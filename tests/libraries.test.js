import { describe, test, expect } from '@jest/globals';
import { RNG } from '../scripts/libraries/rng.js';

describe('RNG (Random Number Generator)', () => {
  test('should create RNG with seed', () => {
    const rng = new RNG(12345);
    expect(rng).toBeDefined();
    expect(rng.m_w).toBeDefined();
    expect(rng.m_z).toBeDefined();
  });

  test('should generate deterministic random numbers', () => {
    const rng1 = new RNG(12345);
    const rng2 = new RNG(12345);
    
    const value1 = rng1.random();
    const value2 = rng2.random();
    
    expect(value1).toBe(value2);
  });

  test('should generate numbers between 0 and 1', () => {
    const rng = new RNG(12345);
    
    for (let i = 0; i < 100; i++) {
      const value = rng.random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  test('should generate different sequences for different seeds', () => {
    const rng1 = new RNG(12345);
    const rng2 = new RNG(54321);
    
    const value1 = rng1.random();
    const value2 = rng2.random();
    
    expect(value1).not.toBe(value2);
  });

  test('should generate consistent sequence', () => {
    const rng = new RNG(12345);
    const sequence1 = [rng.random(), rng.random(), rng.random()];
    
    const rng2 = new RNG(12345);
    const sequence2 = [rng2.random(), rng2.random(), rng2.random()];
    
    expect(sequence1).toEqual(sequence2);
  });
});
