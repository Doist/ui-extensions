# UI Extensions - React Components

The library contains the react components required to interact with integrations from within Doist products.

Specifically it contains the rendering components for the adaptive cards as well as the communication hook to speak to the respective extension servers.

## Commands

In a terminal:

```
npm start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

### Windows

If this is being built on Windows, because of the custom build script, you may need to run the following first:

```
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

This will set npm to use a bash terminal and allow the build script to run.

### Storybook

You may need to update the url that points to a valid backend service, this can be done in `AdaptiveCardRenderer.stories.tsx`.

Run inside another terminal:

```
npm run storybook
```

This should yield the interactive documentation running at (see console output). You can navigate to the _ConnectedCard_ documentation portion where you can see the rendered card, which is fully interactive.

This loads the stories from `./stories`.

> NOTE: Stories should reference the components as if using the library, similar to the example playground. This means importing from the root project directory. This has been aliased in the tsconfig and the storybook webpack config as a helper.

### Jest

Jest tests are set up to run with `npm test` or `yarn test`. This runs the test watcher (Jest) in an interactive mode. By default, runs tests related to files changed since the last commit.

### Running it All

Once bootstrap has been run, do the following commands:

1. `cd packages/ui-extensions-react`
2. `npm run storybook`
