import { MeshBasicMaterial } from 'three';
import { textures } from '../textures';

export const cloud = {
  id: 9,
  name: 'cloud',
  visible: true,
  material: new MeshBasicMaterial({ color: 0xf0f0f0, transparent: true, opacity: 0.3, }),
  spawnable: false
}