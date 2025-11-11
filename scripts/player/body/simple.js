import { MeshStandardMaterial, BoxGeometry, Mesh, Group } from 'three';

/**
 * Creates a simple blocky character model for third-person view
 * Visible when debug camera is active (F10)
 * @returns {Group} A Three.js group containing the character mesh
 */
export function simpleCharacter() {
    
    // Define materials for different body parts
    const skinMaterial = new MeshStandardMaterial({ color: 0xffcc99 }); // Skin tone for head
    const bodyMaterial = new MeshStandardMaterial({ color: 0x0066cc }); // Blue for torso
    const limbMaterial = new MeshStandardMaterial({ color: 0x888888 }); // Gray for limbs

    // Create head (cube positioned at top)
    const head = new Mesh(
        new BoxGeometry(0.5, 0.5, 0.5),
        skinMaterial
    );
    head.position.y = 2; // Position at top of character

    // Create body/torso (rectangular box)
    const body = new Mesh(
        new BoxGeometry(0.8, 1, 0.4),
        bodyMaterial
    );
    body.position.y = 1.2; // Position below head

    // Create left arm
    const leftArm = new Mesh(
        new BoxGeometry(0.3, 1.3, 0.3),
        limbMaterial
    );
    leftArm.position.set(-0.55, 1.05, 0); // Position on left side of body

    // Create right arm
    const rightArm = new Mesh(
        new BoxGeometry(0.3, 1.3, 0.3),
        limbMaterial
    );
    rightArm.position.set(0.55, 1.05, 0); // Position on right side of body

    // Create left leg
    const leftLeg = new Mesh(
        new BoxGeometry(0.3, 1.4, 0.3),
        limbMaterial
    );
    leftLeg.position.set(-0.2, 0, 0); // Position on left side below body

    // Create right leg
    const rightLeg = new Mesh(
        new BoxGeometry(0.3, 1.4, 0.3),
        limbMaterial
    );
    rightLeg.position.set(0.2, 0, 0); // Position on right side below body

    // Group all body parts together
    const character = new Group();
    character.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    
    // Scale down the character to appropriate size
    character.scale.set(0.7, 0.7, 0.7);
    
    return character;
}