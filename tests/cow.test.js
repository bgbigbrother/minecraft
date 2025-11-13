import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Cow } from '../scripts/mobs/cow.js';
import { AnimationClip } from 'three';

// Mock SkeletonUtils
jest.mock('three/examples/jsm/utils/SkeletonUtils.js', () => ({
  clone: jest.fn((model) => ({ ...model }))
}));

// Mock AnimationClip.findByName
jest.spyOn(AnimationClip, 'findByName');

describe('Cow', () => {
  let cow;
  let mockModel;
  let mockAction;

  beforeEach(() => {
    mockAction = {
      play: jest.fn(),
      stop: jest.fn()
    };

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
    cow.mixer.clipAction = jest.fn(() => mockAction);
    
    // Reset mocks
    AnimationClip.findByName.mockClear();
  });

  test('should create cow instance', () => {
    expect(cow).toBeDefined();
    expect(cow.model.name).toBe('Cow');
  });

  test('should have animation mixer', () => {
    expect(cow.mixer).toBeDefined();
  });

  test('constructor adds "eat" to moves', () => {
    expect(cow.moves).toContain('eat');
    expect(cow.moves).toContain('forward');
    expect(cow.moves).toContain('left');
    expect(cow.moves).toContain('right');
  });

  test('should scale model correctly', () => {
    expect(cow.model.scale.set).toHaveBeenCalledWith(0.5, 0.5, 0.5);
  });

  test('animation mapping for "eat" action plays "Eating" animation', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Eating' });
    
    // Mock selectRandomAction to set currentAction to 'eat'
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = cow.currentAction;
      cow.currentAction = 'eat';
    });
    
    cow.selectNewAction();
    
    expect(AnimationClip.findByName).toHaveBeenCalledWith(cow.animations, 'Eating');
    expect(mockAction.play).toHaveBeenCalled();
  });

  test('animation mapping for "idle" action plays "Idle" animation', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Idle' });
    
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = cow.currentAction;
      cow.currentAction = 'idle';
    });
    
    cow.selectNewAction();
    
    expect(AnimationClip.findByName).toHaveBeenCalledWith(cow.animations, 'Idle');
    expect(mockAction.play).toHaveBeenCalled();
  });

  test('animation mapping for "forward" action plays "Walk" animation', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Walk' });
    
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = cow.currentAction;
      cow.currentAction = 'forward';
    });
    
    cow.selectNewAction();
    
    expect(AnimationClip.findByName).toHaveBeenCalledWith(cow.animations, 'Walk');
    expect(mockAction.play).toHaveBeenCalled();
  });

  test('animation mapping for "left" action plays "Walk" animation', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Walk' });
    
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = cow.currentAction;
      cow.currentAction = 'left';
    });
    
    cow.selectNewAction();
    
    expect(AnimationClip.findByName).toHaveBeenCalledWith(cow.animations, 'Walk');
    expect(mockAction.play).toHaveBeenCalled();
  });

  test('animation mapping for "right" action plays "Walk" animation', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Walk' });
    
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = cow.currentAction;
      cow.currentAction = 'right';
    });
    
    cow.selectNewAction();
    
    expect(AnimationClip.findByName).toHaveBeenCalledWith(cow.animations, 'Walk');
    expect(mockAction.play).toHaveBeenCalled();
  });

  test('mixer updates each frame', () => {
    const mockWorld = {
      getBlock: jest.fn()
    };
    cow.chunk = {
      size: { height: 10, width: 16 },
      getBlock: jest.fn(() => ({ id: 2 }))
    };
    
    const updateSpy = jest.spyOn(cow.mixer, 'update');
    const deltaTime = 0.016;
    
    cow.update(deltaTime, mockWorld);
    
    expect(updateSpy).toHaveBeenCalledWith(deltaTime);
  });

  test('animation switching stops previous action', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Walk' });
    
    // Set up initial action
    cow.action = mockAction;
    
    // Mock selectRandomAction to switch from 'idle' to 'forward'
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = 'idle';
      cow.currentAction = 'forward';
    });
    
    cow.selectNewAction();
    
    expect(mockAction.stop).toHaveBeenCalled();
  });

  test('animation switching does not stop if action is the same', () => {
    AnimationClip.findByName.mockReturnValue({ name: 'Idle' });
    
    cow.action = mockAction;
    
    // Mock selectRandomAction to keep action the same
    cow.selectRandomAction = jest.fn(() => {
      cow.previousAction = 'idle';
      cow.currentAction = 'idle';
    });
    
    cow.selectNewAction();
    
    expect(mockAction.stop).not.toHaveBeenCalled();
  });

  test('animate method uses AnimationClip.findByName', () => {
    const mockClip = { name: 'Walk' };
    AnimationClip.findByName.mockReturnValue(mockClip);
    
    cow.animate('Walk');
    
    expect(AnimationClip.findByName).toHaveBeenCalledWith(cow.animations, 'Walk');
    expect(cow.mixer.clipAction).toHaveBeenCalledWith(mockClip);
    expect(mockAction.play).toHaveBeenCalled();
  });

  test('animate method logs warning when clip not found', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    AnimationClip.findByName.mockReturnValue(null);
    
    cow.animate('NonExistent');
    
    expect(consoleWarnSpy).toHaveBeenCalledWith('Animation clip "NonExistent" not found.');
    consoleWarnSpy.mockRestore();
  });
});
