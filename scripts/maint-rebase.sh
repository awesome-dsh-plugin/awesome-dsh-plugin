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
    # Generated files are regenerated below, so main's copy always wins.
    git checkout origin/main -- README.md README.zh.md 2>/dev/null
    git add -A 2>/dev/null
    git -c core.editor=true rebase --continue >/dev/null 2>&1 || {
      git rebase --abort >/dev/null 2>&1; git checkout -f -q main
      echo "$n :: CONFLICT (needs a human)"; continue
    }
  fi

  node scripts/generate-readme.mjs >/dev/null 2>&1 || {
    git checkout -f -q main; echo "$n :: GEN-FAIL (bad entry data)"; continue
  }
  git add -A && git diff --cached --quiet || git commit -q --amend --no-edit

  # A branch identical to main has no commits, and GitHub auto-closes such a
  # PR — destroying the contributor's work and revoking our push access to
  # their fork. Never push an empty result.
  if [ -z "$(git diff origin/main --name-only)" ]; then
    git checkout -f -q main; echo "$n :: EMPTY (already on main? left untouched)"; continue
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
