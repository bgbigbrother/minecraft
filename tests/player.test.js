import { describe, test, expect, beforeEach } from '@jest/globals';
import { PlayerBase } from '../scripts/player/base.js';

describe('PlayerBase', () => {
  let player;

  beforeEach(() => {
    player = new PlayerBase();
  });

  test('should create player instance', () => {
    expect(player).toBeDefined();
  });

  test('should have default height of 2', () => {
    expect(player.height).toBe(2);
  });

  test('should have default radius of 0.5', () => {
    expect(player.radius).toBe(0.5);
  });

  test('should have default max speed of 5', () => {
    expect(player.maxSpeed).toBe(5);
  });

  test('should have default jump speed of 10', () => {
    expect(player.jumpSpeed).toBe(10);
  });

  test('should not be sprinting by default', () => {
    expect(player.sprinting).toBe(false);
  });

  test('should not be on ground by default', () => {
    expect(player.onGround).toBe(false);
  });

  test('should have camera', () => {
    expect(player.camera).toBeDefined();
    expect(player.camera.fov).toBe(70);
  });

  test('should have controls', () => {
    expect(player.controls).toBeDefined();
  });

  test('should have raycaster', () => {
    expect(player.raycaster).toBeDefined();
  });

  test('should have tool container', () => {
    expect(player.tool.container).toBeDefined();
    expect(player.tool.animate).toBe(false);
  });

  test('should have character model', () => {
    expect(player.character).toBeDefined();
  });

  test('should have bounds helper', () => {
    expect(player.boundsHelper).toBeDefined();
    expect(player.boundsHelper.visible).toBe(false);
  });

  test('should have selection helper', () => {
    expect(player.selectionHelper).toBeDefined();
  });

  test('should return position from camera', () => {
    player.camera.position.set(10, 20, 30);
    expect(player.position.x).toBe(10);
    expect(player.position.y).toBe(20);
    expect(player.position.z).toBe(30);
  });

  test('should format position as string', () => {
    player.camera.position.set(1.234567, 2.345678, 3.456789);
    const str = player.toString();
    expect(str).toContain('X: 1.235');
    expect(str).toContain('Y: 2.346');
    expect(str).toContain('Z: 3.457');
  });

  test('should have null selected coords by default', () => {
    expect(player.selectedCoords).toBeNull();
  });

  test('should have debug camera disabled by default', () => {
    expect(player.debugCamera).toBe(false);
  });
});
