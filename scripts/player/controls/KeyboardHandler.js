import { blocks } from '../../textures/blocks.js';
import { ItemThrower } from '../../inventory/ItemThrower.js';

/**
 * Handles all keyboard input events for player controls
 * Manages WASD movement, toolbar selection, and special actions
 */
export class KeyboardHandler {
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
        console.log(`[KeyboardHandler] ${action} at ${timestamp}`);
        
        // Log each detail on a separate line with arrow prefix
        for (const [key, value] of Object.entries(details)) {
            console.log(`  → ${key}: ${value}`);
        }
    }

    /**
     * Event handler for key press
     * Handles movement, block selection, and special actions
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleKeyDown(event) {
        try {
            // Log keydown event
            this.logDebug(`KeyDown: ${event.key} (${event.code})`, {
                'Key code': event.code,
                'Key name': event.key,
                'Repeat': event.repeat
            });

            // Lock pointer on any key press if not already locked
            if (!this.player.controls.isLocked) {
                this.player.debugCamera = false;
                this.player.controls.lock();
            }

            switch (event.code) {
                // Number keys 0-9: Select block type from hotbar
                case 'Digit0':
                case 'Digit1':
                case 'Digit2':
                case 'Digit3':
                case 'Digit4':
                case 'Digit5':
                case 'Digit6':
                case 'Digit7':
                case 'Digit8':
                case 'Digit9':
                    this.handleToolbarSelection(Number(event.key));
                    break;
                
                // WASD movement keys
                case 'KeyW':
                    this.handleWKeyPress();
                    break;
                case 'KeyA':
                    this.player.input.x = -this.player.maxSpeed; // Move left
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                case 'KeyS':
                    this.player.input.z = -this.player.maxSpeed; // Move backward
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                case 'KeyD':
                    this.player.input.x = this.player.maxSpeed; // Move right
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                
                // Special action keys
                case 'KeyR':
                    this.handleRespawn(event);
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.handleShiftKey();
                    break;
                case 'Space':
                    this.handleSpaceKey();
                    break;
                case 'F10':
                    this.handleDebugCamera();
                    break;
                case 'KeyE':
                    this.handleThrowItem(event);
                    break;
            }
        } catch (error) {
            console.error('Error in keyboard handler (keydown):', error);
        }
    }

    /**
     * Event handler for key release
     * Stops movement when WASD keys are released
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleKeyUp(event) {
        try {
            // Log keyup event
            this.logDebug(`KeyUp: ${event.key} (${event.code})`, {
                'Key code': event.code,
                'Key name': event.key
            });

            switch (event.code) {
                case 'KeyW':
                    this.player.input.z = 0; // Stop forward movement
                    this.player.sprintMode = false; // Deactivate sprint mode when W is released
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    this.logDebug('Sprint mode', {
                        'Status': 'DEACTIVATED'
                    });
                    break;
                case 'KeyA':
                    this.player.input.x = 0; // Stop left movement
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                case 'KeyS':
                    this.player.input.z = 0; // Stop backward movement
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                case 'KeyD':
                    this.player.input.x = 0; // Stop right movement
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                case 'ShiftLeft':
                case 'ShiftRight':
                    this.player.input.y = 0; // Stop vertical movement (swimming)
                    this.player.sprinting = false; // Stop sprinting
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
                case 'Space':
                    this.player.input.y = 0; // Stop vertical movement (swimming)
                    this.logDebug('Movement state change', {
                        'input.x': this.player.input.x,
                        'input.z': this.player.input.z,
                        'input.y': this.player.input.y
                    });
                    break;
            }
        } catch (error) {
            console.error('Error in keyboard handler (keyup):', error);
        }
    }

    /**
     * Handles W key press with double-tap detection for sprint mode
     */
    handleWKeyPress() {
        const currentTime = performance.now();
        const timeSinceLastPress = currentTime - this.player.lastWKeyPress;
        
        if (timeSinceLastPress < this.player.doubleTapWindow && timeSinceLastPress > 0) {
            // Double-tap detected - activate sprint mode
            this.player.sprintMode = true;
            this.logDebug('Sprint mode', {
                'Status': 'ACTIVATED',
                'Time since last press': `${timeSinceLastPress.toFixed(0)}ms`,
                'Double-tap window': `${this.player.doubleTapWindow}ms`
            });
        }
        
        this.player.lastWKeyPress = currentTime;
        this.player.input.z = this.player.maxSpeed; // Move forward
        
        this.logDebug('Movement state change', {
            'input.x': this.player.input.x,
            'input.z': this.player.input.z,
            'input.y': this.player.input.y
        });
    }

    /**
     * Handles toolbar slot selection (number keys 0-9)
     * @param {number} slotNumber - Slot number (0-9)
     */
    handleToolbarSelection(slotNumber) {
        const previousSlot = this.player.getActiveSlot();
        
        // Use ToolbarUI to handle slot selection if available
        if (this.player.world && this.player.world.toolbarUI) {
            // ToolbarUI.setSelectedSlot handles all selection logic including:
            // - Removing selection from current slot
            // - Adding selection to new slot
            // - Updating player's activeBlockId
            // - Showing/hiding tool based on selection
            this.player.world.toolbarUI.setSelectedSlot(slotNumber);
        } else {
            // Fallback to legacy behavior if ToolbarUI not available
            this.handleLegacyToolbarSelection(slotNumber);
        }
        
        this.logDebug('Toolbar slot selection', {
            'Previous slot': previousSlot,
            'New slot': slotNumber,
            'Active block ID': this.player.activeBlockId
        });
    }

    /**
     * Fallback toolbar selection for legacy support
     * @param {number} slotNumber - Slot number (0-9)
     */
    handleLegacyToolbarSelection(slotNumber) {
        // Remove selection from current toolbar slot
        const currentSlot = this.player.getActiveSlot();
        document.getElementById(`toolbar-${currentSlot}`)?.classList.remove('selected');

        // Get the block ID from the toolbar slot contents
        if (slotNumber === 0) {
            // Slot 0 is always the pickaxe (empty block ID)
            this.player.activeBlockId = blocks.empty.id;
            this.player.tool.container.visible = true;
            document.getElementById('toolbar-0')?.classList.add('selected');
        } else {
            // Get the block ID from the toolbar UI slot contents
            const blockIdInSlot = this.player.getBlockIdFromSlot(slotNumber);
            if (blockIdInSlot !== null) {
                this.player.activeBlockId = blockIdInSlot;
                this.player.tool.container.visible = false;
                document.getElementById(`toolbar-${slotNumber}`)?.classList.add('selected');
            } else {
                // Slot is empty, switch to pickaxe
                this.player.activeBlockId = blocks.empty.id;
                this.player.tool.container.visible = true;
                document.getElementById('toolbar-0')?.classList.add('selected');
            }
        }
    }

    /**
     * Handles respawn action (R key)
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleRespawn(event) {
        if (event.repeat) return; // Prevent repeat triggers
        this.player.position.y = 32; // Teleport to safe height
        this.player.velocity.set(0, 0, 0); // Reset velocity
        
        this.logDebug('Special action: Respawn', {
            'New position Y': 32,
            'Velocity reset': 'true'
        });
    }

    /**
     * Handles Shift key for sprint or swim down
     */
    handleShiftKey() {
        if (this.player.inWater) {
            this.player.input.y = -1; // Swim down
            this.logDebug('Special action: Swim down', {
                'input.y': this.player.input.y,
                'In water': true
            });
        } else {
            this.player.sprinting = true; // Sprint
            this.logDebug('Special action: Sprint', {
                'Sprinting': true,
                'In water': false
            });
        }
    }

    /**
     * Handles Space key for jump or swim up
     */
    handleSpaceKey() {
        if (this.player.inWater) {
            this.player.input.y = 1; // Swim up
            this.logDebug('Special action: Swim up', {
                'input.y': this.player.input.y,
                'In water': true
            });
        } else if (this.player.onGround) {
            this.player.velocity.y += this.player.jumpSpeed; // Jump
            this.logDebug('Special action: Jump', {
                'velocity.y': this.player.velocity.y,
                'On ground': true
            });
        }
    }

    /**
     * Handles debug camera toggle (F10 key)
     */
    handleDebugCamera() {
        this.player.debugCamera = true;
        this.player.controls.unlock();
        
        this.logDebug('Special action: Debug camera toggle', {
            'Debug camera': true,
            'Pointer lock': 'unlocked'
        });
    }

    /**
     * Handles item throwing (E key)
     * @param {KeyboardEvent} event - Keyboard event object
     */
    handleThrowItem(event) {
        // Only handle when pointer is locked (during gameplay)
        if (this.player.controls.isLocked) {
            // Prevent default browser behavior for 'E' key
            event.preventDefault();
            
            // Throw the currently selected item
            if (this.player.world && this.player.world.toolbarUI) {
                ItemThrower.throwItem(this.player, this.player.world, this.player.world.toolbarUI);
                
                this.logDebug('Special action: Throw item', {
                    'Active slot': this.player.getActiveSlot(),
                    'Active block ID': this.player.activeBlockId,
                    'Pointer locked': true
                });
            }
        }
    }
}
