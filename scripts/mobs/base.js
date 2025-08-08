import { clone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { blocks } from '../textures/blocks.js';

export class MoveMob {
    moves = ["forward", "left", "right"];
    idleAction = "idle";
    position = {
        axis: "z",
        direction: 1,
        rotation: 0
    }
    actionTime = 5;
    startTime = 0;
    currentAction = null;
    previousAction = null;
    speed = 2;
    constructor(model) {
        this.model = clone(model.model);
        this.animations = model.animations;
    }

    selectRandomAction() {
        this.previousAction = this.currentAction;
        if(this.currentAction !== this.idleAction) {
            this.currentAction = this.idleAction;
        } else {
            this.currentAction = this.moves[Math.floor(Math.random() * this.moves.length)];
        }
        this.generatePosition(this.currentAction);
    }

    update(deltaTime, world) {
        this.updateY(world);
        this.actionTime += deltaTime;

        // Perform the current action
        switch (this.currentAction) {
            case "forward":
            case "left":
            case "right":
                this.move(deltaTime);
                break;
        } 
    }

    updateY(world) {
        const y = this.calculateY();
        this.model.position.y = y;
    }

    generate(chunk) {
        this.chunk = chunk;
        const y = this.calculateY();
        this.model.position.set(chunk.size.width / 2 , y, chunk.size.width / 2);
    }

    calculateY() {
        let cowY = parseInt(this.model.position.y);
        for(let y = this.chunk.size.height; y > 0; y--) {
          const block = this.chunk.getBlock(parseInt(this.model.position.x), y, parseInt(this.model.position.z));
          if(block && block.id == blocks.dirt.id) {
            cowY = y + 1.5;
            break
          }
        }
        return cowY;
    }

    generatePosition(action) {
        this.actionTime = 0;
        // Random duration between 5 and 10 seconds
        this.startTime = Math.random() * 5 + 5;

        if(action === "left" || action === "right") {
            this.position.axis = this.position.axis === "x" ? "z" : "x";
            if(action === "left") {
                this.position.rotation += Math.PI / 2.0;
                this.model.rotateY( Math.PI / 2.0);
            } else if(action === "right") {
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
    }

    move(deltaTime) {
        this.model.position[this.position.axis] += this.position.direction * (deltaTime * this.speed);
    }

    addCustomMove(action) {
        this.moves.push(action);
    }
    
}