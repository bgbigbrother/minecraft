import { Vector3 } from 'three';

/**
 * GameOverSystem class
 * Manages player death and respawn mechanics
 * Monitors player health, triggers death events, handles item dropping, and resets player state
 */
export class GameOverSystem {
    /**
     * Creates a new GameOverSystem instance
     * @param {Player} player - Reference to the player instance
     * @param {World} world - Reference to the world instance
     */
    constructor(player, world) {
        this.player = player;
        this.world = world;
        
        // Spawn position where player respawns after death
        this.spawnPosition = new Vector3(32, 32, 32);
        
        // Flag to prevent multiple death triggers for a single death event
        this.isDead = false;
    }

    /**
     * Updates the game over system each frame
     * Monitors player health and triggers death sequence when health reaches zero
     * @param {number} dt - Delta time in seconds since last frame
     */
    update(dt) {
        // Check for death condition: health <= 0 and not already processing death
        if (this.player.health <= 0 && !this.isDead) {
            this.handleDeath();
        }
    }

    /**
     * Handles the complete death sequence
     * Orchestrates item dropping, player state reset, and UI updates
     */
    handleDeath() {
        // Set flag to prevent multiple death triggers
        this.isDead = true;
        
        // Store death location for item dropping
        const deathLocation = this.player.position.clone();
        
        // Drop all inventory items at death location
        this.dropAllItems(deathLocation);
        
        // Reset player state (position, health, inventory, etc.)
        this.resetPlayerState();
        
        // Unlock controls and show initial menu
        this.player.controls.unlock();
        document.getElementById('overlay').style.visibility = 'visible';
        
        // Reset flag to allow future deaths
        this.isDead = false;
    }

    /**
     * Drops all items from player inventory at the death location
     * @param {Vector3} deathLocation - World coordinates where player died
     */
    dropAllItems(deathLocation) {
        // Iterate through all items in the player's inventory
        for (const [blockId, quantity] of this.player.inventory.items.entries()) {
            // Create the specified quantity of dropped items for this block type
            for (let i = 0; i < quantity; i++) {
                // Apply random offset to prevent items from stacking
                // ±0.3 blocks in X and Z coordinates
                const offsetX = (Math.random() - 0.5) * 0.6; // Range: -0.3 to +0.3
                const offsetZ = (Math.random() - 0.5) * 0.6; // Range: -0.3 to +0.3
                
                // Create position with offset
                const itemPosition = new Vector3(
                    deathLocation.x + offsetX,
                    deathLocation.y - 1,
                    deathLocation.z + offsetZ
                );
                
                // Spawn the dropped item in the world
                this.world.spawnDroppedItem(blockId, itemPosition);
            }
        }
    }

    /**
     * Resets player state after death
     * Clears inventory, resets position, velocity, health, and fall damage tracking
     */
    resetPlayerState() {
        // Clear inventory and persist empty state
        this.player.inventory.clear();
        this.player.inventory.save();
        
        // Reset position to spawn location
        this.player.position.copy(this.spawnPosition);
        
        // Reset velocity to zero
        this.player.velocity.set(0, 0, 0);
        
        // Restore health to maximum
        this.player.setHealth(this.player.maxHealth);
        
        // Reset fall damage tracking
        this.player.initializeFallDamage();
    }
}
