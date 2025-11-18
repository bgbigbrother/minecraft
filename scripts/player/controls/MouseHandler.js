import { blocks } from '../../textures/blocks.js';

/**
 * MouseHandler
 * Handles all mouse input events including clicks and wheel scrolling
 * Manages block placement, destruction, and toolbar navigation
 */
export class MouseHandler {
    /**
     * Creates a new MouseHandler
     * @param {Object} player - Reference to the player object
     */
    constructor(player) {
        this.player = player;
    }

    /**
     * Event handler for mouse button clicks
     * Handles left-click (break/interact) and right-click (place block)
     * @param {MouseEvent} event - Mouse event object
     */
    handleMouseDown(event) {
        try {
            // Only process clicks when pointer is locked (in first-person mode)
            if (!this.player.controls.isLocked) {
                return;
            }

            // Check if player is looking at a block
            if (!this.player.selectedCoords) {
                return;
            }

            // Determine action based on mouse button
            if (event.button === 0) {
                // Left click
                this.handleLeftClick();
            } else if (event.button === 2) {
                // Right click
                this.handleRightClick();
            }
        } catch (error) {
            console.error('Error in mouse handler (mousedown):', error);
        }
    }

    /**
     * Handles left-click functionality
     * Breaks blocks with pickaxe or triggers interactions with special blocks
     */
    handleLeftClick() {
        // Check if active block is pickaxe (empty block ID)
        if (this.player.activeBlockId === blocks.empty.id) {
            // Pickaxe selected - remove block at selected coordinates
            if (this.player.world) {
                this.player.world.removeBlock(
                    this.player.selectedCoords.x,
                    this.player.selectedCoords.y,
                    this.player.selectedCoords.z
                );
            }
        } else if (this.player.activeBlockId === blocks.chest?.id) {
            // Chest selected - trigger chest interaction
            // Note: Chest interaction logic would be implemented here
            // For now, we just trigger the tool animation
        } else {
            // Other blocks - could be used for future interactions
        }

        // Trigger tool swing animation
        this.triggerToolAnimation();
    }

    /**
     * Handles right-click block placement (NEW FEATURE)
     * Places the currently selected block at the target coordinates
     */
    handleRightClick() {
        // Don't place blocks if pickaxe is selected
        if (this.player.activeBlockId === blocks.empty.id) {
            return;
        }

        // Place block of selected type at selected coordinates
        if (this.player.world) {
            this.player.world.addBlock(
                this.player.selectedCoords.x,
                this.player.selectedCoords.y,
                this.player.selectedCoords.z,
                this.player.activeBlockId
            );
        }

        // Trigger tool swing animation
        this.triggerToolAnimation();
    }

    /**
     * Event handler for mouse wheel scrolling
     * Navigates through toolbar slots with wrapping
     * @param {WheelEvent} event - Wheel event object
     */
    handleMouseWheel(event) {
        try {
            // Only process wheel events when pointer is locked
            if (!this.player.controls.isLocked) {
                return;
            }

            // Prevent default scroll behavior
            event.preventDefault();

            // Get current slot
            const currentSlot = this.player.getActiveSlot();

            // Determine scroll direction (negative = up, positive = down)
            const direction = event.deltaY < 0 ? 1 : -1;

            // Calculate next slot with wrapping
            const nextSlot = this.getNextSlot(currentSlot, direction);

            // Update toolbar selection
            if (this.player.world && this.player.world.toolbarUI) {
                this.player.world.toolbarUI.setSelectedSlot(nextSlot);
            }
        } catch (error) {
            console.error('Error in mouse handler (wheel):', error);
        }
    }

    /**
     * Triggers the tool swing animation
     * Starts animation and sets timeout to stop after 1.5 swing cycles
     */
    triggerToolAnimation() {
        if (!this.player.tool.animate) {
            this.player.tool.animate = true;
            this.player.tool.animationStart = performance.now();

            // Clear any existing animation timeout
            clearTimeout(this.player.tool.animation);

            // Stop animation after 1.5 swing cycles
            this.player.tool.animation = setTimeout(() => {
                this.player.tool.animate = false;
            }, 3 * Math.PI / this.player.tool.animationSpeed);
        }
    }

    /**
     * Calculates the next toolbar slot with wrapping at boundaries
     * @param {number} currentSlot - Current slot number (0-8)
     * @param {number} direction - Direction to move (1 = next, -1 = previous)
     * @returns {number} Next slot number with wrapping (0-8)
     */
    getNextSlot(currentSlot, direction) {
        let nextSlot = currentSlot + direction;

        // Wrap around at boundaries
        if (nextSlot > 8) {
            nextSlot = 0;
        } else if (nextSlot < 0) {
            nextSlot = 8;
        }

        return nextSlot;
    }
}
