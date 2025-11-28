/**
 * Property-Based Tests for ArmsAnimationController Animation State Restoration
 * Feature: first-person-arms, Property 8: Animation State Restoration
 * Validates: Requirements 2.4
 */

import { describe, test, expect } from '@jest/globals';
import * as fc from 'fast-check';
import { ArmsAnimationController, ANIMATION_STATES } from '../scripts/player/arms_animation_controller.js';
import { AnimationClip, Group } from 'three';

describe('ArmsAnimationController Property-Based Tests - Animation State Restoration', () => {
  /**
   * Feature: first-person-arms, Property 8: Animation State Restoration
   * 
   * For any non-idle animation that completes, the system should transition
   * back to an idle animation state
   * 
   * Validates: Requirements 2.4
   */
  test('Property 8: Animation State Restoration - non-idle animations return to idle after completion', () => {
    fc.assert(
      fc.property(
        // Generate random non-idle action animations
        fc.oneof(
          fc.constant('PUNCH_LEFT'),
          fc.constant('PUNCH_RIGHT'),
          fc.constant('COLLECT'),
          fc.constant('MAGIC_ATTACK'),
          fc.constant('IDLE_START'),
          fc.constant('COMBAT_START'),
          fc.constant('MAGIC_START')
        ),
        // Generate random combat mode states
        fc.boolean(),
        // Generate random number of times to repeat the test
        fc.integer({ min: 1, max: 5 }),
        (actionAnimation, combatMode, repetitions) => {
          // Create a fresh controller for each test iteration
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Set combat mode
          controller.setCombatMode(combatMode);
          
          // Repeat the test multiple times to ensure consistency
          for (let i = 0; i < repetitions; i++) {
            // Play the action animation (non-looping)
            controller.playAnimation(actionAnimation, false);
            
            // Verify the action is playing
            expect(controller.getCurrentState()).toBe(actionAnimation);
            
            // Simulate the animation finishing by calling the finished event handler
            controller.onAnimationFinished({});
            
            // Property: After any non-idle animation completes,
            // the system should transition back to an idle state
            const currentState = controller.getCurrentState();
            const expectedIdleState = combatMode ? 'COMBAT_IDLE' : 'IDLE';
            
            // The current state should be the appropriate idle state
            expect(currentState).toBe(expectedIdleState);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  /**
   * Additional property test: Idle animations should not trigger state changes
   * 
   * When an idle animation completes (which shouldn't happen since they loop),
   * the system should remain in an idle state
   */
  test('Property 8 (stability): Idle animations do not transition away when finished', () => {
    fc.assert(
      fc.property(
        // Generate random idle states
        fc.oneof(
          fc.constant('IDLE'),
          fc.constant('COMBAT_IDLE'),
          fc.constant('HANDS_BELOW')
        ),
        // Generate random combat mode states
        fc.boolean(),
        (idleState, combatMode) => {
          // Create a fresh controller
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Set combat mode
          controller.setCombatMode(combatMode);
          
          // Set to the idle state (looping)
          controller.playAnimation(idleState, true);
          expect(controller.getCurrentState()).toBe(idleState);
          
          // Simulate the animation finishing (shouldn't happen with looping, but test anyway)
          controller.onAnimationFinished({});
          
          // Property: Idle states should remain in an idle state
          // (might transition between idle types based on combat mode, but should not go to action states)
          const currentState = controller.getCurrentState();
          const isIdleState = 
            currentState === 'IDLE' || 
            currentState === 'COMBAT_IDLE' || 
            currentState === 'HANDS_BELOW';
          
          expect(isIdleState).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Multiple action sequences always return to idle
   * 
   * For any sequence of action animations, after each completes,
   * the system should be in an idle state before the next action starts
   */
  test('Property 8 (sequences): Multiple action animations each return to idle', () => {
    fc.assert(
      fc.property(
        // Generate random sequences of action animations
        fc.array(
          fc.oneof(
            fc.constant('PUNCH_LEFT'),
            fc.constant('PUNCH_RIGHT'),
            fc.constant('COLLECT'),
            fc.constant('MAGIC_ATTACK')
          ),
          { minLength: 2, maxLength: 10 }
        ),
        // Generate random combat mode states
        fc.boolean(),
        (actionSequence, combatMode) => {
          // Create a fresh controller
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Set combat mode
          controller.setCombatMode(combatMode);
          
          const expectedIdleState = combatMode ? 'COMBAT_IDLE' : 'IDLE';
          
          // Play each action animation in sequence
          for (const action of actionSequence) {
            // Play the action animation (non-looping)
            controller.playAnimation(action, false);
            
            // Verify the action is playing
            expect(controller.getCurrentState()).toBe(action);
            
            // Simulate the animation finishing
            controller.onAnimationFinished({});
            
            // Property: After each action animation completes,
            // the system should return to idle before the next action
            expect(controller.getCurrentState()).toBe(expectedIdleState);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Combat mode changes affect idle state restoration
   * 
   * When combat mode changes, the idle state restoration should use
   * the appropriate idle animation (relaxed vs combat)
   */
  test('Property 8 (combat mode): Idle restoration respects combat mode setting', () => {
    fc.assert(
      fc.property(
        // Generate random action animations
        fc.oneof(
          fc.constant('PUNCH_LEFT'),
          fc.constant('PUNCH_RIGHT'),
          fc.constant('COLLECT'),
          fc.constant('MAGIC_ATTACK')
        ),
        // Generate random initial combat mode
        fc.boolean(),
        (actionAnimation, initialCombatMode) => {
          // Create a fresh controller
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Set initial combat mode
          controller.setCombatMode(initialCombatMode);
          
          // Play action and complete it
          controller.playAnimation(actionAnimation, false);
          controller.onAnimationFinished({});
          
          // Should be in the correct idle state for initial combat mode
          const expectedIdleState1 = initialCombatMode ? 'COMBAT_IDLE' : 'IDLE';
          expect(controller.getCurrentState()).toBe(expectedIdleState1);
          
          // Toggle combat mode
          controller.setCombatMode(!initialCombatMode);
          
          // Play another action and complete it
          controller.playAnimation(actionAnimation, false);
          controller.onAnimationFinished({});
          
          // Should be in the correct idle state for new combat mode
          const expectedIdleState2 = !initialCombatMode ? 'COMBAT_IDLE' : 'IDLE';
          expect(controller.getCurrentState()).toBe(expectedIdleState2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
