import * as THREE from 'three';
import { blocks } from '../../textures/blocks.js';

/**
 * MouseHandler
 * Handles all mouse input events including clicks and wheel scrolling
 * Manages block placement, destruction, and toolbar navigation
 */
export class MouseHandler {
    /**
     * Creates a new MouseHandler
     * @param {Object} player - Reference to the player object
     */
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
        console.log(`[MouseHandler] ${action} at ${timestamp}`);
        
        // Log each detail on a separate line with arrow prefix
        for (const [key, value] of Object.entries(details)) {
            console.log(`  → ${key}: ${value}`);
        }
    }

    /**
     * Event handler for mouse button clicks
     * Handles left-click (break/interact) and right-click (place block)
     * @param {MouseEvent} event - Mouse event object
     */
    handleMouseDown(event) {
        try {
            // Log mouse click
            const clickType = event.button === 0 ? 'LeftClick' : event.button === 2 ? 'RightClick' : `Button${event.button}`;
            this.logDebug(`${clickType} (button ${event.button})`, {
                'Button number': event.button,
                'Pointer locked': this.player.controls.isLocked
            });

            // Only process clicks when pointer is locked (in first-person mode)
            if (!this.player.controls.isLocked) {
                return;
            }

            // Check if player is looking at a block
            if (!this.player.selectedCoords) {
                this.logDebug('Click ignored', {
                    'Reason': 'No block selected'
                });
                return;
            }

            // Log selected coordinates and active block
            this.logDebug('Click details', {
                'Selected coords': `{x: ${this.player.selectedCoords.x}, y: ${this.player.selectedCoords.y}, z: ${this.player.selectedCoords.z}}`,
                'Active block ID': this.player.activeBlockId
            });

            // Determine action based on mouse button
            if (event.button === 0) {
                // Left click
                this.handleLeftClick();
            } else if (event.button === 2) {
                // Right click
                this.handleRightClick();
            }
        } catch (error) {
            console.error('Error in mouse handler (mousedown):', error);
        }
    }

    /**
     * Handles left-click functionality
     * Breaks blocks with pickaxe or triggers interactions with special blocks
     */
    handleLeftClick() {
        // Check if active block is pickaxe (empty block ID)
        if (this.player.activeBlockId === blocks.empty.id) {
            // Pickaxe selected - remove block at selected coordinates
            if (this.player.world) {
                this.player.world.removeBlock(
                    this.player.selectedCoords.x,
                    this.player.selectedCoords.y,
                    this.player.selectedCoords.z
                );
                
                this.logDebug('Action taken', {
                    'Action': 'BREAK BLOCK',
                    'Block type': 'Pickaxe (empty)',
                    'Coordinates': `{x: ${this.player.selectedCoords.x}, y: ${this.player.selectedCoords.y}, z: ${this.player.selectedCoords.z}}`
                });
            }
        } else if (this.player.activeBlockId === blocks.chest?.id) {
            // Chest selected - trigger chest interaction
            // Note: Chest interaction logic would be implemented here
            // For now, we just trigger the tool animation
            this.logDebug('Action taken', {
                'Action': 'INTERACT WITH CHEST',
                'Block type': 'Chest',
                'Coordinates': `{x: ${this.player.selectedCoords.x}, y: ${this.player.selectedCoords.y}, z: ${this.player.selectedCoords.z}}`
            });
        } else {
            // Other blocks - could be used for future interactions
            this.logDebug('Action taken', {
                'Action': 'TOOL ACTION',
                'Block ID': this.player.activeBlockId,
                'Coordinates': `{x: ${this.player.selectedCoords.x}, y: ${this.player.selectedCoords.y}, z: ${this.player.selectedCoords.z}}`
            });
        }

        // Trigger tool swing animation
        this.triggerToolAnimation();
    }

    /**
     * Handles right-click block placement (NEW FEATURE)
     * Places the currently selected block at the target coordinates
     * Also handles interactions with existing blocks (like chests)
     */
    handleRightClick() {
        // Don't place blocks if pickaxe is selected
        if (this.player.activeBlockId === blocks.empty.id) {
            this.logDebug('Action taken', {
                'Action': 'NONE (pickaxe selected)',
                'Block type': 'Pickaxe (empty)'
            });
            return;
        }

        // Check if we're clicking on an existing interactable block
        const existingBlock = this.player.world?.getBlock?.(
            this.player.selectedCoords.x,
            this.player.selectedCoords.y,
            this.player.selectedCoords.z
        );

        // If there's an existing block, check if it's interactable (like a chest)
        if (existingBlock && existingBlock.id !== blocks.empty.id) {
            const blockType = blocks[Object.keys(blocks).find(key => blocks[key].id === existingBlock.id)];
            
            // If it's an interactable block (has animations), trigger the interaction
            if (blockType && blockType.isModel && blockType.createAnimatedInstance) {
                this.logDebug('Action taken', {
                    'Action': 'INTERACT WITH BLOCK',
                    'Block type': blockType.name,
                    'Block ID': existingBlock.id
                });
                
                // Create a unique instance of the animated model for this specific block location
                const posKey = `${this.player.selectedCoords.x},${this.player.selectedCoords.y},${this.player.selectedCoords.z}`;
                
                // Check if we already have an animated instance for this position
                if (!this.player.world.animatedBlocks) {
                    this.player.world.animatedBlocks = new Map();
                }
                
                let animatedInstance = this.player.world.animatedBlocks.get(posKey);
                
                if (!animatedInstance) {
                    // Find and hide the instanced mesh block at this position
                    // We move it far away temporarily instead of scaling to preserve collision
                    const chunk = this.player.world.children.find(child => {
                        const chunkX = Math.floor(this.player.selectedCoords.x / this.player.world.chunkSize.width) * this.player.world.chunkSize.width;
                        const chunkZ = Math.floor(this.player.selectedCoords.z / this.player.world.chunkSize.width) * this.player.world.chunkSize.width;
                        return child.position.x === chunkX && child.position.z === chunkZ;
                    });
                    
                    let hiddenInstanceInfo = null;
                    
                    if (chunk) {
                        const block = chunk.getBlock(
                            this.player.selectedCoords.x - chunk.position.x,
                            this.player.selectedCoords.y,
                            this.player.selectedCoords.z - chunk.position.z
                        );
                        
                        if (block && block.instanceId !== null) {
                            const mesh = chunk.children.find(m => m.name === blockType.id);
                            if (mesh) {
                                // Store original matrix to restore later
                                const originalMatrix = new THREE.Matrix4();
                                mesh.getMatrixAt(block.instanceId, originalMatrix);
                                
                                // Move instance far away (effectively hiding it)
                                const hiddenMatrix = new THREE.Matrix4();
                                hiddenMatrix.setPosition(10000, 10000, 10000);
                                mesh.setMatrixAt(block.instanceId, hiddenMatrix);
                                mesh.instanceMatrix.needsUpdate = true;
                                
                                // Store info to restore later
                                hiddenInstanceInfo = {
                                    mesh: mesh,
                                    instanceId: block.instanceId,
                                    originalMatrix: originalMatrix
                                };
                            }
                        }
                    }
                    
                    // Create animated instance using the block's method
                    const position = new THREE.Vector3(
                        this.player.selectedCoords.x,
                        this.player.selectedCoords.y,
                        this.player.selectedCoords.z
                    );
                    
                    blockType.createAnimatedInstance(position).then(instance => {
                        if (instance) {
                            // Add to scene
                            const targetScene = this.player.world.parent || this.player.scene || this.player.world;
                            targetScene.add(instance.scene);
                            
                            // Store the instance
                            this.player.world.animatedBlocks.set(posKey, instance);
                            
                            // Store the mixer for frame updates
                            if (!this.player.world.activeAnimationMixers) {
                                this.player.world.activeAnimationMixers = new Map();
                            }
                            this.player.world.activeAnimationMixers.set(posKey, instance.mixer);
                            
                            this.logDebug('Animated instance created', {
                                'Position': posKey,
                                'Has animation': !!instance.action
                            });
                            
                            // After animation completes, remove animated instance and restore original
                            setTimeout(() => {
                                // Remove animated scene
                                targetScene.remove(instance.scene);
                                this.player.world.animatedBlocks.delete(posKey);
                                this.player.world.activeAnimationMixers.delete(posKey);
                                
                                // Restore original instanced mesh
                                if (hiddenInstanceInfo) {
                                    hiddenInstanceInfo.mesh.setMatrixAt(
                                        hiddenInstanceInfo.instanceId,
                                        hiddenInstanceInfo.originalMatrix
                                    );
                                    hiddenInstanceInfo.mesh.instanceMatrix.needsUpdate = true;
                                }
                                
                                this.logDebug('Animation completed', {
                                    'Position': posKey,
                                    'Restored original': !!hiddenInstanceInfo
                                });
                            }, blockType.animationDuration);
                        }
                    });
                }
                
                return; // Don't place a block, we're interacting
            }
        }

        // Place block of selected type at selected coordinates
        if (this.player.world) {
            this.player.world.addBlock(
                this.player.selectedCoords.x,
                this.player.selectedCoords.y,
                this.player.selectedCoords.z,
                this.player.activeBlockId
            );
            
            this.logDebug('Action taken', {
                'Action': 'PLACE BLOCK',
                'Block ID': this.player.activeBlockId,
                'Coordinates': `{x: ${this.player.selectedCoords.x}, y: ${this.player.selectedCoords.y}, z: ${this.player.selectedCoords.z}}`
            });
        }

        // Trigger tool swing animation
        this.triggerToolAnimation();
    }

    /**
     * Event handler for mouse wheel scrolling
     * Navigates through toolbar slots with wrapping
     * @param {WheelEvent} event - Wheel event object
     */
    handleMouseWheel(event) {
        try {
            // Only process wheel events when pointer is locked
            if (!this.player.controls.isLocked) {
                return;
            }

            // Prevent default scroll behavior
            event.preventDefault();

            // Get current slot
            const currentSlot = this.player.getActiveSlot();

            // Determine scroll direction (negative = up, positive = down)
            const direction = event.deltaY < 0 ? 1 : -1;
            const scrollDirection = direction === 1 ? 'UP' : 'DOWN';

            // Calculate next slot with wrapping
            const nextSlot = this.getNextSlot(currentSlot, direction);

            // Log wheel scroll
            this.logDebug(`WheelScroll (deltaY: ${event.deltaY})`, {
                'Direction': scrollDirection,
                'Delta value': event.deltaY,
                'Previous slot': currentSlot,
                'New slot': nextSlot
            });

            // Update toolbar selection
            if (this.player.world && this.player.world.toolbarUI) {
                this.player.world.toolbarUI.setSelectedSlot(nextSlot);
                
                this.logDebug('Toolbar slot change', {
                    'Previous slot': currentSlot,
                    'New slot': nextSlot,
                    'Active block ID': this.player.activeBlockId
                });
            }
        } catch (error) {
            console.error('Error in mouse handler (wheel):', error);
        }
    }

    /**
     * Triggers the tool swing animation
     * Starts animation and sets timeout to stop after 1.5 swing cycles
     */
    triggerToolAnimation() {
        if (!this.player.tool.animate) {
            this.player.tool.animate = true;
            this.player.tool.animationStart = performance.now();

            // Clear any existing animation timeout
            clearTimeout(this.player.tool.animation);

            // Stop animation after 1.5 swing cycles
            this.player.tool.animation = setTimeout(() => {
                this.player.tool.animate = false;
            }, 3 * Math.PI / this.player.tool.animationSpeed);
            
            this.logDebug('Tool animation', {
                'Status': 'TRIGGERED',
                'Animation start': this.player.tool.animationStart.toFixed(0)
            });
        }
    }

    /**
     * Calculates the next toolbar slot with wrapping at boundaries
     * @param {number} currentSlot - Current slot number (0-8)
     * @param {number} direction - Direction to move (1 = next, -1 = previous)
     * @returns {number} Next slot number with wrapping (0-8)
     */
    getNextSlot(currentSlot, direction) {
        let nextSlot = currentSlot + direction;

        // Wrap around at boundaries
        if (nextSlot > 8) {
            nextSlot = 0;
        } else if (nextSlot < 0) {
            nextSlot = 8;
        }

        return nextSlot;
    }
}
