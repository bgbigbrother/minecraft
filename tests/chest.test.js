import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ModelBlock } from '../scripts/textures/blocks/ModelBlock.js';
import { blocks } from '../scripts/textures/blocks.js';
import { chest } from '../scripts/textures/blocks/chest.js';

describe('ModelBlock Base Class', () => {
  describe('Instantiation and Configuration', () => {
    test('should create instance with required config properties', () => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb',
        spawnable: true,
        debug: false
      });

      expect(testBlock.id).toBe(99);
      expect(testBlock.name).toBe('test-block');
      expect(testBlock.modelPath).toBe('./models/test.glb');
      expect(testBlock.spawnable).toBe(true);
      expect(testBlock.debug).toBe(false);
      expect(testBlock.isModel).toBe(true);
    });

    test('should default spawnable to false when not provided', () => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb'
      });

      expect(testBlock.spawnable).toBe(false);
    });

    test('should default debug to false when not provided', () => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb'
      });

      expect(testBlock.debug).toBe(false);
    });
  });

  describe('Geometry and Material Getters', () => {
    test('should return null for geometry before model loads', () => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb'
      });

      expect(testBlock.geometry).toBeNull();
    });

    test('should return null for material before model loads', () => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb'
      });

      expect(testBlock.material).toBeNull();
    });

    test('should return geometry after model loads', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb'
      });

      setTimeout(() => {
        expect(testBlock.geometry).not.toBeNull();
        expect(testBlock.geometry).toBeDefined();
        done();
      }, 50);
    });

    test('should return material after model loads', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb'
      });

      setTimeout(() => {
        expect(testBlock.material).not.toBeNull();
        expect(testBlock.material).toBeDefined();
        done();
      }, 50);
    });
  });

  describe('Debug Logging', () => {
    let consoleLogSpy;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      if (consoleLogSpy) {
        consoleLogSpy.mockRestore();
      }
    });

    test('should log model path when debug is enabled', () => {
      new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb',
        debug: true
      });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ModelBlock] Loading model: ./models/test.glb')
      );
    });

    test('should not log model path when debug is disabled', () => {
      new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb',
        debug: false
      });

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[ModelBlock] Loading model:')
      );
    });

    test('should log success message when debug is enabled', (done) => {
      new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/test.glb',
        debug: true
      });

      setTimeout(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ModelBlock] Model loaded successfully: test-block')
        );
        done();
      }, 50);
    });
  });

  describe('Error Handling', () => {
    let consoleErrorSpy;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleErrorSpy.mockRestore();
    });

    test('should handle missing mesh in model', (done) => {
      // Mock GLTFLoader to return scene without mesh
      const GLTFLoader = require('three/addons/loaders/GLTFLoader.js').GLTFLoader;
      const originalLoad = GLTFLoader.prototype.load;
      
      GLTFLoader.prototype.load = function(url, onLoad) {
        setTimeout(() => {
          onLoad({
            scene: {
              children: [],
              traverse: function(callback) {
                callback(this);
              }
            }
          });
        }, 0);
      };

      new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/invalid.glb'
      });

      setTimeout(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[ModelBlock] No mesh found in model: test-block')
        );
        GLTFLoader.prototype.load = originalLoad;
        done();
      }, 50);
    });
  });
});

describe('Chest Block', () => {
  describe('Block Definition Structure', () => {
    test('should be an instance of ModelBlock', () => {
      expect(chest).toBeInstanceOf(ModelBlock);
    });

    test('should have correct id property', () => {
      expect(chest.id).toBe(16);
    });

    test('should have correct name property', () => {
      expect(chest.name).toBe('chest');
    });

    test('should have correct modelPath', () => {
      expect(chest.modelPath).toBe('./models/chest.glb');
    });

    test('should have spawnable set to false', () => {
      expect(chest.spawnable).toBe(false);
    });

    test('should have debug set to false', () => {
      expect(chest.debug).toBe(false);
    });

    test('should have isModel flag set to true', () => {
      expect(chest.isModel).toBe(true);
    });

    test('should have geometry getter', () => {
      expect(chest).toHaveProperty('geometry');
    });

    test('should have material getter', () => {
      expect(chest).toHaveProperty('material');
    });

    test('should have loaded getter', () => {
      expect(chest).toHaveProperty('loaded');
    });
  });

  describe('Block Registry Integration', () => {
    test('should be registered in blocks object', () => {
      expect(blocks.chest).toBeDefined();
    });

    test('should be the same instance as imported chest', () => {
      expect(blocks.chest).toBe(chest);
    });

    test('should have correct properties when accessed through blocks object', () => {
      expect(blocks.chest.id).toBe(16);
      expect(blocks.chest.name).toBe('chest');
      expect(blocks.chest.spawnable).toBe(false);
      expect(blocks.chest.isModel).toBe(true);
    });
  });

  describe('GLB Model Loading', () => {
    test('should have geometry after model loads', (done) => {
      setTimeout(() => {
        expect(chest.geometry).toBeDefined();
        expect(chest.geometry).not.toBeNull();
        done();
      }, 100);
    });

    test('should have material after model loads', (done) => {
      setTimeout(() => {
        expect(chest.material).toBeDefined();
        expect(chest.material).not.toBeNull();
        done();
      }, 100);
    });

    test('should set loaded to true after model loads', (done) => {
      setTimeout(() => {
        expect(chest.loaded).toBe(true);
        done();
      }, 100);
    });
  });
});

describe('Player Inventory Integration', () => {
  let Player;
  let mockScene;
  let mockWorld;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock DOM elements
    document.body.innerHTML = `
      <div id="overlay"></div>
      <div id="info-player-position"></div>
      <div id="toolbar-0" class="selected"></div>
      <div id="toolbar-1"></div>
      <div id="toolbar-2"></div>
    `;

    // Import Player (mocks are already set up at module level)
    const playerModule = await import('../scripts/player/player.js');
    Player = playerModule.Player;

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
  });

  test('should add chest block to inventory on initialization for new game', () => {
    const player = new Player(mockScene, mockWorld);
    
    // Check that chest block (ID 16) is in inventory
    expect(player.inventory.items.has(16)).toBe(true);
    expect(player.inventory.items.get(16)).toBe(1);
  });

  test('should not add duplicate chest block if inventory already has items', () => {
    // Create first player to populate inventory
    const player1 = new Player(mockScene, mockWorld);
    expect(player1.inventory.items.get(16)).toBe(1);
    
    // Add another item to inventory
    player1.inventory.addItem(1, 5); // Add some grass blocks
    player1.inventory.save(); // Save the updated inventory
    
    // Create second player (simulating game reload)
    const player2 = new Player(mockScene, mockWorld);
    
    // Should still have only 1 chest block (not duplicated)
    expect(player2.inventory.items.get(16)).toBe(1);
    // Should also have the grass blocks from previous session
    expect(player2.inventory.items.get(1)).toBe(5);
  });

  test('should persist chest block across game sessions', () => {
    // Create player and verify chest is added
    const player1 = new Player(mockScene, mockWorld);
    expect(player1.inventory.items.get(16)).toBe(1);
    
    // Create new player instance (simulating game reload)
    const player2 = new Player(mockScene, mockWorld);
    
    // Chest should still be in inventory
    expect(player2.inventory.items.get(16)).toBe(1);
  });
});
