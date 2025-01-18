import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const jungleTree = {
  id: 11,
  name: 'jungleTree',
  material: [
    new MeshLambertMaterial({ map: textures.jungleTreeSide }), // right
    new MeshLambertMaterial({ map: textures.jungleTreeSide }), // left
    new MeshLambertMaterial({ map: textures.jungleTreeTop }),  // top
    new MeshLambertMaterial({ map: textures.jungleTreeTop }),  // bottom
    new MeshLambertMaterial({ map: textures.jungleTreeSide }), // front
    new MeshLambertMaterial({ map: textures.jungleTreeSide })  // back
  ]
}