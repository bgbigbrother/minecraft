import { ControllsPlayerBase } from './controls/index.js';
import { ArmsLoader } from './arms_loader.js';
import { ArmsAnimationController } from './arms_animation_controller.js';

/**
 * Extends player with first-person arms functionality
 * Handles loading, positioning, and animating the player's first-person arms
 */
export class ToolControllsPlayerBase extends ControllsPlayerBase {
    constructor() {
        super();
        
        // Arms animation controller (initialized when arms model loads)
        this.armsController = null;
        
        // Track which punch animation to use next (for alternating)
        this.nextPunchIsLeft = true;
        
        // Store initial transform values for position invariance verification
        this.initialArmsTransform = null;
        
        // Load first-person arms model
        new ArmsLoader((model, animations) => {
            this.setArms(model, animations);
        });
    }

    /**
     * Sets the first-person arms model and initializes animation controller
     * Positions and scales the arms relative to the camera
     * @param {THREE.Group} model - The 3D model of the arms
     * @param {THREE.AnimationClip[]} animations - Array of animation clips from GLB
     */
    setArms(model, animations) {
        // Clear existing arms from tool container
        this.tool.container.clear();
        
        // Add arms model to tool container
        this.tool.container.add(model);
        
        // Configure arms model position (centered in first-person view)
        // X: left(-)/right(+), Y: down(-)/up(+), Z: far(-)/near(+)
        this.tool.container.position.set(0, -2, 0.2);
        
        // Scale the arms model (GLB uses scale of 100 in armature)
        this.tool.container.scale.set(0.4, 0.4, 0.4);
        
        // Rotate arms to proper orientation (180 degrees on Y axis)
        this.tool.container.rotation.set(0, Math.PI, 0);
        
        // Store initial transform values for position invariance verification
        this.initialArmsTransform = {
            position: {
                x: this.tool.container.position.x,
                y: this.tool.container.position.y,
                z: this.tool.container.position.z
            },
            scale: {
                x: this.tool.container.scale.x,
                y: this.tool.container.scale.y,
                z: this.tool.container.scale.z
            },
            rotation: {
                x: this.tool.container.rotation.x,
                y: this.tool.container.rotation.y,
                z: this.tool.container.rotation.z
            }
        };
        
        // Enable shadow casting and receiving on arms model
        // IMPORTANT: Disable frustum culling to prevent arms from being culled
        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.frustumCulled = false; // Disable frustum culling for first-person arms
            }
        });
        
        // Initialize animation controller with the arms model and animations
        this.armsController = new ArmsAnimationController(model, animations);
        
        // Start with idle animation
        this.armsController.playAnimation('IDLE', true);
    }

    /**
     * Updates the arms animation mixer
     * Should be called every frame to advance animation playback
     * @param {number} deltaTime - Time elapsed since last frame in seconds
     */
    updateArmsAnimation(deltaTime) {
        if (this.armsController) {
            this.armsController.update(deltaTime);
        }
    }

    /**
     * Plays an arms animation by state name
     * @param {string} stateName - Name of the animation state to play
     * @param {boolean} loop - Whether the animation should loop
     */
    playArmsAnimation(stateName, loop = false) {
        if (this.armsController) {
            this.armsController.playAnimation(stateName, loop);
        }
    }

    /**
     * Triggers the block break animation (alternates between left and right punch)
     * Called when the player breaks a block
     */
    onBlockBreak() {
        if (this.armsController) {
            // Alternate between left and right punch animations
            const animationState = this.nextPunchIsLeft ? 'PUNCH_LEFT' : 'PUNCH_RIGHT';
            this.armsController.playAnimation(animationState, false);
            
            // Toggle for next time
            this.nextPunchIsLeft = !this.nextPunchIsLeft;
        }
    }

    /**
     * Sets combat mode for arms animations
     * When enabled, uses combat idle animation instead of relaxed idle
     * @param {boolean} enabled - Whether combat mode is active
     */
    setCombatMode(enabled) {
        if (this.armsController) {
            this.armsController.setCombatMode(enabled);
            
            // If currently in an idle state, immediately switch to the appropriate idle animation
            const currentState = this.armsController.getCurrentState();
            if (currentState === 'IDLE' || currentState === 'COMBAT_IDLE') {
                const newIdleState = enabled ? 'COMBAT_IDLE' : 'IDLE';
                this.armsController.transitionTo(newIdleState, 0.3);
            }
        }
    }

    /**
     * Gets the current combat mode state
     * @returns {boolean} Whether combat mode is currently active
     */
    getCombatMode() {
        if (this.armsController) {
            return this.armsController.combatMode;
        }
        return false;
    }

    /**
     * Verifies that the arms transform values haven't drifted from their initial values
     * This ensures position invariance - transforms should only change when explicitly set
     * @param {number} tolerance - Maximum allowed difference (default: 0.0001 for floating point precision)
     * @returns {boolean} True if transforms match initial values within tolerance
     */
    verifyArmsTransformInvariance(tolerance = 0.0001) {
        // If arms haven't been loaded yet, return true (nothing to verify)
        if (!this.initialArmsTransform || !this.armsController) {
            return true;
        }

        const current = {
            position: this.tool.container.position,
            scale: this.tool.container.scale,
            rotation: this.tool.container.rotation
        };

        const initial = this.initialArmsTransform;

        // Check position invariance
        const positionDrift = 
            Math.abs(current.position.x - initial.position.x) +
            Math.abs(current.position.y - initial.position.y) +
            Math.abs(current.position.z - initial.position.z);

        // Check scale invariance
        const scaleDrift = 
            Math.abs(current.scale.x - initial.scale.x) +
            Math.abs(current.scale.y - initial.scale.y) +
            Math.abs(current.scale.z - initial.scale.z);

        // Check rotation invariance
        const rotationDrift = 
            Math.abs(current.rotation.x - initial.rotation.x) +
            Math.abs(current.rotation.y - initial.rotation.y) +
            Math.abs(current.rotation.z - initial.rotation.z);

        // Log warning if drift detected
        if (positionDrift > tolerance || scaleDrift > tolerance || rotationDrift > tolerance) {
            console.warn('Arms transform drift detected:', {
                positionDrift,
                scaleDrift,
                rotationDrift,
                current: {
                    position: { x: current.position.x, y: current.position.y, z: current.position.z },
                    scale: { x: current.scale.x, y: current.scale.y, z: current.scale.z },
                    rotation: { x: current.rotation.x, y: current.rotation.y, z: current.rotation.z }
                },
                initial
            });
            return false;
        }

        return true;
    }

    /**
     * Resets the arms transform to initial values if drift is detected
     * This can be used to correct any unintended transform changes
     */
    resetArmsTransform() {
        if (!this.initialArmsTransform || !this.armsController) {
            return;
        }

        const initial = this.initialArmsTransform;

        // Reset position
        this.tool.container.position.set(
            initial.position.x,
            initial.position.y,
            initial.position.z
        );

        // Reset scale
        this.tool.container.scale.set(
            initial.scale.x,
            initial.scale.y,
            initial.scale.z
        );

        // Reset rotation
        this.tool.container.rotation.set(
            initial.rotation.x,
            initial.rotation.y,
            initial.rotation.z
        );
    }

    /**
     * Gets the current animation state for saving
     * @returns {Object} Animation state data including current state and combat mode
     */
    getAnimationState() {
        if (!this.armsController) {
            return {
                currentState: 'IDLE',
                combatMode: false
            };
        }

        return {
            currentState: this.armsController.getCurrentState(),
            combatMode: this.armsController.combatMode
        };
    }

    /**
     * Restores animation state from saved data
     * @param {Object} animationState - Animation state data with currentState and combatMode
     */
    setAnimationState(animationState) {
        if (!this.armsController || !animationState) {
            return;
        }

        // Restore combat mode first
        if (typeof animationState.combatMode === 'boolean') {
            this.armsController.setCombatMode(animationState.combatMode);
        }

        // Restore animation state
        if (animationState.currentState) {
            // Determine if the animation should loop based on the state type
            const loopingStates = ['IDLE', 'COMBAT_IDLE', 'HANDS_BELOW', 'MAGIC_LOOP'];
            const shouldLoop = loopingStates.includes(animationState.currentState);
            
            this.armsController.playAnimation(animationState.currentState, shouldLoop);
        }
    }

}