import { PlayerBase } from './base';
import { blocks } from '../textures/blocks.js';

export class ControllsPlayerBase extends PlayerBase {
    constructor() {
        super();

        // Hide/show instructions based on pointer controls locking/unlocking
        this.controls.addEventListener('lock', this.onCameraLock.bind(this));
        this.controls.addEventListener('unlock', this.onCameraUnlock.bind(this));

        // Add event listeners for keyboard/mouse events
        document.addEventListener('keyup', this.onKeyUp.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('mousedown', this.onMouseDown.bind(this));
    }

    onCameraLock() {
        document.getElementById('overlay').style.visibility = 'hidden';
    }
    
      onCameraUnlock() {
        if (!this.debugCamera) {
            document.getElementById('overlay').style.visibility = 'visible';
        }
    }

    /**
     * Event handler for 'keyup' event
     * @param {KeyboardEvent} event 
     */
    onKeyUp(event) {
        switch (event.code) {
        case 'KeyW':
            this.input.z = 0;
            break;
        case 'KeyA':
            this.input.x = 0;
            break;
        case 'KeyS':
            this.input.z = 0;
            break;
        case 'KeyD':
            this.input.x = 0;
            break;
        case 'ShiftLeft':
        case 'ShiftRight':
            this.sprinting = false;
            break;
        }
    }

    /**
     * Event handler for 'keyup' event
     * @param {KeyboardEvent} event 
     */
    onKeyDown(event) {
        if (!this.controls.isLocked) {
            this.debugCamera = false;
            this.controls.lock();
        }

        switch (event.code) {
            case 'Digit0':
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
                // Update the selected toolbar icon
                document.getElementById(`toolbar-${this.activeBlockId}`)?.classList.remove('selected');
                document.getElementById(`toolbar-${event.key}`)?.classList.add('selected');

                this.activeBlockId = Number(event.key);

                // Update the pickaxe visibility
                this.tool.container.visible = (this.activeBlockId === 0);

                break;
            case 'KeyW':
                this.input.z = this.maxSpeed;
                break;
            case 'KeyA':
                this.input.x = -this.maxSpeed;
                break;
            case 'KeyS':
                this.input.z = -this.maxSpeed;
                break;
            case 'KeyD':
                this.input.x = this.maxSpeed;
                break;
            case 'KeyR':
                if (this.repeat) break;
                this.position.y = 32;
                this.velocity.set(0, 0, 0);
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.sprinting = true;
                break;
            case 'Space':
                if (this.onGround) {
                this.velocity.y += this.jumpSpeed;
                }
                break;
            case 'F10':
                this.debugCamera = true;
                this.controls.unlock();
                break;
        }
    }

    /**
     * Event handler for 'mousedown'' event
     * @param {MouseEvent} event 
     */
    onMouseDown(event) {
        if (this.controls.isLocked) {
            // Is a block selected?
            if (this.selectedCoords) {
                // If active block is an empty block, then we are in delete mode
                if (this.activeBlockId === blocks.empty.id) {
                    this.world && this.world.removeBlock(
                        this.selectedCoords.x,
                        this.selectedCoords.y,
                        this.selectedCoords.z
                    );
                } else {
                    this.world && this.world.addBlock(
                        this.selectedCoords.x,
                        this.selectedCoords.y,
                        this.selectedCoords.z,
                        this.activeBlockId
                    );
                }

                // If the tool isn't currently animating, trigger the animation
                if (!this.tool.animate) {
                    this.tool.animate = true;
                    this.tool.animationStart = performance.now();

                    // Clear the existing timeout so it doesn't cancel our new animation
                    clearTimeout(this.tool.animation);

                    // Stop the animation after 1.5 cycles
                    this.tool.animation = setTimeout(() => {
                        this.tool.animate = false;
                    }, 3 * Math.PI / this.tool.animationSpeed);
                }
            }
        }
    }
}