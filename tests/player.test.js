import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Player } from '../scripts/player/player.js';

// Mock the World class
jest.mock('../scripts/world/world.js', () => ({
  World: class MockWorld {
    constructor() {
      this.children = [];
      this.params = {
        terrain: {
          waterOffset: 10
        }
      };
    }
    addBlock(x, y, z, blockId) {
      this.lastAddedBlock = { x, y, z, blockId };
    }
    removeBlock(x, y, z) {
      this.lastRemovedBlock = { x, y, z };
    }
  }
}));

// Mock ToolLoader
jest.mock('../scripts/player/tool_loader.js', () => ({
  ToolLoader: class MockToolLoader {
    constructor(callback) {
      // Simulate async loading with a mock pickaxe
      setTimeout(() => {
        callback({
          pickaxe: {
            position: { set: jest.fn() },
            rotation: { x: 0, y: 0, z: 0 },
            scale: { set: jest.fn() }
          }
        });
      }, 0);
    }
  }
}));

// Mock blocks
jest.mock('../scripts/textures/blocks.js', () => ({
  blocks: {
    empty: { id: 0 },
    grass: { id: 1 },
    dirt: { id: 2 },
    stone: { id: 3 }
  }
}));

describe('Player', () => {
  let player;
  let mockScene;
  let mockWorld;

  beforeEach(() => {
    // Mock DOM elements
    document.body.innerHTML = `
      <div id="overlay"></div>
      <div id="info-player-position"></div>
      <div id="toolbar-0" class="selected"></div>
      <div id="toolbar-1"></div>
      <div id="toolbar-2"></div>
    `;

    mockScene = new THREE.Scene();
    mockWorld = {
      children: [],
      params: {
        terrain: {
          waterOffset: 10
        }
      },
      addBlock: jest.fn(),
      removeBlock: jest.fn()
    };

    player = new Player(mockScene, mockWorld);
  });

  describe('constructor', () => {
    test('should create player instance', () => {
      expect(player).toBeDefined();
    });

    test('should set initial position to (32, 32, 32)', () => {
      expect(player.position.x).toBe(32);
      expect(player.position.y).toBe(32);
      expect(player.position.z).toBe(32);
    });

    test('should store world reference', () => {
      expect(player.world).toBe(mockWorld);
    });

    test('should store scene reference', () => {
      expect(player.scene).toBe(mockScene);
    });

    test('should add camera to scene', () => {
      expect(mockScene.children).toContain(player.camera);
    });

    test('should add cameraHelper to scene', () => {
      expect(mockScene.children).toContain(player.cameraHelper);
    });

    test('should add character to scene', () => {
      expect(mockScene.children).toContain(player.character);
    });

    test('should add boundsHelper to scene', () => {
      expect(mockScene.children).toContain(player.boundsHelper);
    });

    test('should add selectionHelper to scene', () => {
      expect(mockScene.children).toContain(player.selectionHelper);
    });
  });

  describe('update', () => {
    test('should call updateBoundsHelper', () => {
      const spy = jest.spyOn(player, 'updateBoundsHelper');
      player.update(0.016, mockWorld);
      expect(spy).toHaveBeenCalled();
    });

    test('should call updateRaycaster with world', () => {
      const spy = jest.spyOn(player, 'updateRaycaster');
      player.update(0.016, mockWorld);
      expect(spy).toHaveBeenCalledWith(mockWorld);
    });

    test('should not call physics update when physics is not added', () => {
      expect(() => player.update(0.016, mockWorld)).not.toThrow();
    });

    test('should call physics update when physics is added', () => {
      const mockPhysics = {
        update: jest.fn()
      };
      
      player.addPhysics(mockPhysics);
      player.update(0.016, mockWorld);
      
      expect(mockPhysics.update).toHaveBeenCalledWith(0.016, player, mockWorld);
    });

    test('should call updateToolAnimation when tool.animate is true', () => {
      const spy = jest.spyOn(player, 'updateToolAnimation');
      player.tool.animate = true;
      
      player.update(0.016, mockWorld);
      
      expect(spy).toHaveBeenCalled();
    });

    test('should not call updateToolAnimation when tool.animate is false', () => {
      const spy = jest.spyOn(player, 'updateToolAnimation');
      player.tool.animate = false;
      
      player.update(0.016, mockWorld);
      
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('addPhysics', () => {
    test('should store physics reference', () => {
      const mockPhysics = {
        update: jest.fn()
      };
      
      player.addPhysics(mockPhysics);
      player.update(0.016, mockWorld);
      
      expect(mockPhysics.update).toHaveBeenCalled();
    });

    test('should allow physics to be added after construction', () => {
      const mockPhysics = {
        update: jest.fn()
      };
      
      // First update without physics
      player.update(0.016, mockWorld);
      expect(mockPhysics.update).not.toHaveBeenCalled();
      
      // Add physics
      player.addPhysics(mockPhysics);
      
      // Second update with physics
      player.update(0.016, mockWorld);
      expect(mockPhysics.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('inheritance', () => {
    test('should inherit from ToolControllsPlayerBase', () => {
      expect(player.setTool).toBeDefined();
      expect(player.updateToolAnimation).toBeDefined();
    });

    test('should inherit from ControllsPlayerBase', () => {
      expect(player.onKeyDown).toBeDefined();
      expect(player.onKeyUp).toBeDefined();
      expect(player.onMouseDown).toBeDefined();
    });

    test('should inherit from PlayerBase', () => {
      expect(player.height).toBe(2);
      expect(player.radius).toBe(0.5);
      expect(player.maxSpeed).toBe(5);
      expect(player.jumpSpeed).toBe(10);
      expect(player.camera).toBeDefined();
      expect(player.controls).toBeDefined();
    });

    test('should have tool container', () => {
      expect(player.tool.container).toBeDefined();
    });

    test('should have character model', () => {
      expect(player.character).toBeDefined();
    });

    test('should have bounds helper', () => {
      expect(player.boundsHelper).toBeDefined();
    });

    test('should have selection helper', () => {
      expect(player.selectionHelper).toBeDefined();
    });
  });

  describe('position', () => {
    test('should return camera position', () => {
      player.camera.position.set(10, 20, 30);
      expect(player.position.x).toBe(10);
      expect(player.position.y).toBe(20);
      expect(player.position.z).toBe(30);
    });

    test('should allow position modification', () => {
      player.position.set(5, 15, 25);
      expect(player.camera.position.x).toBe(5);
      expect(player.camera.position.y).toBe(15);
      expect(player.camera.position.z).toBe(25);
    });
  });

  describe('integration with scene and world', () => {
    test('should be properly integrated with scene', () => {
      expect(mockScene.children.length).toBeGreaterThan(0);
      expect(mockScene.children).toContain(player.camera);
    });

    test('should be properly integrated with world', () => {
      expect(player.world).toBe(mockWorld);
    });

    test('should update with world reference', () => {
      expect(() => player.update(0.016, mockWorld)).not.toThrow();
    });
  });
});
