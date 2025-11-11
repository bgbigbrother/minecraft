import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { MoveMob } from '../scripts/mobs/base.js';

// Mock SkeletonUtils
jest.mock('three/examples/jsm/utils/SkeletonUtils.js', () => ({
  clone: jest.fn((model) => ({ ...model }))
}));

describe('MoveMob', () => {
  let mob;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      model: {
        position: { x: 0, y: 0, z: 0, set: jest.fn() },
        rotateY: jest.fn()
      },
      animations: []
    };

    mob = new MoveMob(mockModel);
  });

  test('should create mob instance', () => {
    expect(mob).toBeDefined();
    expect(mob.model).toBeDefined();
  });

  test('should have default moves', () => {
    expect(mob.moves).toEqual(['forward', 'left', 'right']);
  });

  test('should have idle action', () => {
    expect(mob.idleAction).toBe('idle');
  });

  test('should have default speed', () => {
    expect(mob.speed).toBe(2);
  });

  test('should have default action time', () => {
    expect(mob.actionTime).toBe(5);
  });

  test('should select random action', () => {
    mob.selectRandomAction();
    expect(mob.currentAction).toBeDefined();
  });

  test('should add custom move', () => {
    mob.addCustomMove('jump');
    expect(mob.moves).toContain('jump');
  });

  test('should update position on move', () => {
    mob.currentAction = 'forward';
    mob.position.axis = 'z';
    mob.position.direction = 1;
    const initialZ = mob.model.position.z;
    
    mob.move(0.1);
    
    expect(mob.model.position.z).toBeGreaterThan(initialZ);
  });
});
