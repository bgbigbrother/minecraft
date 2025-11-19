import eventBus from '../../../src/menu/utils/eventBus.js';

/**
 * PointerLockHandler
 * Manages pointer lock state and related UI transitions
 * Emits events for menu system to handle overlay visibility
 */
export class PointerLockHandler {
    /**
     * Creates a new PointerLockHandler
     * @param {Object} player - Reference to the player object
     */
    constructor(player) {
        this.player = player;
    }

    /**
     * Logs debug information if debug mode is enabled
     * @param {string} action - The action being performed
     * @param {Object} details - Additional details to log
     */
    logDebug(action, details) {
        if (!this.player.debugControls) {
            return;
        }

        const timestamp = performance.now().toFixed(0);
        console.log(`[PointerLockHandler] ${action} at ${timestamp}`);
        
        // Log each detail on a separate line with arrow prefix
        for (const [key, value] of Object.entries(details)) {
            console.log(`  → ${key}: ${value}`);
        }
    }

    /**
     * Called when pointer lock is activated (game starts)
     * Emits event for menu system to handle overlay visibility
     */
    handleLock() {
        // Emit event for menu system to handle overlay visibility
        eventBus.emit('menu:pointerlock:change:state', { locked: true });
        
        this.logDebug('Lock', {
            'Pointer locked': true,
            'Event emitted': 'menu:pointerlock:change:state'
        });
    }

    /**
     * Called when pointer lock is released (ESC pressed)
     * Emits event for menu system to handle overlay visibility
     */
    handleUnlock() {
        // Emit event for menu system to handle overlay visibility
        // Menu system will decide whether to show overlay based on game state
        eventBus.emit('menu:pointerlock:change:state', { locked: false });
        
        this.logDebug('Unlock', {
            'Pointer locked': false,
            'Debug camera active': this.player.debugCamera,
            'Event emitted': 'menu:pointerlock:change:state'
        });
    }

    /**
     * Programmatically lock the pointer
     */
    lock() {
        if (this.player.controls) {
            this.player.controls.lock();
        }
    }

    /**
     * Programmatically unlock the pointer
     */
    unlock() {
        if (this.player.controls) {
            this.player.controls.unlock();
        }
    }

    /**
     * Check if pointer is currently locked
     * @returns {boolean} True if pointer is locked
     */
    isLocked() {
        return this.player.controls ? this.player.controls.isLocked : false;
    }
}
