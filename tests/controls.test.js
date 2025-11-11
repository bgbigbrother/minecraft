import { describe, test, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { ControllsPlayerBase } from '../scripts/player/controls.js';

// Mock blocks
jest.mock('../scripts/textures/blocks.js', () => ({
  blocks: {
    empty: { id: 0 },
    grass: { id: 1 },
    dirt: { id: 2 },
    stone: { id: 3 }
  }
}));

describe('ControllsPlayerBase', () => {
  let player;
  let mockWorld;

  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="overlay" style="visibility: visible;"></div>
      <div id="toolbar-0" class="selected"></div>
      <div id="toolbar-1"></div>
      <div id="toolbar-2"></div>
      <div id="toolbar-3"></div>
      <div id="toolbar-4"></div>
      <div id="toolbar-5"></div>
      <div id="toolbar-6"></div>
      <div id="toolbar-7"></div>
      <div id="toolbar-8"></div>
    `;

    mockWorld = {
      addBlock: jest.fn(),
      removeBlock: jest.fn()
    };

    player = new ControllsPlayerBase();
    player.world = mockWorld;
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('constructor', () => {
    test('should set up event listeners', () => {
      expect(player.controls.listeners['lock']).toBeDefined();
      expect(player.controls.listeners['unlock']).toBeDefined();
      expect(player.controls.listeners['lock'].length).toBeGreaterThan(0);
      expect(player.controls.listeners['unlock'].length).toBeGreaterThan(0);
    });
  });

  describe('onCameraLock', () => {
    test('should hide overlay when camera is locked', () => {
      const overlay = document.getElementById('overlay');
      overlay.style.visibility = 'visible';
      
      player.onCameraLock();
      
      expect(overlay.style.visibility).toBe('hidden');
    });
  });

  describe('onCameraUnlock', () => {
    test('should show overlay when camera is unlocked and not in debug mode', () => {
      const overlay = document.getElementById('overlay');
      overlay.style.visibility = 'hidden';
      player.debugCamera = false;
      
      player.onCameraUnlock();
      
      expect(overlay.style.visibility).toBe('visible');
    });

    test('should not show overlay when in debug camera mode', () => {
      const overlay = document.getElementById('overlay');
      overlay.style.visibility = 'hidden';
      player.debugCamera = true;
      
      player.onCameraUnlock();
      
      expect(overlay.style.visibility).toBe('hidden');
    });
  });

  describe('onKeyUp', () => {
    test('should stop forward movement on KeyW release', () => {
      player.input.z = 5;
      player.onKeyUp({ code: 'KeyW' });
      expect(player.input.z).toBe(0);
    });

    test('should stop left movement on KeyA release', () => {
      player.input.x = -5;
      player.onKeyUp({ code: 'KeyA' });
      expect(player.input.x).toBe(0);
    });

    test('should stop backward movement on KeyS release', () => {
      player.input.z = -5;
      player.onKeyUp({ code: 'KeyS' });
      expect(player.input.z).toBe(0);
    });

    test('should stop right movement on KeyD release', () => {
      player.input.x = 5;
      player.onKeyUp({ code: 'KeyD' });
      expect(player.input.x).toBe(0);
    });

    test('should stop sprinting on ShiftLeft release', () => {
      player.sprinting = true;
      player.onKeyUp({ code: 'ShiftLeft' });
      expect(player.sprinting).toBe(false);
    });

    test('should stop sprinting on ShiftRight release', () => {
      player.sprinting = true;
      player.onKeyUp({ code: 'ShiftRight' });
      expect(player.sprinting).toBe(false);
    });
  });

  describe('onKeyDown', () => {
    test('should lock controls when not locked', () => {
      player.controls.isLocked = false;
      const lockSpy = jest.spyOn(player.controls, 'lock');
      player.onKeyDown({ code: 'KeyW', key: 'w' });
      expect(lockSpy).toHaveBeenCalled();
    });

    test('should set debugCamera to false when locking', () => {
      player.controls.isLocked = false;
      player.debugCamera = true;
      player.onKeyDown({ code: 'KeyW', key: 'w' });
      expect(player.debugCamera).toBe(false);
    });

    describe('number keys for block selection', () => {
      test('should select block 0 (pickaxe)', () => {
        player.controls.isLocked = true;
        player.activeBlockId = 1;
        
        player.onKeyDown({ code: 'Digit0', key: '0' });
        
        expect(player.activeBlockId).toBe(0);
        expect(player.tool.container.visible).toBe(true);
      });

      test('should select block 1', () => {
        player.controls.isLocked = true;
        player.activeBlockId = 0;
        
        player.onKeyDown({ code: 'Digit1', key: '1' });
        
        expect(player.activeBlockId).toBe(1);
        expect(player.tool.container.visible).toBe(false);
      });

      test('should select block 2', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit2', key: '2' });
        expect(player.activeBlockId).toBe(2);
      });

      test('should select block 3', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit3', key: '3' });
        expect(player.activeBlockId).toBe(3);
      });

      test('should select block 4', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit4', key: '4' });
        expect(player.activeBlockId).toBe(4);
      });

      test('should select block 5', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit5', key: '5' });
        expect(player.activeBlockId).toBe(5);
      });

      test('should select block 6', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit6', key: '6' });
        expect(player.activeBlockId).toBe(6);
      });

      test('should select block 7', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit7', key: '7' });
        expect(player.activeBlockId).toBe(7);
      });

      test('should select block 8', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'Digit8', key: '8' });
        expect(player.activeBlockId).toBe(8);
      });

      test('should update toolbar UI when selecting block', () => {
        player.controls.isLocked = true;
        player.activeBlockId = 0;
        
        const toolbar0 = document.getElementById('toolbar-0');
        const toolbar1 = document.getElementById('toolbar-1');
        toolbar0.classList.add('selected');
        
        player.onKeyDown({ code: 'Digit1', key: '1' });
        
        expect(toolbar0.classList.contains('selected')).toBe(false);
        expect(toolbar1.classList.contains('selected')).toBe(true);
      });
    });

    describe('movement keys', () => {
      test('should move forward on KeyW', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'KeyW', key: 'w' });
        expect(player.input.z).toBe(player.maxSpeed);
      });

      test('should move left on KeyA', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'KeyA', key: 'a' });
        expect(player.input.x).toBe(-player.maxSpeed);
      });

      test('should move backward on KeyS', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'KeyS', key: 's' });
        expect(player.input.z).toBe(-player.maxSpeed);
      });

      test('should move right on KeyD', () => {
        player.controls.isLocked = true;
        player.onKeyDown({ code: 'KeyD', key: 'd' });
        expect(player.input.x).toBe(player.maxSpeed);
      });
    });

    describe('special actions', () => {
      test('should reset position on KeyR', () => {
        player.controls.isLocked = true;
        player.position.y = 10;
        player.velocity.set(5, 5, 5);
        player.repeat = false;
        
        player.onKeyDown({ code: 'KeyR', key: 'r' });
        
        expect(player.position.y).toBe(32);
        expect(player.velocity.x).toBe(0);
        expect(player.velocity.y).toBe(0);
        expect(player.velocity.z).toBe(0);
      });

      test('should not reset position on KeyR when repeat is true', () => {
        player.controls.isLocked = true;
        player.position.y = 10;
        player.repeat = true;
        
        player.onKeyDown({ code: 'KeyR', key: 'r' });
        
        expect(player.position.y).toBe(10);
      });

      test('should enable sprinting on ShiftLeft', () => {
        player.controls.isLocked = true;
        player.sprinting = false;
        
        player.onKeyDown({ code: 'ShiftLeft', key: 'Shift' });
        
        expect(player.sprinting).toBe(true);
      });

      test('should enable sprinting on ShiftRight', () => {
        player.controls.isLocked = true;
        player.sprinting = false;
        
        player.onKeyDown({ code: 'ShiftRight', key: 'Shift' });
        
        expect(player.sprinting).toBe(true);
      });

      test('should jump on Space when on ground', () => {
        player.controls.isLocked = true;
        player.onGround = true;
        player.velocity.y = 0;
        
        player.onKeyDown({ code: 'Space', key: ' ' });
        
        expect(player.velocity.y).toBe(player.jumpSpeed);
      });

      test('should not jump on Space when not on ground', () => {
        player.controls.isLocked = true;
        player.onGround = false;
        player.velocity.y = 0;
        
        player.onKeyDown({ code: 'Space', key: ' ' });
        
        expect(player.velocity.y).toBe(0);
      });

      test('should enable debug camera on F10', () => {
        player.controls.isLocked = true;
        player.debugCamera = false;
        const unlockSpy = jest.spyOn(player.controls, 'unlock');
        
        player.onKeyDown({ code: 'F10', key: 'F10' });
        
        expect(player.debugCamera).toBe(true);
        expect(unlockSpy).toHaveBeenCalled();
      });
    });
  });

  describe('onMouseDown', () => {
    test('should remove block when pickaxe is selected', () => {
      player.controls.isLocked = true;
      player.activeBlockId = 0;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      
      player.onMouseDown({ button: 0 });
      
      expect(mockWorld.removeBlock).toHaveBeenCalledWith(5, 10, 15);
    });

    test('should add block when block type is selected', () => {
      player.controls.isLocked = true;
      player.activeBlockId = 1;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      
      player.onMouseDown({ button: 0 });
      
      expect(mockWorld.addBlock).toHaveBeenCalledWith(5, 10, 15, 1);
    });

    test('should not interact when controls are not locked', () => {
      player.controls.isLocked = false;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      
      player.onMouseDown({ button: 0 });
      
      expect(mockWorld.removeBlock).not.toHaveBeenCalled();
      expect(mockWorld.addBlock).not.toHaveBeenCalled();
    });

    test('should not interact when no block is selected', () => {
      player.controls.isLocked = true;
      player.selectedCoords = null;
      
      player.onMouseDown({ button: 0 });
      
      expect(mockWorld.removeBlock).not.toHaveBeenCalled();
      expect(mockWorld.addBlock).not.toHaveBeenCalled();
    });

    test('should trigger tool animation', () => {
      jest.useFakeTimers();
      player.controls.isLocked = true;
      player.activeBlockId = 0;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      player.tool.animate = false;
      
      player.onMouseDown({ button: 0 });
      
      expect(player.tool.animate).toBe(true);
      expect(player.tool.animationStart).toBeDefined();
      
      jest.runAllTimers();
      expect(player.tool.animate).toBe(false);
      jest.useRealTimers();
    });

    test('should not start new animation when already animating', () => {
      player.controls.isLocked = true;
      player.activeBlockId = 0;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      player.tool.animate = true;
      const startTime = 1000;
      player.tool.animationStart = startTime;
      
      player.onMouseDown({ button: 0 });
      
      expect(player.tool.animationStart).toBe(startTime);
    });

    test('should clear existing animation timeout', () => {
      jest.useFakeTimers();
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
      
      player.controls.isLocked = true;
      player.activeBlockId = 0;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      player.tool.animate = false;
      player.tool.animation = setTimeout(() => {}, 1000);
      
      player.onMouseDown({ button: 0 });
      
      expect(clearTimeoutSpy).toHaveBeenCalled();
      
      jest.useRealTimers();
    });

    test('should handle world being null', () => {
      jest.useFakeTimers();
      player.controls.isLocked = true;
      player.activeBlockId = 0;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      player.world = null;
      
      expect(() => player.onMouseDown({ button: 0 })).not.toThrow();
      jest.useRealTimers();
    });

    test('should handle world being undefined', () => {
      jest.useFakeTimers();
      player.controls.isLocked = true;
      player.activeBlockId = 1;
      player.selectedCoords = { x: 5, y: 10, z: 15 };
      player.world = undefined;
      
      expect(() => player.onMouseDown({ button: 0 })).not.toThrow();
      jest.useRealTimers();
    });
  });
});
