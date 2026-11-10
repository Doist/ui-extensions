# Todoist UI Extensions

This repository contains the source code for the `@todoist/ui-extensions-core` npm package used to develop UI Extensions for [Todoist](https://developer.todoist.com/ui-extensions) and [Twist](https://developer.twist.com/ui-extensions).

## Repository structure

The package is managed as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces). Use the Node.js version specified in `.nvmrc`.

To install the dependencies run `npm install`.

### ui-extensions-core

_TodoistCard_ components and _Todoist UI Extension Data Exchange Format_ types. You can use this package to construct your integration's UI which will then provide the TodoistCards JSON payload to be rendered on our clients.

You can learn more about building Todoist UI Extensions [here](https://developer.todoist.com/ui-extensions) and Twist UI Extensions [here](https://developer.twist.com/ui-extensions).

## Release and migration status

See [the release runbook](docs/releasing.md) for the pack-only bootstrap, retained
artifact publication/recovery, registry access and the M02 lockfile gate.

`ui-extensions-react` was [retired in #334](https://github.com/Doist/ui-extensions/pull/334).
It has no active manifest, implementation or publisher here. The two remaining
React test files are not an active workspace. There is no supported
`@todoist/ui-extensions-react` release or drop-in renderer replacement in core.
See [consumer compatibility](docs/consumer-compatibility.md) before changing a
legacy renderer dependency or a pre-v6 core consumer.
