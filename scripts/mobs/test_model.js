import * as THREE from 'three';

/**
 * Creates a simple procedural test model for mob testing
 * A wireframe box with transparent faces and colored edges
 * 
 * @param {number} wide - Width of the box (default: 1 block)
 * @param {number} tall - Height of the box (default: 1 block)
 * @param {number} deep - Depth of the box (default: 1 block)
 * @returns {THREE.Group} A group containing the mesh and wireframe
 */
export function createSimpleTestModel(wide = 1, tall = 1, deep = 1) {
  // Create a group to hold both the transparent mesh and wireframe
  const group = new THREE.Group();
  
  // Create box geometry with specified dimensions
  // Default is 1x1x1 to match Minecraft block size
  const geometry = new THREE.BoxGeometry(wide, tall, deep);
  
  // Create transparent green material for the box faces
  // This allows you to see through the mob while still seeing its shape
  const material = new THREE.MeshBasicMaterial({ 
    color: 0x00ff00,        // Green color
    transparent: true,       // Enable transparency
    opacity: 0.1,           // Very transparent (10% opacity)
    side: THREE.DoubleSide  // Render both sides of faces
  });
  
  // Create the mesh and add it to the group
  const mesh = new THREE.Mesh(geometry, material);
  group.add(mesh);
  
  // Create edges geometry to show the wireframe outline
  const edges = new THREE.EdgesGeometry(geometry);
  
  // Create red line material for the edges
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff0000,  // Red color for high visibility
    linewidth: 1      // Line thickness (note: may not work on all platforms)
  });
  
  // Create wireframe line segments and add to group
  const wireframe = new THREE.LineSegments(edges, lineMaterial);
  group.add(wireframe);
  
  // Return the complete group with both mesh and wireframe
  return group;
}
