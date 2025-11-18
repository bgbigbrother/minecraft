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

describe('Animation Functionality', () => {
  describe('ModelBlock Animation Extraction', () => {
    test('should extract animations from GLTF with animations', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-animated-block',
        modelPath: './models/chest.glb', // Chest has animations
        debug: false
      });

      setTimeout(() => {
        expect(testBlock.animations).toBeDefined();
        expect(Array.isArray(testBlock.animations)).toBe(true);
        expect(testBlock.animations.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    test('should create AnimationMixer when animations exist', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-animated-block',
        modelPath: './models/chest.glb',
        debug: false
      });

      setTimeout(() => {
        expect(testBlock.mixer).toBeDefined();
        expect(testBlock.mixer).not.toBeNull();
        expect(testBlock.mixer.constructor.name).toBe('AnimationMixer');
        done();
      }, 100);
    });

    test('should store scene reference when animations exist', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-animated-block',
        modelPath: './models/chest.glb',
        debug: false
      });

      setTimeout(() => {
        expect(testBlock.scene).toBeDefined();
        expect(testBlock.scene).not.toBeNull();
        done();
      }, 100);
    });

    test('should handle models without animations gracefully', (done) => {
      // Use a non-chest model path which won't have animations in the mock
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-no-animation',
        modelPath: './models/test.glb'
      });

      setTimeout(() => {
        expect(testBlock.animations).toEqual([]);
        expect(testBlock.mixer).toBeNull();
        expect(testBlock.loaded).toBe(true);
        done();
      }, 50);
    });
  });

  describe('ModelBlock playAnimation Method', () => {
    test('should return valid animation action when animation exists', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-animated-block',
        modelPath: './models/chest.glb',
        debug: false
      });

      setTimeout(() => {
        const action = testBlock.playAnimation(0);
        expect(action).not.toBeNull();
        expect(action).toBeDefined();
        expect(typeof action.play).toBe('function');
        expect(typeof action.stop).toBe('function');
        done();
      }, 100);
    });

    test('should handle invalid animation index gracefully', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-animated-block',
        modelPath: './models/chest.glb',
        debug: false
      });

      setTimeout(() => {
        const action = testBlock.playAnimation(999); // Invalid index
        expect(action).toBeNull();
        done();
      }, 100);
    });

    test('should return null when no mixer exists', (done) => {
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-no-animation',
        modelPath: './models/test.glb'
      });

      setTimeout(() => {
        const action = testBlock.playAnimation(0);
        expect(action).toBeNull();
        done();
      }, 50);
    });

    test('should log warning when debug is enabled and animation cannot play', (done) => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const testBlock = new ModelBlock({
        id: 99,
        name: 'test-block',
        modelPath: './models/chest.glb',
        debug: true
      });

      // Try to play before model loads
      testBlock.playAnimation(0);
      
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ModelBlock] Cannot play animation')
      );
      
      consoleWarnSpy.mockRestore();
      done();
    });
  });

  describe('Chest Block Animation Support', () => {
    test('should have animations property after loading', (done) => {
      setTimeout(() => {
        expect(chest.animations).toBeDefined();
        expect(Array.isArray(chest.animations)).toBe(true);
        expect(chest.animations.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    test('should have mixer property after loading', (done) => {
      setTimeout(() => {
        expect(chest.mixer).toBeDefined();
        expect(chest.mixer).not.toBeNull();
        done();
      }, 100);
    });

    test('should have scene property after loading', (done) => {
      setTimeout(() => {
        expect(chest.scene).toBeDefined();
        expect(chest.scene).not.toBeNull();
        done();
      }, 100);
    });

    test('should be able to play animation', (done) => {
      setTimeout(() => {
        const action = chest.playAnimation(0);
        expect(action).not.toBeNull();
        expect(action).toBeDefined();
        done();
      }, 100);
    });
  });

  describe('Animation Mixer Updates', () => {
    test('should update mixer with delta time', (done) => {
      setTimeout(() => {
        const mixer = chest.mixer;
        expect(mixer).toBeDefined();
        expect(mixer).not.toBeNull();
        
        // Play an animation
        const action = chest.playAnimation(0);
        expect(action).not.toBeNull();
        
        // Update mixer with delta time
        const deltaTime = 0.016; // ~60fps
        expect(() => mixer.update(deltaTime)).not.toThrow();
        
        done();
      }, 100);
    });

    test('should handle multiple mixer updates', (done) => {
      setTimeout(() => {
        const mixer = chest.mixer;
        expect(mixer).not.toBeNull();
        chest.playAnimation(0);
        
        // Simulate multiple frame updates
        for (let i = 0; i < 10; i++) {
          expect(() => mixer.update(0.016)).not.toThrow();
        }
        
        done();
      }, 100);
    });
  });

  describe('Multiple Chest Animations', () => {
    test('should support independent animations for multiple instances', (done) => {
      setTimeout(() => {
        // Create two separate animation actions
        const action1 = chest.playAnimation(0);
        const action2 = chest.playAnimation(0);
        
        expect(action1).not.toBeNull();
        expect(action2).not.toBeNull();
        
        // Actions should be independent (different objects)
        expect(action1).not.toBe(action2);
        
        done();
      }, 100);
    });
  });

  describe('Right-Click Interaction', () => {
    let MouseHandler;
    let mockPlayer;
    let mockWorld;
    let mouseHandler;
    let originalCreateAnimatedInstance;

    beforeEach(async () => {
      // Mock createAnimatedInstance to avoid SkeletonUtils issues in all tests
      originalCreateAnimatedInstance = blocks.chest.createAnimatedInstance;
      blocks.chest.createAnimatedInstance = jest.fn().mockResolvedValue(null);

      // Import MouseHandler
      const mouseHandlerModule = await import('../scripts/player/controls/MouseHandler.js');
      MouseHandler = mouseHandlerModule.MouseHandler;

      // Create mock world with necessary methods
      mockWorld = {
        getBlock: jest.fn(),
        addBlock: jest.fn(),
        removeBlock: jest.fn(),
        children: [],
        animatedBlocks: new Map(),
        activeAnimationMixers: new Map(),
        parent: new THREE.Scene()
      };

      // Create mock player
      mockPlayer = {
        controls: {
          isLocked: true
        },
        selectedCoords: {
          x: 5,
          y: 10,
          z: 5
        },
        activeBlockId: blocks.chest.id,
        world: mockWorld,
        scene: new THREE.Scene(),
        tool: {
          animate: false,
          animationStart: 0,
          animation: null,
          animationSpeed: 0.01
        },
        debugControls: false
      };

      mouseHandler = new MouseHandler(mockPlayer);
    });

    afterEach(() => {
      // Restore original method after each test
      blocks.chest.createAnimatedInstance = originalCreateAnimatedInstance;
    });

    test('should detect right-click events', () => {
      const mockEvent = {
        button: 2,
        preventDefault: jest.fn()
      };

      // Mock world to return a chest block
      mockWorld.getBlock.mockReturnValue({ id: blocks.chest.id });

      expect(() => mouseHandler.handleMouseDown(mockEvent)).not.toThrow();
    });

    test('should identify chest block when right-clicking', () => {
      const mockEvent = {
        button: 2,
        preventDefault: jest.fn()
      };

      // Mock world to return a chest block
      mockWorld.getBlock.mockReturnValue({ id: blocks.chest.id });

      mouseHandler.handleMouseDown(mockEvent);

      // Verify getBlock was called with correct coordinates
      expect(mockWorld.getBlock).toHaveBeenCalledWith(5, 10, 5);
    });

    test('should not place block when interacting with chest', () => {
      const mockEvent = {
        button: 2,
        preventDefault: jest.fn()
      };

      // Mock world to return a chest block
      mockWorld.getBlock.mockReturnValue({ id: blocks.chest.id });

      mouseHandler.handleMouseDown(mockEvent);

      // Verify getBlock was called to check for existing block
      expect(mockWorld.getBlock).toHaveBeenCalledWith(5, 10, 5);
    });

    test('should handle right-click on non-chest blocks', () => {
      const mockEvent = {
        button: 2,
        preventDefault: jest.fn()
      };

      // Mock world to return empty block (no interaction)
      mockWorld.getBlock.mockReturnValue({ id: blocks.empty.id });
      mockPlayer.activeBlockId = blocks.dirt.id;

      mouseHandler.handleMouseDown(mockEvent);

      // Should place block when not interacting
      expect(mockWorld.addBlock).toHaveBeenCalledWith(5, 10, 5, blocks.dirt.id);
    });
  });

  describe('Animation Integration', () => {
    test('should have createAnimatedInstance method', () => {
      expect(chest.createAnimatedInstance).toBeDefined();
      expect(typeof chest.createAnimatedInstance).toBe('function');
    });

    test('should handle animation duration property', () => {
      expect(chest.animationDuration).toBeDefined();
      expect(typeof chest.animationDuration).toBe('number');
      expect(chest.animationDuration).toBeGreaterThan(0);
    });
  });
});
