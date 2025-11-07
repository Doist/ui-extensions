import { dirname, join } from 'path'
module.exports = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
    addons: [
        getAbsolutePath('@storybook/addon-links'),
        getAbsolutePath('@storybook/addon-essentials'),
    ],

    webpackFinal: async (config) => {
        // Skip transpilation for node_modules, except for non-transpiled dependencies
        config.module.rules[0].exclude = /node_modules\/(?!.*ariakit.*).*/

        config.module.rules.push({
            test: /\.(ts|tsx)$/,
            use: {
                loader: 'ts-loader',
            },
        })
        config.resolve.extensions.push('.ts', '.tsx')
        return config
    },

    framework: {
        name: getAbsolutePath('@storybook/react-webpack5'),
        options: {},
    },

    docs: {
        autodocs: true,
    },
}

function getAbsolutePath(value) {
    return dirname(require.resolve(join(value, 'package.json')))
}
