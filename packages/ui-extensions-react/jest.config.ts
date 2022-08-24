/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

// eslint-disable-next-line import/no-default-export, import/no-anonymous-default-export
export default {
    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // https://kulshekhar.github.io/ts-jest/docs/getting-started/options
    preset: 'ts-jest',

    moduleNameMapper: {
        '\\.(css|less)$': '<rootDir>/test_utils/styleMock.ts',
        '.\\.svg$': '<rootDir>/__mocks__/svg.tsx',
    },

    transform: {
        '.+\\.(js|jsx|ts|tsx)$': 'ts-jest',
    },

    testEnvironment: 'jsdom',

    // A list of paths to modules that run some code to configure or set up the testing framework before each test
    setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],

    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    modulePathIgnorePatterns: ['<rootDir>/dist/'],
}
