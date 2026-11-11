# Todoist UI Extensions

This repository contains the source code for the `@todoist/ui-extensions-core` npm package used to develop UI Extensions for [Todoist](https://developer.todoist.com/ui-extensions) and [Twist](https://developer.twist.com/ui-extensions).

## Repository structure

The package is managed as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces). Use the Node.js version specified in `.nvmrc`.

To install the dependencies run `npm install`.

### ui-extensions-core

_TodoistCard_ components and _Todoist UI Extension Data Exchange Format_ types. You can use this package to construct your integration's UI which will then provide the TodoistCards JSON payload to be rendered on our clients.

You can learn more about building Todoist UI Extensions [here](https://developer.todoist.com/ui-extensions) and Twist UI Extensions [here](https://developer.twist.com/ui-extensions).

## Publishing

Only `packages/ui-extensions-core` is published. Update its version and the root
lockfile, merge the changes, then run the **Publish core package** workflow on
`main`. It checks and builds the package, packs it once, and publishes the same
tarball to npmjs and GitHub Packages. npm publication uses trusted publishing for
`todoist/ui-extensions`, workflow `core-deploy.yml`, with no environment.

For the first npm release, an authorized maintainer publishes the built tarball
interactively, then mirrors that same tarball to GitHub Packages. Configure npm
trusted publishing after the package exists. Keep the original tarball if either
registry needs a retry; do not rebuild an already-published version.

## Legacy React consumers

`ui-extensions-react` was [retired in #334](https://github.com/Doist/ui-extensions/pull/334).
It has no active manifest, implementation or publisher here. The two remaining
React test files are not an active workspace. There is no supported
`@todoist/ui-extensions-react` release or drop-in renderer replacement in core.
See [consumer compatibility](docs/consumer-compatibility.md) before changing a
legacy renderer dependency or a pre-v6 core consumer.
