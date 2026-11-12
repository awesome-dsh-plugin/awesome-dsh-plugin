#!/bin/bash
# Rebase an open PR onto current main and regenerate the READMEs, then push the
# result back to the contributor's fork. Used when a submission is fine but has
# gone stale behind other merges — which happens constantly on a list this busy.
#
#   scripts/maint-rebase.sh 1234 [1235 ...]
#
# Requires push access to the fork ("Allow edits by maintainers"). Uses SSH:
# the gh OAuth token lacks the `workflow` scope and cannot push branches that
# touch .github/workflows.
set -uo pipefail
cd "$(dirname "$0")/.."

# Every iteration below starts with `git reset --hard`, which silently throws
# away anything uncommitted in the working tree. That includes edits to this
# very script: a fix being written here was destroyed mid-run, and because bash
# re-reads a script while executing it, the run afterwards was following a file
# that no longer existed on disk. Refuse to start unless the tree is clean.
if [ -n "$(git status --porcelain)" ]; then
  echo "working tree is not clean — commit or stash first (this script runs 'git reset --hard')"
  git status --short | sed 's/^/  /'
  exit 1
fi

for n in "$@"; do
  git checkout -q main && git fetch -q origin && git reset -q --hard origin/main

  read -r owner repo ref old mcm <<< "$(gh pr view "$n" \
    --json headRepositoryOwner,headRepository,headRefName,headRefOid,maintainerCanModify \
    --jq '"\(.headRepositoryOwner.login) \(.headRepository.name) \(.headRefName) \(.headRefOid) \(.maintainerCanModify)"' 2>/dev/null)"
  [ -z "${owner:-}" ] && { echo "$n :: GH-FAIL"; continue; }
  # The API flag goes stale; a push can still 403 even when it reads true.
  [ "$mcm" != "true" ] && { echo "$n :: NO-EDIT (author must enable maintainer edits)"; continue; }

  # The fork may have been renamed — never assume it is called awesome-dsh-plugin.
  git fetch -q "git@github.com:$owner/$repo.git" "$ref" 2>/dev/null || { echo "$n :: FETCH-FAIL"; continue; }
  git checkout -q -B "maint$n" FETCH_HEAD

  if ! git rebase origin/main >/dev/null 2>&1; then
    # A stale fork usually carries several commits that each touch the two
    # generated READMEs, so the rebase stops once per commit. Resolving once and
    # calling `rebase --continue` a single time only clears the first stop: the
    # second one made --continue return non-zero, and the script reported
    # CONFLICT and handed back a branch that needed no human at all. #1873 was
    # exactly this — four commits, three of them README regenerations, no real
    # conflict anywhere. Keep resolving until the rebase finishes or something
    # this script has no business deciding is left unmerged.
    giveup=""
    guard=0
    while [ -d "$(git rev-parse --git-path rebase-merge)" ] || [ -d "$(git rev-parse --git-path rebase-apply)" ]; do
    guard=$((guard + 1))
    if [ "$guard" -gt 50 ]; then giveup="more than 50 conflicting commits"; break; fi

    # Generated files are regenerated below, so main's copy always wins.
    git checkout origin/main -- README.md README.zh.md 2>/dev/null

    # data/screenshots.json is a single JSON object that every screenshot PR
    # appends to, so it collides constantly. Taking main's copy would silently
    # drop the contributor's screenshots — the entire point of their PR — so
    # merge it instead.
    #
    # This has to be a real three-way merge against the merge-base, not main's
    # copy with the branch's keys laid over the top. Overlaying resurrects any
    # key main has since DELETED but the branch still carries: a stale entry URL
    # from before a repo rename comes back, and build-site rejects it because it
    # no longer matches a listed entry. Only keys the branch changed relative to
    # where it forked are the branch's contribution.
    if git diff --name-only --diff-filter=U | grep -qx 'data/screenshots.json'; then
      MB=$(git merge-base origin/main FETCH_HEAD 2>/dev/null)
      git show "$MB:data/screenshots.json" > /tmp/shots-base.json 2>/dev/null || echo '{}' > /tmp/shots-base.json
      git show origin/main:data/screenshots.json > /tmp/shots-ours.json 2>/dev/null
      git show FETCH_HEAD:data/screenshots.json > /tmp/shots-theirs.json 2>/dev/null
      if node -e '
        const fs = require("fs")
        const read = (f) => { try { return JSON.parse(fs.readFileSync(f, "utf8")) } catch { return {} } }
        const base = read("/tmp/shots-base.json")
        const ours = read("/tmp/shots-ours.json")
        const theirs = read("/tmp/shots-theirs.json")
        const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)
        const out = { ...ours }
        for (const [k, v] of Object.entries(theirs)) if (!same(base[k], v)) out[k] = v
        for (const k of Object.keys(base)) if (!(k in theirs) && k in out) delete out[k]
        // Keep main'"'"'s existing key order and append whatever is new. The file
        // matches no sort — it grew by appending — so re-sorting it rewrites a
        // couple of hundred lines that nobody changed. That noise landed in
        // contributors'"'"' diffs and read as "this PR also touched unrelated
        // entries", which is the exact signal used to catch cross-entry damage.
        // Poisoning it is worse than an untidy file.
        // Screenshots for entries that are no longer listed have to go. An old
        // branch carries keys for entries main has since removed or renamed,
        // and build-site refuses a key that matches no entry — "is not a
        // listed entry URL". Two rebases came back red for exactly this and
        // for nothing else, which reads to the contributor as their
        // submission being broken. Their screenshots are untouched; only keys
        // pointing at entries that do not exist are dropped.
        const listed = new Set(
          fs.readdirSync("data/plugins")
            .filter((f) => f.endsWith(".yml"))
            .map((f) => (fs.readFileSync("data/plugins/" + f, "utf8").match(/^url:\s*(\S+)/m) || [])[1])
            .filter(Boolean),
        )
        for (const k of Object.keys(out)) if (!listed.has(k)) delete out[k]
        const order = [...Object.keys(ours).filter((k) => k in out), ...Object.keys(out).filter((k) => !(k in ours))]
        fs.writeFileSync("data/screenshots.json", JSON.stringify(Object.fromEntries(order.map((k) => [k, out[k]])), null, 1) + "\n")
      ' 2>/dev/null; then
        git add data/screenshots.json
      fi
    fi

    # Anything still unmerged is a conflict nobody has decided. Staging it with
    # `git add -A` commits the <<<<<<< markers verbatim and pushes them to the
    # contributor's branch — which is exactly what happened before this check
    # existed, to ten branches at once. Hand it back instead.
    if [ -n "$(git diff --name-only --diff-filter=U)" ]; then
      giveup="unresolved: $(git diff --name-only --diff-filter=U | tr '\n' ' ')"
      break
    fi

    git add -A 2>/dev/null
    if ! git -c core.editor=true rebase --continue >/dev/null 2>&1; then
      # Once a commit's README churn is discarded in favour of main's copy the
      # commit can have nothing left in it, and --continue refuses to create an
      # empty commit. For a "regenerate README" commit that is the expected
      # outcome, not a failure — drop it and carry on.
      git -c core.editor=true rebase --skip >/dev/null 2>&1 || {
        giveup="rebase --continue and --skip both failed"
        break
      }
    fi
    done

    if [ -n "$giveup" ]; then
      git rebase --abort >/dev/null 2>&1; git checkout -f -q main
      echo "$n :: CONFLICT ($giveup)"; continue
    fi
  fi

  # The READMEs are generated, so main's copy is the only correct starting
  # point — not just when the rebase conflicted. A rebase that applies cleanly
  # still carries whatever the branch's README said, and on an old fork that is
  # a README from a different era: entry lines main has since removed (which
  # then fail the "appears in the README but has no data/plugins file" check)
  # and links to locale files that no longer exist. Both showed up as
  # GEN-FAIL "bad entry data", blaming the contributor's YAML for a staleness
  # this script had itself preserved.
  git checkout origin/main -- README.md README.zh.md 2>/dev/null

  # Prune screenshots for entries that no longer exist. This has to run on
  # every rebase, not only when screenshots.json conflicted: a branch that
  # rebases cleanly keeps its own copy of the file verbatim, dead keys and all,
  # and build-site then refuses it with "is not a listed entry URL". #1664 and
  # #1044 both rebased clean and both came back red for four dead keys the
  # contributor never touched. Contributor screenshots are untouched.
  if [ -f data/screenshots.json ]; then
    node -e '
      const fs = require("fs")
      let shots
      try { shots = JSON.parse(fs.readFileSync("data/screenshots.json", "utf8")) } catch { process.exit(0) }
      const listed = new Set(
        fs.readdirSync("data/plugins")
          .filter((f) => f.endsWith(".yml"))
          .map((f) => (fs.readFileSync("data/plugins/" + f, "utf8").match(/^url:\s*(\S+)/m) || [])[1])
          .filter(Boolean),
      )
      const dead = Object.keys(shots).filter((k) => !listed.has(k))
      if (!dead.length) process.exit(0)
      for (const k of dead) delete shots[k]
      fs.writeFileSync("data/screenshots.json", JSON.stringify(shots, null, 1) + "\n")
      console.error("      dropped " + dead.length + " screenshot key(s) for entries that no longer exist")
    ' 2>&1
    git add data/screenshots.json 2>/dev/null
  fi

  node scripts/generate-readme.mjs >/dev/null 2>&1 || {
    git checkout -f -q main; echo "$n :: GEN-FAIL (bad entry data)"; continue
  }
  # `git commit --amend` refuses when the amended commit would be empty, and
  # that refusal used to pass silently: the loop pushed on, printed no verdict
  # for this PR at all, and left README.md modified in the tree — so the *next*
  # iteration's `git checkout main` aborted and took an innocent PR down with
  # it. One PR's odd history became a cascade of skipped ones. Whatever the
  # outcome here, leave the tree clean and say what happened.
  git add -A
  if ! git diff --cached --quiet; then
    git commit -q --amend --no-edit || {
      git checkout -f -q main; echo "$n :: AMEND-FAIL (nothing left to commit after regeneration)"; continue
    }
  fi

  # A branch identical to main has no commits, and GitHub auto-closes such a
  # PR — destroying the contributor's work and revoking our push access to
  # their fork. Never push an empty result.
  if [ -z "$(git diff origin/main --name-only)" ]; then
    git checkout -f -q main; echo "$n :: EMPTY (already on main? left untouched)"; continue
  fi

  # Last line of defence, deliberately independent of the resolution logic
  # above: never push conflict markers to someone else's branch. This has gone
  # wrong twice, both times because a resolution step looked like it worked. A
  # grep costs nothing and does not care why the markers are there. Only the
  # <<<<<<< and >>>>>>> forms are checked — a bare ======= line is a legitimate
  # setext heading underline in Markdown.
  if git grep -qE '^(<{7}|>{7}) ' -- 2>/dev/null; then
    echo "$n :: MARKERS (conflict markers in the result — refusing to push)"
    git grep -lE '^(<{7}|>{7}) ' -- 2>/dev/null | sed 's/^/      /'
    git checkout -f -q main; continue
  fi

  # A submission changes entry data and the two generated READMEs. Nothing
  # else. Forks taken before the CI landed carry a branch that *deletes*
  # .github/workflows — ten open pull requests do this right now — and a clean
  # rebase preserves that deletion, so rebasing one and merging it would take
  # the repository's own CI down. pr-guard.yml catches it on the way in; this
  # catches it on the way out, so a maintainer's rebase can never push a
  # workflow deletion onto a contributor's branch either. Refuse and report.
  stray=$(git diff origin/main --name-only | grep -vE '^(data/|README\.md$|README\.zh\.md$)' || true)
  if [ -n "$stray" ]; then
    echo "$n :: OUT-OF-SCOPE (touches files a submission has no business changing — refusing to push)"
    echo "$stray" | sed 's/^/      /'
    git checkout -f -q main; continue
  fi

  if git push -q --force-with-lease="$ref:$old" "git@github.com:$owner/$repo.git" "maint$n:$ref" 2>/dev/null; then
    echo "$n :: REBASED"
  else
    echo "$n :: PUSH-FAIL"
  fi
  git checkout -q main
done

git checkout -f -q main 2>/dev/null
for b in $(git branch --format='%(refname:short)' | grep -E '^maint[0-9]+'); do git branch -D "$b" >/dev/null 2>&1; done
