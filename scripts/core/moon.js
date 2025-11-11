import { SphereGeometry, MeshBasicMaterial, Mesh } from 'three';

/**
 * Visual representation of the moon
 * A pale white sphere mesh that appears during nighttime
 * Positioned 180 degrees opposite to the sun
 */
const moonGeometry = new SphereGeometry(7, 32, 32); // Slightly smaller than sun (radius 1.8)
const moonMaterial = new MeshBasicMaterial({ color: 0xe5e5e5 }); // Pale white
export const moonMesh = new Mesh(moonGeometry, moonMaterial);
moonMesh.visible = false; // Initially hidden, will be shown during night

/**
 * Updates the moon's position to be 180 degrees opposite of the sun
 * @param {THREE.Vector3} sunPosition - The current position of the sun
 */
export function updateMoonPosition(sunPosition) {
  // Position moon 180 degrees opposite to the sun
  moonMesh.position.set(-sunPosition.x, -sunPosition.y, -sunPosition.z);
}
