import { MoveMob } from './base';
import { AnimationMixer, AnimationClip } from 'three';

export class Cow extends MoveMob {
    mixer = null;
    action = null;

    constructor(model) {
        super(model);
        this.mixer = new AnimationMixer(this.model);
        this.addCustomMove("eat");
        this.model.name = "Cow";
        this.model.scale.set(0.5, 0.5, 0.5);
    }

    // Randomly select a new action and duration
    selectNewAction() {
        this.selectRandomAction();
        

        if (this.action && this.currentAction !== this.previousAction) {
            this.action.stop();
        }

        if(this.currentAction === "eat") {
            this.animate('Eating');
        } else if(this.currentAction === "idle") {
            this.animate('Idle');
        } else {
            this.animate("Walk");
        }
    }

    update(deltaTime, world) {
        super.update(deltaTime, world)
        this.mixer.update(deltaTime);

        if (this.actionTime >= this.startTime) {
            this.selectNewAction();
        }
    }

    animate(clipName = 'Eating') {
        if (!this.mixer) return; // Ensure the mixer exists

        const clip = AnimationClip.findByName(this.animations, clipName);
        if (clip) {
            this.action = this.mixer.clipAction(clip);
            this.action.play();
        } else {
            console.warn(`Animation clip "${clipName}" not found.`);
        }
    }
}