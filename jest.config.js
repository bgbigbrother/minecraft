export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(three)/)',
  ],
  moduleNameMapper: {
    '^three$': '<rootDir>/__mocks__/three.js',
    '^three/addons/controls/PointerLockControls.js$': '<rootDir>/__mocks__/PointerLockControls.js',
    '^.*/player/body/simple$': '<rootDir>/__mocks__/simpleCharacter.js',
    '\\.(jpg|jpeg|png|gif|svg|mp3|glb|ttf)$': '<rootDir>/__mocks__/fileMock.js',
  },
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'scripts/**/*.js',
    '!scripts/main.js',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
};
