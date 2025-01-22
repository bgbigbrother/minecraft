import { World } from './world/world';
import { Player } from './player/player';
import { Physics } from './physics/physics';
import { setupUI } from './ui';
import { scene } from './core/scene';
import { onResize } from './core/resize';
import { setupLights } from './core/lights';
import { animate } from './core/animation';
import { ModelLoader } from './mobs/model_loader';

new ModelLoader((models) => {

    const world = new World(models);
    world.generate();
    scene.add(world);

    const player = new Player(scene, world);
    const physics = new Physics(scene);
    player.addPhysics(physics);

    window.addEventListener('resize', onResize.bind(this, player));

    setupUI(world, player, physics, scene);
    setupLights();
    animate.call(this, player, world);
});