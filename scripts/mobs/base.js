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
        
        // Find a valid spawn location with flat 4x4 area
        const spawnLocation = this.findValidSpawnLocation(chunk);
        
        if (spawnLocation) {
            // Valid location found - position mob at those coordinates
            this.model.position.set(spawnLocation.x, spawnLocation.y, spawnLocation.z);
            return true;
        } else {
            // No valid location found - log warning
            console.warn('No valid spawn location found for mob in chunk');
            return false;
        }
    }

    calculateY() {
        let cowY = parseInt(this.model.position.y);
        for(let y = this.chunk.size.height; y > 0; y--) {
          const block = this.chunk.getBlock(parseInt(this.model.position.x), y, parseInt(this.model.position.z));
          if(block && block.id) {
            // Look up the block definition from the blocks registry
            const blockDef = Object.values(blocks).find(b => b.id === block.id);
            if(blockDef && blockDef.spawnable) {
              cowY = y + 1.5;
              break;
            }
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

    validateSpawnArea(x, z, y, chunk) {
        // Calculate 4x4 area boundaries centered at (x, z)
        // The area extends 2 blocks in each direction from center
        const startX = Math.floor(x - 2);
        const startZ = Math.floor(z - 2);
        
        // Iterate through all 16 blocks in the 4x4 area
        for (let offsetX = 0; offsetX < 4; offsetX++) {
            for (let offsetZ = 0; offsetZ < 4; offsetZ++) {
                const blockX = startX + offsetX;
                const blockZ = startZ + offsetZ;
                
                // Get the block at this position
                const block = chunk.getBlock(blockX, y, blockZ);
                
                // If no block exists at this position, it's invalid
                if (!block || !block.id) {
                    return false;
                }
                
                // Look up the block definition from the blocks registry
                const blockDef = Object.values(blocks).find(b => b.id === block.id);
                
                // Check if block is spawnable
                if (!blockDef || !blockDef.spawnable) {
                    return false;
                }
                
                // Verify the block above is empty (at y+1)
                const blockAbove = chunk.getBlock(blockX, y + 1, blockZ);
                if (blockAbove && blockAbove.id !== 0) {
                    return false;
                }
            }
        }
        
        // All 16 blocks passed validation
        return true;
    }

    findValidSpawnLocation(chunk) {
        // Start search near chunk center
        const centerX = Math.floor(chunk.size.width / 2);
        const centerZ = Math.floor(chunk.size.width / 2);
        
        // Try multiple search attempts in a spiral pattern from center
        const maxAttempts = 20;
        const searchRadius = 5;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            // Calculate search position in a spiral pattern
            const angle = attempt * 0.5;
            const radius = (attempt / maxAttempts) * searchRadius;
            const x = centerX + Math.floor(Math.cos(angle) * radius);
            const z = centerZ + Math.floor(Math.sin(angle) * radius);
            
            // Ensure we're within chunk boundaries (with margin for 4x4 area)
            if (x < 2 || x >= chunk.size.width - 2 || z < 2 || z >= chunk.size.width - 2) {
                continue;
            }
            
            // Find ground level at this position
            let groundY = null;
            for (let y = chunk.size.height; y > 0; y--) {
                const block = chunk.getBlock(x, y, z);
                if (block && block.id) {
                    const blockDef = Object.values(blocks).find(b => b.id === block.id);
                    if (blockDef && blockDef.spawnable) {
                        groundY = y;
                        break;
                    }
                }
            }
            
            // If no ground found, try next position
            if (groundY === null) {
                continue;
            }
            
            // Validate the 4x4 area at this position
            if (this.validateSpawnArea(x, z, groundY, chunk)) {
                // Valid location found - return coordinates with mob positioned 1.5 units above ground
                return {
                    x: x,
                    y: groundY + 1.5,
                    z: z
                };
            }
        }
        
        // No valid location found after all attempts
        return null;
    }
    
}