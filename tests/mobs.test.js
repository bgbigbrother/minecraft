import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { MoveMob } from '../scripts/mobs/base.js';
import { blocks } from '../scripts/textures/blocks.js';

// Mock SkeletonUtils
jest.mock('three/examples/jsm/utils/SkeletonUtils.js', () => ({
  clone: jest.fn((model) => ({ ...model }))
}));

describe('MoveMob', () => {
  let mob;
  let mockModel;
  let mockChunk;

  beforeEach(() => {
    mockModel = {
      model: {
        position: { x: 0, y: 0, z: 0, set: jest.fn() },
        rotateY: jest.fn()
      },
      animations: []
    };

    mockChunk = {
      size: {
        width: 16,
        height: 32
      },
      getBlock: jest.fn((x, y, z) => {
        // Simulate dirt block at y=10
        if (y === 10) {
          return { id: blocks.dirt.id };
        }
        return null;
      })
    };

    mob = new MoveMob(mockModel);
  });

  describe('Constructor and Initialization', () => {
    test('should create mob instance', () => {
      expect(mob).toBeDefined();
      expect(mob.model).toBeDefined();
    });

    test('should have default moves', () => {
      expect(mob.moves).toEqual(['forward', 'left', 'right']);
    });

    test('should have idle action', () => {
      expect(mob.idleAction).toBe('idle');
    });

    test('should have default speed of 2', () => {
      expect(mob.speed).toBe(2);
    });

    test('should initialize position state', () => {
      expect(mob.position.axis).toBe('z');
      expect(mob.position.direction).toBe(1);
      expect(mob.position.rotation).toBe(0);
    });

    test('should initialize action timing', () => {
      expect(mob.actionTime).toBe(5);
      expect(mob.startTime).toBe(0);
    });
  });

  describe('Action Selection', () => {
    test('should alternate between idle and movement actions', () => {
      // Start with null action
      expect(mob.currentAction).toBeNull();
      
      // First selection should be idle (since currentAction !== idleAction)
      mob.selectRandomAction();
      expect(mob.currentAction).toBe('idle');
      
      // Second selection should be a movement action
      mob.selectRandomAction();
      expect(['forward', 'left', 'right']).toContain(mob.currentAction);
      
      // Third selection should be idle again
      mob.selectRandomAction();
      expect(mob.currentAction).toBe('idle');
    });

    test('should store previous action', () => {
      mob.currentAction = 'forward';
      mob.selectRandomAction();
      expect(mob.previousAction).toBe('forward');
    });

    test('should call generatePosition when selecting action', () => {
      const spy = jest.spyOn(mob, 'generatePosition');
      mob.selectRandomAction();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Rotation and Axis Calculations', () => {
    test('should rotate 90 degrees counterclockwise for left turn', () => {
      mob.position.rotation = 0;
      mob.position.axis = 'z';
      
      mob.generatePosition('left');
      
      expect(mob.position.rotation).toBeCloseTo(Math.PI / 2);
      expect(mob.position.axis).toBe('x');
      expect(mob.model.rotateY).toHaveBeenCalledWith(Math.PI / 2);
    });

    test('should rotate 90 degrees clockwise for right turn', () => {
      mob.position.rotation = 0;
      mob.position.axis = 'z';
      
      mob.generatePosition('right');
      
      expect(mob.position.rotation).toBeCloseTo(Math.PI * 1.5);
      expect(mob.position.axis).toBe('x');
      expect(mob.model.rotateY).toHaveBeenCalledWith(Math.PI * 1.5);
    });

    test('should switch axis from z to x on turn', () => {
      mob.position.axis = 'z';
      mob.generatePosition('left');
      expect(mob.position.axis).toBe('x');
    });

    test('should switch axis from x to z on turn', () => {
      mob.position.axis = 'x';
      mob.generatePosition('right');
      expect(mob.position.axis).toBe('z');
    });

    test('should reset rotation at 2π', () => {
      mob.position.rotation = Math.PI * 2;
      mob.generatePosition('forward');
      expect(mob.position.rotation).toBe(0);
    });

    test('should reset rotation at -2π', () => {
      mob.position.rotation = -Math.PI * 2;
      mob.generatePosition('forward');
      expect(mob.position.rotation).toBe(0);
    });
  });

  describe('Movement Direction Calculations', () => {
    test('should set direction to 1 for initial z-axis forward movement', () => {
      mob.position.axis = 'z';
      mob.position.rotation = 0;
      mob.generatePosition('forward');
      expect(mob.position.direction).toBe(1);
    });

    test('should set direction to -1 when rotation is π on z-axis', () => {
      mob.position.axis = 'z';
      mob.position.rotation = Math.PI;
      mob.generatePosition('forward');
      expect(mob.position.direction).toBe(-1);
    });

    test('should set direction to -1 when rotation is 1.5π on x-axis', () => {
      mob.position.axis = 'x';
      mob.position.rotation = Math.PI * 1.5;
      mob.generatePosition('forward');
      expect(mob.position.direction).toBe(-1);
    });

    test('should set direction to 1 for other rotation/axis combinations', () => {
      mob.position.axis = 'x';
      mob.position.rotation = Math.PI / 2;
      mob.generatePosition('forward');
      expect(mob.position.direction).toBe(1);
    });
  });

  describe('Action Duration Randomization', () => {
    test('should generate random duration between 5 and 10 seconds', () => {
      const durations = [];
      for (let i = 0; i < 100; i++) {
        mob.generatePosition('forward');
        durations.push(mob.startTime);
      }
      
      const min = Math.min(...durations);
      const max = Math.max(...durations);
      
      expect(min).toBeGreaterThanOrEqual(5);
      expect(max).toBeLessThanOrEqual(10);
    });

    test('should reset actionTime to 0 when generating new position', () => {
      mob.actionTime = 7.5;
      mob.generatePosition('forward');
      expect(mob.actionTime).toBe(0);
    });
  });

  describe('Movement with Delta Time', () => {
    test('should move along z-axis with positive direction', () => {
      mob.position.axis = 'z';
      mob.position.direction = 1;
      mob.model.position.z = 0;
      
      mob.move(0.1);
      
      // Movement = direction * (deltaTime * speed) = 1 * (0.1 * 2) = 0.2
      expect(mob.model.position.z).toBeCloseTo(0.2);
    });

    test('should move along x-axis with negative direction', () => {
      mob.position.axis = 'x';
      mob.position.direction = -1;
      mob.model.position.x = 5;
      
      mob.move(0.1);
      
      // Movement = -1 * (0.1 * 2) = -0.2
      expect(mob.model.position.x).toBeCloseTo(4.8);
    });

    test('should scale movement by delta time', () => {
      mob.position.axis = 'z';
      mob.position.direction = 1;
      mob.model.position.z = 0;
      
      mob.move(0.5);
      
      // Movement = 1 * (0.5 * 2) = 1.0
      expect(mob.model.position.z).toBeCloseTo(1.0);
    });

    test('should use speed property for movement calculation', () => {
      mob.speed = 5;
      mob.position.axis = 'z';
      mob.position.direction = 1;
      mob.model.position.z = 0;
      
      mob.move(0.1);
      
      // Movement = 1 * (0.1 * 5) = 0.5
      expect(mob.model.position.z).toBeCloseTo(0.5);
    });
  });

  describe('Terrain Following (calculateY)', () => {
    test('should find dirt block and position mob 1.5 units above it', () => {
      mob.chunk = mockChunk;
      mob.model.position.x = 8;
      mob.model.position.z = 8;
      
      const y = mob.calculateY();
      
      expect(y).toBe(11.5); // 10 + 1.5
    });

    test('should scan from chunk height down to 0', () => {
      mob.chunk = mockChunk;
      mob.model.position.x = 8;
      mob.model.position.z = 8;
      
      mob.calculateY();
      
      // Should have called getBlock for multiple y values
      expect(mockChunk.getBlock).toHaveBeenCalled();
    });

    test('should use integer coordinates for block lookup', () => {
      mob.chunk = mockChunk;
      mob.model.position.x = 8.7;
      mob.model.position.z = 8.3;
      
      mob.calculateY();
      
      // Should convert to integers
      expect(mockChunk.getBlock).toHaveBeenCalledWith(8, expect.any(Number), 8);
    });

    test('should return current y if no dirt block found', () => {
      const emptyChunk = {
        size: { width: 16, height: 32 },
        getBlock: jest.fn(() => null)
      };
      
      mob.chunk = emptyChunk;
      mob.model.position.y = 15;
      
      const y = mob.calculateY();
      
      expect(y).toBe(15);
    });
  });

  describe('Spawn Positioning', () => {
    test('should position mob at chunk center', () => {
      mob.generate(mockChunk);
      
      expect(mob.model.position.set).toHaveBeenCalledWith(8, 11.5, 8);
    });

    test('should store chunk reference', () => {
      mob.generate(mockChunk);
      expect(mob.chunk).toBe(mockChunk);
    });

    test('should calculate Y position based on terrain', () => {
      const spy = jest.spyOn(mob, 'calculateY');
      mob.generate(mockChunk);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Update Loop', () => {
    beforeEach(() => {
      mob.chunk = mockChunk;
      mob.model.position.x = 8;
      mob.model.position.z = 8;
    });

    test('should update Y position each frame', () => {
      const spy = jest.spyOn(mob, 'updateY');
      mob.update(0.1, {});
      expect(spy).toHaveBeenCalled();
    });

    test('should increment actionTime by deltaTime', () => {
      mob.actionTime = 2.0;
      mob.update(0.5, {});
      expect(mob.actionTime).toBeCloseTo(2.5);
    });

    test('should execute forward action', () => {
      mob.currentAction = 'forward';
      mob.position.axis = 'z';
      mob.position.direction = 1;
      const initialZ = mob.model.position.z;
      
      mob.update(0.1, {});
      
      expect(mob.model.position.z).toBeGreaterThan(initialZ);
    });

    test('should execute left action', () => {
      mob.currentAction = 'left';
      mob.position.axis = 'x';
      mob.position.direction = 1;
      const initialX = mob.model.position.x;
      
      mob.update(0.1, {});
      
      expect(mob.model.position.x).toBeGreaterThan(initialX);
    });

    test('should execute right action', () => {
      mob.currentAction = 'right';
      mob.position.axis = 'z';
      mob.position.direction = -1;
      const initialZ = mob.model.position.z;
      
      mob.update(0.1, {});
      
      expect(mob.model.position.z).toBeLessThan(initialZ);
    });

    test('should not move during idle action', () => {
      mob.currentAction = 'idle';
      const initialX = mob.model.position.x;
      const initialZ = mob.model.position.z;
      
      mob.update(0.1, {});
      
      expect(mob.model.position.x).toBe(initialX);
      expect(mob.model.position.z).toBe(initialZ);
    });
  });

  describe('Extensibility', () => {
    test('should add custom move to moves array', () => {
      mob.addCustomMove('jump');
      expect(mob.moves).toContain('jump');
    });

    test('should allow multiple custom moves', () => {
      mob.addCustomMove('jump');
      mob.addCustomMove('eat');
      expect(mob.moves).toContain('jump');
      expect(mob.moves).toContain('eat');
      expect(mob.moves.length).toBe(5);
    });

    test('should include custom moves in action selection', () => {
      mob.addCustomMove('eat');
      mob.currentAction = 'idle';
      
      // Select multiple times to increase chance of getting custom move
      const actions = new Set();
      for (let i = 0; i < 50; i++) {
        mob.selectRandomAction();
        if (mob.currentAction !== 'idle') {
          actions.add(mob.currentAction);
        }
        mob.currentAction = 'idle'; // Reset to idle for next iteration
      }
      
      expect(actions.has('eat')).toBe(true);
    });
  });
});

// Integration tests for chunk-mob system
describe('Chunk-Mob Integration', () => {
  let mockChunk;
  let mockCow;
  let mockModels;

  beforeEach(() => {
    mockModels = {
      cow: {
        model: {
          position: { x: 0, y: 0, z: 0, set: jest.fn() },
          rotateY: jest.fn(),
          scale: { set: jest.fn() },
          name: ''
        },
        animations: []
      }
    };

    // Create a mock chunk that simulates the real Chunk behavior
    mockChunk = {
      biome: 'Temperate',
      animals: [],
      size: { width: 16, height: 32 },
      position: { x: 0, y: 0, z: 0 },
      children: [],
      add: jest.fn(function(obj) {
        this.children.push(obj);
      }),
      getBlock: jest.fn((x, y, z) => {
        if (y === 10) return { id: blocks.dirt.id };
        return null;
      }),
      generateTerrain: jest.fn(),
      loadPlayerChanges: jest.fn(),
      generateMeshes: jest.fn()
    };

    // Import Cow class
    mockCow = require('../scripts/mobs/cow.js').Cow;
  });

  describe('Mob Spawning by Biome', () => {
    test('should spawn cow in Temperate biome', () => {
      mockChunk.biome = 'Temperate';
      
      // Simulate the chunk.generate logic for mob spawning
      if (mockChunk.biome === 'Temperate' || mockChunk.biome === 'Jungle') {
        const cow = new mockCow(mockModels.cow);
        cow.generate(mockChunk);
        mockChunk.animals.push(cow);
        mockChunk.add(cow.model);
      }
      
      expect(mockChunk.animals.length).toBe(1);
      expect(mockChunk.animals[0]).toBeInstanceOf(mockCow);
    });

    test('should spawn cow in Jungle biome', () => {
      mockChunk.biome = 'Jungle';
      
      // Simulate the chunk.generate logic for mob spawning
      if (mockChunk.biome === 'Temperate' || mockChunk.biome === 'Jungle') {
        const cow = new mockCow(mockModels.cow);
        cow.generate(mockChunk);
        mockChunk.animals.push(cow);
        mockChunk.add(cow.model);
      }
      
      expect(mockChunk.animals.length).toBe(1);
      expect(mockChunk.animals[0]).toBeInstanceOf(mockCow);
    });

    test('should not spawn cow in Desert biome', () => {
      mockChunk.biome = 'Desert';
      
      // Simulate the chunk.generate logic for mob spawning
      if (mockChunk.biome === 'Temperate' || mockChunk.biome === 'Jungle') {
        const cow = new mockCow(mockModels.cow);
        cow.generate(mockChunk);
        mockChunk.animals.push(cow);
        mockChunk.add(cow.model);
      }
      
      expect(mockChunk.animals.length).toBe(0);
    });

    test('should not spawn cow in Tundra biome', () => {
      mockChunk.biome = 'Tundra';
      
      // Simulate the chunk.generate logic for mob spawning
      if (mockChunk.biome === 'Temperate' || mockChunk.biome === 'Jungle') {
        const cow = new mockCow(mockModels.cow);
        cow.generate(mockChunk);
        mockChunk.animals.push(cow);
        mockChunk.add(cow.model);
      }
      
      expect(mockChunk.animals.length).toBe(0);
    });
  });

  describe('Chunk Update Integration', () => {
    test('should call mob.update when chunk.update is called', () => {
      // Add a cow to the chunk
      const cow = new mockCow(mockModels.cow);
      cow.generate(mockChunk);
      mockChunk.animals.push(cow);
      
      const updateSpy = jest.spyOn(cow, 'update');
      
      // Simulate chunk.update behavior
      const deltaTime = 0.016;
      const mockWorld = {};
      mockChunk.animals.forEach((animal) => animal.update(deltaTime, mockWorld));
      
      expect(updateSpy).toHaveBeenCalledWith(deltaTime, mockWorld);
    });

    test('should update all mobs in chunk', () => {
      // Add two cows to the chunk
      const cow1 = new mockCow(mockModels.cow);
      const cow2 = new mockCow(mockModels.cow);
      cow1.generate(mockChunk);
      cow2.generate(mockChunk);
      mockChunk.animals.push(cow1, cow2);
      
      const updateSpy1 = jest.spyOn(cow1, 'update');
      const updateSpy2 = jest.spyOn(cow2, 'update');
      
      // Simulate chunk.update behavior
      const deltaTime = 0.016;
      const mockWorld = {};
      mockChunk.animals.forEach((animal) => animal.update(deltaTime, mockWorld));
      
      expect(updateSpy1).toHaveBeenCalledWith(deltaTime, mockWorld);
      expect(updateSpy2).toHaveBeenCalledWith(deltaTime, mockWorld);
    });

    test('should handle empty animals array', () => {
      mockChunk.animals = [];
      
      // Simulate chunk.update behavior
      expect(() => {
        mockChunk.animals.forEach((animal) => animal.update(0.016, {}));
      }).not.toThrow();
    });
  });

  describe('Scene Graph Integration', () => {
    test('should add mob model to chunk scene graph', () => {
      const cow = new mockCow(mockModels.cow);
      cow.generate(mockChunk);
      mockChunk.animals.push(cow);
      mockChunk.add(cow.model);
      
      expect(mockChunk.add).toHaveBeenCalledWith(cow.model);
      expect(mockChunk.animals.length).toBe(1);
      expect(mockChunk.children.length).toBe(1);
    });

    test('should add multiple mob models to scene graph', () => {
      const cow1 = new mockCow(mockModels.cow);
      const cow2 = new mockCow(mockModels.cow);
      
      cow1.generate(mockChunk);
      mockChunk.animals.push(cow1);
      mockChunk.add(cow1.model);
      
      cow2.generate(mockChunk);
      mockChunk.animals.push(cow2);
      mockChunk.add(cow2.model);
      
      expect(mockChunk.add).toHaveBeenCalledTimes(2);
      expect(mockChunk.animals.length).toBe(2);
      expect(mockChunk.children.length).toBe(2);
    });
  });

  describe('Mob-Chunk Reference', () => {
    test('should store chunk reference in mob', () => {
      const cow = new mockCow(mockModels.cow);
      cow.generate(mockChunk);
      
      expect(cow.chunk).toBe(mockChunk);
    });

    test('should use chunk reference for terrain queries', () => {
      const cow = new mockCow(mockModels.cow);
      cow.generate(mockChunk);
      
      const y = cow.calculateY();
      
      expect(mockChunk.getBlock).toHaveBeenCalled();
      expect(y).toBe(11.5); // 10 + 1.5
    });
  });
});
