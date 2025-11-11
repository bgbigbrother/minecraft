import { describe, test, expect } from '@jest/globals';

describe('Renderer Module', () => {
  test('should create renderer with correct settings', async () => {
    const { renderer } = await import('../scripts/core/renderer.js');
    
    expect(renderer).toBeDefined();
    expect(renderer.shadowMap.enabled).toBe(true);
  });
});
