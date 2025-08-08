import * as THREE from 'three';

export class Water extends THREE.Group {
  params = {
    waterOffset: 4
  }

  constructor(size, params) {
    super();
    this.size = size;
    this.params = params;
  }

  generate() {
    const material = new THREE.MeshStandardMaterial({
      color: 0x3030f2,          // Base water color
      transparent: true,        // Enable transparency
      opacity: 0.8,             // Slightly transparent
      metalness: 0.8,           // For reflective properties
      roughness: 0.2,           // Slight roughness for realism
      side: THREE.DoubleSide    // Render both sides
    });

    const waterMesh = new THREE.Mesh(new THREE.PlaneGeometry(), material);
    waterMesh.rotateX(-Math.PI / 2.0);
    waterMesh.position.set(
      this.size.width / 2,
      this.params.waterOffset + 0.4,
      this.size.width / 2
    );
    waterMesh.scale.set(this.size.width, this.size.width, 1);
    waterMesh.layers.set(1);

    this.add(waterMesh);
  }
}