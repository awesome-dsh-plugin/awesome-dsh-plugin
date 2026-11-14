# Targeted catalog refresh

This maintainer operation refreshes one listed entry's npm metadata and README
without probing the whole catalog. It implements #8939; normal push,
`workflow_run`, nightly and untargeted manual builds retain their existing
behavior.

## Select one entry

After the workflow changes have been reviewed and merged, use **Actions →
build site → Run workflow** on `main`. Set `target_repo` and leave both
`probe_all` and `skip_probes` false. The equivalent CLI invocation is:

```sh
gh workflow run build-site.yml \
  --repo awesome-dsh-plugin/awesome-dsh-plugin --ref main \
  -f target_repo=tangyixiao/dsh-zcode-plan-bridge \
  -f probe_all=false -f skip_probes=false
```

This command starts the existing build, deployment and publication workflow;
it is not a dry run. A manual dispatch shares the nightly probe concurrency
group with `cancel-in-progress: true` and can cancel an active nightly probe.
Check active runs before dispatching. The workflow's existing permissions,
cache paths, deployment and publication conditions are unchanged.

`owner/repo` selects only that repository's listed root entry. To select a
monorepo subpackage, supply its complete URL exactly as listed, for example
`https://github.com/owner/repo/tree/main/packages/plugin`. A root target does
not refresh sibling subpackages. A subpackage target does not refresh its root
or siblings. URL query strings, fragments, aliases and unlisted targets fail
before probing; a repository shorthand whose root is not listed also fails.

## Restored caches and verification

The workflow validates the input before probing, restores its existing shared
probe cache, then validates the restored maps. Both `data/npm-map.json` and
`data/readmes.json` must be valid JSON objects. For the other listed URLs, the
preflight requires valid npm rows covering at least 90% and nonempty English
or Chinese README rows covering at least 50%, rounded up. If there are no
other entries, those checks use the selected entry instead. This rejects a
missing, corrupt or target-only cache while allowing sparse README coverage.
Use an ordinary full probe to restore a usable baseline if preflight fails;
do not remove the checks or create a cache containing only the target.

Both probes load their full restored maps. They select the exact target key,
bypass the normal freshness gates, and preserve unrelated and historical rows.
The npm writer retains one-space indentation; the README writer retains compact
JSON. Both retain a final newline. No catalog entry or generated README is
edited by this operation.

A successful workflow is not proof that both remote services supplied new
data: the probes retain prior data when their existing failure paths are taken.
Inspect the probe logs and resulting target row/content, as well as the final
deployment and publication outcomes. A targeted npm refresh re-runs package
discovery and the repository association check; it is broader than refreshing
the version of an already known npm package.

Run the offline regression suite before integrating workflow changes:

```sh
node --test scripts/*.test.mjs
```

The targeted tests use synthetic cache maps and stubbed network responses;
passing them establishes selection, cache preservation and failure behavior,
not the completeness of production probe data.

## Related changes and integration order

| Change | Responsibility | Integration requirement |
| --- | --- | --- |
| #8942 / #8939 | Forced npm and README refresh for one exact entry on manual dispatch | Keep target validation, restored-cache preflight and unrelated-row preservation together with the workflow input and invocation. |
| #9756 | Retry transient npm probe failures and avoid caching a failed first probe as a fresh negative verdict | Preserve this PR's target selection, forced freshness bypass and target-mode cleanup guard when combining edits to `probe-npm.mjs`. Run the targeted tests and retry/failure coverage after integration. |
| #11901 / #11337 | Refresh publish facts for entries already mapped to npm during ordinary builds | Add the invocation inside `if [ -z "$PROBE_TARGET_REPO" ]`, alongside the ordinary probes. Do not refresh unrelated rows during targeted dispatch. Run its version-refresh tests as well as the targeted tests. |

As inspected on 2026-11-09, #11901 at `21b569f` contains the script, helper and
tests but no workflow invocation; its latest commit removed that wiring for
separate maintainer integration. Adding its script alone does not activate an
automatic refresh. Its six-hour freshness gate, omission of `npm: null` rows
and lack of README refresh do not replace targeted dispatch.

Review and apply the script changes and their tests before enabling their
workflow calls. If #11901 is wired first, move that call inside the normal-build
guard when integrating #8942. If #8942 lands first, place the later call inside
the existing guard. In either order, verify that a targeted dispatch changes
only the selected npm/README cache rows and does not invoke ordinary probes;
ordinary builds must retain their normal probes and automatic version refresh.

Workflow edits require maintainer review. `Repository config guard` flags the
intentional `.github/workflows/` changes in this infrastructure PR; its generic
stale-fork remedy would remove the feature's dispatch input and invocation.
Keep the guard intact. If the maintainer applies the workflow portion directly,
apply the implementation and tests first, then the matching workflow patch,
review the combined tree and run the same checks before merging or dispatching.
