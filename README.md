# Todoist UI Extensions

This repository contains the source code for the `@doist/ui-extensions-core` npm package used to develop UI Extensions for [Todoist](https://developer.todoist.com/ui-extensions) and [Twist](https://developer.twist.com/ui-extensions).

## Repository structure

The package is managed as an [npm workspace](https://docs.npmjs.com/cli/v7/using-npm/workspaces). Use the Node.js version specified in `.nvmrc`.

To install the dependencies run `npm install`.

### ui-extensions-core

_TodoistCard_ components and _Todoist UI Extension Data Exchange Format_ types. You can use this package to construct your integration's UI which will then provide the TodoistCards JSON payload to be rendered on our clients.

You can learn more about building Todoist UI Extensions [here](https://developer.todoist.com/ui-extensions) and Twist UI Extensions [here](https://developer.twist.com/ui-extensions).
