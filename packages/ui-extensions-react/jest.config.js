module.exports = {
    preset: 'ts-jest',
    transform: { '^.+\\.(js|ts)?$': 'ts-jest' },
    clearMocks: true,
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
        '\\.svg': '<rootDir>/test_utils/svgMock.ts',
    },
}
