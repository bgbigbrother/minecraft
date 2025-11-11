# Minecraft Clone - Test Suite

This directory contains comprehensive unit tests for the Minecraft clone project.

## Test Structure

All tests are organized in a single `tests/` folder with the following files:

- `setup.js` - Test environment setup and mocks
- `libraries.test.js` - Tests for RNG (Random Number Generator)
- `world.test.js` - Tests for WorldBaseClass
- `chunk.test.js` - Tests for chunk generation and coordinate conversion
- `dataStore.test.js` - Tests for DataStore (save/load functionality)
- `terrain.test.js` - Tests for Terrain class
- `tree.test.js` - Tests for Tree generation
- `physics.test.js` - Tests for BasePhysics
- `player.test.js` - Tests for PlayerBase
- `core.test.js` - Tests for core Three.js setup (scene, camera, renderer)
- `textures.test.js` - Tests for block definitions
- `resources.test.js` - Tests for resource definitions
- `integration.test.js` - Integration tests for multiple systems

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The test suite covers:

- **Libraries**: RNG deterministic random number generation
- **World System**: World generation, chunk management, coordinate conversion
- **Data Persistence**: Block storage and retrieval
- **Terrain**: Block placement, removal, and obscurity detection
- **Trees**: Procedural tree generation for different biomes
- **Physics**: Gravity, collision detection helpers
- **Player**: Movement, camera, raycasting, block selection
- **Core Systems**: Scene, camera, renderer setup
- **Block System**: Block definitions and resources

## Technologies

- **Jest** - Testing framework
- **@jest/globals** - Jest global functions
- **jest-environment-jsdom** - DOM environment for browser-based code
- **babel-jest** - ES6 module transformation
- **canvas** - Canvas mock for Three.js

## Notes

- Three.js objects are mocked in `setup.js` to avoid WebGL dependencies
- Tests focus on logic and data structures rather than rendering
- Integration tests verify that multiple systems work together correctly
