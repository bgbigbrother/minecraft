import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Cow } from '../scripts/mobs/cow.js';

// Mock SkeletonUtils
jest.mock('three/examples/jsm/utils/SkeletonUtils.js', () => ({
  clone: jest.fn((model) => ({ ...model }))
}));

describe('Cow', () => {
  let cow;
  let mockModel;

  beforeEach(() => {
    mockModel = {
      model: {
        position: { x: 0, y: 0, z: 0, set: jest.fn() },
        rotateY: jest.fn(),
        name: '',
        scale: { set: jest.fn() }
      },
      animations: [
        { name: 'Eating' },
        { name: 'Idle' },
        { name: 'Walk' }
      ]
    };

    cow = new Cow(mockModel);
  });

  test('should create cow instance', () => {
    expect(cow).toBeDefined();
    expect(cow.model.name).toBe('Cow');
  });

  test('should have animation mixer', () => {
    expect(cow.mixer).toBeDefined();
  });

  test('should have eat move added', () => {
    expect(cow.moves).toContain('eat');
  });

  test('should scale model correctly', () => {
    expect(cow.model.scale.set).toHaveBeenCalledWith(0.5, 0.5, 0.5);
  });

  test('should select new action', () => {
    cow.selectNewAction();
    expect(cow.currentAction).toBeDefined();
  });
});
