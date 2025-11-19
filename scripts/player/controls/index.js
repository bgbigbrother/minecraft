import { PlayerBase } from '../base.js';
import { KeyboardHandler } from './KeyboardHandler.js';
import { MouseHandler } from './MouseHandler.js';
import { PointerLockHandler } from './PointerLockHandler.js';
import { blocks } from '../../textures/blocks.js';

/**
 * Extends player with keyboard and mouse input handling
 * Manages WASD movement, block selection, and tool switching
 * Coordinates specialized input handlers for better code organization
 */
export class ControllsPlayerBase extends PlayerBase {
    constructor(options = {}) {
        super();

        // Sprint mode tracking (shared between handlers)
        this.lastWKeyPress = 0; // Timestamp of last W key press
        this.doubleTapWindow = 300; // Time window for double-tap detection (ms)
        this.sprintMode = false; // Whether sprint mode is active

        // Debug flag (shared across all handlers)
        this.debugControls = options.debugControls || false;

        // Instantiate input handlers (public for extensibility)
        this.keyboardHandler = new KeyboardHandler(this);
        this.mouseHandler = new MouseHandler(this);
        this.pointerLockHandler = new PointerLockHandler(this);
        this.interactionHandler = null; // Will be initialized after world is set


        // Set up event system listener for menu:newgame:start
        this.setupEventListeners();
    }

    /**
     * Sets up event listeners for cross-component communication
     */
    setupEventListeners() {
        // Set up pointer lock event listeners
        // Hide/show instructions overlay based on pointer lock state
        // this.controls.addEventListener('lock', this.onCameraLock);
        this.controls.addEventListener('unlock', this.onCameraUnlock.bind(this));

        // Set up keyboard and mouse input listeners
        document.removeEventListener('keyup', this.onKeyUp);
        document.addEventListener('keyup', this.onKeyUp);
        document.removeEventListener('keydown', this.onKeyDown);
        document.addEventListener('keydown', this.onKeyDown);
        document.removeEventListener('mousedown', this.onMouseDown);
        document.addEventListener('mousedown', this.onMouseDown);
        document.addEventListener('wheel', this.onMouseWheel.bind(this), { passive: false });

        // Register listener on document
        document.removeEventListener('game:menu:start:new', this.onCameraLock);
        document.addEventListener('game:menu:start:new', this.onCameraLock);
    }

    /**
     * Sets the debug mode flag for all handlers
     * @param {boolean} enabled - Whether to enable debug logging
     */
    setDebugMode(enabled) {
        this.debugControls = enabled;
    }

    /**
     * Gets the block ID from a toolbar slot by reading the toolbar UI
     * @param {number} slotNumber - Slot number (1-8)
     * @returns {number|null} Block ID in that slot, or null if empty
     */
    getBlockIdFromSlot(slotNumber) {
        // Access the toolbar UI's slot contents cache
        if (this.world && this.world.toolbarUI) {
            const slotContent = this.world.toolbarUI.slotContents.get(slotNumber);
            if (slotContent) {
                return slotContent[0]; // Return the block ID
            }
        }
        return null;
    }

    /**
     * Gets the currently active toolbar slot number
     * @returns {number} Slot number (0-8)
     */
    getActiveSlot() {
        // If activeBlockId is 0 (pickaxe), return slot 0
        if (this.activeBlockId === blocks.empty.id) {
            return 0;
        }
        
        // Find which slot contains the active block ID
        if (this.world && this.world.toolbarUI) {
            for (let i = 1; i <= 8; i++) {
                const slotContent = this.world.toolbarUI.slotContents.get(i);
                if (slotContent && slotContent[0] === this.activeBlockId) {
                    return i;
                }
            }
        }
        
        // Default to slot 0 if not found
        return 0;
    }

    /**
     * Called when pointer lock is activated (game starts)
     * Delegates to PointerLockHandler and dispatches event
     */
    onCameraLock = () => {
        // Lock pointer on any key press if not already locked
        if (!this.controls.isLocked) {
            this.debugCamera = false;
            this.controls.lock();
        }
        this.pointerLockHandler.handleLock();
        
        // Dispatch game:controls:lock event
        const event = new CustomEvent('game:controls:lock', {
            detail: { 
                timestamp: Date.now(),
                locked: true
            },
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);

        if (this.debugControls) {
            console.log('[Controls] Dispatched game:controls:lock event');
        }
    }
    
    /**
     * Called when pointer lock is released (ESC pressed)
     * Delegates to PointerLockHandler and dispatches event
     */
    onCameraUnlock() {
        this.pointerLockHandler.handleUnlock();
        
        // Dispatch game:controls:unlock event
        const event = new CustomEvent('game:controls:unlock', {
            detail: { 
                timestamp: Date.now(),
                locked: false
            },
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
        
        if (this.debugControls) {
            console.log('[Controls] Dispatched game:controls:unlock event');
        }
    }

    /**
     * Event handler for key release
     * Delegates to KeyboardHandler
     * @param {KeyboardEvent} event - Keyboard event object
     */
    onKeyUp = (event) => {
        this.keyboardHandler.handleKeyUp(event);
    }

    /**
     * Event handler for key press
     * Delegates to KeyboardHandler
     * @param {KeyboardEvent} event - Keyboard event object
     */
    onKeyDown = (event) => {
        this.keyboardHandler.handleKeyDown(event);
    }

    /**
     * Event handler for mouse click
     * Delegates to MouseHandler
     * @param {MouseEvent} event - Mouse event object
     */
    onMouseDown = (event) => {
        this.mouseHandler.handleMouseDown(event);
    }

    /**
     * Event handler for mouse wheel scrolling
     * Delegates to MouseHandler for toolbar navigation
     * @param {WheelEvent} event - Wheel event object
     */
    onMouseWheel(event) {
        this.mouseHandler.handleMouseWheel(event);
    }

}
