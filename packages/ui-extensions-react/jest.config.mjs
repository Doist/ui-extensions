export default {
    preset: 'ts-jest',
    transform: { '^.+\\.(js|ts)?$': 'ts-jest' },
    clearMocks: true,
    testEnvironment: 'jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/setup-tests.ts'],
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    transformIgnorePatterns: ['node_modules/(?!(node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill)/)'],
    moduleNameMapper: {
        '\\.(css|less)$': 'identity-obj-proxy',
        '\\.svg': '<rootDir>/test_utils/svgMock.ts',
    },
}
