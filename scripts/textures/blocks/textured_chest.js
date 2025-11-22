import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

// The chest texture atlas is 256x256 with 4x4 grid (16 total textures, we'll use 8)
// Each chest texture is 64x64 pixels containing an unwrapped chest
// We extract just the front face (lock/latch area) from each chest

const atlasSize = 256;
const chestSize = 64;
// Adjust these values to better center the texture on the block
const frontFaceX = 14; // pixels from left within each 64x64 chest texture (adjusted)
const frontFaceY = 14; // pixels from bottom within each 64x64 chest texture (adjusted)
const frontFaceWidth = 14; // width of front face in pixels (increased to fill block)
const frontFaceHeight = 14; // height of front face in pixels (increased to fill block)

// Bottom face coordinates (where the cross/+ pattern is)
const bottomFaceX = 14; // pixels from left for bottom face
const bottomFaceY = 0; // pixels from bottom for bottom face (top of the unwrap)
const bottomFaceWidth = 14; // width of bottom face
const bottomFaceHeight = 14; // height of bottom face

// Top face coordinates (to the right of the bottom face in the atlas)
const topFaceX = 28; // pixels from left for top face (right of bottom: 14 + 14)
const topFaceY = 0; // pixels from bottom for top face
const topFaceWidth = 14; // width of top face
const topFaceHeight = 14; // height of top face

// Helper function to create a material with UV mapping
function createChestFaceMaterial(col, row, faceType = 'front') {
  const material = new MeshLambertMaterial({ map: textures.chestTexture.clone() });
  
  // Calculate the base position of this chest in the atlas
  const chestBaseX = col * chestSize;
  const chestBaseY = row * chestSize;
  
  // Select coordinates based on face type
  let faceX, faceY, faceWidth, faceHeight;
  if (faceType === 'top') {
    faceX = topFaceX;
    faceY = topFaceY;
    faceWidth = topFaceWidth;
    faceHeight = topFaceHeight;
  } else if (faceType === 'bottom') {
    faceX = bottomFaceX;
    faceY = bottomFaceY;
    faceWidth = bottomFaceWidth;
    faceHeight = bottomFaceHeight;
  } else {
    faceX = frontFaceX;
    faceY = frontFaceY;
    faceWidth = frontFaceWidth;
    faceHeight = frontFaceHeight;
  }
  
  // Add the face offset within the chest
  const absoluteX = chestBaseX + faceX;
  const absoluteY = chestBaseY + faceY;
  
  // Convert to UV coordinates (0-1 range)
  // Y is flipped: row 0 is at top (Y=0.75-1.0), row 3 is at bottom (Y=0-0.25)
  const uvX = absoluteX / atlasSize;
  const uvY = (atlasSize - absoluteY - faceHeight) / atlasSize;
  const uvWidth = faceWidth / atlasSize;
  const uvHeight = faceHeight / atlasSize;
  
  material.map.repeat.set(uvWidth, uvHeight);
  material.map.offset.set(uvX, uvY);
  material.map.needsUpdate = true;
  return material;
}

// Helper to create a block with all faces using the front face of a chest texture
function createChestBlock(id, name, col, row) {
  return {
    id,
    name,
    material: [
      createChestFaceMaterial(col, row, 'front'), // right
      createChestFaceMaterial(col, row, 'front'), // left
      createChestFaceMaterial(col, row, 'top'), // top - left of bottom in atlas
      createChestFaceMaterial(col, row, 'bottom'), // bottom - uses the cross pattern
      createChestFaceMaterial(col, row, 'front'), // front
      createChestFaceMaterial(col, row, 'front')  // back
    ],
    spawnable: true
  };
}

// Create 16 different chest blocks from the atlas (4x4 grid)
// Row 0, Col 0-3 (first 4 chests)
export const texturedChest1 = createChestBlock(17, 'textured_chest_1', 0, 0);
export const texturedChest2 = createChestBlock(18, 'textured_chest_2', 1, 0);
export const texturedChest3 = createChestBlock(19, 'textured_chest_3', 2, 0);
export const texturedChest4 = createChestBlock(20, 'textured_chest_4', 3, 0);

// Row 1, Col 0-3 (next 4 chests)
export const texturedChest5 = createChestBlock(21, 'textured_chest_5', 0, 1);
export const texturedChest6 = createChestBlock(22, 'textured_chest_6', 1, 1);
export const texturedChest7 = createChestBlock(23, 'textured_chest_7', 2, 1);
export const texturedChest8 = createChestBlock(24, 'textured_chest_8', 3, 1);

// Row 2, Col 0-3 (next 4 chests)
export const texturedChest9 = createChestBlock(25, 'textured_chest_9', 0, 2);
export const texturedChest10 = createChestBlock(26, 'textured_chest_10', 1, 2);
export const texturedChest11 = createChestBlock(27, 'textured_chest_11', 2, 2);
export const texturedChest12 = createChestBlock(28, 'textured_chest_12', 3, 2);

// Row 3, Col 0-3 (last 4 chests)
export const texturedChest13 = createChestBlock(29, 'textured_chest_13', 0, 3);
export const texturedChest14 = createChestBlock(30, 'textured_chest_14', 1, 3);
export const texturedChest15 = createChestBlock(31, 'textured_chest_15', 2, 3);
export const texturedChest16 = createChestBlock(32, 'textured_chest_16', 3, 3);
