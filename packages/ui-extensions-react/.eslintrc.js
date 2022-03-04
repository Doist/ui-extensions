module.exports = {
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
    },
    extends: ['../../.eslintrc.js', '@doist/eslint-config/react', 'react-app'],
    ignorePatterns: ['dist/', '*.config.js', 'es/', 'lib/'],
}
