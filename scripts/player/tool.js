import { ControllsPlayerBase } from './controls/index.js';
import { ToolLoader } from './tool_loader';

/**
 * Extends player with tool/item functionality
 * Handles loading, positioning, and animating the player's held tool
 */
export class ToolControllsPlayerBase extends ControllsPlayerBase {
    constructor() {
        super();
        
        // Load tool models and set pickaxe as default tool
        new ToolLoader((models) => {
            models.pickaxe && this.setTool(models.pickaxe);
        });
    }

    /**
     * Sets the tool/item the player is currently holding
     * Positions and scales the tool relative to the camera
     * @param {THREE.Mesh} tool - The 3D model of the tool to display
     */
    setTool(tool) {
        this.tool.container.clear(); // Remove any existing tool
        this.tool.container.add(tool); // Add new tool to container
        
        // Enable shadows for the tool
        this.tool.container.receiveShadow = true;
        this.tool.container.castShadow = true;

        // Position tool in bottom-right of screen (first-person view)
        this.tool.container.position.set(0.6, -0.3, -0.5);
        
        // Scale down the tool to appropriate size
        this.tool.container.scale.set(0.5, 0.5, 0.5);
        
        // Rotate tool to proper orientation
        this.tool.container.rotation.z = Math.PI / 2; // 90 degrees on Z axis
        this.tool.container.rotation.y = Math.PI + 0.2; // 180 degrees + slight angle on Y axis
    }

    /**
     * Updates the tool swing animation
     * Creates a swinging motion when player mines/places blocks
     */
    updateToolAnimation() {
        if (this.tool.container.children.length > 0) {
            // Calculate animation time
            const t = this.tool.animationSpeed * (performance.now() - this.tool.animationStart);
            
            // Apply sinusoidal rotation for swinging motion
            this.tool.container.children[0].rotation.y = 0.5 * Math.sin(t);
        }
    }

}