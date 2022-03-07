# Doist UI Extensions

This monorepo contains the source code for `npm` packages used to develop UI Extensions for [Twist](https://twist.com). You can learn more about building Twist UI Extensions [here](https://developer.twist.com/ui-extensions).

## Repository structure

The monorepo is managed using [npm v7 workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). You will need at least NPM v7 on your development machine. The easiest way to obtain this is by installing Node v15 or greater.

To install the dependencies run `npm install`.

This monorepo comprises of two packages:

### ui-extensions-core

_DoistCard_ components and _Doist UI Extension Data Exchange Format_ types. You can use this package to construct your integration's UI which will then provide the DoistCards JSON payload to be rendered on our clients.

You can learn more about build Twist UI Extensions [here](https://developer.twist.com/ui-extensions).

### ui-extensions-react

A library containing card renderer and connector for React apps. This is used internally by Doist projects and not needed to develop an integration.
