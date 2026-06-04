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

        // Handle SVG imports as React components (matching the @svgr/rollup setup used by
        // the build), instead of Storybook's default asset/URL handling.
        const assetRule = config.module.rules.find(
            (rule) => rule.test instanceof RegExp && rule.test.test('.svg'),
        )
        if (assetRule) {
            assetRule.exclude = /\.svg$/
        }
        config.module.rules.push({
            test: /\.svg$/,
            use: ['@svgr/webpack'],
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
