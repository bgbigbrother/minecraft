import { describe, test, expect } from '@jest/globals';
import { resources } from '../scripts/textures/resources.js';

describe('Resources', () => {
  test('should export resources array', () => {
    expect(resources).toBeDefined();
    expect(Array.isArray(resources)).toBe(true);
  });

  test('should have 3 resource types', () => {
    expect(resources.length).toBe(3);
  });

  test('should include stone', () => {
    const stone = resources.find(r => r.id === 3);
    expect(stone).toBeDefined();
  });

  test('should include coal ore', () => {
    const coalOre = resources.find(r => r.id === 4);
    expect(coalOre).toBeDefined();
  });

  test('should include iron ore', () => {
    const ironOre = resources.find(r => r.id === 5);
    expect(ironOre).toBeDefined();
  });

  test('all resources should have required properties', () => {
    resources.forEach(resource => {
      expect(resource).toHaveProperty('id');
      expect(resource).toHaveProperty('scale');
      expect(resource).toHaveProperty('scarcity');
    });
  });
});
