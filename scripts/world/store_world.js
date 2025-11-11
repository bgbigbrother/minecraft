import { WorldBaseClass } from './base';
import { DataStore } from './world_store';

/**
 * Extends world with save/load functionality
 * Stores world data in browser's localStorage
 */
export class StoreWorldBaseClass extends WorldBaseClass {
    /**
     * Data store for chunk data persistence
     */
    dataStore = new DataStore();

    constructor() {
        super();
        
        // Set up keyboard shortcuts for save/load
        document.addEventListener('keydown', (ev) => {
            switch (ev.code) {
              case 'F1':
                this.save(); // Save game
                break;
              case 'F2':
                this.load(); // Load game
                break;
            }
        });
    }

    /**
     * Saves the world data to browser's localStorage
     * Stores both generation parameters and modified block data
     */
    save() {
        // Save world generation parameters
        localStorage.setItem('minecraft_params', JSON.stringify(this.params));
        
        // Save modified chunk data (player edits)
        localStorage.setItem('minecraft_data', JSON.stringify(this.dataStore.data));
        
        // Show save confirmation message
        document.getElementById('status').innerHTML = 'GAME SAVED';
        setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
    }

    /**
     * Loads the world data from browser's localStorage
     * Restores both generation parameters and modified blocks
     */
    load() {
        // Load world generation parameters
        this.params = JSON.parse(localStorage.getItem('minecraft_params'));
        
        // Load modified chunk data
        this.dataStore.data = JSON.parse(localStorage.getItem('minecraft_data'));
        
        // Show load confirmation message
        document.getElementById('status').innerHTML = 'GAME LOADED';
        setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
        
        // Regenerate world with loaded data
        this.generate();
    }
}