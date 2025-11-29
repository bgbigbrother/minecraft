import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock ArmsLoader
jest.mock('../scripts/player/arms_loader.js', () => ({
  ArmsLoader: jest.fn().mockImplementation(() => {
    // Don't call callback immediately to avoid initialization issues
  })
}));

describe('ToolControllsPlayerBase', () => {
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
  });

  test('should create tool player instance', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    expect(player).toBeDefined();
    expect(player.tool).toBeDefined();
  });

  test('should have tool container', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    expect(player.tool.container).toBeDefined();
  });

  test('should initialize initialArmsTransform as null', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    expect(player.initialArmsTransform).toBeNull();
  });

  test('should store initial transform values when arms are set', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        // Simulate mesh children
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    // Mock animations
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Verify initial transform was stored
    expect(player.initialArmsTransform).toBeDefined();
    expect(player.initialArmsTransform.position).toEqual({ x: 0, y: -2, z: 0.2 });
    expect(player.initialArmsTransform.scale).toEqual({ x: 0.4, y: 0.4, z: 0.4 });
    expect(player.initialArmsTransform.rotation.y).toBeCloseTo(Math.PI, 5);
  });

  test('should verify transform invariance returns true when no drift', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Verify no drift detected
    expect(player.verifyArmsTransformInvariance()).toBe(true);
  });

  test('should verify transform invariance returns false when position drifts', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Introduce position drift
    player.tool.container.position.x += 0.1;
    
    // Verify drift detected
    expect(player.verifyArmsTransformInvariance()).toBe(false);
  });

  test('should verify transform invariance returns false when scale drifts', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Introduce scale drift
    player.tool.container.scale.y += 0.01;
    
    // Verify drift detected
    expect(player.verifyArmsTransformInvariance()).toBe(false);
  });

  test('should verify transform invariance returns false when rotation drifts', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Introduce rotation drift
    player.tool.container.rotation.z += 0.1;
    
    // Verify drift detected
    expect(player.verifyArmsTransformInvariance()).toBe(false);
  });

  test('should reset arms transform to initial values', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Introduce drift
    player.tool.container.position.x += 0.5;
    player.tool.container.scale.y += 0.05;
    player.tool.container.rotation.z += 0.2;
    
    // Verify drift exists
    expect(player.verifyArmsTransformInvariance()).toBe(false);
    
    // Reset transform
    player.resetArmsTransform();
    
    // Verify drift is corrected
    expect(player.verifyArmsTransformInvariance()).toBe(true);
    expect(player.tool.container.position.x).toBeCloseTo(0, 5);
    expect(player.tool.container.scale.y).toBeCloseTo(0.4, 5);
    expect(player.tool.container.rotation.z).toBeCloseTo(0, 5);
  });

  test('should return true when verifying invariance before arms are loaded', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Verify returns true when arms not loaded yet
    expect(player.verifyArmsTransformInvariance()).toBe(true);
  });

  test('should handle resetArmsTransform gracefully when arms not loaded', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Should not throw error
    expect(() => player.resetArmsTransform()).not.toThrow();
  });

  test('should get default animation state when arms controller not loaded', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    const animationState = player.getAnimationState();
    
    expect(animationState).toEqual({
      currentState: 'IDLE',
      combatMode: false
    });
  });

  test('should get animation state from arms controller', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' },
      { name: 'arms_armature|Combat_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Set combat mode
    player.armsController.setCombatMode(true);
    player.armsController.currentState = 'COMBAT_IDLE';
    
    const animationState = player.getAnimationState();
    
    expect(animationState).toEqual({
      currentState: 'COMBAT_IDLE',
      combatMode: true
    });
  });

  test('should set animation state when arms controller exists', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' },
      { name: 'arms_armature|Combat_idle_loop' },
      { name: 'arms_armature|Combat_punch_left' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Set animation state
    player.setAnimationState({
      currentState: 'PUNCH_LEFT',
      combatMode: true
    });
    
    expect(player.armsController.combatMode).toBe(true);
    expect(player.armsController.currentState).toBe('PUNCH_LEFT');
  });

  test('should handle setAnimationState gracefully when arms controller not loaded', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Should not throw error
    expect(() => player.setAnimationState({
      currentState: 'IDLE',
      combatMode: false
    })).not.toThrow();
  });

  test('should handle setAnimationState with null animation state', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Should not throw error with null
    expect(() => player.setAnimationState(null)).not.toThrow();
  });

  test('should set looping animations correctly', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' },
      { name: 'arms_armature|Hands_below' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Mock playAnimation to verify loop parameter
    const playAnimationSpy = jest.spyOn(player.armsController, 'playAnimation');
    
    // Set looping animation (IDLE)
    player.setAnimationState({
      currentState: 'IDLE',
      combatMode: false
    });
    
    expect(playAnimationSpy).toHaveBeenCalledWith('IDLE', true);
    
    playAnimationSpy.mockClear();
    
    // Set looping animation (HANDS_BELOW)
    player.setAnimationState({
      currentState: 'HANDS_BELOW',
      combatMode: false
    });
    
    expect(playAnimationSpy).toHaveBeenCalledWith('HANDS_BELOW', true);
  });

  test('should set non-looping animations correctly', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    // Mock arms model
    const mockModel = {
      traverse: jest.fn((callback) => {
        callback({ isMesh: true, castShadow: false, receiveShadow: false });
      })
    };
    
    const mockAnimations = [
      { name: 'arms_armature|Relax_hands_idle_loop' },
      { name: 'arms_armature|Combat_punch_left' }
    ];
    
    player.setArms(mockModel, mockAnimations);
    
    // Mock playAnimation to verify loop parameter
    const playAnimationSpy = jest.spyOn(player.armsController, 'playAnimation');
    
    // Set non-looping animation (PUNCH_LEFT)
    player.setAnimationState({
      currentState: 'PUNCH_LEFT',
      combatMode: false
    });
    
    expect(playAnimationSpy).toHaveBeenCalledWith('PUNCH_LEFT', false);
  });
});
