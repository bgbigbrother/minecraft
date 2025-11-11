import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock dependencies
jest.mock('../scripts/core/sun', () => {
  const mockSunPosition = {
    copy: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis()
  };
  const mockSunMeshPosition = {
    copy: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis()
  };
  return {
    sun: {
      position: mockSunPosition,
      target: { position: { copy: jest.fn() } }
    },
    sunMesh: {
      position: mockSunMeshPosition
    }
  };
});

jest.mock('../scripts/core/moon', () => {
  const mockMoonMeshPosition = {
    copy: jest.fn().mockReturnThis(),
    sub: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis()
  };
  return {
    moonMesh: {
      position: mockMoonMeshPosition
    }
  };
});

jest.mock('../scripts/core/camera', () => {
  const mockOrbitCameraPosition = {
    copy: jest.fn().mockReturnThis(),
    add: jest.fn().mockReturnThis()
  };
  return {
    orbitCamera: {
      position: mockOrbitCameraPosition
    }
  };
});

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
  let mockDayNightCycle;
  let mockAudio;
  let animate;
  let sun, sunMesh, moonMesh, orbitCamera, controls, renderer, stats, scene;

  beforeEach(async () => {
    // Clear module cache to get fresh imports
    jest.resetModules();

    // Mock player
    mockPlayer = {
      controls: { isLocked: true },
      camera: { position: { x: 10, y: 20, z: 30 } },
      position: { x: 10, y: 20, z: 30 },
      update: jest.fn(),
      character: { visible: false },
      tool: { container: { visible: true } }
    };

    // Mock world
    mockWorld = {
      update: jest.fn(),
      chunkSize: { height: 32 }
    };

    // Mock day/night cycle
    mockDayNightCycle = {
      update: jest.fn()
    };

    // Mock audio element
    mockAudio = {
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn()
    };
    document.querySelector = jest.fn(() => mockAudio);

    // Mock requestAnimationFrame
    global.requestAnimationFrame = jest.fn((cb) => cb);
    
    // Mock performance.now with incrementing time
    let time = 1000;
    global.performance = { 
      now: jest.fn(() => {
        time += 16; // Simulate ~60fps
        return time;
      })
    };

    // Import mocked dependencies
    const sunModule = await import('../scripts/core/sun');
    sun = sunModule.sun;
    sunMesh = sunModule.sunMesh;
    
    const moonModule = await import('../scripts/core/moon');
    moonMesh = moonModule.moonMesh;
    
    const cameraModule = await import('../scripts/core/camera');
    orbitCamera = cameraModule.orbitCamera;
    
    const controlsModule = await import('../scripts/core/controls');
    controls = controlsModule.controls;
    
    const rendererModule = await import('../scripts/core/renderer');
    renderer = rendererModule.renderer;
    
    const statsModule = await import('../scripts/core/stats');
    stats = statsModule.stats;
    
    const sceneModule = await import('../scripts/core/scene');
    scene = sceneModule.scene;

    // Import animate function
    const animationModule = await import('../scripts/core/animation.js');
    animate = animationModule.animate;
  });

  test('should export animate function', () => {
    expect(animate).toBeDefined();
    expect(typeof animate).toBe('function');
  });

  test('should schedule next frame with requestAnimationFrame', () => {
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(global.requestAnimationFrame).toHaveBeenCalled();
  });

  test('should update player and world when controls are locked', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockPlayer.update).toHaveBeenCalled();
    expect(mockWorld.update).toHaveBeenCalled();
    expect(mockPlayer.update).toHaveBeenCalledWith(expect.any(Number), mockWorld);
    expect(mockWorld.update).toHaveBeenCalledWith(expect.any(Number), mockPlayer);
  });

  test('should update day/night cycle when controls are locked', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockDayNightCycle.update).toHaveBeenCalled();
    expect(mockDayNightCycle.update).toHaveBeenCalledWith(expect.any(Number));
  });

  test('should play audio when controls are locked', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(document.querySelector).toHaveBeenCalledWith('audio');
    expect(mockAudio.play).toHaveBeenCalled();
  });

  test('should update sun position relative to player', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(sun.position.add).toHaveBeenCalledWith(mockPlayer.camera.position);
    expect(sun.target.position.copy).toHaveBeenCalledWith(mockPlayer.camera.position);
  });

  test('should update sunMesh position relative to player', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(sunMesh.position.add).toHaveBeenCalledWith(mockPlayer.camera.position);
  });

  test('should update moonMesh position relative to player', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(moonMesh.position.add).toHaveBeenCalledWith(mockPlayer.camera.position);
  });

  test('should update orbit camera to track player', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(orbitCamera.position.copy).toHaveBeenCalled();
    expect(orbitCamera.position.add).toHaveBeenCalled();
    expect(controls.target.copy).toHaveBeenCalledWith(mockPlayer.position);
  });

  test('should render scene with player camera when controls are locked', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(renderer.render).toHaveBeenCalledWith(scene, mockPlayer.camera);
  });

  test('should pause audio when controls are unlocked', () => {
    mockPlayer.controls.isLocked = false;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  test('should show player character when controls are unlocked', () => {
    mockPlayer.controls.isLocked = false;
    mockPlayer.character.visible = false;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockPlayer.character.visible).toBe(true);
  });

  test('should hide tool container when controls are unlocked', () => {
    mockPlayer.controls.isLocked = false;
    mockPlayer.tool.container.visible = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockPlayer.tool.container.visible).toBe(false);
  });

  test('should render scene with orbit camera when controls are unlocked', () => {
    mockPlayer.controls.isLocked = false;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(renderer.render).toHaveBeenCalledWith(scene, orbitCamera);
  });

  test('should not update player and world when controls are unlocked', () => {
    mockPlayer.controls.isLocked = false;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockPlayer.update).not.toHaveBeenCalled();
    expect(mockWorld.update).not.toHaveBeenCalled();
  });

  test('should not update day/night cycle when controls are unlocked', () => {
    mockPlayer.controls.isLocked = false;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(mockDayNightCycle.update).not.toHaveBeenCalled();
  });

  test('should update stats every frame', () => {
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(stats.update).toHaveBeenCalled();
  });

  test('should calculate delta time and pass to update methods', () => {
    mockPlayer.controls.isLocked = true;
    
    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    // Verify that update methods are called with a delta time (number) and correct objects
    expect(mockPlayer.update).toHaveBeenCalledWith(expect.any(Number), mockWorld);
    expect(mockWorld.update).toHaveBeenCalledWith(expect.any(Number), mockPlayer);
    expect(mockDayNightCycle.update).toHaveBeenCalledWith(expect.any(Number));
    
    // Verify delta time is a reasonable value (between 0 and 1 second)
    const deltaTime = mockPlayer.update.mock.calls[0][0];
    expect(deltaTime).toBeGreaterThan(0);
    expect(deltaTime).toBeLessThan(1);
  });

  test('should handle multiple animation frames', () => {
    let frameCount = 0;
    global.requestAnimationFrame = jest.fn((cb) => {
      frameCount++;
      if (frameCount < 3) {
        cb();
      }
    });

    animate(mockPlayer, mockWorld, mockDayNightCycle);
    
    expect(global.requestAnimationFrame).toHaveBeenCalledTimes(3);
  });
});
