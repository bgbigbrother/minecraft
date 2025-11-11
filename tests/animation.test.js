import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('../scripts/core/sun', () => ({
  sun: {
    position: { copy: jest.fn(), sub: jest.fn() },
    target: { position: { copy: jest.fn() } }
  },
  sunMesh: {
    position: { copy: jest.fn(), sub: jest.fn() }
  }
}));

jest.mock('../scripts/core/camera', () => ({
  orbitCamera: {
    position: { copy: jest.fn(), add: jest.fn() }
  }
}));

jest.mock('../scripts/core/controls', () => ({
  controls: {
    target: { copy: jest.fn() }
  }
}));

jest.mock('../scripts/core/renderer', () => ({
  renderer: {
    render: jest.fn()
  }
}));

jest.mock('../scripts/core/stats', () => ({
  stats: {
    update: jest.fn()
  }
}));

jest.mock('../scripts/core/scene', () => ({
  scene: {}
}));

describe('Animation Module', () => {
  let mockPlayer;
  let mockWorld;
  let mockAudio;

  beforeEach(() => {
    // Mock player
    mockPlayer = {
      controls: { isLocked: true },
      camera: { position: { x: 0, y: 0, z: 0 } },
      position: { x: 0, y: 0, z: 0 },
      update: jest.fn(),
      character: { visible: false },
      tool: { container: { visible: true } }
    };

    // Mock world
    mockWorld = {
      update: jest.fn(),
      chunkSize: { height: 32 }
    };

    // Mock audio element
    mockAudio = {
      play: jest.fn(),
      pause: jest.fn()
    };
    document.querySelector = jest.fn(() => mockAudio);

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn();
    global.performance = { now: jest.fn(() => 1000) };
  });

  test('should export animate function', async () => {
    const { animate } = await import('../scripts/core/animation.js');
    expect(animate).toBeDefined();
    expect(typeof animate).toBe('function');
  });
});
