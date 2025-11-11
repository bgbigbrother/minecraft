import { DirectionalLight, Vector2, SphereGeometry, MeshBasicMaterial, Mesh } from 'three';

/**
 * Directional light representing the sun
 * Provides main lighting and casts shadows
 */
export const sun = new DirectionalLight();
sun.intensity = 1.5; // Brightness of sunlight
sun.position.set(50, 50, 50); // Position in sky (relative to player)
sun.castShadow = true; // Enable shadow casting

// Configure shadow camera (orthographic projection for directional light)
// Defines the area where shadows are rendered
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
sun.shadow.camera.near = 0.1; // Near clipping plane
sun.shadow.camera.far = 200; // Far clipping plane
sun.shadow.bias = -0.0001; // Prevents shadow acne artifacts
sun.shadow.mapSize = new Vector2(512, 512); // Shadow map resolution

/**
 * Visual representation of the sun
 * A glowing sphere mesh that shows where the sun is in the sky
 */
const sunGeometry = new SphereGeometry(2, 32, 32); // Sphere with radius 2
const sunMaterial = new MeshBasicMaterial({ color: 0xffdd00 }); // Bright yellow (unaffected by lighting)
export const sunMesh = new Mesh(sunGeometry, sunMaterial);
sunMesh.position.copy(sun.position); // Position the sun mesh at the light's position