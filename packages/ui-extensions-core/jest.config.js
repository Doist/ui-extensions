const { join } = require('path')

module.exports = {
    transform: { '^.+\\.ts?$': 'ts-jest' },
    clearMocks: true,
    testEnvironment: 'jsdom',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec|e2e-spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
