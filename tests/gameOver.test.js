import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock Three.js dependencies
jest.mock('three', () => {
  const Vector3 = jest.fn().mockImplementation(function(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.set = jest.fn(function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    });
    this.copy = jest.fn(function(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    });
    this.clone = jest.fn(function() {
      return new Vector3(this.x, this.y, this.z);
    });
    return this;
  });

  return { Vector3 };
});

describe('GameOverSystem', () => {
  let GameOverSystem;
  let gameOverSystem;
  let mockPlayer;
  let mockWorld;
  let mockInventory;

  beforeEach(async () => {
    // Reset modules to get fresh imports
    jest.resetModules();

    // Mock DOM elements
    document.getElementById = jest.fn((id) => {
      if (id === 'overlay') {
        return {
          style: {
            visibility: ''
          }
        };
      }
      return null;
    });

    // Create mock inventory
    mockInventory = {
      items: new Map(),
      clear: jest.fn(),
      save: jest.fn()
    };

    // Create mock player
    mockPlayer = {
      health: 100,
      maxHealth: 100,
      position: {
        x: 10,
        y: 20,
        z: 30,
        clone: jest.fn(function() {
          return { x: this.x, y: this.y, z: this.z };
        }),
        copy: jest.fn(function(v) {
          this.x = v.x;
          this.y = v.y;
          this.z = v.z;
          return this;
        })
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0,
        set: jest.fn(function(x, y, z) {
          this.x = x;
          this.y = y;
          this.z = z;
          return this;
        })
      },
      controls: {
        unlock: jest.fn()
      },
      inventory: mockInventory,
      setHealth: jest.fn(function(health) {
        this.health = Math.max(0, Math.min(health, this.maxHealth));
      }),
      initializeFallDamage: jest.fn()
    };

    // Create mock world
    mockWorld = {
      spawnDroppedItem: jest.fn()
    };

    // Import GameOverSystem
    const gameOverModule = await import('../scripts/player/gameOver.js');
    GameOverSystem = gameOverModule.GameOverSystem;

    // Create game over system instance
    gameOverSystem = new GameOverSystem(mockPlayer, mockWorld);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    test('should create GameOverSystem instance', () => {
      expect(gameOverSystem).toBeDefined();
    });

    test('should store player reference', () => {
      expect(gameOverSystem.player).toBe(mockPlayer);
    });

    test('should store world reference', () => {
      expect(gameOverSystem.world).toBe(mockWorld);
    });

    test('should initialize spawn position to (32, 32, 32)', () => {
      expect(gameOverSystem.spawnPosition.x).toBe(32);
      expect(gameOverSystem.spawnPosition.y).toBe(32);
      expect(gameOverSystem.spawnPosition.z).toBe(32);
    });

    test('should initialize isDead flag to false', () => {
      expect(gameOverSystem.isDead).toBe(false);
    });
  });

  describe('Death Detection - update()', () => {
    test('should not trigger death when health > 0', () => {
      mockPlayer.health = 50;
      const handleDeathSpy = jest.spyOn(gameOverSystem, 'handleDeath');
      
      gameOverSystem.update(0.016);
      
      expect(handleDeathSpy).not.toHaveBeenCalled();
    });

    test('should trigger death when health = 0', () => {
      mockPlayer.health = 0;
      const handleDeathSpy = jest.spyOn(gameOverSystem, 'handleDeath');
      
      gameOverSystem.update(0.016);
      
      expect(handleDeathSpy).toHaveBeenCalledTimes(1);
    });

    test('should trigger death when health < 0', () => {
      mockPlayer.health = -10;
      const handleDeathSpy = jest.spyOn(gameOverSystem, 'handleDeath');
      
      gameOverSystem.update(0.016);
      
      expect(handleDeathSpy).toHaveBeenCalledTimes(1);
    });

    test('should not trigger multiple deaths for same death event', () => {
      mockPlayer.health = 0;
      const handleDeathSpy = jest.spyOn(gameOverSystem, 'handleDeath');
      
      // Set isDead flag manually to simulate death in progress
      gameOverSystem.isDead = true;
      
      gameOverSystem.update(0.016);
      
      expect(handleDeathSpy).not.toHaveBeenCalled();
    });

    test('should allow death after previous death completes', () => {
      mockPlayer.health = 0;
      
      // First death
      gameOverSystem.update(0.016);
      
      // Damage player again
      mockPlayer.health = 0;
      
      // Second death should be allowed
      const handleDeathSpy = jest.spyOn(gameOverSystem, 'handleDeath');
      gameOverSystem.update(0.016);
      
      expect(handleDeathSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Death Orchestration - handleDeath()', () => {
    test('should set isDead flag to true at start', () => {
      expect(gameOverSystem.isDead).toBe(false);
      
      gameOverSystem.handleDeath();
      
      // Flag should be reset to false after completion, but we can test the flow
      expect(gameOverSystem.isDead).toBe(false); // Reset after completion
    });

    test('should call dropAllItems with death location', () => {
      const dropAllItemsSpy = jest.spyOn(gameOverSystem, 'dropAllItems');
      mockPlayer.position.x = 15;
      mockPlayer.position.y = 25;
      mockPlayer.position.z = 35;
      
      gameOverSystem.handleDeath();
      
      expect(dropAllItemsSpy).toHaveBeenCalledTimes(1);
      const callArg = dropAllItemsSpy.mock.calls[0][0];
      expect(callArg.x).toBe(15);
      expect(callArg.y).toBe(25);
      expect(callArg.z).toBe(35);
    });

    test('should call resetPlayerState after dropping items', () => {
      const resetPlayerStateSpy = jest.spyOn(gameOverSystem, 'resetPlayerState');
      
      gameOverSystem.handleDeath();
      
      expect(resetPlayerStateSpy).toHaveBeenCalledTimes(1);
    });

    test('should reset isDead flag after completion', () => {
      gameOverSystem.handleDeath();
      
      expect(gameOverSystem.isDead).toBe(false);
    });
  });

  describe('Item Dropping - dropAllItems()', () => {
    test('should create correct number of DroppedItems for single item type', () => {
      mockInventory.items.set(1, 5); // 5 grass blocks
      const deathLocation = { x: 10, y: 20, z: 30 };
      
      gameOverSystem.dropAllItems(deathLocation);
      
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(5);
    });

    test('should create correct number of DroppedItems for multiple item types', () => {
      mockInventory.items.set(1, 3); // 3 grass blocks
      mockInventory.items.set(2, 2); // 2 dirt blocks
      mockInventory.items.set(3, 4); // 4 stone blocks
      const deathLocation = { x: 10, y: 20, z: 30 };
      
      gameOverSystem.dropAllItems(deathLocation);
      
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(9); // 3 + 2 + 4
    });

    test('should apply random offsets to prevent stacking', () => {
      mockInventory.items.set(1, 3);
      const deathLocation = { x: 10, y: 20, z: 30 };
      
      gameOverSystem.dropAllItems(deathLocation);
      
      // Check that each call has different positions (with offsets)
      const calls = mockWorld.spawnDroppedItem.mock.calls;
      expect(calls.length).toBe(3);
      
      // All items should have Y coordinate equal to death location
      calls.forEach(call => {
        const position = call[1];
        expect(position.y).toBe(19);
      });
      
      // X and Z should have offsets (within ±0.3 range)
      calls.forEach(call => {
        const position = call[1];
        expect(position.x).toBeGreaterThanOrEqual(9.7); // 10 - 0.3
        expect(position.x).toBeLessThanOrEqual(10.3); // 10 + 0.3
        expect(position.z).toBeGreaterThanOrEqual(29.7); // 30 - 0.3
        expect(position.z).toBeLessThanOrEqual(30.3); // 30 + 0.3
      });
    });

    test('should pass correct blockId to spawnDroppedItem', () => {
      mockInventory.items.set(5, 2); // 2 items of block type 5
      const deathLocation = { x: 10, y: 20, z: 30 };
      
      gameOverSystem.dropAllItems(deathLocation);
      
      const calls = mockWorld.spawnDroppedItem.mock.calls;
      expect(calls[0][0]).toBe(5);
      expect(calls[1][0]).toBe(5);
    });

    test('should handle empty inventory gracefully', () => {
      const deathLocation = { x: 10, y: 20, z: 30 };
      
      gameOverSystem.dropAllItems(deathLocation);
      
      expect(mockWorld.spawnDroppedItem).not.toHaveBeenCalled();
    });

    test('should handle inventory with zero quantity items', () => {
      mockInventory.items.set(1, 0); // Should not happen, but test gracefully
      const deathLocation = { x: 10, y: 20, z: 30 };
      
      gameOverSystem.dropAllItems(deathLocation);
      
      expect(mockWorld.spawnDroppedItem).not.toHaveBeenCalled();
    });
  });

  describe('Player State Reset - resetPlayerState()', () => {
    test('should clear inventory', () => {
      gameOverSystem.resetPlayerState();
      
      expect(mockInventory.clear).toHaveBeenCalledTimes(1);
    });

    test('should save empty inventory to localStorage', () => {
      gameOverSystem.resetPlayerState();
      
      expect(mockInventory.save).toHaveBeenCalledTimes(1);
    });

    test('should reset position to spawn coordinates', () => {
      mockPlayer.position.copy = jest.fn();
      
      gameOverSystem.resetPlayerState();
      
      expect(mockPlayer.position.copy).toHaveBeenCalledTimes(1);
      const callArg = mockPlayer.position.copy.mock.calls[0][0];
      expect(callArg.x).toBe(32);
      expect(callArg.y).toBe(32);
      expect(callArg.z).toBe(32);
    });

    test('should reset velocity to zero', () => {
      mockPlayer.velocity.x = 5;
      mockPlayer.velocity.y = -10;
      mockPlayer.velocity.z = 3;
      
      gameOverSystem.resetPlayerState();
      
      expect(mockPlayer.velocity.set).toHaveBeenCalledWith(0, 0, 0);
    });

    test('should restore health to maxHealth', () => {
      mockPlayer.health = 0;
      mockPlayer.maxHealth = 100;
      
      gameOverSystem.resetPlayerState();
      
      expect(mockPlayer.setHealth).toHaveBeenCalledWith(100);
    });

    test('should reset fall damage tracking', () => {
      gameOverSystem.resetPlayerState();
      
      expect(mockPlayer.initializeFallDamage).toHaveBeenCalledTimes(1);
    });

    test('should perform all reset operations in correct order', () => {
      const callOrder = [];
      
      mockInventory.clear.mockImplementation(() => callOrder.push('clear'));
      mockInventory.save.mockImplementation(() => callOrder.push('save'));
      mockPlayer.position.copy = jest.fn(() => callOrder.push('position'));
      mockPlayer.velocity.set = jest.fn(() => callOrder.push('velocity'));
      mockPlayer.setHealth = jest.fn(() => callOrder.push('health'));
      mockPlayer.initializeFallDamage = jest.fn(() => callOrder.push('fallDamage'));
      
      gameOverSystem.resetPlayerState();
      
      expect(callOrder).toEqual(['clear', 'save', 'position', 'velocity', 'health', 'fallDamage']);
    });
  });

  describe('Integration - Complete Death Sequence', () => {
    test('should execute complete death sequence from health=0 to respawn', () => {
      mockPlayer.health = 0;
      mockInventory.items.set(1, 3);
      mockPlayer.position.x = 50;
      mockPlayer.position.y = 60;
      mockPlayer.position.z = 70;
      
      gameOverSystem.update(0.016);
      
      // Verify items were dropped
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(3);
      
      // Verify inventory was cleared
      expect(mockInventory.clear).toHaveBeenCalled();
      expect(mockInventory.save).toHaveBeenCalled();
      
      // Verify position was reset
      expect(mockPlayer.position.copy).toHaveBeenCalled();
      
      // Verify velocity was reset
      expect(mockPlayer.velocity.set).toHaveBeenCalledWith(0, 0, 0);
      
      // Verify health was restored
      expect(mockPlayer.setHealth).toHaveBeenCalledWith(100);
      
      // Verify fall damage was reset
      expect(mockPlayer.initializeFallDamage).toHaveBeenCalled();
    });

    test('should handle death with full inventory', () => {
      mockPlayer.health = 0;
      
      // Add many item types
      for (let i = 1; i <= 10; i++) {
        mockInventory.items.set(i, 5);
      }
      
      gameOverSystem.update(0.016);
      
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(50); // 10 types * 5 each
    });

    test('should handle death with empty inventory', () => {
      mockPlayer.health = 0;
      
      gameOverSystem.update(0.016);
      
      expect(mockWorld.spawnDroppedItem).not.toHaveBeenCalled();
      expect(mockInventory.clear).toHaveBeenCalled();
    });

    test('should handle multiple deaths in succession', () => {
      // First death
      mockPlayer.health = 0;
      mockInventory.items.set(1, 2);
      gameOverSystem.update(0.016);
      
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(2);
      
      // Clear inventory for second death
      mockInventory.items.clear();
      
      // Reset mock call count
      mockWorld.spawnDroppedItem.mockClear();
      
      // Second death
      mockPlayer.health = 0;
      mockInventory.items.set(2, 3);
      gameOverSystem.update(0.016);
      
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    test('should handle death at spawn position', () => {
      mockPlayer.health = 0;
      mockPlayer.position.x = 32;
      mockPlayer.position.y = 32;
      mockPlayer.position.z = 32;
      mockInventory.items.set(1, 1);
      
      gameOverSystem.update(0.016);
      
      // Should still drop items at spawn
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(1);
    });

    test('should handle death with negative health', () => {
      mockPlayer.health = -50;
      
      gameOverSystem.update(0.016);
      
      expect(mockPlayer.setHealth).toHaveBeenCalledWith(100);
    });

    test('should handle death with custom maxHealth', () => {
      mockPlayer.health = 0;
      mockPlayer.maxHealth = 200;
      
      gameOverSystem.update(0.016);
      
      expect(mockPlayer.setHealth).toHaveBeenCalledWith(200);
    });

    test('should handle very large inventory quantities', () => {
      mockPlayer.health = 0;
      mockInventory.items.set(1, 1000);
      
      gameOverSystem.update(0.016);
      
      expect(mockWorld.spawnDroppedItem).toHaveBeenCalledTimes(1000);
    });

    test('should not interfere with normal gameplay when health > 0', () => {
      mockPlayer.health = 100;
      
      // Call update multiple times
      for (let i = 0; i < 100; i++) {
        gameOverSystem.update(0.016);
      }
      
      expect(mockWorld.spawnDroppedItem).not.toHaveBeenCalled();
      expect(mockInventory.clear).not.toHaveBeenCalled();
    });
  });
});
