import { describe, test, expect } from '@jest/globals';

describe('Core Scene', () => {
  test('should create scene with fog', async () => {
    const { scene } = await import('../scripts/core/scene.js');
    
    expect(scene).toBeDefined();
    expect(scene.fog).toBeDefined();
    expect(scene.fog.near).toBe(50);
    expect(scene.fog.far).toBe(75);
  });
});

describe('Core Camera', () => {
  test('should create orbit camera with correct settings', async () => {
    const { orbitCamera } = await import('../scripts/core/camera.js');
    
    expect(orbitCamera).toBeDefined();
    expect(orbitCamera.fov).toBe(75);
    expect(orbitCamera.near).toBe(0.1);
    expect(orbitCamera.far).toBe(1000);
  });
});
