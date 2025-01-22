import { MeshStandardMaterial, BoxGeometry, Mesh, Group } from 'three';

export function simpleCharacter() {
    
    // Materials
    const skinMaterial = new MeshStandardMaterial({ color: 0xffcc99 });
    const bodyMaterial = new MeshStandardMaterial({ color: 0x0066cc });
    const limbMaterial = new MeshStandardMaterial({ color: 0x888888 });

    // Head
    const head = new Mesh(
        new BoxGeometry(0.5, 0.5, 0.5),
        skinMaterial
    );
    head.position.y = 2;

    // Body
    const body = new Mesh(
        new BoxGeometry(0.8, 1, 0.4),
        bodyMaterial
    );
    body.position.y = 1.2;

    // Arms (Rectangular)
    const leftArm = new Mesh(
        new BoxGeometry(0.3, 1.3, 0.3),
        limbMaterial
    );
    leftArm.position.set(-0.55, 1.05, 0);

    const rightArm = new Mesh(
        new BoxGeometry(0.3, 1.3, 0.3),
        limbMaterial
    );
    rightArm.position.set(0.55, 1.05, 0);

    // Legs (Rectangular)
    const leftLeg = new Mesh(
        new BoxGeometry(0.3, 1.4, 0.3),
        limbMaterial
    );
    leftLeg.position.set(-0.2, 0, 0);

    const rightLeg = new Mesh(
        new BoxGeometry(0.3, 1.4, 0.3),
        limbMaterial
    );
    rightLeg.position.set(0.2, 0, 0);

    const character = new Group();

    character.add(head, body, leftArm, rightArm, leftLeg, rightLeg);
    character.scale.set(0.7, 0.7, 0.7);
    return character;
}