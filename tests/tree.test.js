import { describe, test, expect, beforeEach } from '@jest/globals';
import { Tree } from '../scripts/biome/tree.js';
import { RNG } from '../scripts/libraries/rng.js';
import { blocks } from '../scripts/textures/blocks.js';

describe('Tree', () => {
  let rng;
  const params = {
    trunk: {
      minHeight: 4,
      maxHeight: 7
    },
    canopy: {
      minRadius: 3,
      maxRadius: 3,
      density: 0.7
    }
  };

  beforeEach(() => {
    rng = new RNG(12345);
  });

  test('should create tree instance', () => {
    const tree = new Tree('Temperate', rng, 0, 0, 0, params);
    expect(tree).toBeDefined();
    expect(tree.blocks).toEqual([]);
  });

  test('should generate temperate tree with trunk and canopy', () => {
    const tree = new Tree('Temperate', rng, 5, 10, 15, params);
    const blocks = tree.generate();
    
    expect(blocks.length).toBeGreaterThan(0);
    
    // Check that trunk blocks exist
    const trunkBlocks = blocks.filter(b => b.id === 6); // tree block id
    expect(trunkBlocks.length).toBeGreaterThan(0);
    
    // Check that leaf blocks exist
    const leafBlocks = blocks.filter(b => b.id === 7); // leaves block id
    expect(leafBlocks.length).toBeGreaterThan(0);
  });

  test('should generate jungle tree', () => {
    const tree = new Tree('Jungle', rng, 5, 10, 15, params);
    const blocks = tree.generate();
    
    expect(blocks.length).toBeGreaterThan(0);
    
    // Check for jungle tree trunk
    const trunkBlocks = blocks.filter(b => b.id === 11); // jungle tree block id
    expect(trunkBlocks.length).toBeGreaterThan(0);
  });

  test('should generate desert cactus without canopy', () => {
    const tree = new Tree('Desert', rng, 5, 10, 15, params);
    const blocks = tree.generate();
    
    expect(blocks.length).toBeGreaterThan(0);
    
    // Check for cactus blocks
    const cactusBlocks = blocks.filter(b => b.id === 13); // cactus block id
    expect(cactusBlocks.length).toBeGreaterThan(0);
    
    // Desert trees should not have leaves
    const leafBlocks = blocks.filter(b => b.id === 7 || b.id === 12);
    expect(leafBlocks.length).toBe(0);
  });

  test('should generate tundra tree without canopy', () => {
    const tree = new Tree('Tundra', rng, 5, 10, 15, params);
    const blocks = tree.generate();
    
    expect(blocks.length).toBeGreaterThan(0);
    
    // Tundra trees should have trunk but no leaves
    const trunkBlocks = blocks.filter(b => b.id === 6);
    expect(trunkBlocks.length).toBeGreaterThan(0);
  });

  test('should place trunk at correct position', () => {
    const x = 10, y = 5, z = 20;
    const tree = new Tree('Temperate', rng, x, y, z, params);
    const blocks = tree.generate();
    
    // All trunk blocks should have same x and z as tree position
    const trunkBlocks = blocks.filter(b => b.id === 6);
    trunkBlocks.forEach(block => {
      expect(block.x).toBe(x);
      expect(block.z).toBe(z);
      expect(block.y).toBeGreaterThanOrEqual(y);
    });
  });

  test('should respect trunk height parameters', () => {
    const tree = new Tree('Temperate', rng, 0, 0, 0, params);
    const blocks = tree.generate();
    
    const trunkBlocks = blocks.filter(b => b.id === 6);
    const trunkHeight = trunkBlocks.length;
    
    expect(trunkHeight).toBeGreaterThanOrEqual(params.trunk.minHeight);
    expect(trunkHeight).toBeLessThanOrEqual(params.trunk.maxHeight);
  });

  test('should generate deterministic trees with same seed', () => {
    const rng1 = new RNG(12345);
    const rng2 = new RNG(12345);
    
    const tree1 = new Tree('Temperate', rng1, 0, 0, 0, params);
    const tree2 = new Tree('Temperate', rng2, 0, 0, 0, params);
    
    const blocks1 = tree1.generate();
    const blocks2 = tree2.generate();
    
    expect(blocks1.length).toBe(blocks2.length);
  });
});
