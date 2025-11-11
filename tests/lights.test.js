import { describe, test, expect, jest } from '@jest/globals';

// Mock scene
const mockScene = {
  add: jest.fn()
};

jest.mock('../scripts/core/scene', () => ({
  scene: mockScene
}));

jest.mock('../scripts/core/sun', () => ({
  sun: {
    target: {}
  },
  sunMesh: {}
}));

describe('Lights Module', () => {
  test('should export setupLights function', async () => {
    const { setupLights } = await import('../scripts/core/lights.js');
    expect(setupLights).toBeDefined();
    expect(typeof setupLights).toBe('function');
  });

  test('should add lights to scene when setupLights is called', async () => {
    mockScene.add.mockClear();
    const { setupLights } = await import('../scripts/core/lights.js');
    
    setupLights();
    
    expect(mockScene.add).toHaveBeenCalled();
  });
});
