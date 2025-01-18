import { SRGBColorSpace, NearestFilter, TextureLoader } from 'three';

const textureLoader = new TextureLoader();

export function loadTexture(path) {
    const texture = textureLoader.load(path);
    texture.colorSpace = SRGBColorSpace;
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    return texture;
}