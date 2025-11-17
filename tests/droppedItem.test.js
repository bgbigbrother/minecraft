import { describe, it, expect, beforeEach } from '@jest/globals';
import { DroppedItem } from '../scripts/inventory/DroppedItem.js';
import * as THREE from 'three';

describe('DroppedItem Constructor', () => {
  let mockBlockDefinition;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };
  });

  it('should create mesh with 0.1 scale', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    expect(droppedItem.mesh).toBeDefined();
    expect(droppedItem.mesh.scale.x).toBe(0.1);
    expect(droppedItem.mesh.scale.y).toBe(0.1);
    expect(droppedItem.mesh.scale.z).toBe(0.1);
  });

  it('should use correct material from block definition', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    expect(droppedItem.mesh.material).toBe(mockBlockDefinition.material);
  });

  it('should store blockId correctly', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(3, position, mockBlockDefinition);

    expect(droppedItem.blockId).toBe(3);
  });

  it('should clone position vector', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    expect(droppedItem.position).not.toBe(position);
    expect(droppedItem.position.x).toBe(5);
    expect(droppedItem.position.y).toBe(10);
    expect(droppedItem.position.z).toBe(5);
  });

  it('should initialize velocity to zero', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    expect(droppedItem.velocity.x).toBe(0);
    expect(droppedItem.velocity.y).toBe(0);
    expect(droppedItem.velocity.z).toBe(0);
  });

  it('should position mesh at correct location', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    expect(droppedItem.mesh.position.x).toBe(5);
    expect(droppedItem.mesh.position.y).toBe(10);
    expect(droppedItem.mesh.position.z).toBe(5);
  });

  it('should handle missing block definition gracefully', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, null);

    expect(droppedItem.mesh).toBeDefined();
    expect(droppedItem.mesh.material).toBeDefined();
  });
});

describe('DroppedItem Dispose', () => {
  let mockBlockDefinition;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };
  });

  it('should dispose geometry when dispose is called', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    const geometry = droppedItem.mesh.geometry;
    
    // Verify geometry exists before dispose
    expect(geometry).toBeDefined();

    droppedItem.dispose();

    // Verify mesh is cleared after dispose
    expect(droppedItem.mesh).toBeNull();
  });

  it('should clear mesh reference after dispose', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    droppedItem.dispose();

    expect(droppedItem.mesh).toBeNull();
  });

  it('should not throw when dispose is called multiple times', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);

    expect(() => {
      droppedItem.dispose();
      droppedItem.dispose();
    }).not.toThrow();
  });

  it('should not throw when mesh is already null', () => {
    const position = new THREE.Vector3(5, 10, 5);
    const droppedItem = new DroppedItem(1, position, mockBlockDefinition);
    droppedItem.mesh = null;

    expect(() => {
      droppedItem.dispose();
    }).not.toThrow();
  });
});

describe('DroppedItem Rotation', () => {
  let droppedItem;
  let mockBlockDefinition;

  beforeEach(() => {
    // Create a mock block definition with material
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };

    // Create a dropped item at position (5, 10, 5)
    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition);
  });

  it('should have ROTATION_SPEED constant set to 2 radians per second', () => {
    expect(DroppedItem.ROTATION_SPEED).toBe(2);
  });

  it('should rotate on Y-axis when update is called', () => {
    const initialRotation = droppedItem.mesh.rotation.y;
    const dt = 0.016; // ~60 FPS frame time
    
    droppedItem.update(dt);
    
    const expectedRotation = initialRotation + (DroppedItem.ROTATION_SPEED * dt);
    expect(droppedItem.mesh.rotation.y).toBeCloseTo(expectedRotation, 5);
  });

  it('should have frame-rate independent rotation', () => {
    const initialRotation = droppedItem.mesh.rotation.y;
    
    // Simulate 1 second at 60 FPS (60 frames of ~0.016s each)
    for (let i = 0; i < 60; i++) {
      droppedItem.update(0.016);
    }
    const rotation60fps = droppedItem.mesh.rotation.y;
    
    // Reset rotation
    droppedItem.mesh.rotation.y = initialRotation;
    
    // Simulate 1 second at 30 FPS (30 frames of ~0.033s each)
    for (let i = 0; i < 30; i++) {
      droppedItem.update(0.033);
    }
    const rotation30fps = droppedItem.mesh.rotation.y;
    
    // Both should result in approximately 2 radians of rotation (ROTATION_SPEED * 1 second)
    // Using precision of 0 decimal places to account for floating-point arithmetic
    expect(rotation60fps).toBeCloseTo(initialRotation + 2, 0);
    expect(rotation30fps).toBeCloseTo(initialRotation + 2, 0);
    expect(rotation60fps).toBeCloseTo(rotation30fps, 0);
  });

  it('should continue rotating over multiple frames', () => {
    const initialRotation = droppedItem.mesh.rotation.y;
    const dt = 0.1; // 100ms
    
    // Update 5 times
    for (let i = 0; i < 5; i++) {
      droppedItem.update(dt);
    }
    
    const expectedRotation = initialRotation + (DroppedItem.ROTATION_SPEED * dt * 5);
    expect(droppedItem.mesh.rotation.y).toBeCloseTo(expectedRotation, 5);
  });

  it('should not crash if mesh is null', () => {
    droppedItem.mesh = null;
    
    expect(() => {
      droppedItem.update(0.016);
    }).not.toThrow();
  });
});

describe('DroppedItem Gravity', () => {
  let droppedItem;
  let mockBlockDefinition;
  let mockWorld;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };

    // Mock world with getBlock method that returns no solid blocks
    mockWorld = {
      getBlock: (x, y, z) => 0 // Return air/empty
    };

    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
  });

  it('should have GRAVITY constant set to 9.8', () => {
    expect(DroppedItem.GRAVITY).toBe(9.8);
  });

  it('should apply downward velocity when not on ground', () => {
    const initialVelocityY = droppedItem.velocity.y;
    const dt = 0.1; // 100ms
    
    droppedItem.update(dt);
    
    const expectedVelocityY = initialVelocityY - (DroppedItem.GRAVITY * dt);
    expect(droppedItem.velocity.y).toBeCloseTo(expectedVelocityY, 5);
  });

  it('should accumulate velocity over multiple frames', () => {
    const dt = 0.016; // ~60 FPS
    
    // Update 10 times
    for (let i = 0; i < 10; i++) {
      droppedItem.update(dt);
    }
    
    const expectedVelocityY = -(DroppedItem.GRAVITY * dt * 10);
    expect(droppedItem.velocity.y).toBeCloseTo(expectedVelocityY, 4);
  });

  it('should update position based on velocity', () => {
    const initialY = droppedItem.position.y;
    const dt = 0.1;
    
    droppedItem.update(dt);
    
    // After one frame: velocity.y = -0.98, position.y should decrease by velocity.y * dt
    const expectedVelocityY = -(DroppedItem.GRAVITY * dt);
    const expectedY = initialY + (expectedVelocityY * dt);
    
    expect(droppedItem.position.y).toBeCloseTo(expectedY, 5);
  });

  it('should update mesh position to match item position', () => {
    const dt = 0.1;
    
    droppedItem.update(dt);
    
    expect(droppedItem.mesh.position.y).toBeCloseTo(droppedItem.position.y, 5);
  });

  it('should not apply gravity when on ground', () => {
    // Set item as on ground
    droppedItem.onGround = true;
    const initialVelocityY = droppedItem.velocity.y;
    const initialY = droppedItem.position.y;
    
    droppedItem.update(0.1);
    
    // Velocity and position should not change
    expect(droppedItem.velocity.y).toBe(initialVelocityY);
    expect(droppedItem.position.y).toBe(initialY);
  });
});

describe('DroppedItem Collision Detection', () => {
  let droppedItem;
  let mockBlockDefinition;
  let mockWorld;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };
  });

  it('should detect solid block below item', () => {
    // Mock world with solid block below
    mockWorld = {
      getBlock: (x, y, z) => {
        if (y === 9) return 1; // Solid block at y=9
        return 0; // Air elsewhere
      }
    };

    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    const hasCollision = droppedItem.checkCollision();
    expect(hasCollision).toBe(true);
  });

  it('should not detect collision when no solid block below', () => {
    // Mock world with no solid blocks
    mockWorld = {
      getBlock: (x, y, z) => 0 // All air
    };

    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    const hasCollision = droppedItem.checkCollision();
    expect(hasCollision).toBe(false);
  });

  it('should check block coordinates correctly', () => {
    const checkedCoordinates = [];
    
    mockWorld = {
      getBlock: (x, y, z) => {
        checkedCoordinates.push({ x, y, z });
        return 0;
      }
    };

    const position = new THREE.Vector3(5.7, 10.3, 5.2);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.checkCollision();
    
    // Should check floor(5.7), floor(10.3 - 0.1), floor(5.2) = (5, 10, 5)
    // When item is at y=10.3, we check the block below at floor(10.3 - 0.1) = 10
    expect(checkedCoordinates.length).toBeGreaterThan(0);
    expect(checkedCoordinates[0]).toEqual({ x: 5, y: 10, z: 5 });
  });

  it('should return false when world reference is missing', () => {
    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, null);
    
    const hasCollision = droppedItem.checkCollision();
    expect(hasCollision).toBe(false);
  });

  it('should treat empty blocks (blockId 0) as non-solid', () => {
    mockWorld = {
      getBlock: (x, y, z) => 0 // Empty/air block
    };

    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    const hasCollision = droppedItem.checkCollision();
    expect(hasCollision).toBe(false);
  });
});

describe('DroppedItem Landing on Ground', () => {
  let droppedItem;
  let mockBlockDefinition;
  let mockWorld;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };
  });

  it('should stop falling when collision is detected', () => {
    // Mock world with solid block at y=9
    mockWorld = {
      getBlock: (x, y, z) => {
        if (y === 9) return 1; // Solid block
        return 0;
      }
    };

    const position = new THREE.Vector3(5, 10.2, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    // Apply some downward velocity
    droppedItem.velocity.y = -2;
    
    droppedItem.update(0.1);
    
    // Should have stopped falling
    expect(droppedItem.velocity.y).toBe(0);
    expect(droppedItem.onGround).toBe(true);
  });

  it('should snap to block surface when landing', () => {
    // Mock world with solid block at y=9
    mockWorld = {
      getBlock: (x, y, z) => {
        if (y === 9) return 1;
        return 0;
      }
    };

    const position = new THREE.Vector3(5, 10.2, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -2;
    droppedItem.update(0.1);
    
    // Should snap to y = floor(10.2) + 1.05 = 10 + 1.05 = 10.05
    expect(droppedItem.position.y).toBeCloseTo(10.05, 2);
  });

  it('should update mesh position when landing', () => {
    mockWorld = {
      getBlock: (x, y, z) => {
        if (y === 9) return 1;
        return 0;
      }
    };

    const position = new THREE.Vector3(5, 10.2, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -2;
    droppedItem.update(0.1);
    
    expect(droppedItem.mesh.position.y).toBeCloseTo(droppedItem.position.y, 5);
  });

  it('should set onGround flag when landing', () => {
    mockWorld = {
      getBlock: (x, y, z) => {
        if (y === 9) return 1;
        return 0;
      }
    };

    const position = new THREE.Vector3(5, 10.2, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    expect(droppedItem.onGround).toBe(false);
    
    droppedItem.velocity.y = -2;
    droppedItem.update(0.1);
    
    expect(droppedItem.onGround).toBe(true);
  });

  it('should continue rotating after landing', () => {
    mockWorld = {
      getBlock: (x, y, z) => {
        if (y === 9) return 1;
        return 0;
      }
    };

    const position = new THREE.Vector3(5, 10.2, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -2;
    droppedItem.update(0.1);
    
    const rotationAfterLanding = droppedItem.mesh.rotation.y;
    
    // Update again - rotation should continue
    droppedItem.update(0.1);
    
    expect(droppedItem.mesh.rotation.y).toBeGreaterThan(rotationAfterLanding);
  });
});

describe('DroppedItem World Boundary Protection', () => {
  let droppedItem;
  let mockBlockDefinition;
  let mockWorld;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };

    // Mock world with no solid blocks
    mockWorld = {
      getBlock: (x, y, z) => 0
    };
  });

  it('should prevent falling below y=0', () => {
    const position = new THREE.Vector3(5, 0.5, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    // Apply strong downward velocity
    droppedItem.velocity.y = -10;
    
    droppedItem.update(0.5); // Large time step to push below 0
    
    // Should be clamped to 0.5
    expect(droppedItem.position.y).toBe(0.5);
  });

  it('should stop velocity when hitting world bottom', () => {
    const position = new THREE.Vector3(5, 0.5, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -10;
    droppedItem.update(0.5);
    
    expect(droppedItem.velocity.y).toBe(0);
  });

  it('should set onGround flag when hitting world bottom', () => {
    const position = new THREE.Vector3(5, 0.5, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -10;
    droppedItem.update(0.5);
    
    expect(droppedItem.onGround).toBe(true);
  });

  it('should update mesh position when clamped to world bottom', () => {
    const position = new THREE.Vector3(5, 0.5, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -10;
    droppedItem.update(0.5);
    
    expect(droppedItem.mesh.position.y).toBe(0.5);
  });

  it('should not affect items above y=0', () => {
    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition, mockWorld);
    
    droppedItem.velocity.y = -1;
    droppedItem.update(0.1);
    
    // Should fall normally, not be clamped
    expect(droppedItem.position.y).toBeLessThan(10);
    expect(droppedItem.position.y).toBeGreaterThan(0.5);
  });
});

describe('DroppedItem Despawn Tracking', () => {
  let droppedItem;
  let mockBlockDefinition;

  beforeEach(() => {
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };

    const position = new THREE.Vector3(5, 10, 5);
    droppedItem = new DroppedItem(1, position, mockBlockDefinition);
  });

  it('should have DESPAWN_TIME constant set to 600 seconds', () => {
    expect(DroppedItem.DESPAWN_TIME).toBe(600);
  });

  it('should initialize createdAt timestamp in constructor', () => {
    expect(droppedItem.createdAt).toBeDefined();
    expect(typeof droppedItem.createdAt).toBe('number');
    expect(droppedItem.createdAt).toBeGreaterThan(0);
  });

  it('should have getAge method that returns age in seconds', () => {
    expect(typeof droppedItem.getAge).toBe('function');
    
    const age = droppedItem.getAge();
    expect(typeof age).toBe('number');
    expect(age).toBeGreaterThanOrEqual(0);
    expect(age).toBeLessThan(1); // Should be less than 1 second old
  });

  it('should calculate age correctly', () => {
    // Manually set createdAt to 5 seconds ago
    droppedItem.createdAt = Date.now() - 5000;
    
    const age = droppedItem.getAge();
    expect(age).toBeGreaterThanOrEqual(4.9);
    expect(age).toBeLessThanOrEqual(5.1);
  });

  it('should have shouldDespawn method', () => {
    expect(typeof droppedItem.shouldDespawn).toBe('function');
  });

  it('should not despawn when age is less than DESPAWN_TIME', () => {
    // Item just created
    expect(droppedItem.shouldDespawn()).toBe(false);
    
    // Item created 300 seconds ago (half of despawn time)
    droppedItem.createdAt = Date.now() - 300000;
    expect(droppedItem.shouldDespawn()).toBe(false);
    
    // Item created 599 seconds ago (just before despawn time)
    droppedItem.createdAt = Date.now() - 599000;
    expect(droppedItem.shouldDespawn()).toBe(false);
  });

  it('should despawn when age equals DESPAWN_TIME', () => {
    // Item created exactly 600 seconds ago
    droppedItem.createdAt = Date.now() - 600000;
    expect(droppedItem.shouldDespawn()).toBe(true);
  });

  it('should despawn when age exceeds DESPAWN_TIME', () => {
    // Item created 601 seconds ago
    droppedItem.createdAt = Date.now() - 601000;
    expect(droppedItem.shouldDespawn()).toBe(true);
    
    // Item created 1000 seconds ago
    droppedItem.createdAt = Date.now() - 1000000;
    expect(droppedItem.shouldDespawn()).toBe(true);
  });

  it('should return correct age over time', () => {
    const firstAge = droppedItem.getAge();
    
    // Wait a bit (simulate time passing)
    const waitTime = 100; // 100ms
    const startTime = Date.now();
    while (Date.now() - startTime < waitTime) {
      // Busy wait
    }
    
    const secondAge = droppedItem.getAge();
    expect(secondAge).toBeGreaterThan(firstAge);
    expect(secondAge - firstAge).toBeGreaterThanOrEqual(0.09); // At least 90ms difference
  });
});

describe('ItemCollector checkDespawns', () => {
  let mockWorld;
  let droppedItems;
  let mockBlockDefinition;

  beforeEach(() => {
    // Import ItemCollector
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    mockBlockDefinition = {
      material: new THREE.MeshLambertMaterial({ color: 0x00ff00 })
    };

    // Mock world with scene-like remove method
    mockWorld = {
      remove: function(mesh) {
        // Track removed meshes for verification
        if (!this.removedMeshes) {
          this.removedMeshes = [];
        }
        this.removedMeshes.push(mesh);
      },
      removedMeshes: []
    };

    droppedItems = [];
  });

  it('should remove items older than 600 seconds', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Create items with different ages
    const oldItem = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    oldItem.createdAt = Date.now() - 601000; // 601 seconds ago
    
    const newItem = new DroppedItem(2, new THREE.Vector3(6, 10, 6), mockBlockDefinition);
    newItem.createdAt = Date.now() - 100000; // 100 seconds ago
    
    droppedItems.push(oldItem, newItem);
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // Old item should be removed, new item should remain
    expect(droppedItems.length).toBe(1);
    expect(droppedItems[0]).toBe(newItem);
  });

  it('should keep items younger than 600 seconds', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Create items all younger than despawn time
    const item1 = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    item1.createdAt = Date.now() - 100000; // 100 seconds ago
    
    const item2 = new DroppedItem(2, new THREE.Vector3(6, 10, 6), mockBlockDefinition);
    item2.createdAt = Date.now() - 300000; // 300 seconds ago
    
    const item3 = new DroppedItem(3, new THREE.Vector3(7, 10, 7), mockBlockDefinition);
    item3.createdAt = Date.now() - 599000; // 599 seconds ago (just before despawn)
    
    droppedItems.push(item1, item2, item3);
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // All items should remain
    expect(droppedItems.length).toBe(3);
  });

  it('should remove mesh from scene when despawning', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const oldItem = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    oldItem.createdAt = Date.now() - 601000; // 601 seconds ago
    
    const itemMesh = oldItem.mesh;
    droppedItems.push(oldItem);
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // Verify mesh was removed from world
    expect(mockWorld.removedMeshes).toContain(itemMesh);
  });

  it('should call dispose on despawned items', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const oldItem = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    oldItem.createdAt = Date.now() - 601000; // 601 seconds ago
    
    droppedItems.push(oldItem);
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // Verify item was disposed (mesh should be null)
    expect(oldItem.mesh).toBeNull();
  });

  it('should remove despawned items from tracking array', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const oldItem1 = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    oldItem1.createdAt = Date.now() - 601000;
    
    const oldItem2 = new DroppedItem(2, new THREE.Vector3(6, 10, 6), mockBlockDefinition);
    oldItem2.createdAt = Date.now() - 700000;
    
    const newItem = new DroppedItem(3, new THREE.Vector3(7, 10, 7), mockBlockDefinition);
    newItem.createdAt = Date.now() - 100000;
    
    droppedItems.push(oldItem1, newItem, oldItem2);
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // Only new item should remain
    expect(droppedItems.length).toBe(1);
    expect(droppedItems[0]).toBe(newItem);
  });

  it('should handle empty droppedItems array', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Should not throw with empty array
    expect(() => {
      ItemCollector.checkDespawns(droppedItems, mockWorld);
    }).not.toThrow();
    
    expect(droppedItems.length).toBe(0);
  });

  it('should handle items at exactly 600 seconds', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const item = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    item.createdAt = Date.now() - 600000; // Exactly 600 seconds ago
    
    droppedItems.push(item);
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // Item at exactly 600 seconds should be removed (>= condition)
    expect(droppedItems.length).toBe(0);
  });

  it('should handle multiple old items', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Create 5 old items
    for (let i = 0; i < 5; i++) {
      const item = new DroppedItem(i, new THREE.Vector3(i, 10, i), mockBlockDefinition);
      item.createdAt = Date.now() - (601000 + i * 1000); // All older than 600 seconds
      droppedItems.push(item);
    }
    
    // Check despawns
    ItemCollector.checkDespawns(droppedItems, mockWorld);
    
    // All items should be removed
    expect(droppedItems.length).toBe(0);
    expect(mockWorld.removedMeshes.length).toBe(5);
  });

  it('should not throw when world is null', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const item = new DroppedItem(1, new THREE.Vector3(5, 10, 5), mockBlockDefinition);
    item.createdAt = Date.now() - 601000;
    droppedItems.push(item);
    
    // Should not throw with null world
    expect(() => {
      ItemCollector.checkDespawns(droppedItems, null);
    }).not.toThrow();
  });

  it('should not throw when droppedItems is null', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Should not throw with null droppedItems
    expect(() => {
      ItemCollector.checkDespawns(null, mockWorld);
    }).not.toThrow();
  });
});
