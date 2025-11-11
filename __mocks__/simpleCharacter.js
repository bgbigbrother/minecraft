import { Group } from 'three';

export function simpleCharacter() {
  const character = new Group();
  character.scale = { x: 0.7, y: 0.7, z: 0.7, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
  return character;
}
