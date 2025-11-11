import { describe, test, expect, beforeEach } from '@jest/globals';
import { BasePhysics } from '../scripts/physics/base.js';

describe('BasePhysics', () => {
  let physics;
  let mockScene;

  beforeEach(() => {
    mockScene = {
      add: jest.fn(),
      children: []
    };
    physics = new BasePhysics(mockScene);
  });

  test('should create physics instance', () => {
    expect(physics).toBeDefined();
  });

  test('should have default gravity value', () => {
    expect(physics.gravity).toBe(32);
  });

  test('should have default simulation rate', () => {
    expect(physics.simulationRate).toBe(250);
  });

  test('should calculate correct step size', () => {
    expect(physics.stepSize).toBe(1 / 250);
  });

  test('should initialize accumulator to 0', () => {
    expect(physics.accumulator).toBe(0);
  });

  test('should create helpers group', () => {
    expect(physics.helpers).toBeDefined();
    expect(physics.helpers.visible).toBe(false);
  });

  test('should add helpers to scene', () => {
    expect(mockScene.add).toHaveBeenCalledWith(physics.helpers);
  });

  test('should add collision helper', () => {
    const block = { x: 5, y: 10, z: 15 };
    const initialHelperCount = physics.helpers.children.length;
    
    physics.addCollisionHelper(block);
    
    expect(physics.helpers.children.length).toBe(initialHelperCount + 1);
  });

  test('should add contact pointer helper', () => {
    const point = { x: 1, y: 2, z: 3 };
    const initialHelperCount = physics.helpers.children.length;
    
    physics.addContactPointerHelper(point);
    
    expect(physics.helpers.children.length).toBe(initialHelperCount + 1);
  });

  test('should allow changing gravity', () => {
    physics.gravity = 50;
    expect(physics.gravity).toBe(50);
  });

  test('should allow changing simulation rate', () => {
    physics.simulationRate = 100;
    expect(physics.simulationRate).toBe(100);
  });
});
