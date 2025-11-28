/**
 * Tests for idle animation management in ArmsAnimationController
 * Validates Requirements 2.1, 2.4
 */

import { ArmsAnimationController, ANIMATION_STATES } from '../scripts/player/arms_animation_controller.js';
import { AnimationMixer, AnimationClip, Group } from 'three';

describe('ArmsAnimationController - Idle Animation Management', () => {
  let controller;
  let mockModel;
  let mockClips;

  beforeEach(() => {
    // Create a mock model
    mockModel = new Group();

    // Create mock animation clips for all animation states
    mockClips = Object.values(ANIMATION_STATES).map(name => {
      return new AnimationClip(name, 1.0, []);
    });

    // Create controller
    controller = new ArmsAnimationController(mockModel, mockClips);
  });

  test('should initialize with IDLE state', () => {
    expect(controller.getCurrentState()).toBe('IDLE');
  });

  test('should have setCombatMode method', () => {
    expect(typeof controller.setCombatMode).toBe('function');
  });

  test('should set combat mode flag', () => {
    controller.setCombatMode(true);
    expect(controller.combatMode).toBe(true);

    controller.setCombatMode(false);
    expect(controller.combatMode).toBe(false);
  });

  test('should have onAnimationFinished method', () => {
    expect(typeof controller.onAnimationFinished).toBe('function');
  });

  test('should register finished event listener on mixer', () => {
    // The mixer should have event listeners registered
    expect(controller.mixer._listeners).toBeDefined();
    expect(controller.mixer._listeners.finished).toBeDefined();
    expect(controller.mixer._listeners.finished.length).toBeGreaterThan(0);
  });

  test('should transition to IDLE after action animation completes (relaxed mode)', () => {
    // Set to relaxed mode
    controller.setCombatMode(false);
    
    // Play a punch animation
    controller.playAnimation('PUNCH_LEFT', false);
    expect(controller.getCurrentState()).toBe('PUNCH_LEFT');

    // Simulate animation finished event
    controller.onAnimationFinished({});

    // Should transition to relaxed idle
    expect(controller.getCurrentState()).toBe('IDLE');
  });

  test('should transition to COMBAT_IDLE after action animation completes (combat mode)', () => {
    // Set to combat mode
    controller.setCombatMode(true);
    
    // Play a punch animation
    controller.playAnimation('PUNCH_RIGHT', false);
    expect(controller.getCurrentState()).toBe('PUNCH_RIGHT');

    // Simulate animation finished event
    controller.onAnimationFinished({});

    // Should transition to combat idle
    expect(controller.getCurrentState()).toBe('COMBAT_IDLE');
  });

  test('should not interrupt IDLE animation when finished event fires', () => {
    // Start in idle
    controller.playAnimation('IDLE', true);
    expect(controller.getCurrentState()).toBe('IDLE');

    // Simulate animation finished event (shouldn't happen for looping, but test the guard)
    controller.onAnimationFinished({});

    // Should remain in idle
    expect(controller.getCurrentState()).toBe('IDLE');
  });

  test('should not interrupt COMBAT_IDLE animation when finished event fires', () => {
    // Start in combat idle
    controller.playAnimation('COMBAT_IDLE', true);
    expect(controller.getCurrentState()).toBe('COMBAT_IDLE');

    // Simulate animation finished event
    controller.onAnimationFinished({});

    // Should remain in combat idle
    expect(controller.getCurrentState()).toBe('COMBAT_IDLE');
  });

  test('should not interrupt HANDS_BELOW animation when finished event fires', () => {
    // Start swimming animation
    controller.playAnimation('HANDS_BELOW', true);
    expect(controller.getCurrentState()).toBe('HANDS_BELOW');

    // Simulate animation finished event
    controller.onAnimationFinished({});

    // Should remain in hands below (swimming continues until player exits water)
    expect(controller.getCurrentState()).toBe('HANDS_BELOW');
  });

  test('should transition to idle after COLLECT animation completes', () => {
    controller.setCombatMode(false);
    
    // Play collect animation
    controller.playAnimation('COLLECT', false);
    expect(controller.getCurrentState()).toBe('COLLECT');

    // Simulate animation finished event
    controller.onAnimationFinished({});

    // Should transition to idle
    expect(controller.getCurrentState()).toBe('IDLE');
  });

  test('should set clampWhenFinished on non-looping animations', () => {
    // Play a non-looping animation
    controller.playAnimation('PUNCH_LEFT', false);

    // The current action should have clampWhenFinished set
    expect(controller.currentAction.clampWhenFinished).toBe(true);
  });
});
