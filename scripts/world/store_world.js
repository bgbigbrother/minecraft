import { WorldBaseClass } from './base';
import { DataStore } from './world_store';

export class StoreWorldBaseClass extends WorldBaseClass {
    dataStore = new DataStore();

    constructor() {
        super();
        
        document.addEventListener('keydown', (ev) => {
            switch (ev.code) {
              case 'F1':
                this.save();
                break;
              case 'F2':
                this.load();
                break;
            }
        });
    }

    /**
     * Saves the world data to local storage
     */
    save() {
        localStorage.setItem('minecraft_params', JSON.stringify(this.params));
        localStorage.setItem('minecraft_data', JSON.stringify(this.dataStore.data));
        document.getElementById('status').innerHTML = 'GAME SAVED';
        setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
    }

    /**
     * Loads the game from disk
     */
    load() {
        this.params = JSON.parse(localStorage.getItem('minecraft_params'));
        this.dataStore.data = JSON.parse(localStorage.getItem('minecraft_data'));
        document.getElementById('status').innerHTML = 'GAME LOADED';
        setTimeout(() => document.getElementById('status').innerHTML = '', 3000);
        this.generate();
    }
}