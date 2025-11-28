/**
 * Property-Based Tests for ArmsAnimationController Animation State Consistency
 * Feature: first-person-arms, Property 5: Idle Animation in Idle State
 * Validates: Requirements 2.1
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import * as fc from 'fast-check';
import { ArmsAnimationController, ANIMATION_STATES } from '../scripts/player/arms_animation_controller.js';
import { AnimationClip, Group } from 'three';

describe('ArmsAnimationController Property-Based Tests - Animation State Consistency', () => {
  /**
   * Feature: first-person-arms, Property 5: Idle Animation in Idle State
   * 
   * For any game state where the player is not performing actions,
   * the current animation should be one of the idle animations
   * (Relax_hands_idle_loop or Combat_idle_loop)
   * 
   * Validates: Requirements 2.1
   */
  test('Property 5: Idle Animation in Idle State - after action animations complete, system returns to idle', () => {
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
          { minLength: 1, maxLength: 10 }
        ),
        // Generate random combat mode states
        fc.boolean(),
        (actionSequence, combatMode) => {
          // Create a fresh controller for each test iteration
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Set combat mode
          controller.setCombatMode(combatMode);
          
          // Play each action animation in sequence and simulate completion
          for (const action of actionSequence) {
            // Play the action animation (non-looping)
            controller.playAnimation(action, false);
            
            // Verify the action is playing
            expect(controller.getCurrentState()).toBe(action);
            
            // Simulate the animation finishing
            controller.onAnimationFinished({});
            
            // Property: After any action animation completes,
            // the system should return to an idle state
            const currentState = controller.getCurrentState();
            const expectedIdleState = combatMode ? 'COMBAT_IDLE' : 'IDLE';
            
            expect(currentState).toBe(expectedIdleState);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  /**
   * Additional property test: Idle animations should remain stable
   * 
   * When the system is in an idle state and receives a finished event,
   * it should remain in that idle state (not transition away)
   */
  test('Property 5 (stability): Idle animations remain in idle state when finished event fires', () => {
    fc.assert(
      fc.property(
        // Generate random idle states
        fc.oneof(
          fc.constant('IDLE'),
          fc.constant('COMBAT_IDLE'),
          fc.constant('HANDS_BELOW') // Swimming is also a continuous state
        ),
        // Generate random number of finished events
        fc.integer({ min: 1, max: 5 }),
        (idleState, numEvents) => {
          // Create a fresh controller
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Set to the idle state
          controller.playAnimation(idleState, true);
          expect(controller.getCurrentState()).toBe(idleState);
          
          // Simulate multiple finished events
          for (let i = 0; i < numEvents; i++) {
            controller.onAnimationFinished({});
            
            // Property: Idle states should not transition away
            // when finished events fire
            const currentState = controller.getCurrentState();
            
            // Should remain in an idle state (might transition between idle types,
            // but should not go to action states)
            const isIdleState = 
              currentState === 'IDLE' || 
              currentState === 'COMBAT_IDLE' || 
              currentState === 'HANDS_BELOW';
            
            expect(isIdleState).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Initial state is always idle
   * 
   * For any newly created controller, the initial state should be IDLE
   */
  test('Property 5 (initialization): Controller always starts in IDLE state', () => {
    fc.assert(
      fc.property(
        fc.constant(null), // No random input needed
        () => {
          // Create a fresh controller
          const mockModel = new Group();
          const mockClips = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          const controller = new ArmsAnimationController(mockModel, mockClips);
          
          // Property: Initial state should always be IDLE
          expect(controller.getCurrentState()).toBe('IDLE');
        }
      ),
      { numRuns: 100 }
    );
  });
});
