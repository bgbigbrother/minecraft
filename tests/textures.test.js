import { describe, test, expect } from '@jest/globals';
import { blocks } from '../scripts/textures/blocks.js';

describe('Blocks', () => {
  test('should export blocks object', () => {
    expect(blocks).toBeDefined();
    expect(typeof blocks).toBe('object');
  });

  test('should have empty block', () => {
    expect(blocks.empty).toBeDefined();
  });

  test('should have grass block', () => {
    expect(blocks.grass).toBeDefined();
  });

  test('should have dirt block', () => {
    expect(blocks.dirt).toBeDefined();
  });

  test('should have stone block', () => {
    expect(blocks.stone).toBeDefined();
  });

  test('should have coal ore block', () => {
    expect(blocks.coalOre).toBeDefined();
  });

  test('should have iron ore block', () => {
    expect(blocks.ironOre).toBeDefined();
  });

  test('should have tree block', () => {
    expect(blocks.tree).toBeDefined();
  });

  test('should have leaves block', () => {
    expect(blocks.leaves).toBeDefined();
  });

  test('should have sand block', () => {
    expect(blocks.sand).toBeDefined();
  });

  test('should have cloud block', () => {
    expect(blocks.cloud).toBeDefined();
  });

  test('should have snow block', () => {
    expect(blocks.snow).toBeDefined();
  });

  test('should have jungle tree block', () => {
    expect(blocks.jungleTree).toBeDefined();
  });

  test('should have jungle leaves block', () => {
    expect(blocks.jungleLeaves).toBeDefined();
  });

  test('should have cactus block', () => {
    expect(blocks.cactus).toBeDefined();
  });

  test('should have jungle grass block', () => {
    expect(blocks.jungleGrass).toBeDefined();
  });
});
