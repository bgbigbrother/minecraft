import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const grass = {
    id: 1,
    name: 'grass',
    material: [
      new MeshLambertMaterial({ map: textures.grassSide }), // right
      new MeshLambertMaterial({ map: textures.grassSide }), // left
      new MeshLambertMaterial({ map: textures.grass }),     // top
      new MeshLambertMaterial({ map: textures.dirt }),      // bottom
      new MeshLambertMaterial({ map: textures.grassSide }), // front
      new MeshLambertMaterial({ map: textures.grassSide })  // back
    ]
}