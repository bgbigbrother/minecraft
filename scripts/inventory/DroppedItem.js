import * as THREE from 'three';

/**
 * DroppedItem represents a collectible block item in the 3D world.
 * Created when a block is broken, it appears as a miniature version of the block.
 */
export class DroppedItem {
  // Constants
  static ROTATION_SPEED = 2; // Radians per second
  static GRAVITY = 9.8; // Blocks per second squared
  static DESPAWN_TIME = 600; // Seconds until item despawns (10 minutes)
  
  /**
   * @param {number} blockId - The ID of the block type
   * @param {THREE.Vector3} position - World position where the item should spawn
   * @param {object} blockDefinition - Block definition containing material and other properties
   * @param {object} world - Reference to the world for collision detection
   */
  constructor(blockId, position, blockDefinition, world) {
    // Validate inputs
    if (typeof blockId !== 'number' || isNaN(blockId)) {
      console.warn(`Invalid blockId provided to DroppedItem: ${blockId}`);
      this.blockId = 0; // Default to empty/air
    } else {
      this.blockId = blockId;
    }
    
    if (!position || !position.clone) {
      console.warn('Invalid position provided to DroppedItem, using default (0,0,0)');
      this.position = new THREE.Vector3(0, 0, 0);
    } else {
      this.position = position.clone();
    }
    
    // Initialize velocity for physics
    this.velocity = new THREE.Vector3(0, 0, 0);
    
    // Store world reference for collision detection
    this.world = world;
    
    // Track if item is on ground (optimization)
    this.onGround = false;
    
    // Store creation timestamp for despawn tracking
    this.createdAt = Date.now();
    
    try {
      // Create a small cube mesh (0.1 scale of normal block)
      const geometry = new THREE.BoxGeometry(3, 3, 3);
      
      // Validate block definition has material
      if (!blockDefinition || !blockDefinition.material) {
        console.warn(`Block definition missing material for blockId ${blockId}, using default material`);
        // Create a basic material as fallback
        const fallbackMaterial = new THREE.MeshLambertMaterial({ color: 0xff00ff });
        this.mesh = new THREE.Mesh(geometry, fallbackMaterial);
      } else {
        // Use the same material as the original block
        this.mesh = new THREE.Mesh(geometry, blockDefinition.material);
      }
      
      // Scale down to 0.1 of normal size
      this.mesh.scale.set(0.1, 0.1, 0.1);
      
      // Position the mesh in the world
      this.mesh.position.copy(this.position);
    } catch (e) {
      console.warn('Error creating DroppedItem mesh:', e.message || e);
      // Create minimal mesh as fallback
      this.mesh = null;
    }
  }

  /**
   * Update method for animations and physics
   * @param {number} dt - Delta time since last frame in seconds
   */
  update(dt) {
    if (!this.mesh) return;
    
    // Rotate the item on Y-axis for visual appeal
    this.mesh.rotation.y += DroppedItem.ROTATION_SPEED * dt;
    
    // Apply gravity if not on ground
    if (!this.onGround) {
      // Apply downward acceleration
      this.velocity.y -= DroppedItem.GRAVITY * dt;
      
      // Update position based on velocity
      this.position.y += this.velocity.y * dt;
      
      // World boundary protection - prevent falling into void
      if (this.position.y < 0) {
        this.position.y = 0.5;
        this.velocity.y = 0;
        this.onGround = true;
      }
      
      // Check for collision with solid blocks
      if (this.checkCollision()) {
        // Snap to block surface
        // The block we detected is at floor(position.y - 0.1)
        // So we should sit at that block's y + 1.05
        const blockY = Math.floor(this.position.y - 0.1);
        this.position.y = blockY + 1.05;
        
        // Stop falling
        this.velocity.y = 0;
        
        // Mark as on ground for optimization
        this.onGround = true;
      }
      
      // Update mesh position to match (do this after all position updates)
      this.mesh.position.copy(this.position);
    }
  }

  /**
   * Check if there's a solid block below the item
   * @returns {boolean} True if solid block exists below, false otherwise
   */
  checkCollision() {
    // Return false if no world reference
    if (!this.world || !this.world.getBlock) {
      return false;
    }
    
    try {
      // Calculate block coordinates below item
      // A block at y=N occupies space from y=N to y=N+1
      // Items should rest at y=N+1.05 (just above the block)
      // We need to check the block directly below the item
      // If item is at y=10.5, it's above block y=9 (which goes from 9-10)
      // So we check floor(item.y - 0.1) to get the block below
      const blockX = Math.floor(this.position.x);
      const blockY = Math.floor(this.position.y - 0.1);
      const blockZ = Math.floor(this.position.z);
      
      // Check if solid block exists at this position
      const block = this.world.getBlock(blockX, blockY, blockZ);
      
      // Return true if block exists and is not empty (blockId 0 is air/empty)
      return block !== null && block !== undefined && block !== 0;
    } catch (e) {
      console.warn('Error checking collision for DroppedItem:', e.message || e);
      return false;
    }
  }

  /**
   * Get the age of the item in seconds
   * @returns {number} Age in seconds since creation
   */
  getAge() {
    return (Date.now() - this.createdAt) / 1000;
  }

  /**
   * Check if the item should despawn
   * @returns {boolean} True if item has existed longer than DESPAWN_TIME
   */
  shouldDespawn() {
    return this.getAge() >= DroppedItem.DESPAWN_TIME;
  }

  /**
   * Clean up Three.js resources to prevent memory leaks
   */
  dispose() {
    try {
      if (this.mesh) {
        // Dispose geometry
        if (this.mesh.geometry) {
          this.mesh.geometry.dispose();
        }
        
        // Note: We don't dispose the material because it's shared with the block definition
        // The material is managed by the blocks system
        
        // Clear references
        this.mesh = null;
      }
    } catch (e) {
      console.warn('Error disposing DroppedItem:', e.message || e);
      // Ensure mesh reference is cleared even if disposal fails
      this.mesh = null;
    }
  }
}
