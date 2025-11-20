import { WorldBaseClass } from './base';
import { DataStore } from './world_store';
import settings from './config';

/**
 * Extends world with save/load functionality
 * Stores world data in browser's localStorage
 */
export class StoreWorldBaseClass extends WorldBaseClass {
    /**
     * Data store for chunk data persistence
     */
    dataStore = new DataStore();
    
    /**
     * World name for save/load operations
     */
    name = 'Default World';
    
    /**
     * Reference to player instance (set externally)
     */
    player = null;

    constructor() {
        super();
        
        // Handle load world
        document.removeEventListener('game:menu:load', this.load);
        document.addEventListener('game:menu:load', this.load);

        // Handle reset of the world
        document.removeEventListener('game:menu:save', this.reset);
        document.addEventListener('game:menu:save', this.reset);
    }

    /**
     * Resets the world by clearing all chunks and data
     * Call this before loading a new world to ensure clean state
     */
    reset = () => {
        // Clear all rendered chunks from the scene
        this.disposeChunks();
        
        // Clear the data store (modified blocks)
        if (this.dataStore) {
            this.dataStore.clear();
        }
        
        // Clear dropped items if they exist
        if (this.droppedItems) {
            this.droppedItems.forEach(item => {
                if (item.mesh) {
                    this.remove(item.mesh);
                }
            });
            this.droppedItems = [];
        }
        
        // Reset to default world parameters
        this.params = settings
    }

    /**
     * Loads the world data from browser's localStorage
     * Restores both generation parameters and modified blocks
     * Note: This method maintains backward compatibility with F2 quick load
     * For menu-based loading, use loadFromData() instead
     */
    load = (event) => {
        try {
            if (event.detail.params && event.detail.data) {
                // Reset the world before loading
                this.reset();
                
                // Load world generation parameters (legacy support)
                this.params = event.detail.params;
                this.dataStore.data = event.detail.data;
                this.name = event.detail.name;
                this.restorePlayerState(event.detail.player);
                
                // Regenerate world with loaded data
                this.generate();
            } else {
                console.error(`Wrong world data provided: ${event.detail}`)
            }
        } catch (error) {
            console.error('Failed to load world:', error);
            
        }
    }
    
    /**
     * Gets the current player state for saving
     * @returns {Object} Player state data
     */
    getPlayerState() {
        if (!this.player) {
            return {
                position: { x: 32, y: 32, z: 32 },
                health: 100,
                inventory: {}
            };
        }
        
        return {
            position: {
                x: parseInt(this.player.position.x),
                y: 32,
                z: parseInt(this.player.position.z)
            },
            health: this.player.health,
            inventory: this.player.inventory ? this.player.inventory.toJSON() : {}
        };
    }
    
    /**
     * Restores player state from saved data
     * @param {Object} playerData - Player state data
     */
    restorePlayerState(playerData) {
        if (!this.player) {
            return;
        }
        
        // Restore position
        if (playerData.position) {
            this.player.position.set(
                playerData.position.x,
                playerData.position.y,
                playerData.position.z
            );
        }
        
        // Restore health
        if (typeof playerData.health === 'number') {
            this.player.setHealth(playerData.health);
        }
        
        // Restore inventory
        if (playerData.inventory && this.player.inventory) {
            this.player.inventory.fromJSON(playerData.inventory);
            this.player.inventory.save(); // Persist to localStorage
        }
    }
}