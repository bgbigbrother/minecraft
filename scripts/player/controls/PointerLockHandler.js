/**
 * PointerLockHandler
 * Manages pointer lock state and related UI transitions
 * React components listen directly to browser pointer lock events
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
     * React components listen directly to browser pointer lock events
     */
    handleLock() {
        this.logDebug('Lock', {
            'Pointer locked': true
        });
    }

    /**
     * Called when pointer lock is released (ESC pressed)
     * React components listen directly to browser pointer lock events
     */
    handleUnlock() {
        this.logDebug('Unlock', {
            'Pointer locked': false,
            'Debug camera active': this.player.debugCamera
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
