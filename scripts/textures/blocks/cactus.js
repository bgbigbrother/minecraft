import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const cactus = {
  id: 13,
  name: 'cactus',
  material: [
    new MeshLambertMaterial({ map: textures.cactusSide }), // right
    new MeshLambertMaterial({ map: textures.cactusSide }), // left
    new MeshLambertMaterial({ map: textures.cactusTop }),  // top
    new MeshLambertMaterial({ map: textures.cactusTop }),  // bottom
    new MeshLambertMaterial({ map: textures.cactusSide }), // front
    new MeshLambertMaterial({ map: textures.cactusSide })  // back
  ],
  spawnable: false
}