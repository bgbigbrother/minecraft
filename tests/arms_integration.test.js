/**
 * Integration tests for first-person arms system
 * Tests all animation transitions, save/load, shadows, and performance
 * Validates Requirements: All (comprehensive integration testing)
 */

import { ArmsLoader } from '../scripts/player/arms_loader.js';
import { ArmsAnimationController, ANIMATION_STATES } from '../scripts/player/arms_animation_controller.js';
import { ToolControllsPlayerBase } from '../scripts/player/tool.js';
import { AnimationClip, Group, Mesh, BoxGeometry, MeshStandardMaterial } from 'three';

describe('First-Person Arms System - Integration Tests', () => {
  describe('Animation Transitions', () => {
    let controller;
    let mockModel;
    let mockClips;

    beforeEach(() => {
      mockModel = new Group();
      mockClips = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
      controller = new ArmsAnimationController(mockModel, mockClips);
    });

    test('should transition from IDLE to PUNCH_LEFT on block break', () => {
      controller.playAnimation('IDLE', true);
      expect(controller.getCurrentState()).toBe('IDLE');

      controller.playAnimation('PUNCH_LEFT', false);
      expect(controller.getCurrentState()).toBe('PUNCH_LEFT');
    });

    test('should transition from IDLE to COLLECT on item pickup', () => {
      controller.playAnimation('IDLE', true);
      expect(controller.getCurrentState()).toBe('IDLE');

      controller.playAnimation('COLLECT', false);
      expect(controller.getCurrentState()).toBe('COLLECT');
    });

    test('should transition from IDLE to HANDS_BELOW when entering water', () => {
      controller.playAnimation('IDLE', true);
      expect(controller.getCurrentState()).toBe('IDLE');

      controller.playAnimation('HANDS_BELOW', true);
      expect(controller.getCurrentState()).toBe('HANDS_BELOW');
    });

    test('should transition from HANDS_BELOW to IDLE when exiting water', () => {
      controller.playAnimation('HANDS_BELOW', true);
      expect(controller.getCurrentState()).toBe('HANDS_BELOW');

      controller.playAnimation('IDLE', true);
      expect(controller.getCurrentState()).toBe('IDLE');
    });

    test('should transition from IDLE to COMBAT_IDLE when entering combat mode', () => {
      controller.playAnimation('IDLE', true);
      controller.setCombatMode(true);
      
      controller.transitionTo('COMBAT_IDLE', 0.3);
      expect(controller.getCurrentState()).toBe('COMBAT_IDLE');
    });

    test('should transition from COMBAT_IDLE to IDLE when exiting combat mode', () => {
      controller.playAnimation('COMBAT_IDLE', true);
      controller.setCombatMode(false);
      
      controller.transitionTo('IDLE', 0.3);
      expect(controller.getCurrentState()).toBe('IDLE');
    });

    test('should return to IDLE after PUNCH_LEFT completes', () => {
      controller.setCombatMode(false);
      controller.playAnimation('PUNCH_LEFT', false);
      
      controller.onAnimationFinished({});
      expect(controller.getCurrentState()).toBe('IDLE');
    });

    test('should return to IDLE after COLLECT completes', () => {
      controller.setCombatMode(false);
      controller.playAnimation('COLLECT', false);
      
      controller.onAnimationFinished({});
      expect(controller.getCurrentState()).toBe('IDLE');
    });

    test('should alternate between PUNCH_LEFT and PUNCH_RIGHT', () => {
      controller.playAnimation('PUNCH_LEFT', false);
      expect(controller.getCurrentState()).toBe('PUNCH_LEFT');

      controller.playAnimation('PUNCH_RIGHT', false);
      expect(controller.getCurrentState()).toBe('PUNCH_RIGHT');

      controller.playAnimation('PUNCH_LEFT', false);
      expect(controller.getCurrentState()).toBe('PUNCH_LEFT');
    });
  });

  describe('Animation Mixer Updates', () => {
    let controller;
    let mockModel;
    let mockClips;

    beforeEach(() => {
      mockModel = new Group();
      mockClips = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
      controller = new ArmsAnimationController(mockModel, mockClips);
    });

    test('should update mixer with delta time', () => {
      const updateSpy = jest.spyOn(controller.mixer, 'update');
      
      controller.update(0.016); // 60 FPS frame time
      expect(updateSpy).toHaveBeenCalledWith(0.016);
      
      controller.update(0.033); // 30 FPS frame time
      expect(updateSpy).toHaveBeenCalledWith(0.033);
    });

    test('should handle multiple consecutive updates', () => {
      const updateSpy = jest.spyOn(controller.mixer, 'update');
      
      for (let i = 0; i < 100; i++) {
        controller.update(0.016);
      }
      
      expect(updateSpy).toHaveBeenCalledTimes(100);
    });

    test('should not throw error when updating with zero delta time', () => {
      expect(() => {
        controller.update(0);
      }).not.toThrow();
    });
  });

  describe('Player Integration', () => {
    let player;
    let mockModel;
    let mockAnimations;

    beforeEach(() => {
      player = new ToolControllsPlayerBase();
      
      // Create mock model with mesh children for shadow testing
      mockModel = new Group();
      const mesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshStandardMaterial()
      );
      mockModel.add(mesh);
      
      // Create mock animations
      mockAnimations = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
    });

    test('should initialize arms controller when setArms is called', () => {
      player.setArms(mockModel, mockAnimations);
      
      expect(player.armsController).toBeDefined();
      expect(player.armsController).toBeInstanceOf(ArmsAnimationController);
    });

    test('should add arms model to tool container', () => {
      player.setArms(mockModel, mockAnimations);
      
      expect(player.tool.container.children).toContain(mockModel);
    });

    test('should configure arms transform correctly', () => {
      player.setArms(mockModel, mockAnimations);
      
      expect(player.tool.container.position.x).toBeCloseTo(0);
      expect(player.tool.container.position.y).toBeCloseTo(-7.5);
      expect(player.tool.container.position.z).toBeCloseTo(0.5);
      
      expect(player.tool.container.scale.x).toBeCloseTo(1.5);
      expect(player.tool.container.scale.y).toBeCloseTo(1.5);
      expect(player.tool.container.scale.z).toBeCloseTo(1.5);
      
      expect(player.tool.container.rotation.y).toBeCloseTo(Math.PI);
    });

    test('should enable shadows on arms model', () => {
      player.setArms(mockModel, mockAnimations);
      
      mockModel.traverse((child) => {
        if (child.isMesh) {
          expect(child.castShadow).toBe(true);
          expect(child.receiveShadow).toBe(true);
        }
      });
    });

    test('should store initial transform values', () => {
      player.setArms(mockModel, mockAnimations);
      
      expect(player.initialArmsTransform).toBeDefined();
      expect(player.initialArmsTransform.position).toBeDefined();
      expect(player.initialArmsTransform.scale).toBeDefined();
      expect(player.initialArmsTransform.rotation).toBeDefined();
    });

    test('should play animation through player interface', () => {
      player.setArms(mockModel, mockAnimations);
      
      player.playArmsAnimation('PUNCH_LEFT', false);
      expect(player.armsController.getCurrentState()).toBe('PUNCH_LEFT');
    });

    test('should update arms animation through player interface', () => {
      player.setArms(mockModel, mockAnimations);
      const updateSpy = jest.spyOn(player.armsController, 'update');
      
      player.updateArmsAnimation(0.016);
      expect(updateSpy).toHaveBeenCalledWith(0.016);
    });

    test('should alternate punches on block break', () => {
      player.setArms(mockModel, mockAnimations);
      
      player.onBlockBreak();
      const firstPunch = player.armsController.getCurrentState();
      expect(['PUNCH_LEFT', 'PUNCH_RIGHT']).toContain(firstPunch);
      
      player.onBlockBreak();
      const secondPunch = player.armsController.getCurrentState();
      expect(['PUNCH_LEFT', 'PUNCH_RIGHT']).toContain(secondPunch);
      
      // Should be different from first punch
      expect(secondPunch).not.toBe(firstPunch);
    });

    test('should handle combat mode toggle', () => {
      player.setArms(mockModel, mockAnimations);
      
      player.setCombatMode(true);
      expect(player.getCombatMode()).toBe(true);
      
      player.setCombatMode(false);
      expect(player.getCombatMode()).toBe(false);
    });
  });

  describe('Position Invariance', () => {
    let player;
    let mockModel;
    let mockAnimations;

    beforeEach(() => {
      player = new ToolControllsPlayerBase();
      mockModel = new Group();
      mockAnimations = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
      player.setArms(mockModel, mockAnimations);
    });

    test('should verify transform invariance returns true initially', () => {
      expect(player.verifyArmsTransformInvariance()).toBe(true);
    });

    test('should detect position drift', () => {
      player.tool.container.position.x += 0.1;
      expect(player.verifyArmsTransformInvariance()).toBe(false);
    });

    test('should detect scale drift', () => {
      player.tool.container.scale.x += 0.01;
      expect(player.verifyArmsTransformInvariance()).toBe(false);
    });

    test('should detect rotation drift', () => {
      player.tool.container.rotation.y += 0.1;
      expect(player.verifyArmsTransformInvariance()).toBe(false);
    });

    test('should reset transform to initial values', () => {
      // Modify transform
      player.tool.container.position.x += 0.5;
      player.tool.container.scale.y += 0.05;
      player.tool.container.rotation.z += 0.2;
      
      // Verify drift detected
      expect(player.verifyArmsTransformInvariance()).toBe(false);
      
      // Reset transform
      player.resetArmsTransform();
      
      // Verify invariance restored
      expect(player.verifyArmsTransformInvariance()).toBe(true);
    });

    test('should tolerate floating point precision errors', () => {
      // Add tiny floating point error
      player.tool.container.position.x += 0.00001;
      
      // Should still pass with default tolerance
      expect(player.verifyArmsTransformInvariance()).toBe(true);
    });
  });

  describe('Save/Load Animation State', () => {
    let player;
    let mockModel;
    let mockAnimations;

    beforeEach(() => {
      player = new ToolControllsPlayerBase();
      mockModel = new Group();
      mockAnimations = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
      player.setArms(mockModel, mockAnimations);
    });

    test('should get animation state', () => {
      player.playArmsAnimation('PUNCH_LEFT', false);
      player.setCombatMode(true);
      
      const state = player.getAnimationState();
      
      expect(state.currentState).toBe('PUNCH_LEFT');
      expect(state.combatMode).toBe(true);
    });

    test('should restore animation state', () => {
      const savedState = {
        currentState: 'COMBAT_IDLE',
        combatMode: true
      };
      
      player.setAnimationState(savedState);
      
      expect(player.armsController.getCurrentState()).toBe('COMBAT_IDLE');
      expect(player.armsController.combatMode).toBe(true);
    });

    test('should handle save/load cycle', () => {
      // Set up a specific state
      player.playArmsAnimation('HANDS_BELOW', true);
      player.setCombatMode(true);
      
      // Save state
      const savedState = player.getAnimationState();
      
      // Change state
      player.playArmsAnimation('IDLE', true);
      player.setCombatMode(false);
      
      // Restore state
      player.setAnimationState(savedState);
      
      // Verify restoration
      expect(player.armsController.getCurrentState()).toBe('HANDS_BELOW');
      expect(player.armsController.combatMode).toBe(true);
    });

    test('should handle missing animation state gracefully', () => {
      expect(() => {
        player.setAnimationState(null);
      }).not.toThrow();
      
      expect(() => {
        player.setAnimationState({});
      }).not.toThrow();
    });

    test('should return default state when arms not loaded', () => {
      const newPlayer = new ToolControllsPlayerBase();
      const state = newPlayer.getAnimationState();
      
      expect(state.currentState).toBe('IDLE');
      expect(state.combatMode).toBe(false);
    });
  });

  describe('Error Handling', () => {
    let controller;
    let mockModel;
    let mockClips;

    beforeEach(() => {
      mockModel = new Group();
      mockClips = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
      controller = new ArmsAnimationController(mockModel, mockClips);
    });

    test('should handle invalid animation state gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      controller.playAnimation('INVALID_STATE', false);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle missing animation clip gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Create controller with empty clips
      const emptyController = new ArmsAnimationController(mockModel, []);
      emptyController.playAnimation('IDLE', true);
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle update when mixer is null', () => {
      controller.mixer = null;
      
      expect(() => {
        controller.update(0.016);
      }).not.toThrow();
    });

    test('should handle playArmsAnimation when controller not initialized', () => {
      const player = new ToolControllsPlayerBase();
      
      expect(() => {
        player.playArmsAnimation('IDLE', true);
      }).not.toThrow();
    });

    test('should handle updateArmsAnimation when controller not initialized', () => {
      const player = new ToolControllsPlayerBase();
      
      expect(() => {
        player.updateArmsAnimation(0.016);
      }).not.toThrow();
    });
  });

  describe('Performance Considerations', () => {
    let controller;
    let mockModel;
    let mockClips;

    beforeEach(() => {
      mockModel = new Group();
      mockClips = Object.values(ANIMATION_STATES).map(name => {
        return new AnimationClip(name, 1.0, []);
      });
      controller = new ArmsAnimationController(mockModel, mockClips);
    });

    test('should handle rapid animation changes', () => {
      const states = ['IDLE', 'PUNCH_LEFT', 'PUNCH_RIGHT', 'COLLECT', 'HANDS_BELOW'];
      
      expect(() => {
        for (let i = 0; i < 100; i++) {
          const state = states[i % states.length];
          controller.playAnimation(state, false);
        }
      }).not.toThrow();
    });

    test('should handle high frequency updates', () => {
      expect(() => {
        for (let i = 0; i < 1000; i++) {
          controller.update(0.001); // 1ms updates
        }
      }).not.toThrow();
    });

    test('should complete animation state lookup quickly', () => {
      const start = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        controller.getCurrentState();
      }
      
      const duration = performance.now() - start;
      
      // Should complete 10000 lookups in less than 100ms
      expect(duration).toBeLessThan(100);
    });
  });
});
