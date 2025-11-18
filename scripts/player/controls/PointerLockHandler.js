/**
 * PointerLockHandler
 * Manages pointer lock state and related UI transitions
 * Handles showing/hiding the instruction overlay based on lock state
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
     * Called when pointer lock is activated (game starts)
     * Hides the instruction overlay
     */
    handleLock() {
        const overlay = document.getElementById('overlay');
        if (overlay) {
            overlay.style.visibility = 'hidden';
        }
    }

    /**
     * Called when pointer lock is released (ESC pressed)
     * Shows the instruction overlay unless in debug camera mode
     */
    handleUnlock() {
        // Only show overlay if not in debug camera mode
        if (!this.player.debugCamera) {
            const overlay = document.getElementById('overlay');
            if (overlay) {
                overlay.style.visibility = 'visible';
            }
        }
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
