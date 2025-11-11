import { describe, test, expect } from '@jest/globals';

describe('Sun Module', () => {
  test('should create sun directional light', async () => {
    const { sun } = await import('../scripts/core/sun.js');
    
    expect(sun).toBeDefined();
    expect(sun.intensity).toBe(1.5);
    expect(sun.castShadow).toBe(true);
  });

  test('should configure shadow camera', async () => {
    const { sun } = await import('../scripts/core/sun.js');
    
    expect(sun.shadow.camera.left).toBe(-40);
    expect(sun.shadow.camera.right).toBe(40);
    expect(sun.shadow.camera.top).toBe(40);
    expect(sun.shadow.camera.bottom).toBe(-40);
  });

  test('should create sun mesh', async () => {
    const { sunMesh } = await import('../scripts/core/sun.js');
    
    expect(sunMesh).toBeDefined();
    expect(sunMesh.position).toBeDefined();
  });
});
