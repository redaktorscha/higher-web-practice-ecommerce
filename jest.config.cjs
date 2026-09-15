module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFiles: ['<rootDir>/src/test/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.ts'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleNameMapper: {
    '\\.(png|jpg|jpeg|gif|webp|avif|svg)$': '<rootDir>/src/test/fileMock.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'bundler',
          target: 'ES2023',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          allowImportingTsExtensions: true,
          isolatedModules: true,
          verbatimModuleSyntax: false,
          types: ['jest', 'node'],
        },
      },
    ],
  },
};
