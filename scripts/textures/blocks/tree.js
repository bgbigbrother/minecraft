import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const tree = {
  id: 6,
  name: 'tree',
  visible: true,
  material: [
    new MeshLambertMaterial({ map: textures.treeSide }), // right
    new MeshLambertMaterial({ map: textures.treeSide }), // left
    new MeshLambertMaterial({ map: textures.treeTop }), // top
    new MeshLambertMaterial({ map: textures.treeTop }), // bottom
    new MeshLambertMaterial({ map: textures.treeSide }), // front
    new MeshLambertMaterial({ map: textures.treeSide })  // back
  ],
  spawnable: false
}