import { Vector3 } from 'three';
import { blocks } from '../textures/blocks';
import { Player } from '../player/player';
import { BasePhysics } from './base';

/**
 * Physics system for player collision detection and response
 * Uses broad-phase and narrow-phase collision detection
 * Implements cylinder-box collision for player-block interactions
 */
export class Physics extends BasePhysics {
  constructor(scene) {
    super(scene);
  }

  /**
   * Advances the physics simulation by delta time
   * Uses fixed timestep for consistent physics regardless of frame rate
   * @param {number} dt - Delta time in seconds since last update
   * @param {Player} player - The player object
   * @param {World} world - The world object
   */
  update(dt, player, world) {
    // Accumulate time for fixed timestep simulation
    this.accumulator += dt;
    
    // Run physics updates in fixed timesteps
    while (this.accumulator >= this.stepSize) {
      // Apply gravity (disabled when in water)
      if (!player.inWater) {
        player.velocity.y -= this.gravity * this.stepSize;
      }
      
      // Apply player input (movement)
      player.applyInputs(this.stepSize);
      
      // Check and resolve collisions
      this.detectCollisions(player, world);
      
      // Consume one timestep from accumulator
      this.accumulator -= this.stepSize;
    }
  }

  /**
   * Main collision detection pipeline
   * 1. Broad phase: Find potential collision candidates
   * 2. Narrow phase: Determine actual collisions
   * 3. Resolve: Adjust player position and velocity
   * @param {Player} player - The player object
   * @param {World} world - The world object
   */
  detectCollisions(player, world) {
    player.onGround = false; // Reset ground state (will be set if collision below)
    this.helpers.clear(); // Clear debug visualization from previous frame

    // Find all blocks that might be colliding with player
    const candidates = this.broadPhase(player, world);
    
    // Determine which candidates are actually colliding
    const collisions = this.narrowPhase(candidates, player);

    // Resolve all detected collisions
    if (collisions.length > 0) {
      this.resolveCollisions(collisions, player);
    }
  }

  /**
   * Broad phase collision detection
   * Quickly finds all solid blocks near the player using AABB (axis-aligned bounding box)
   * This is a coarse filter - not all candidates will actually be colliding
   * @param {Player} player - The player object
   * @param {World} world - The world object
   * @returns {Array<{x: number, y: number, z: number}>} Array of block positions
   */
  broadPhase(player, world) {
    const candidates = [];

    // Calculate the bounding box around the player's collision cylinder
    // This gives us the range of blocks that could possibly be colliding
    const minX = Math.floor(player.position.x - player.radius);
    const maxX = Math.ceil(player.position.x + player.radius);
    const minY = Math.floor(player.position.y - player.height);
    const maxY = Math.ceil(player.position.y);
    const minZ = Math.floor(player.position.z - player.radius);
    const maxZ = Math.ceil(player.position.z + player.radius);

    // Check all blocks within the bounding box
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const blockId = world.getBlock(x, y, z)?.id;
          
          // Only consider solid blocks (not air/empty)
          if (blockId && blockId !== blocks.empty.id) {
            const block = { x, y, z };
            candidates.push(block);
            this.addCollisionHelper(block); // Add debug visualization
          }
        }
      }
    }

    //console.log(`Broadphase Candidates: ${candidates.length}`);

    return candidates;
  }

  /**
   * Narrows down the blocks found in the broad-phase to the set
   * of blocks the player is actually colliding with
   * @param {{ id: number, instanceId: number }[]} candidates 
   * @returns 
   */
  narrowPhase(candidates, player) {
    const collisions = [];

    for (const block of candidates) {
      // Get the point on the block that is closest to the center of the player's bounding cylinder
      const closestPoint = {
        x: Math.max(block.x - 0.5, Math.min(player.position.x, block.x + 0.5)),
        y: Math.max(block.y - 0.5, Math.min(player.position.y - (player.height / 2), block.y + 0.5)),
        z: Math.max(block.z - 0.5, Math.min(player.position.z, block.z + 0.5))
      };

      // Get distance along each axis between closest point and the center
      // of the player's bounding cylinder
      const dx = closestPoint.x - player.position.x;
      const dy = closestPoint.y - (player.position.y - (player.height / 2));
      const dz = closestPoint.z - player.position.z;

      if (this.pointInPlayerBoundingCylinder(closestPoint, player)) {
        // Compute the overlap between the point and the player's bounding
        // cylinder along the y-axis and in the xz-plane
        const overlapY = (player.height / 2) - Math.abs(dy);
        const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

        // Compute the normal of the collision (pointing away from the contact point)
        // and the overlap between the point and the player's bounding cylinder
        let normal, overlap;
        if (overlapY < overlapXZ) {
          normal = new Vector3(0, -Math.sign(dy), 0);
          overlap = overlapY;
          player.onGround = true;
        } else {
          normal = new Vector3(-dx, 0, -dz).normalize();
          overlap = overlapXZ;
        }

        collisions.push({
          block,
          contactPoint: closestPoint,
          normal,
          overlap
        });

        this.addContactPointerHelper(closestPoint);
      }
    }

    //console.log(`Narrowphase Collisions: ${collisions.length}`);

    return collisions;
  }

  /**
   * Resolves each of the collisions found in the narrow-phase
   * @param {*} collisions 
   * @param {Player} player
   */
  resolveCollisions(collisions, player) {
    // Resolve the collisions in order of the smallest overlap to the largest
    collisions.sort((a, b) => {
      return a.overlap < b.overlap;
    });

    for (const collision of collisions) {
      // We need to re-check if the contact point is inside the player bounding
      // cylinder for each collision since the player position is updated after
      // each collision is resolved
      if (!this.pointInPlayerBoundingCylinder(collision.contactPoint, player)) continue;

      // Adjust position of player so the block and player are no longer overlapping
      let deltaPosition = collision.normal.clone();
      deltaPosition.multiplyScalar(collision.overlap);
      player.position.add(deltaPosition);

      // Get the magnitude of the player's velocity along the collision normal
      let magnitude = player.worldVelocity.dot(collision.normal);
      // Remove that part of the velocity from the player's velocity
      let velocityAdjustment = collision.normal.clone().multiplyScalar(magnitude);

      // Apply the velocity to the player
      player.applyWorldDeltaVelocity(velocityAdjustment.negate());
    }
  }

  /**
   * Returns true if the point 'p' is inside the player's bounding cylinder
   * @param {{ x: number, y: number, z: number }} p 
   * @param {Player} player 
   * @returns {boolean}
   */
  pointInPlayerBoundingCylinder(p, player) {
    const dx = p.x - player.position.x;
    const dy = p.y - (player.position.y - (player.height / 2));
    const dz = p.z - player.position.z;
    const r_sq = dx * dx + dz * dz;

    // Check if contact point is inside the player's bounding cylinder
    return (Math.abs(dy) < player.height / 2) && (r_sq < player.radius * player.radius);
  }

  /**
   * Detects if the player is currently in water
   * Checks if player's bounding cylinder intersects with any water blocks
   * Uses broad-phase optimization to check only nearby blocks
   * @param {Player} player - The player object
   * @param {World} world - The world object
   * @returns {boolean} True if any part of player is in water
   */
  isPlayerInWater(player, world) {
    // Calculate the bounding box around the player's collision cylinder
    // This gives us the range of blocks that could possibly contain water
    const minX = Math.floor(player.position.x - player.radius);
    const maxX = Math.ceil(player.position.x + player.radius);
    const minY = Math.floor(player.position.y - player.height);
    const maxY = Math.ceil(player.position.y);
    const minZ = Math.floor(player.position.z - player.radius);
    const maxZ = Math.ceil(player.position.z + player.radius);

    // Check all blocks within the bounding box
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const block = world.getBlock(x, y, z);
          
          // Check if this block is water
          if (block?.id === blocks.water.id) {
            return true;
          }
        }
      }
    }

    return false;
  }
}