import { PlayerBase } from './base';
import { blocks } from '../textures/blocks.js';

/**
 * Extends player with keyboard and mouse input handling
 * Manages WASD movement, block selection, and tool switching
 */
export class ControllsPlayerBase extends PlayerBase {
    constructor() {
        super();

        // Sprint mode tracking
        this.lastWKeyPress = 0; // Timestamp of last W key press
        this.doubleTapWindow = 300; // Time window for double-tap detection (ms)
        this.sprintMode = false; // Whether sprint mode is active

        // Set up pointer lock event listeners
        // Hide/show instructions overlay based on pointer lock state
        this.controls.addEventListener('lock', this.onCameraLock.bind(this));
        this.controls.addEventListener('unlock', this.onCameraUnlock.bind(this));

        // Set up keyboard and mouse input listeners
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    /**
     * Called when pointer lock is activated (game starts)
     * Hides the instruction overlay
     */
    onCameraLock() {
        document.getElementById('overlay').style.visibility = 'hidden';
    }
    
    /**
     * Called when pointer lock is released (ESC pressed)
     * Shows the instruction overlay unless in debug camera mode
     */
    onCameraUnlock() {
        if (!this.debugCamera) {
            document.getElementById('overlay').style.visibility = 'visible';
        }
    }

    /**
     * Event handler for key release
     * Stops movement when WASD keys are released
     * @param {KeyboardEvent} event - Keyboard event object
     */
    onKeyUp(event) {
        switch (event.code) {
        case 'KeyW':
            this.input.z = 0; // Stop forward movement
            this.sprintMode = false; // Deactivate sprint mode when W is released
            break;
        case 'KeyA':
            this.input.x = 0; // Stop left movement
            break;
        case 'KeyS':
            this.input.z = 0; // Stop backward movement
            break;
        case 'KeyD':
            this.input.x = 0; // Stop right movement
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            this.sprinting = false; // Stop sprinting
            break;
        }
    }

    /**
     * Event handler for key press
     * Handles movement, block selection, and special actions
     * @param {KeyboardEvent} event - Keyboard event object
     */
    onKeyDown(event) {
        // Lock pointer on any key press if not already locked
        if (!this.controls.isLocked) {
            this.debugCamera = false;
            this.controls.lock();
        }

        switch (event.code) {
            // Number keys 0-8: Select block type from hotbar
            case 'Digit0':
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
                // Remove selection from current toolbar icon
                document.getElementById(`toolbar-${this.activeBlockId}`)?.classList.remove('selected');
                // Add selection to new toolbar icon
                document.getElementById(`toolbar-${event.key}`)?.classList.add('selected');

                // Update active block ID (0 = pickaxe, 1-8 = block types)
                this.activeBlockId = Number(event.key);

                // Show pickaxe only when slot 0 is selected
                this.tool.container.visible = (this.activeBlockId === 0);

                break;
            
            // WASD movement keys
            case 'KeyW':
                // Double-tap detection for sprint mode
                const currentTime = performance.now();
                const timeSinceLastPress = currentTime - this.lastWKeyPress;
                
                if (timeSinceLastPress < this.doubleTapWindow && timeSinceLastPress > 0) {
                    // Double-tap detected - activate sprint mode
                    this.sprintMode = true;
                }
                
                this.lastWKeyPress = currentTime;
                this.input.z = this.maxSpeed; // Move forward
                break;
            case 'KeyA':
                this.input.x = -this.maxSpeed; // Move left
                break;
            case 'KeyS':
                this.input.z = -this.maxSpeed; // Move backward
                break;
            case 'KeyD':
                this.input.x = this.maxSpeed; // Move right
                break;
            
            // R: Reset player position (respawn)
            case 'KeyR':
                if (this.repeat) break; // Prevent repeat triggers
                this.position.y = 32; // Teleport to safe height
                this.velocity.set(0, 0, 0); // Reset velocity
                break;
            
            // Shift: Sprint
            case 'ShiftLeft':
            case 'ShiftRight':
                this.sprinting = true;
                break;
            
            // Space: Jump (only when on ground)
            case 'Space':
                if (this.onGround) {
                    this.velocity.y += this.jumpSpeed;
                }
                break;
            
            // F10: Toggle debug camera (third-person view)
            case 'F10':
                this.debugCamera = true;
                this.controls.unlock();
                break;
        }
    }

    /**
     * Event handler for mouse click
     * Handles block placement and destruction
     * @param {MouseEvent} event - Mouse event object
     */
    onMouseDown(event) {
        // Only process clicks when in first-person mode
        if (this.controls.isLocked) {
            // Check if player is looking at a block
            if (this.selectedCoords) {
                // Determine action based on active block type
                if (this.activeBlockId === blocks.empty.id) {
                    // Slot 0 (pickaxe) = destroy block
                    this.world && this.world.removeBlock(
                        this.selectedCoords.x,
                        this.selectedCoords.y,
                        this.selectedCoords.z
                    );
                } else {
                    // Slots 1-8 = place block of selected type
                    this.world && this.world.addBlock(
                        this.selectedCoords.x,
                        this.selectedCoords.y,
                        this.selectedCoords.z,
                        this.activeBlockId
                    );
                }

                // Trigger tool swing animation
                if (!this.tool.animate) {
                    this.tool.animate = true;
                    this.tool.animationStart = performance.now();

                    // Clear any existing animation timeout
                    clearTimeout(this.tool.animation);

                    // Stop animation after 1.5 swing cycles
                    this.tool.animation = setTimeout(() => {
                        this.tool.animate = false;
                    }, 3 * Math.PI / this.tool.animationSpeed);
                }
            }
        }
    }
}