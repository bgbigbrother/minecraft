import { WorldBaseClass } from './base';
import { DataStore } from './world_store';
// import { saveWorld } from '../../src/menu/utils/storage.js';

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
        
        // Set up keyboard shortcuts for save/load
        document.removeEventListener('game:menu:load', this.load);
        document.addEventListener('game:menu:load', this.load);
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
                // Load world generation parameters (legacy support)
                this.params = event.detail.params;
                this.dataStore.data = event.detail.data;
                this.name = event.detail.name;
                
                // Show load confirmation message
                document.getElementById('status').innerHTML = 'GAME LOADED';
                setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
                
                // Regenerate world with loaded data
                this.generate();
            } else {
                document.getElementById('status').innerHTML = 'NO SAVE DATA FOUND';
                setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
            }
        } catch (error) {
            console.error('Failed to load world:', error);
            document.getElementById('status').innerHTML = 'LOAD FAILED';
            setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
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
                x: this.player.position.x,
                y: this.player.position.y,
                z: this.player.position.z
            },
            health: this.player.health,
            inventory: this.player.inventory ? this.player.inventory.toJSON() : {}
        };
    }
    
    /**
     * Loads world from provided world data (used by menu system)
     * @param {Object} worldData - World data object from storage
     */
    loadFromData(worldData) {
        try {
            // Restore world generation parameters
            if (worldData.params) {
                this.params = worldData.params;
            }
            
            // Restore modified chunk data
            if (worldData.data) {
                this.dataStore.data = worldData.data;
            }
            
            // Restore player state
            if (worldData.player && this.player) {
                this.restorePlayerState(worldData.player);
            }
            
            // Regenerate world with loaded data
            this.generate();
            
            // Show load confirmation message
            document.getElementById('status').innerHTML = 'WORLD LOADED';
            setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
        } catch (error) {
            console.error('Failed to load world from data:', error);
            document.getElementById('status').innerHTML = 'LOAD FAILED';
            setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
        }
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