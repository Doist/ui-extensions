import { join } from 'path'

export default {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts?$': ['ts-jest', { useESM: true }],
    },
    clearMocks: true,
    testEnvironment: 'jsdom',
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec|e2e-spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
