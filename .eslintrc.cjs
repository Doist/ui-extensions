module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
    },
    env: {
        node: true,
        jest: true,
    },
    extends: [
        '@todoist/eslint-config/eslintrc/recommended-type-checked',
        '@todoist/eslint-config/eslintrc/simple-import-sort',
    ],
    root: true,
    ignorePatterns: ['scripts/', '.eslintrc.cjs', 'global-setup.js', 'jest.config.js'],
    rules: {
        '@typescript-eslint/no-unnecessary-condition': 'error',
    },
    overrides: [
        {
            files: ['*.spec.*', 'fixtures.ts'],
            rules: {
                '@typescript-eslint/unbound-method': 'off',
            },
        },
    ],
}
