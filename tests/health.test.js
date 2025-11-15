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

describe('Player Health System', () => {
  let PlayerBase;
  let player;
  let mockHealthBarFill;

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

    // Import PlayerBase
    const playerModule = await import('../scripts/player/base.js');
    PlayerBase = playerModule.PlayerBase;

    // Create player instance
    player = new PlayerBase();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should initialize with default maxHealth of 100', () => {
      expect(player.maxHealth).toBe(100);
    });

    test('should initialize with full health', () => {
      expect(player.health).toBe(100);
    });

    test('should call updateHealthBar on initialization', () => {
      expect(global.setTimeout).toHaveBeenCalled();
      expect(document.getElementById).toHaveBeenCalledWith('health-bar-fill');
    });
  });

  describe('takeDamage()', () => {
    test('should reduce health by specified amount', () => {
      player.takeDamage(10);
      expect(player.health).toBe(90);
    });

    test('should reduce health by larger amounts', () => {
      player.takeDamage(50);
      expect(player.health).toBe(50);
    });

    test('should not reduce health below 0', () => {
      player.takeDamage(150);
      expect(player.health).toBe(0);
    });

    test('should update health bar after taking damage', () => {
      player.takeDamage(25);
      expect(mockHealthBarFill.style.width).toBe('75%');
    });

    test('should handle multiple damage instances', () => {
      player.takeDamage(10);
      player.takeDamage(20);
      player.takeDamage(15);
      expect(player.health).toBe(55);
    });

    test('should handle decimal damage values', () => {
      player.takeDamage(10.5);
      expect(player.health).toBe(89.5);
    });
  });

  describe('heal()', () => {
    test('should increase health by specified amount', () => {
      player.health = 50;
      player.heal(20);
      expect(player.health).toBe(70);
    });

    test('should not exceed maxHealth', () => {
      player.health = 90;
      player.heal(20);
      expect(player.health).toBe(100);
    });

    test('should heal from 0 health', () => {
      player.health = 0;
      player.heal(50);
      expect(player.health).toBe(50);
    });

    test('should update health bar after healing', () => {
      player.health = 50;
      player.heal(25);
      expect(mockHealthBarFill.style.width).toBe('75%');
    });

    test('should handle multiple heal instances', () => {
      player.health = 30;
      player.heal(10);
      player.heal(15);
      player.heal(20);
      expect(player.health).toBe(75);
    });

    test('should handle decimal heal values', () => {
      player.health = 50;
      player.heal(10.5);
      expect(player.health).toBe(60.5);
    });
  });

  describe('setHealth()', () => {
    test('should set health to specific value', () => {
      player.setHealth(75);
      expect(player.health).toBe(75);
    });

    test('should not exceed maxHealth', () => {
      player.setHealth(150);
      expect(player.health).toBe(100);
    });

    test('should not go below 0', () => {
      player.setHealth(-50);
      expect(player.health).toBe(0);
    });

    test('should update health bar after setting health', () => {
      player.setHealth(60);
      expect(mockHealthBarFill.style.width).toBe('60%');
    });

    test('should handle setting to 0', () => {
      player.setHealth(0);
      expect(player.health).toBe(0);
      expect(mockHealthBarFill.style.width).toBe('0%');
    });

    test('should handle setting to maxHealth', () => {
      player.health = 50;
      player.setHealth(player.maxHealth);
      expect(player.health).toBe(100);
      expect(mockHealthBarFill.style.width).toBe('100%');
    });
  });

  describe('updateHealthBar()', () => {
    test('should update health bar width to match health percentage', () => {
      player.health = 75;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('75%');
    });

    test('should show 100% when at full health', () => {
      player.health = 100;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('100%');
    });

    test('should show 0% when at zero health', () => {
      player.health = 0;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('0%');
    });

    test('should handle decimal health percentages', () => {
      player.health = 33.33;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('33.33%');
    });

    test('should handle missing health bar element gracefully', () => {
      document.getElementById = jest.fn(() => null);
      expect(() => player.updateHealthBar()).not.toThrow();
    });
  });

  describe('Custom maxHealth', () => {
    test('should work with custom maxHealth value', () => {
      player.maxHealth = 200;
      player.health = 200;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('100%');
    });

    test('should calculate percentage correctly with custom maxHealth', () => {
      player.maxHealth = 200;
      player.health = 100;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('50%');
    });

    test('should respect new maxHealth when healing', () => {
      player.maxHealth = 150;
      player.health = 100;
      player.heal(100);
      expect(player.health).toBe(150);
    });

    test('should respect new maxHealth when setting health', () => {
      player.maxHealth = 50;
      player.setHealth(100);
      expect(player.health).toBe(50);
    });

    test('should handle maxHealth of 1', () => {
      player.maxHealth = 1;
      player.health = 0.5;
      player.updateHealthBar();
      expect(mockHealthBarFill.style.width).toBe('50%');
    });
  });

  describe('Edge Cases', () => {
    test('should handle taking 0 damage', () => {
      const initialHealth = player.health;
      player.takeDamage(0);
      expect(player.health).toBe(initialHealth);
    });

    test('should handle healing 0 health', () => {
      const initialHealth = player.health;
      player.heal(0);
      expect(player.health).toBe(initialHealth);
    });

    test('should handle negative damage (should not heal)', () => {
      player.health = 50;
      player.takeDamage(-10);
      expect(player.health).toBeGreaterThanOrEqual(50);
    });

    test('should handle negative heal (should not damage)', () => {
      player.health = 50;
      player.heal(-10);
      expect(player.health).toBeLessThanOrEqual(50);
    });

    test('should handle very large damage values', () => {
      player.takeDamage(999999);
      expect(player.health).toBe(0);
    });

    test('should handle very large heal values', () => {
      player.health = 0;
      player.heal(999999);
      expect(player.health).toBe(player.maxHealth);
    });
  });

  describe('Integration Scenarios', () => {
    test('should handle damage and heal cycle', () => {
      player.takeDamage(30);
      expect(player.health).toBe(70);
      
      player.heal(20);
      expect(player.health).toBe(90);
      
      player.takeDamage(40);
      expect(player.health).toBe(50);
    });

    test('should handle death scenario (health reaches 0)', () => {
      player.takeDamage(100);
      expect(player.health).toBe(0);
      expect(mockHealthBarFill.style.width).toBe('0%');
    });

    test('should handle resurrection scenario (heal from 0)', () => {
      player.health = 0;
      player.heal(50);
      expect(player.health).toBe(50);
      expect(mockHealthBarFill.style.width).toBe('50%');
    });

    test('should handle rapid damage and heal', () => {
      for (let i = 0; i < 10; i++) {
        player.takeDamage(5);
        player.heal(3);
      }
      expect(player.health).toBe(80); // Lost 2 per iteration, 10 iterations = -20
    });

    test('should maintain health bar accuracy through multiple operations', () => {
      player.takeDamage(25);
      expect(mockHealthBarFill.style.width).toBe('75%');
      
      player.heal(15);
      expect(mockHealthBarFill.style.width).toBe('90%');
      
      player.setHealth(50);
      expect(mockHealthBarFill.style.width).toBe('50%');
    });
  });
});
