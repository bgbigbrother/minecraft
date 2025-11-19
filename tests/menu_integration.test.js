/**
 * Integration tests for the game menu overlay system
 * Tests the complete flow: menu → new game → play → save → exit → load
 */

import eventBus from '../src/menu/utils/eventBus.js';
import { saveWorld, loadWorld, getAllWorlds, deleteWorld, saveSettings, loadSettings, clearAllData } from '../src/menu/utils/storage.js';

describe('Menu Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    clearAllData(true);
    // Clear event bus listeners
    eventBus.clear();
  });

  afterEach(() => {
    // Clean up after each test
    clearAllData(true);
    eventBus.clear();
  });

  describe('Event Bus System', () => {
    it('should emit and receive events', () => {
      const mockCallback = jest.fn();
      
      eventBus.on('test:event', mockCallback);
      eventBus.emit('test:event', { data: 'test' });
      
      expect(mockCallback).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should unsubscribe from events', () => {
      const mockCallback = jest.fn();
      
      eventBus.on('test:event', mockCallback);
      eventBus.off('test:event', mockCallback);
      eventBus.emit('test:event', { data: 'test' });
      
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple listeners for the same event', () => {
      const mockCallback1 = jest.fn();
      const mockCallback2 = jest.fn();
      
      eventBus.on('test:event', mockCallback1);
      eventBus.on('test:event', mockCallback2);
      eventBus.emit('test:event', { data: 'test' });
      
      expect(mockCallback1).toHaveBeenCalledWith({ data: 'test' });
      expect(mockCallback2).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle errors in listeners without breaking other listeners', () => {
      const mockCallback1 = jest.fn(() => {
        throw new Error('Test error');
      });
      const mockCallback2 = jest.fn();
      
      eventBus.on('test:event', mockCallback1);
      eventBus.on('test:event', mockCallback2);
      eventBus.emit('test:event', { data: 'test' });
      
      expect(mockCallback1).toHaveBeenCalled();
      expect(mockCallback2).toHaveBeenCalled();
    });
  });

  describe('Storage System', () => {
    describe('World Save/Load', () => {
      it('should save and load a world', () => {
        const worldData = {
          params: { seed: 12345 },
          data: { '0,0': { blocks: [] } },
          player: { position: { x: 0, y: 0, z: 0 }, health: 100 }
        };

        saveWorld('Test World', worldData);
        const loaded = loadWorld('Test World');

        expect(loaded).toBeTruthy();
        expect(loaded.name).toBe('Test World');
        expect(loaded.params.seed).toBe(12345);
        expect(loaded.player.health).toBe(100);
      });

      it('should update existing world on save', () => {
        const worldData1 = {
          params: { seed: 12345 },
          data: {},
          player: { position: { x: 0, y: 0, z: 0 }, health: 100 }
        };

        const worldData2 = {
          params: { seed: 12345 },
          data: {},
          player: { position: { x: 10, y: 10, z: 10 }, health: 80 }
        };

        saveWorld('Test World', worldData1);
        saveWorld('Test World', worldData2);

        const worlds = getAllWorlds();
        expect(worlds.length).toBe(1);
        expect(worlds[0].player.health).toBe(80);
      });

      it('should get all saved worlds', () => {
        const worldData1 = {
          params: { seed: 12345 },
          data: {},
          player: { position: { x: 0, y: 0, z: 0 }, health: 100 }
        };

        const worldData2 = {
          params: { seed: 67890 },
          data: {},
          player: { position: { x: 0, y: 0, z: 0 }, health: 100 }
        };

        saveWorld('World 1', worldData1);
        saveWorld('World 2', worldData2);

        const worlds = getAllWorlds();
        expect(worlds.length).toBe(2);
        expect(worlds.find(w => w.name === 'World 1')).toBeTruthy();
        expect(worlds.find(w => w.name === 'World 2')).toBeTruthy();
      });

      it('should delete a world', () => {
        const worldData = {
          params: { seed: 12345 },
          data: {},
          player: { position: { x: 0, y: 0, z: 0 }, health: 100 }
        };

        saveWorld('Test World', worldData);
        expect(getAllWorlds().length).toBe(1);

        deleteWorld('Test World');
        expect(getAllWorlds().length).toBe(0);
      });

      it('should return null for non-existent world', () => {
        const loaded = loadWorld('Non-existent World');
        expect(loaded).toBeNull();
      });
    });

    describe('Settings Save/Load', () => {
      it('should save and load settings', () => {
        const settings = {
          musicVolume: 75,
          showFPS: true
        };

        saveSettings(settings);
        const loaded = loadSettings();

        expect(loaded.musicVolume).toBe(75);
        expect(loaded.showFPS).toBe(true);
      });

      it('should return default settings when none exist', () => {
        const loaded = loadSettings();

        expect(loaded.musicVolume).toBe(50);
        expect(loaded.showFPS).toBe(false);
      });

      it('should validate settings before saving', () => {
        const invalidSettings = {
          musicVolume: 150, // Invalid: > 100
          showFPS: true
        };

        expect(() => saveSettings(invalidSettings)).toThrow();
      });
    });
  });

  describe('Menu Flow Integration', () => {
    it('should emit new game event with world name', (done) => {
      const worldName = 'Integration Test World';

      eventBus.on('menu:game:start:newGame', (payload) => {
        expect(payload.worldName).toBe(worldName);
        done();
      });

      eventBus.emit('menu:game:start:newGame', { worldName });
    });

    it('should emit load game event with world data', (done) => {
      const worldData = {
        name: 'Test World',
        params: { seed: 12345 },
        data: {},
        player: { position: { x: 0, y: 0, z: 0 }, health: 100 }
      };

      eventBus.on('menu:game:load:world', (payload) => {
        expect(payload.worldData.name).toBe('Test World');
        expect(payload.worldData.params.seed).toBe(12345);
        done();
      });

      eventBus.emit('menu:game:load:world', { worldData });
    });

    it('should emit options update event', (done) => {
      eventBus.on('menu:options:update:setting', (payload) => {
        expect(payload.key).toBe('musicVolume');
        expect(payload.value).toBe(75);
        done();
      });

      eventBus.emit('menu:options:update:setting', { key: 'musicVolume', value: 75 });
    });

    it('should emit pointer lock change event', (done) => {
      eventBus.on('menu:pointerlock:change:state', (payload) => {
        expect(payload.locked).toBe(true);
        done();
      });

      eventBus.emit('menu:pointerlock:change:state', { locked: true });
    });
  });

  describe('Complete Game Flow', () => {
    it('should handle complete new game → save → load flow', () => {
      // Step 1: Start new game
      const worldName = 'Flow Test World';
      let gameStarted = false;

      eventBus.on('menu:game:start:newGame', (payload) => {
        expect(payload.worldName).toBe(worldName);
        gameStarted = true;
      });

      eventBus.emit('menu:game:start:newGame', { worldName });
      expect(gameStarted).toBe(true);

      // Step 2: Save game
      const worldData = {
        params: { seed: 12345 },
        data: { '0,0': { blocks: [] } },
        player: { position: { x: 10, y: 20, z: 30 }, health: 85 }
      };

      saveWorld(worldName, worldData);

      // Step 3: Verify save
      const savedWorlds = getAllWorlds();
      expect(savedWorlds.length).toBe(1);
      expect(savedWorlds[0].name).toBe(worldName);

      // Step 4: Load game
      const loadedWorld = loadWorld(worldName);
      expect(loadedWorld).toBeTruthy();
      expect(loadedWorld.player.position.x).toBe(10);
      expect(loadedWorld.player.health).toBe(85);

      // Step 5: Emit load event
      let gameLoaded = false;
      eventBus.on('menu:game:load:world', (payload) => {
        expect(payload.worldData.name).toBe(worldName);
        gameLoaded = true;
      });

      eventBus.emit('menu:game:load:world', { worldData: loadedWorld });
      expect(gameLoaded).toBe(true);
    });

    it('should persist settings across sessions', () => {
      // Step 1: Update settings
      eventBus.on('menu:options:update:setting', (payload) => {
        saveSettings({ ...loadSettings(), [payload.key]: payload.value });
      });

      // Emit setting updates
      eventBus.emit('menu:options:update:setting', { key: 'musicVolume', value: 80 });
      eventBus.emit('menu:options:update:setting', { key: 'showFPS', value: true });

      // Step 2: Verify settings persisted
      const loaded = loadSettings();
      expect(loaded.musicVolume).toBe(80);
      expect(loaded.showFPS).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid world data gracefully', () => {
      const invalidWorldData = {
        // Missing name field - should fail validation
        timestamp: Date.now(),
        params: { seed: 12345 }
      };

      // saveWorld adds defaults, so this won't throw
      // Instead test that it adds the required fields
      saveWorld('Invalid World', invalidWorldData);
      const loaded = loadWorld('Invalid World');
      
      expect(loaded).toBeTruthy();
      expect(loaded.name).toBe('Invalid World');
      expect(loaded.data).toBeDefined();
      expect(loaded.player).toBeDefined();
    });

    it('should handle localStorage errors gracefully', () => {
      // Test that the storage utility has error handling
      // by verifying it doesn't crash when localStorage is unavailable
      const originalSetItem = localStorage.setItem;
      const originalGetItem = localStorage.getItem;
      
      // Make localStorage unavailable
      localStorage.setItem = jest.fn(() => {
        throw new Error('localStorage not available');
      });
      
      localStorage.getItem = jest.fn(() => {
        throw new Error('localStorage not available');
      });

      // These should not crash, but return gracefully
      const worlds = getAllWorlds();
      expect(worlds).toEqual([]);
      
      const settings = loadSettings();
      expect(settings).toBeDefined();
      expect(settings.musicVolume).toBe(50); // Default value

      // Restore original methods
      localStorage.setItem = originalSetItem;
      localStorage.getItem = originalGetItem;
    });
  });
});
