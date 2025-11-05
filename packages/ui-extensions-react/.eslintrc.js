module.exports = {
    parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
    },
    extends: ['../../.eslintrc.js', '@doist/eslint-config/react'],
    ignorePatterns: ['dist/', '*.config.js', 'es/', 'lib/'],
    rules: {
        // Rules no longer necessary with the new JSX Transformer
        // ref: https://reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html
        'react/jsx-uses-react': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-restricted-imports': 'warn',
    },
}
