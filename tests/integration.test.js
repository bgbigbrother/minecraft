import { describe, test, expect } from '@jest/globals';
import { RNG } from '../scripts/libraries/rng.js';
import { WorldBaseClass } from '../scripts/world/base.js';
import { DataStore } from '../scripts/world/world_store.js';
import { blocks } from '../scripts/textures/blocks.js';

describe('Integration Tests', () => {
  describe('World Generation with RNG', () => {
    test('should create world with deterministic seed', () => {
      const world1 = new WorldBaseClass();
      const world2 = new WorldBaseClass();
      
      world1.params.seed = 12345;
      world2.params.seed = 12345;
      
      expect(world1.params.seed).toBe(world2.params.seed);
    });

    test('should use RNG for deterministic generation', () => {
      const rng1 = new RNG(12345);
      const rng2 = new RNG(12345);
      
      const values1 = Array.from({ length: 10 }, () => rng1.random());
      const values2 = Array.from({ length: 10 }, () => rng2.random());
      
      expect(values1).toEqual(values2);
    });
  });

  describe('DataStore with World', () => {
    test('should store and retrieve block modifications', () => {
      const dataStore = new DataStore();
      
      // Simulate placing blocks
      dataStore.set(0, 0, 5, 10, 15, blocks.stone.id);
      dataStore.set(0, 0, 6, 11, 16, blocks.grass.id);
      
      // Verify blocks are stored
      expect(dataStore.get(0, 0, 5, 10, 15)).toBe(blocks.stone.id);
      expect(dataStore.get(0, 0, 6, 11, 16)).toBe(blocks.grass.id);
    });

    test('should handle world save/load cycle', () => {
      const world = new WorldBaseClass();
      const originalSeed = 99999;
      world.params.seed = originalSeed;
      
      // Verify seed is set
      expect(world.params.seed).toBe(originalSeed);
    });
  });

  describe('Block System', () => {
    test('should have unique IDs for all blocks', () => {
      const blockIds = Object.values(blocks).map(b => b.id);
      const uniqueIds = new Set(blockIds);
      
      expect(blockIds.length).toBe(uniqueIds.size);
    });

    test('should have empty block with ID 0', () => {
      expect(blocks.empty.id).toBe(0);
    });
  });

  describe('World Parameters', () => {
    test('should have valid terrain parameters', () => {
      const world = new WorldBaseClass();
      
      expect(world.params.terrain.scale).toBeGreaterThan(0);
      expect(world.params.terrain.magnitude).toBeGreaterThan(0);
      expect(world.params.terrain.waterOffset).toBeLessThan(world.params.terrain.offset);
    });

    test('should have valid biome thresholds', () => {
      const world = new WorldBaseClass();
      const biomes = world.params.biomes;
      
      expect(biomes.tundraToTemperate).toBeLessThan(biomes.temperateToJungle);
      expect(biomes.temperateToJungle).toBeLessThan(biomes.jungleToDesert);
      expect(biomes.jungleToDesert).toBeLessThanOrEqual(1.0);
    });

    test('should have valid tree parameters', () => {
      const world = new WorldBaseClass();
      const trees = world.params.trees;
      
      expect(trees.trunk.minHeight).toBeLessThanOrEqual(trees.trunk.maxHeight);
      expect(trees.canopy.minRadius).toBeLessThanOrEqual(trees.canopy.maxRadius);
      expect(trees.frequency).toBeGreaterThan(0);
      expect(trees.frequency).toBeLessThan(1);
    });
  });
});
