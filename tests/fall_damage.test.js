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
    this.add = jest.fn(function(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    });
    this.applyEuler = jest.fn().mockReturnThis();
    return this;
  });

  const Vector2 = jest.fn().mockImplementation(function(x = 0, y = 0) {
    this.x = x;
    this.y = y;
    return this;
  });

  const PerspectiveCamera = jest.fn().mockImplementation(function() {
    this.position = new Vector3();
    this.rotation = { y: 0 };
    this.layers = {
      set: jest.fn(),
      enable: jest.fn()
    };
    this.add = jest.fn();
    return this;
  });

  const CameraHelper = jest.fn().mockImplementation(function() {
    this.visible = false;
    return this;
  });

  const Raycaster = jest.fn().mockImplementation(function() {
    this.layers = {
      set: jest.fn()
    };
    return this;
  });

  const Group = jest.fn().mockImplementation(function() {
    this.add = jest.fn();
    this.position = {
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      })
    };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = {
      x: 1,
      y: 1,
      z: 1,
      set: jest.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      })
    };
    return this;
  });

  const Mesh = jest.fn().mockImplementation(function() {
    this.visible = false;
    this.position = {
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn(function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      })
    };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    return this;
  });

  const CylinderGeometry = jest.fn();
  const BoxGeometry = jest.fn();
  const MeshBasicMaterial = jest.fn();
  const MeshStandardMaterial = jest.fn();
  const Euler = jest.fn();
  const Fog = jest.fn();

  return {
    Vector3,
    Vector2,
    PerspectiveCamera,
    CameraHelper,
    Raycaster,
    Group,
    Mesh,
    CylinderGeometry,
    BoxGeometry,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Euler,
    Fog
  };
});

// Mock PointerLockControls
jest.mock('three/addons/controls/PointerLockControls.js', () => ({
  PointerLockControls: jest.fn().mockImplementation(function() {
    this.addEventListener = jest.fn();
    this.isLocked = false;
    return this;
  })
}));

// Mock simple character
jest.mock('../scripts/player/body/simple', () => ({
  simpleCharacter: jest.fn().mockImplementation(() => ({
    position: { copy: jest.fn() },
    visible: false
  }))
}));

// Mock blocks
jest.mock('../scripts/textures/blocks.js', () => ({
  blocks: {
    empty: { id: 0 }
  }
}));

// Mock LandingSoundGenerator
jest.mock('../scripts/audio/landingSoundGenerator.js', () => ({
  LandingSoundGenerator: jest.fn().mockImplementation(function() {
    this.play = jest.fn();
    this.init = jest.fn();
    return this;
  })
}));

describe('Fall Damage System', () => {
  let PlayerBase;
  let player;
  let mockHealthBarFill;
  let originalPerformanceNow;

  beforeEach(async () => {
    // Reset modules to get fresh imports
    jest.resetModules();

    // Mock DOM elements
    mockHealthBarFill = {
      style: {
        width: '100%'
      }
    };

    document.getElementById = jest.fn((id) => {
      if (id === 'health-bar-fill') {
        return mockHealthBarFill;
      }
      if (id === 'info-player-position') {
        return { innerHTML: '' };
      }
      return null;
    });

    // Mock setTimeout for constructor
    global.setTimeout = jest.fn((fn) => fn());

    // Save original performance.now
    originalPerformanceNow = performance.now;
    
    // Mock performance.now with a controllable time
    let currentTime = 0;
    performance.now = jest.fn(() => currentTime);
    performance.now.setTime = (time) => { currentTime = time; };

    // Import PlayerBase
    const playerModule = await import('../scripts/player/base.js');
    PlayerBase = playerModule.PlayerBase;

    // Create player instance
    player = new PlayerBase();
  });

  afterEach(() => {
    jest.clearAllMocks();
    performance.now = originalPerformanceNow;
  });

  describe('Fall Damage Initialization', () => {
    test('should initialize gameStartTime to null before pointer lock', () => {
      expect(player.gameStartTime).toBeNull();
    });

    test('should initialize fallStartY to null', () => {
      expect(player.fallStartY).toBeNull();
    });

    test('should initialize isFalling to false', () => {
      expect(player.isFalling).toBe(false);
    });

    test('should set spawn immunity duration to 5000ms', () => {
      expect(player.spawnImmunityDuration).toBe(5000);
    });
  });

  describe('Fall Detection Logic', () => {
    test('should detect fall start when velocity.y < 0 and not on ground', () => {
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;

      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(true);
      expect(player.fallStartY).toBe(10);
    });

    test('should track highest point during fall', () => {
      // Start falling from y=10
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      expect(player.fallStartY).toBe(10);

      // Continue falling, but check if we were higher
      player.position.y = 9;
      player.updateFallDamage(0.016);
      expect(player.fallStartY).toBe(10); // Should still be 10

      // Simulate being at a higher point (shouldn't happen in real fall, but tests the max logic)
      player.position.y = 11;
      player.updateFallDamage(0.016);
      expect(player.fallStartY).toBe(11); // Should update to 11
    });

    test('should reset fall tracking when landing (onGround becomes true)', () => {
      // Start falling
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(true);
      expect(player.fallStartY).toBe(10);

      // Land (but within safe distance to avoid damage)
      player.position.y = 8;
      player.onGround = true;
      
      // Advance time past spawn immunity
      performance.now.setTime(6000);
      
      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(false);
      expect(player.fallStartY).toBeNull();
    });

    test('should reset fall tracking when moving upward (velocity.y > 0)', () => {
      // Start falling
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(true);

      // Start moving upward (jumping)
      player.velocity.y = 1;
      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(false);
      expect(player.fallStartY).toBeNull();
    });
  });

  describe('Damage Calculation', () => {
    beforeEach(() => {
      // Advance time past spawn immunity for damage tests
      performance.now.setTime(6000);
    });

    test('should apply no damage for falls of 3 blocks or less', () => {
      // Fall from 3 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      // Land at y=7 (3 block fall)
      player.position.y = 7;
      player.onGround = true;
      player.updateFallDamage(0.016);

      expect(player.health).toBe(100);
    });

    test('should calculate correct damage for 4 block fall', () => {
      // Fall from 4 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      // Land at y=6 (4 block fall)
      player.position.y = 6;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Expected damage: (4 - 3) * (100 * 0.01) = 1
      expect(player.health).toBe(99);
    });

    test('should calculate correct damage for 10 block fall', () => {
      // Fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      // Land at y=10 (10 block fall)
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Expected damage: (10 - 3) * (100 * 0.01) = 7
      expect(player.health).toBe(93);
    });

    test('should calculate correct damage for 20 block fall', () => {
      // Fall from 20 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 30;
      player.updateFallDamage(0.016);

      // Land at y=10 (20 block fall)
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Expected damage: (20 - 3) * (100 * 0.01) = 17
      expect(player.health).toBe(83);
    });

    test('should update health bar after fall damage', () => {
      // Fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      expect(mockHealthBarFill.style.width).toBe('93%');
    });
  });

  describe('Spawn Immunity', () => {
    test('should not apply damage during first 5 seconds after spawn', () => {
      // Simulate pointer lock to start game time
      player.controls.isLocked = true;
      performance.now.setTime(0);
      player.updateFallDamage(0.016); // This sets gameStartTime
      
      // Set time to 2 seconds after game start (within immunity)
      performance.now.setTime(2000);

      // Fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Should not take damage due to spawn immunity
      expect(player.health).toBe(100);
    });

    test('should apply damage correctly after immunity expires', () => {
      // Set time to 6 seconds after spawn (past immunity)
      performance.now.setTime(6000);

      // Fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Should take damage: (10 - 3) * 1 = 7
      expect(player.health).toBe(93);
    });

    test('should not apply damage at exactly 5 seconds (boundary)', () => {
      // Simulate pointer lock to start game time
      player.controls.isLocked = true;
      performance.now.setTime(0);
      player.updateFallDamage(0.016); // This sets gameStartTime
      
      // Set time to exactly 5 seconds (4999ms is still immune)
      performance.now.setTime(4999);

      // Fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Should not take damage (still within immunity)
      expect(player.health).toBe(100);
    });

    test('should apply damage just after 5 seconds', () => {
      // Set time to just past 5 seconds
      performance.now.setTime(5001);

      // Fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Should take damage
      expect(player.health).toBe(93);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      // Advance time past spawn immunity for edge case tests
      performance.now.setTime(6000);
    });

    test('should handle multiple consecutive falls', () => {
      // First fall from 10 blocks
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      expect(player.health).toBe(93); // Lost 7 health

      // Reset for second fall
      player.onGround = false;
      player.velocity.y = -1;
      player.position.y = 15;
      player.updateFallDamage(0.016);

      // Second fall from 10 blocks
      player.position.y = 5;
      player.onGround = true;
      player.updateFallDamage(0.016);

      expect(player.health).toBe(86); // Lost another 7 health
    });

    test('should handle jumping during a fall', () => {
      // Start falling
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(true);

      // Jump (velocity becomes positive)
      player.velocity.y = 5;
      player.updateFallDamage(0.016);

      // Fall should be reset
      expect(player.isFalling).toBe(false);
      expect(player.fallStartY).toBeNull();

      // Now fall again from lower height
      player.velocity.y = -1;
      player.position.y = 15;
      player.updateFallDamage(0.016);

      player.position.y = 10;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Should only take damage for 5 block fall, not the original 20
      expect(player.health).toBe(98); // (5 - 3) * 1 = 2 damage
    });

    test('should handle landing and immediately falling again', () => {
      // First fall
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 5;
      player.onGround = true;
      player.updateFallDamage(0.016);

      expect(player.health).toBe(98); // (5 - 3) * 1 = 2 damage
      expect(player.isFalling).toBe(false);

      // Immediately fall again
      player.onGround = false;
      player.velocity.y = -1;
      player.position.y = 10;
      player.updateFallDamage(0.016);

      expect(player.isFalling).toBe(true);
      expect(player.fallStartY).toBe(10);

      // Land again
      player.position.y = 5;
      player.onGround = true;
      player.updateFallDamage(0.016);

      expect(player.health).toBe(96); // Lost another 2 health
    });

    test('should handle extreme fall distances (100+ blocks)', () => {
      // Fall from 103 blocks (should be fatal)
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 103;
      player.updateFallDamage(0.016);

      // Land
      player.position.y = 0;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Expected damage: (103 - 3) * 1 = 100 (fatal)
      expect(player.health).toBe(0);
    });

    test('should handle fall that brings health below zero', () => {
      // Set health to low value
      player.health = 10;

      // Fall from 20 blocks (would do 17 damage)
      player.velocity.y = -1;
      player.onGround = false;
      player.position.y = 20;
      player.updateFallDamage(0.016);

      player.position.y = 0;
      player.onGround = true;
      player.updateFallDamage(0.016);

      // Health should be clamped to 0 (10 - 17 = -7, clamped to 0)
      expect(player.health).toBe(0);
    });

    test('should not start new fall when already on ground', () => {
      player.velocity.y = -1;
      player.onGround = true; // Already on ground
      player.position.y = 10;

      player.updateFallDamage(0.016);

      // Should not start falling
      expect(player.isFalling).toBe(false);
      expect(player.fallStartY).toBeNull();
    });

    test('should handle zero velocity', () => {
      player.velocity.y = 0;
      player.onGround = false;
      player.position.y = 10;

      player.updateFallDamage(0.016);

      // Should not start falling with zero velocity
      expect(player.isFalling).toBe(false);
    });
  });
});
