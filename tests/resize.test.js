import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
const mockOrbitCamera = {
  aspect: 1,
  updateProjectionMatrix: jest.fn()
};

const mockRenderer = {
  setSize: jest.fn()
};

jest.mock('../scripts/core/camera', () => ({
  orbitCamera: mockOrbitCamera
}));

jest.mock('../scripts/core/renderer', () => ({
  renderer: mockRenderer
}));

describe('Resize Module', () => {
  let mockPlayer;

  beforeEach(() => {
    mockPlayer = {
      camera: {
        aspect: 1,
        updateProjectionMatrix: jest.fn()
      }
    };
  });

  test('should export onResize function', async () => {
    const { onResize } = await import('../scripts/core/resize.js');
    expect(onResize).toBeDefined();
    expect(typeof onResize).toBe('function');
  });

  test('should update camera aspect ratios on resize', async () => {
    const { onResize } = await import('../scripts/core/resize.js');
    
    onResize(mockPlayer);
    
    expect(mockPlayer.camera.updateProjectionMatrix).toHaveBeenCalled();
    expect(mockOrbitCamera.updateProjectionMatrix).toHaveBeenCalled();
  });

  test('should update renderer size on resize', async () => {
    const { onResize } = await import('../scripts/core/resize.js');
    
    onResize(mockPlayer);
    
    expect(mockRenderer.setSize).toHaveBeenCalledWith(window.innerWidth, window.innerHeight);
  });
});
