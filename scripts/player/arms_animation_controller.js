import { AnimationMixer, AnimationClip } from 'three';

/**
 * Animation state mapping for first-person arms
 * Maps game states to animation clip names from the GLB file
 */
export const ANIMATION_STATES = {
  IDLE: 'arms_armature|Relax_hands_idle_loop',
  IDLE_START: 'arms_armature|Relax_hands_idle_start',
  COMBAT_IDLE: 'arms_armature|Combat_idle_loop',
  COMBAT_START: 'arms_armature|Combat_idle_start',
  PUNCH_LEFT: 'arms_armature|Combat_punch_left',
  PUNCH_RIGHT: 'arms_armature|Combat_punch_right',
  COLLECT: 'arms_armature|Collect_something',
  HANDS_BELOW: 'arms_armature|Hands_below',
  MAGIC_ATTACK: 'arms_armature|Magic_spell_attack',
  MAGIC_LOOP: 'arms_armature|Magic_spell_loop',
  MAGIC_START: 'arms_armature|Magic_spell_loop_start'
};

/**
 * Manages animation state and playback for first-person arms
 * Handles animation transitions, state tracking, and mixer updates
 */
export class ArmsAnimationController {
  /**
   * Three.js AnimationMixer for managing animations
   */
  mixer = null;

  /**
   * Map of animation state names to AnimationClip objects
   */
  animations = new Map();

  /**
   * Currently playing AnimationAction
   */
  currentAction = null;

  /**
   * Current animation state name
   */
  currentState = null;

  /**
   * Combat mode flag - determines which idle animation to use
   */
  combatMode = false;

  /**
   * Creates a new ArmsAnimationController
   * @param {THREE.Group} model - The arms model to animate
   * @param {THREE.AnimationClip[]} animationClips - Array of animation clips from GLB
   */
  constructor(model, animationClips) {
    // Initialize the animation mixer with the arms model
    this.mixer = new AnimationMixer(model);

    // Map animation clips to state names for easy lookup
    animationClips.forEach(clip => {
      this.animations.set(clip.name, clip);
    });

    // Start with idle animation
    this.currentState = 'IDLE';

    // Listen for animation finished events to return to idle
    this.mixer.addEventListener('finished', (e) => {
      this.onAnimationFinished(e);
    });
  }

  /**
   * Plays an animation by state name
   * @param {string} stateName - Name of the animation state (e.g., 'IDLE', 'PUNCH_LEFT')
   * @param {boolean} loop - Whether the animation should loop (default: true)
   */
  playAnimation(stateName, loop = true) {
    // Get the animation clip name from the state mapping
    const clipName = ANIMATION_STATES[stateName];
    
    if (!clipName) {
      console.warn(`Animation state "${stateName}" not found in ANIMATION_STATES`);
      return;
    }

    // Find the animation clip
    const clip = this.animations.get(clipName);
    
    if (!clip) {
      console.warn(`Animation clip "${clipName}" not found in loaded animations`);
      return;
    }

    // Stop current action if playing
    if (this.currentAction) {
      this.currentAction.stop();
    }

    // Create and play the new action
    this.currentAction = this.mixer.clipAction(clip);
    this.currentAction.loop = loop ? 2201 : 2200; // LoopRepeat : LoopOnce
    this.currentAction.clampWhenFinished = true; // Hold on last frame when finished
    this.currentAction.reset(); // Reset to start
    this.currentAction.play();

    // Update current state
    this.currentState = stateName;
  }

  /**
   * Smoothly transitions from current animation to a new animation
   * @param {string} stateName - Name of the animation state to transition to
   * @param {number} duration - Transition duration in seconds (default: 0.2)
   */
  transitionTo(stateName, duration = 0.2) {
    // Get the animation clip name from the state mapping
    const clipName = ANIMATION_STATES[stateName];
    
    if (!clipName) {
      console.warn(`Animation state "${stateName}" not found in ANIMATION_STATES`);
      return;
    }

    // Find the animation clip
    const clip = this.animations.get(clipName);
    
    if (!clip) {
      console.warn(`Animation clip "${clipName}" not found in loaded animations`);
      return;
    }

    // Create the new action
    const newAction = this.mixer.clipAction(clip);

    // If there's a current action, cross-fade to the new one
    if (this.currentAction) {
      newAction.reset();
      newAction.play();
      this.currentAction.crossFadeTo(newAction, duration, true);
    } else {
      // No current action, just play the new one
      newAction.play();
    }

    // Update current action and state
    this.currentAction = newAction;
    this.currentState = stateName;
  }

  /**
   * Updates the animation mixer (should be called every frame)
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  /**
   * Gets the current animation state name
   * @returns {string} Current animation state (e.g., 'IDLE', 'PUNCH_LEFT')
   */
  getCurrentState() {
    return this.currentState;
  }

  /**
   * Sets combat mode flag
   * Determines which idle animation to use (relaxed vs combat)
   * @param {boolean} enabled - Whether combat mode is active
   */
  setCombatMode(enabled) {
    this.combatMode = enabled;
  }

  /**
   * Handles animation finished events
   * Returns to appropriate idle animation after action animations complete
   * @param {Object} event - Animation finished event from mixer
   * @private
   */
  onAnimationFinished(event) {
    // Determine which idle state to return to based on combat mode
    const idleState = this.combatMode ? 'COMBAT_IDLE' : 'IDLE';
    
    // Only transition to idle if we're not already in an idle state
    // This prevents interrupting looping idle animations
    if (this.currentState !== 'IDLE' && 
        this.currentState !== 'COMBAT_IDLE' &&
        this.currentState !== 'HANDS_BELOW') {
      // Transition back to idle with a smooth blend
      this.transitionTo(idleState, 0.3);
    }
  }
}
