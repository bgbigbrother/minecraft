import { describe, test, expect, jest } from '@jest/globals';

// Mock GLTFLoader
jest.mock('three/addons/loaders/GLTFLoader.js', () => ({
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn((path, callback) => {
      callback({
        scene: { name: 'MockModel' },
        animations: []
      });
    })
  }))
}));

describe('ModelLoader', () => {
  test('should create model loader instance', async () => {
    const { ModelLoader } = await import('../scripts/mobs/model_loader.js');
    
    const onLoad = jest.fn();
    const loader = new ModelLoader(onLoad);
    
    expect(loader).toBeDefined();
    expect(loader.models).toBeDefined();
    expect(loader.models.cow).toBeDefined();
  });

  test('should call onLoad callback', async () => {
    const { ModelLoader } = await import('../scripts/mobs/model_loader.js');
    
    const onLoad = jest.fn();
    new ModelLoader(onLoad);
    
    expect(onLoad).toHaveBeenCalled();
  });
});
