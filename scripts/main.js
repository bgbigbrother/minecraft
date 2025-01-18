import { World } from './world/world';
import { Player } from './player/player';
import { Physics } from './physics';
import { setupUI } from './ui';
import { scene } from './core/scene';
import { onResize } from './core/resize';
import { setupLights } from './core/lights';
import { animate } from './core/animation';

const world = new World();
world.generate();
scene.add(world);

const player = new Player(scene, world);
const physics = new Physics(scene);

window.addEventListener('resize', onResize.bind(this, player));

setupUI(world, player, physics, scene);
setupLights();
animate.call(this, player, physics, world);