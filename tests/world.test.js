import { describe, test, expect, beforeEach } from '@jest/globals';
import { WorldBaseClass } from '../scripts/world/base.js';

describe('WorldBaseClass', () => {
  let world;

  beforeEach(() => {
    world = new WorldBaseClass();
  });

  test('should create world instance', () => {
    expect(world).toBeDefined();
    expect(world.children).toEqual([]);
  });

  test('should have default asyncLoading enabled', () => {
    expect(world.asyncLoading).toBe(true);
  });

  test('should have default drawDistance of 3', () => {
    expect(world.drawDistance).toBe(3);
  });

  test('should have correct chunkSize dimensions', () => {
    expect(world.chunkSize.width).toBe(32);
    expect(world.chunkSize.height).toBe(32);
  });

  test('should have default params with seed', () => {
    expect(world.params.seed).toBe(1);
  });

  test('should have terrain parameters', () => {
    expect(world.params.terrain).toBeDefined();
    expect(world.params.terrain.scale).toBe(100);
    expect(world.params.terrain.magnitude).toBe(8);
    expect(world.params.terrain.offset).toBe(6);
    expect(world.params.terrain.waterOffset).toBe(4);
  });

  test('should have biome parameters', () => {
    expect(world.params.biomes).toBeDefined();
    expect(world.params.biomes.scale).toBe(500);
    expect(world.params.biomes.tundraToTemperate).toBe(0.25);
    expect(world.params.biomes.temperateToJungle).toBe(0.5);
    expect(world.params.biomes.jungleToDesert).toBe(0.75);
  });

  test('should have tree generation parameters', () => {
    expect(world.params.trees).toBeDefined();
    expect(world.params.trees.frequency).toBe(0.005);
    expect(world.params.trees.trunk.minHeight).toBe(4);
    expect(world.params.trees.trunk.maxHeight).toBe(7);
  });

  test('should have cloud parameters', () => {
    expect(world.params.clouds).toBeDefined();
    expect(world.params.clouds.scale).toBe(30);
    expect(world.params.clouds.density).toBe(0.5);
  });

  test('should allow changing asyncLoading', () => {
    world.asyncLoading = false;
    expect(world.asyncLoading).toBe(false);
  });

  test('should allow changing drawDistance', () => {
    world.drawDistance = 5;
    expect(world.drawDistance).toBe(5);
  });

  test('should allow modifying params', () => {
    world.params.seed = 12345;
    expect(world.params.seed).toBe(12345);
  });
});
