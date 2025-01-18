import { ControllsPlayerBase } from './controls';
import { ToolLoader } from './tool_loader';

export class ToolControllsPlayerBase extends ControllsPlayerBase {
    constructor() {
        super();
        new ToolLoader((models) => {
            this.setTool(models.pickaxe);
        });
    }

    /**
     * Set the tool object the player is holding
     * @param {THREE.Mesh} tool 
     */
    setTool(tool) {
        this.tool.container.clear();
        this.tool.container.add(tool);
        this.tool.container.receiveShadow = true;
        this.tool.container.castShadow = true;

        this.tool.container.position.set(0.6, -0.3, -0.5);
        this.tool.container.scale.set(0.5, 0.5, 0.5);
        this.tool.container.rotation.z = Math.PI / 2;
        this.tool.container.rotation.y = Math.PI + 0.2;
    }

    /**
     * Animates the tool rotatiosn
     */
    updateToolAnimation() {
        if (this.tool.container.children.length > 0) {
            const t = this.tool.animationSpeed * (performance.now() - this.tool.animationStart);
            this.tool.container.children[0].rotation.y = 0.5 * Math.sin(t);
        }
    }

}