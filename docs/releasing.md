# Releasing UI Extensions Core

Only `packages/ui-extensions-core` is an active published workspace. The private
`root` package stays unpublished. The initial new identity is
`@todoist/ui-extensions-core@6.0.1`, with the same tarball in npmjs and the **public**
GitHub Packages mirror. Its only runtime dependency is
`typescript-json-serializer@6.0.1`.

This migration draft is **WAITING_FOR_PUBLICATION** and must not merge with its old
lockfile. The manifest requests `@todoist/tsconfig@2.0.2`,
`@todoist/prettier-config@4.0.2`, and `@todoist/eslint-config@13.1.2`.
After M02 publishes those exact versions and their dependency closure in both
registries, regenerate the real lockfile with `npm install --package-lock-only
--ignore-scripts`, then run `npm ci --ignore-scripts`, `npm run test:release`, and
`npm run integrity-check --workspace=packages/ui-extensions-core`. Resolve actual
peer errors; do not use aliases, fake integrity values, `--force`, or
`--legacy-peer-deps` as release verification. The ESLint config change from 12 to
13 also requires its real lint/peer check. Existing old-scope installs do not
establish this gate.

## Access prerequisites

Henning routes these to the existing npm/GitHub package and Platform owners;
this repository does not contain the D06 assignment list.

-   After the GitHub rename, inspect the transferred
    [public core package](https://github.com/orgs/todoist/packages/npm/package/ui-extensions-core/settings).
    Preserve public visibility and repository linkage to `todoist/ui-extensions`.
    Give this repository's Actions write access and the actual consuming repositories
    read access. The publisher deliberately stops if it cannot read that package's
    metadata, including a 404 that could hide insufficient access. If transfer has
    not made it readable, the package administrator must resolve that first.
-   Create/protect the `npm-release` environment with the existing release approvers
    and main-only branch policy in [repository environments](https://github.com/todoist/ui-extensions/settings/environments).
    No environment or permissions are changed by this PR.
-   `core-pack.yml` uses GitHub-hosted `ubuntu-latest`, Node 24 from `.nvmrc`, and
    read-only repository permission. It has no publication credentials or OIDC.
-   `core-deploy.yml` is the direct caller (no reusable wrapper), uses the same
    runner/Node and npm 11.19.0, environment `npm-release`, and `contents: read`,
    `actions: read`, `packages: write`, `id-token: write`. `GH_TOKEN` validates and
    downloads source artifacts; `GH_PACKAGES_TOKEN` reads both-registry preflight
    evidence and writes only the GitHub mirror. In CI both come from `github.token`.
    Locally use authenticated `gh` and a classic PAT with `read:packages` (also
    `write:packages` for a GitHub publication). Never put token values in commands,
    release metadata, logs, or the repository.
-   The first real npm release is interactive. Once the new package exists, configure
    [npm package settings](https://www.npmjs.com/package/@todoist/ui-extensions-core/access)
    → Trusted publishing: GitHub owner `todoist`, repository `ui-extensions`, workflow
    `core-deploy.yml`, environment `npm-release`, direct `npm publish` enabled. Configure
    near the next real release; a new connection expires if unused for two days.
    Do not create a placeholder release to test trust. See
    [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/) and
    [npm trust prerequisites](https://docs.npmjs.com/cli/v11/commands/npm-trust/).

## Produce the first real artifact — authorized operator only

The commands below are future release operations, not preparation checks. No
workflow dispatch, tag, release, registry write, or deployment has been performed
as part of preparing this change.

After rename, M02 verification, review and merge, dispatch **only** the pack job:

```sh
gh workflow run core-pack.yml --repo todoist/ui-extensions --ref main
gh run list --repo todoist/ui-extensions --workflow core-pack.yml --event workflow_dispatch
```

Select the successful run whose full `headSha` is the reviewed main commit.
The pack workflow checks out that exact event SHA, runs the workspace integrity
check, packs once without lifecycle hooks, and retains `ui-extensions-core-release`
for 90 days. It never publishes. Do not rerun a pack workflow. A failed build before
any release can be fixed forward; once either registry contains this version,
recover its original successful artifact rather than generating new bytes.

Use the reviewed current-main release scripts with Node 24, npm 11.19.0, `gh`,
`tar`, and `unzip`. Set these values from the selected successful run (the SHA and
run ID cannot be known until the authorized future pack):

```sh
export ARTIFACT_RUN_ID=THE_ORIGINAL_SUCCESSFUL_RUN_ID
export RELEASE_SHA=THE_FULL_40_CHARACTER_PACK_HEAD_SHA
export RELEASE_VERSION=6.0.1
export RELEASE_TAG=latest
node scripts/release.mjs download release-artifact
node scripts/release.mjs verify release-artifact
```

`download` requires an empty destination. Preserve the entire downloaded directory,
its `release.json`, run URL and GitHub artifact digest in the release owner's
approved durable storage before the 90-day expiry. Source verification checks the
successful original run, repository, workflow ID/path, main dispatch, checkout SHA,
main ancestry, supported schema, archive digest, tarball hash and source manifest.
Historical workflow bytes need **not** equal a later current-main workflow. A later
maintenance commit therefore does not invalidate the original artifact. Unsupported
schemas or expired hosted artifacts stop for approved recovery of the **original**
archived bytes; they are never instructions to rebuild an already-published version.

## First npm publication and same-artifact mirror

With `GH_PACKAGES_TOKEN` supplied securely for GitHub read access, run in a real
terminal:

```sh
node scripts/release.mjs bootstrap-npm release-artifact
```

This re-downloads and authenticates the original artifact, preflights **both**
registries, logs in to npm in an isolated temporary config, repeats both checks,
then publishes the original tarball with terminal I/O for fresh publish-time 2FA.
It never gives GitHub credentials to the npm publication process. The temporary
npm login config is removed afterward; the user's global npm config is untouched.

Mirror that exact artifact with an authorized local package write credential:

```sh
node scripts/release.mjs publish release-artifact github
```

Or dispatch the protected workflow with the same three recorded values and
`destination=github`. Automated npm publication requires the trust setup above:

```sh
gh workflow run core-deploy.yml --repo todoist/ui-extensions --ref main \
  -f artifact_run_id="$ARTIFACT_RUN_ID" -f release_sha="$RELEASE_SHA" \
  -f release_version="$RELEASE_VERSION" -f destination=both -f release_tag=latest
```

Every write, including an npm-only/GitHub-only retry, compares any existing
same-version copies in **both** registries with the retained tarball by downloading
and hashing their bytes. Authentication, network, visibility ambiguity or a byte
mismatch stops before writing. An identical destination copy is a no-op. Both
registries receive `--access=public`, `--ignore-scripts`, and explicit isolated
registry/scope routing. Cross-run provenance is disabled because the publisher
commit can differ from the build commit; do not enable automatic provenance for
that path.

After both copies exist, verify real consumer installs against npmjs and GitHub
separately with the consumers' credentials and registry routing. npmjs installs
must need no GitHub access. Public-only consumers can use npmjs; mixed private/public
`@todoist` consumers must route the scope to GitHub, without fallback assumptions.
Do not release consumer gates on a tarball, tag or successful producer merge alone.

## Recovery and subsequent releases

Reuse the original run, SHA, version and artifact. Do not rerun the pack, bump the
version just to fill a missing mirror, or change old tags. The script refuses a
`latest` downgrade; for an older missing mirror explicitly choose
`RELEASE_TAG=migration-recovery` locally or `release_tag=migration-recovery` in the
workflow. The release owner checks both registries and, after recovery installs
pass, removes only that temporary tag through an authorized normal registry
administration path. OIDC dist-tag permissions are separate and are not used here.
Do not move `latest` backwards or add an `internal` promotion path.

This repository uses explicit manifest versions and unscoped `core-vVERSION` tags,
not semantic-release. Historical `core-v6.0.0` remains untouched; the new-scope first
version is the reviewed next patch 6.0.1. Preserve the normal `core-v6.0.1` release
record after both real publications. Tag pushes now do **not** publish. Future
versions use a reviewed manifest/real-lockfile bump on main, pack once, publish
retained bytes, then record the normal release tag; the scoped name cannot reset
version calculation to 1.0.0.

A matching release tag name alone is not a completed release record. Before treating
`core-v6.0.1` (or a future core tag) as recorded, resolve the tag to its exact
commit and require `RELEASE_SHA`; inspect the release's `draft`, `prerelease`,
`published_at`, target and retained assets/metadata. A completed stable record is
published, not draft/prerelease, and identifies the same original source/artifact
verified in both registries. If creation/upload was interrupted, resume that
matching draft with only the original retained bytes/metadata. If its commit or
existing assets disagree, stop for the release owner. Never delete, force-move or
recreate an existing tag/release to make the check pass. An archive outside GitHub
releases must still retain `release.json`, the original tarball and GitHub
run/artifact identity; verify their digests during recovery.

## External effects and schema identity

Migration-branch pushes do not match any deployment or publication trigger. Draft
PR events run Audit and Core CI; their install/build/audit commands do not publish,
deploy, or message a team. Audit performs a registry advisory read. CODEOWNERS
references individual accounts. No repository webhook was configured at inspection;
the repository-installations API returned 404, so external App configuration was
not certified. `doistbot` review is explicitly requested for this draft.

Merging this change does not publish. The unchanged schema workflow can deploy on
manual dispatch or main changes to the exact `schemas/latest` symlink path. This
PR changes neither that path nor schema bytes. Preserve `schemas.doist.com`, the
`doist-schemas-*` AWS bucket/role, legacy JSON keys and all Todoist/Twist runtime
identities. Platform must separately inspect that existing role's OIDC trust for
`repo:todoist/ui-extensions:ref:refs/heads/main` (or its actual configured subject)
before any future authorized schema deployment.
