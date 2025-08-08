import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { AnimationMixer, AnimationClip } from 'three';
import { blocks } from '../textures/blocks.js';
import { MoveMob } from './base';

export class Cow extends MoveMob {
    mixer = null;
    currentAction = "eat";
    action = null;
    position = {
        axis: "z",
        direction: 1,
        rotation: 0
    }
    previousAction = null;
    actionTime = 5;
    startTime = 0;

    constructor(model) {
        super(model);
        this.model = clone(model.model);
        this.animations = model.animations;
        this.mixer = new AnimationMixer(this.model);
    }

    generate(chunk) {
        let cowY;
        for(let y = chunk.size.height; y > 0; y--) {
          const block = chunk.getBlock(chunk.size.width - 1, y, chunk.size.width - 1);
          if(block && block.id == blocks.dirt.id) {
            cowY = y + 1;
            break
          }
        }
        this.model.position.set(chunk.size.width, cowY, chunk.size.width);
    }

    // Randomly select a new action and duration
    selectNewAction() {
        this.previousAction = this.currentAction;
        this.currentAction = this.selectRandomAction();
        this.startTime = Math.random() * 5 + 5; // Random duration between 5 and 10 seconds
        this.actionTime = 0;

        if (this.action && this.currentAction !== this.previousAction) {
            this.action.stop();
        }

        if(this.currentAction === "eat") {
            this.animate('Eating');
        } else {
            this.animate("Walk");
        }

        console.log(this.previousAction, this.currentAction);
        console.log(this.position);

        if(this.currentAction === "moveLeft" || this.currentAction === "moveRight") {
            this.position.axis = this.position.axis === "x" ? "z" : "x";
            if(this.currentAction === "moveLeft") {
                this.position.rotation += Math.PI / 2.0;
                this.model.rotateY( Math.PI / 2.0);
            } else if(this.currentAction === "moveRight") {
                let newPosition = this.position.rotation === 0 ? Math.PI * 1.5 : -Math.PI / 2.0;
                this.position.rotation += newPosition;
                this.model.rotateY(newPosition);
            }
        }

        if((this.position.axis === "x" && this.position.rotation === Math.PI * 1.5) || (this.position.axis === "z" && this.position.rotation === Math.PI)) {
            this.position.direction = -1;
        } else {
            this.position.direction = 1;
        }

        if(this.position.rotation === -Math.PI * 2 || this.position.rotation === Math.PI * 2) {
            this.position.rotation = 0;
        }
        console.log(this.position);
    }

    update(deltaTime) {
        this.mixer.update(deltaTime);

        this.actionTime += deltaTime;

        if (this.actionTime >= this.startTime) {
            this.selectNewAction();
        }

        // Perform the current action
        switch (this.currentAction) {
            case "eat":
                this.eat();
                break;
            case "moveForward":
                this.moveForward(deltaTime);
                break;
            case "moveLeft":
                this.moveLeft(deltaTime);
                break;
            case "moveRight":
                this.moveRight(deltaTime);
                break;
        }
    }

    // Cow actions
    eat() {
    }

    moveForward(deltaTime) {
        this.model.position[this.position.axis] += this.position.direction * deltaTime;
    }

    moveLeft(deltaTime) {
        this.model.position[this.position.axis] += this.position.direction * deltaTime;
    }

    moveRight(deltaTime) {
        this.model.position[this.position.axis] += this.position.direction * deltaTime;
    }
}