# Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

All tests are located in the `tests/` folder:

```
tests/
├── setup.js              # Test environment setup
├── libraries.test.js     # RNG tests
├── world.test.js         # World generation tests
├── chunk.test.js         # Chunk management tests
├── dataStore.test.js     # Save/load tests
├── terrain.test.js       # Terrain manipulation tests
├── tree.test.js          # Tree generation tests
├── physics.test.js       # Physics system tests
├── player.test.js        # Player mechanics tests
├── core.test.js          # Three.js setup tests
├── textures.test.js      # Block definitions tests
├── resources.test.js     # Resource definitions tests
├── integration.test.js   # Multi-system tests
├── README.md             # Test documentation
└── SUMMARY.md            # Test results summary
```

## Test Results

- **12 test suites** with **118 tests** - all passing ✅
- **Execution time**: ~0.6 seconds
- **Coverage**: 22.87% overall (100% for core logic modules)

## What's Tested

### Core Systems (100% coverage)
- ✅ Random Number Generator (RNG)
- ✅ Block definitions and textures
- ✅ Resource definitions
- ✅ Data store (save/load)
- ✅ World base class

### Game Logic (40-60% coverage)
- ✅ Terrain generation and manipulation
- ✅ Tree generation for all biomes
- ✅ Chunk coordinate conversion
- ✅ Player initialization and properties
- ✅ Physics parameters

### Integration
- ✅ World + RNG deterministic generation
- ✅ DataStore + World persistence
- ✅ Block system validation
- ✅ Parameter validation

## Technologies

- **Jest** - Testing framework
- **Babel** - ES6 module transformation
- **jsdom** - Browser environment simulation
- **Custom mocks** - Three.js and dependencies

## Writing New Tests

1. Create a new file in `tests/` folder: `myFeature.test.js`
2. Import test utilities:
   ```javascript
   import { describe, test, expect } from '@jest/globals';
   ```
3. Import the module to test:
   ```javascript
   import { MyClass } from '../scripts/path/to/module.js';
   ```
4. Write tests:
   ```javascript
   describe('MyClass', () => {
     test('should do something', () => {
       const instance = new MyClass();
       expect(instance.property).toBe(expectedValue);
     });
   });
   ```

## Mocking Three.js

Three.js objects are automatically mocked. See `__mocks__/three.js` for available mocks.

## CI/CD Integration

Add to your CI pipeline:
```yaml
- run: npm install
- run: npm test
- run: npm run test:coverage
```

## Notes

- Tests focus on game logic, not rendering
- WebGL-dependent code is mocked
- Animation loops and UI handlers are not tested (require browser)
- All tests run in Node.js with jsdom environment
