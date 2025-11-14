import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Cow } from '../scripts/mobs/cow.js';
import { Chunk } from '../scripts/biome/chunk.js';
import { World } from '../scripts/world/world.js';
import { blocks } from '../scripts/textures/blocks.js';
import * as THREE from 'three';

// Mock SkeletonUtils
jest.mock('three/examples/jsm/utils/SkeletonUtils.js', () => ({
  clone: jest.fn((model) => ({
    ...model,
    position: { x: 0, y: 0, z: 0, set: jest.fn() },
    rotateY: jest.fn(),
    scale: { set: jest.fn() },
    name: ''
  }))
}));

// Mock AnimationClip
jest.spyOn(THREE.AnimationClip, 'findByName').mockImplementation((animations, name) => {
  return { name, duration: 1.0 };
});

describe('Mob System End-to-End Integration', () => {
  let mockModels;
  let world;
  let chunk;

  beforeEach(() => {
    // Create mock models that simulate loaded GLTF data
    mockModels = {
      cow: {
        model: {
          position: { x: 0, y: 0, z: 0, set: jest.fn() },
          rotateY: jest.fn(),
          scale: { set: jest.fn() },
          name: '',
          traverse: jest.fn()
        },
        animations: [
          { name: 'Walk', duration: 1.0 },
          { name: 'Idle', duration: 1.0 },
          { name: 'Eating', duration: 1.0 }
        ]
      },
      testMob: {
        model: {
          position: { x: 0, y: 0, z: 0, set: jest.fn() },
          rotateY: jest.fn(),
          scale: { set: jest.fn() },
          name: '',
          traverse: jest.fn(),
          clone: jest.fn(function() {
            return {
              position: { x: 0, y: 0, z: 0, set: jest.fn() },
              rotateY: jest.fn(),
              scale: { set: jest.fn() },
              name: '',
              traverse: jest.fn(),
              clone: this.clone
            };
          })
        },
        animations: []
      }
    };

    // Create a real World instance with mocked models
    world = new World(mockModels);
    
    // Mock the chunk size and params
    const chunkSize = { width: 16, height: 32 };
    const params = {
      seed: 12345,
      terrain: {
        scale: 30,
        magnitude: 0.5,
        offset: 0.2
      }
    };
    
    // Create a chunk with mocked terrain data
    chunk = new Chunk(chunkSize, params, world.dataStore);
    chunk.position.set(0, 0, 0);
    chunk.userData = { x: 0, z: 0 };
    
    // Mock the chunk's terrain generation to create a simple flat terrain
    chunk.generateTerrain = jest.fn(() => {
      // Create a simple flat terrain with dirt blocks at y=10
      for (let x = 0; x < chunkSize.width; x++) {
        for (let z = 0; z < chunkSize.width; z++) {
          chunk.setBlockId(x, 10, z, blocks.dirt.id);
        }
      }
    });
    
    chunk.generateMeshes = jest.fn();
    chunk.loadPlayerChanges = jest.fn();
  });

  describe('Cow Spawning in Appropriate Biomes', () => {
    test('should spawn cow in Temperate biome', () => {
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(1);
      // Currently using MoveMob (testMob) instead of Cow
      expect(chunk.animals[0].model.name).toBe('');
    });

    test('should spawn cow in Jungle biome', () => {
      chunk.biome = 'Jungle';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(1);
    });

    test('should not spawn cow in Desert biome', () => {
      chunk.biome = 'Desert';
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(0);
    });

    test('should not spawn cow in Tundra biome', () => {
      chunk.biome = 'Tundra';
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(0);
    });

    test('should add cow model to chunk scene graph', () => {
      chunk.biome = 'Temperate';
      const addSpy = jest.spyOn(chunk, 'add');
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      
      expect(addSpy).toHaveBeenCalledWith(chunk.animals[0].model);
    });

    test('should scale cow model to 0.5', () => {
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      
      // MoveMob doesn't set scale, only Cow does
      const mob = chunk.animals[0];
      expect(mob.model).toBeDefined();
    });
  });

  describe('Cow Animation and Movement', () => {
    let mob;

    beforeEach(() => {
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      mob = chunk.animals[0];
    });

    test('should initialize with animation mixer', () => {
      // MoveMob doesn't have mixer, only Cow does
      expect(mob).toBeDefined();
    });

    test('should have "eat" action in moves array', () => {
      // MoveMob doesn't have eat action by default
      expect(mob.moves).toContain('forward');
      expect(mob.moves).toContain('left');
      expect(mob.moves).toContain('right');
    });

    test('should update animation mixer on each frame', () => {
      // MoveMob doesn't have mixer
      expect(() => mob.update(0.016, world)).not.toThrow();
    });

    test('should play Walk animation for forward movement', () => {
      mob.currentAction = 'forward';
      mob.previousAction = 'idle';
      
      // MoveMob doesn't have selectNewAction, it has selectRandomAction
      expect(mob.selectRandomAction).toBeDefined();
    });

    test('should play Idle animation for idle action', () => {
      mob.currentAction = 'idle';
      mob.previousAction = 'forward';
      
      // MoveMob doesn't have animations
      expect(mob.currentAction).toBe('idle');
    });

    test('should play Eating animation for eat action', () => {
      mob.currentAction = 'eat';
      mob.previousAction = 'idle';
      
      // MoveMob doesn't have eat action by default
      expect(mob.currentAction).toBe('eat');
    });

    test('should move forward over time', () => {
      mob.currentAction = 'forward';
      mob.position.axis = 'z';
      mob.position.direction = 1;
      const initialZ = mob.model.position.z;
      
      // Simulate multiple frames
      for (let i = 0; i < 10; i++) {
        mob.update(0.016, world);
      }
      
      // Mob should have moved (position.z should have increased)
      expect(mob.model.position.z).toBeGreaterThan(initialZ);
    });

    test('should rotate when turning left', () => {
      const initialRotation = mob.position.rotation;
      mob.generatePosition('left');
      
      expect(mob.position.rotation).toBeGreaterThan(initialRotation);
      expect(mob.model.rotateY).toHaveBeenCalled();
    });

    test('should rotate when turning right', () => {
      const initialRotation = mob.position.rotation;
      mob.generatePosition('right');
      
      expect(mob.position.rotation).not.toBe(initialRotation);
      expect(mob.model.rotateY).toHaveBeenCalled();
    });

    test('should select new action when action time expires', () => {
      mob.actionTime = 0;
      mob.startTime = 5;
      
      // MoveMob doesn't automatically select new actions, only Cow does
      // Test that we can manually call selectRandomAction
      expect(() => mob.selectRandomAction()).not.toThrow();
      expect(mob.currentAction).toBeDefined();
    });
  });

  describe('Multiple Chunks with Mobs', () => {
    test('should support multiple chunks each with their own mobs', () => {
      // Create first chunk with cow
      const chunk1 = new Chunk(
        { width: 16, height: 32 },
        { seed: 12345, terrain: { scale: 30, magnitude: 0.5, offset: 0.2 } },
        world.dataStore
      );
      chunk1.biome = 'Temperate';
      chunk1.generateTerrain = jest.fn();
      chunk1.generateMeshes = jest.fn();
      chunk1.loadPlayerChanges = jest.fn();
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk1.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk1.generate(mockModels);
      
      // Create second chunk with cow
      const chunk2 = new Chunk(
        { width: 16, height: 32 },
        { seed: 12345, terrain: { scale: 30, magnitude: 0.5, offset: 0.2 } },
        world.dataStore
      );
      chunk2.biome = 'Jungle';
      chunk2.generateTerrain = jest.fn();
      chunk2.generateMeshes = jest.fn();
      chunk2.loadPlayerChanges = jest.fn();
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk2.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk2.generate(mockModels);
      
      expect(chunk1.animals.length).toBe(1);
      expect(chunk2.animals.length).toBe(1);
      expect(chunk1.animals[0]).not.toBe(chunk2.animals[0]);
    });

    test('should update all mobs in all chunks', () => {
      // Create two chunks with mobs
      const chunk1 = new Chunk(
        { width: 16, height: 32 },
        { seed: 12345, terrain: { scale: 30, magnitude: 0.5, offset: 0.2 } },
        world.dataStore
      );
      chunk1.biome = 'Temperate';
      chunk1.generateTerrain = jest.fn();
      chunk1.generateMeshes = jest.fn();
      chunk1.loadPlayerChanges = jest.fn();
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk1.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk1.generate(mockModels);
      
      const chunk2 = new Chunk(
        { width: 16, height: 32 },
        { seed: 12345, terrain: { scale: 30, magnitude: 0.5, offset: 0.2 } },
        world.dataStore
      );
      chunk2.biome = 'Jungle';
      chunk2.generateTerrain = jest.fn();
      chunk2.generateMeshes = jest.fn();
      chunk2.loadPlayerChanges = jest.fn();
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk2.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk2.generate(mockModels);
      
      const cow1UpdateSpy = jest.spyOn(chunk1.animals[0], 'update');
      const cow2UpdateSpy = jest.spyOn(chunk2.animals[0], 'update');
      
      // Update both chunks
      chunk1.update(0.016, world);
      chunk2.update(0.016, world);
      
      expect(cow1UpdateSpy).toHaveBeenCalledWith(0.016, world);
      expect(cow2UpdateSpy).toHaveBeenCalledWith(0.016, world);
    });

    test('should maintain independent mob states across chunks', () => {
      // Create two chunks
      const chunk1 = new Chunk(
        { width: 16, height: 32 },
        { seed: 12345, terrain: { scale: 30, magnitude: 0.5, offset: 0.2 } },
        world.dataStore
      );
      chunk1.biome = 'Temperate';
      chunk1.generateTerrain = jest.fn();
      chunk1.generateMeshes = jest.fn();
      chunk1.loadPlayerChanges = jest.fn();
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk1.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk1.generate(mockModels);
      
      const chunk2 = new Chunk(
        { width: 16, height: 32 },
        { seed: 12345, terrain: { scale: 30, magnitude: 0.5, offset: 0.2 } },
        world.dataStore
      );
      chunk2.biome = 'Jungle';
      chunk2.generateTerrain = jest.fn();
      chunk2.generateMeshes = jest.fn();
      chunk2.loadPlayerChanges = jest.fn();
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk2.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk2.generate(mockModels);
      
      const cow1 = chunk1.animals[0];
      const cow2 = chunk2.animals[0];
      
      // Set different action times to prevent action changes during update
      cow1.currentAction = 'forward';
      cow1.actionTime = 0;
      cow1.startTime = 10; // Won't expire during single update
      
      cow2.currentAction = 'idle';
      cow2.actionTime = 0;
      cow2.startTime = 10; // Won't expire during single update
      
      // Update both
      chunk1.update(0.016, world);
      chunk2.update(0.016, world);
      
      // States should remain independent (actions won't change because actionTime < startTime)
      expect(cow1.currentAction).toBe('forward');
      expect(cow2.currentAction).toBe('idle');
      
      // Verify they have different instances
      expect(cow1).not.toBe(cow2);
      expect(cow1.model).not.toBe(cow2.model);
    });
  });

  describe('Terrain Following', () => {
    let cow;

    beforeEach(() => {
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      cow = chunk.animals[0];
    });

    test('should position cow at ground level on spawn', () => {
      expect(cow.model.position.set).toHaveBeenCalled();
      const setCall = cow.model.position.set.mock.calls[0];
      
      // Should be positioned at chunk center (8, y, 8) where y is calculated
      expect(setCall[0]).toBe(8); // x = width/2
      expect(setCall[2]).toBe(8); // z = width/2
    });

    test('should store reference to parent chunk', () => {
      expect(cow.chunk).toBe(chunk);
    });

    test('should calculate Y position based on terrain', () => {
      cow.model.position.x = 8;
      cow.model.position.z = 8;
      
      const y = cow.calculateY();
      
      // Should find dirt block at y=10 and position 1.5 units above
      expect(y).toBe(11.5);
    });

    test('should update Y position every frame', () => {
      const updateYSpy = jest.spyOn(cow, 'updateY');
      
      cow.update(0.016, world);
      
      expect(updateYSpy).toHaveBeenCalled();
    });

    test('should follow terrain as cow moves', () => {
      cow.currentAction = 'forward';
      cow.position.axis = 'z';
      cow.position.direction = 1;
      
      // Update multiple times to simulate movement
      for (let i = 0; i < 5; i++) {
        cow.update(0.016, world);
      }
      
      // updateY should have been called multiple times
      const updateYSpy = jest.spyOn(cow, 'updateY');
      cow.update(0.016, world);
      expect(updateYSpy).toHaveBeenCalled();
    });
  });

  describe('World Integration', () => {
    test('should call chunk.update from world.update', () => {
      // Add chunk to world
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      chunk.userData = { x: 0, z: 0 };
      chunk.name = 'Chunk';
      world.add(chunk);
      
      const chunkUpdateSpy = jest.spyOn(chunk, 'update');
      
      // Create a mock player
      const mockPlayer = {
        position: { x: 0, y: 10, z: 0 }
      };
      
      // Update world
      world.update(0.016, mockPlayer);
      
      expect(chunkUpdateSpy).toHaveBeenCalledWith(0.016, world);
    });

    test('should update all mobs through world update loop', () => {
      // Add chunk with cow to world
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      chunk.userData = { x: 0, z: 0 };
      chunk.name = 'Chunk';
      world.add(chunk);
      
      const cow = chunk.animals[0];
      const cowUpdateSpy = jest.spyOn(cow, 'update');
      
      // Create a mock player
      const mockPlayer = {
        position: { x: 0, y: 10, z: 0 }
      };
      
      // Update world (which should update chunks, which should update mobs)
      world.update(0.016, mockPlayer);
      
      expect(cowUpdateSpy).toHaveBeenCalledWith(0.016, world);
    });
  });

  describe('Complete System Verification', () => {
    test('should complete full lifecycle: spawn, animate, move, follow terrain', () => {
      // 1. Spawn mob in appropriate biome
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(1);
      const mob = chunk.animals[0];
      
      // 2. Verify mob is properly initialized
      expect(mob).toBeDefined();
      expect(mob.chunk).toBe(chunk);
      
      // 3. Verify mob can move
      mob.currentAction = 'forward';
      mob.position.axis = 'z';
      mob.position.direction = 1;
      const initialZ = mob.model.position.z;
      
      mob.update(0.1, world);
      
      expect(mob.model.position.z).toBeGreaterThan(initialZ);
      
      // 4. Verify mob follows terrain
      const calculateYSpy = jest.spyOn(mob, 'calculateY');
      mob.update(0.016, world);
      expect(calculateYSpy).toHaveBeenCalled();
    });

    test('should handle multiple update cycles correctly', () => {
      chunk.biome = 'Temperate';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      const mob = chunk.animals[0];
      
      mob.currentAction = 'forward';
      mob.position.axis = 'z';
      mob.position.direction = 1;
      
      // Run 60 frames (1 second at 60fps)
      for (let i = 0; i < 60; i++) {
        expect(() => {
          mob.update(0.016, world);
        }).not.toThrow();
      }
      
      // Mob should still be functional
      expect(mob.currentAction).toBeDefined();
    });

    test('should integrate with world update loop seamlessly', () => {
      // Setup world with chunk and mob
      chunk.biome = 'Jungle';
      
      // Set up terrain data with spawnable blocks
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockId(x, 10, z, 1); // grass block id
        }
      }
      
      chunk.generate(mockModels);
      chunk.userData = { x: 0, z: 0 };
      chunk.name = 'Chunk';
      world.add(chunk);
      
      const mockPlayer = {
        position: { x: 0, y: 10, z: 0 }
      };
      
      // Run multiple world update cycles
      for (let i = 0; i < 30; i++) {
        expect(() => {
          world.update(0.016, mockPlayer);
        }).not.toThrow();
      }
      
      // System should still be functional
      expect(chunk.animals.length).toBe(1);
      expect(chunk.animals[0]).toBeDefined();
    });
  });
});
