import { describe, test, expect, jest } from '@jest/globals';

// Mock GLTFLoader
jest.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((path, callback) => {
      callback({
        scene: { name: 'MockPickaxe' }
      });
    })
  }))
}));

describe('ToolLoader', () => {
  test('should create tool loader instance', async () => {
    const { ToolLoader } = await import('../scripts/player/tool_loader.js');
    
    const onLoad = jest.fn();
    const loader = new ToolLoader(onLoad);
    
    expect(loader).toBeDefined();
    expect(loader.models).toBeDefined();
    expect(loader.models.pickaxe).toBeDefined();
  });

  test('should call onLoad callback with models', async () => {
    const { ToolLoader } = await import('../scripts/player/tool_loader.js');
    
    const onLoad = jest.fn();
    new ToolLoader(onLoad);
    
    expect(onLoad).toHaveBeenCalled();
    expect(onLoad).toHaveBeenCalledWith(expect.objectContaining({
      pickaxe: expect.any(Object)
    }));
  });

  test('should have loader instance', async () => {
    const { ToolLoader } = await import('../scripts/player/tool_loader.js');
    
    const onLoad = jest.fn();
    const loader = new ToolLoader(onLoad);
    
    expect(loader.loader).toBeDefined();
  });
});
