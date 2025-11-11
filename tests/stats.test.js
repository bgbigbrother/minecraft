import { describe, test, expect } from '@jest/globals';

describe('Stats Module', () => {
  test('should create stats instance', async () => {
    const { stats } = await import('../scripts/core/stats.js');
    
    expect(stats).toBeDefined();
    expect(stats.dom).toBeDefined();
  });
});
