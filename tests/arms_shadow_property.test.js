/**
 * Property-Based Test for Arms Shadow Configuration
 * Tests that shadow properties persist throughout the model's lifecycle
 * 
 * Feature: first-person-arms, Property 15: Shadow Configuration Persistence
 * Validates: Requirements 6.1, 6.2
 */

import { describe, test, expect, beforeEach } from '@jest/globals';
import * as fc from 'fast-check';
import { ToolControllsPlayerBase } from '../scripts/player/tool.js';
import { ANIMATION_STATES } from '../scripts/player/arms_animation_controller.js';
import { Group, Mesh, BoxGeometry, MeshStandardMaterial, AnimationClip } from 'three';

describe('Arms Shadow Configuration Property-Based Tests', () => {
  /**
   * Feature: first-person-arms, Property 15: Shadow Configuration Persistence
   * 
   * For any arms model instance, both castShadow and receiveShadow properties
   * should be true and remain true throughout the model's lifecycle
   * 
   * Validates: Requirements 6.1, 6.2
   */
  test('Property 15: Shadow Configuration Persistence - shadows remain enabled throughout lifecycle', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random sequences of game updates and operations
        fc.array(
          fc.oneof(
            fc.constant({ type: 'update', deltaTime: 0.016 }), // 60 FPS
            fc.constant({ type: 'update', deltaTime: 0.033 }), // 30 FPS
            fc.record({
              type: fc.constant('animation'),
              state: fc.constantFrom(...Object.keys(ANIMATION_STATES)),
              loop: fc.boolean()
            }),
            fc.record({
              type: fc.constant('combatMode'),
              enabled: fc.boolean()
            }),
            fc.constant({ type: 'blockBreak' }),
            fc.constant({ type: 'verifyTransform' })
          ),
          { minLength: 10, maxLength: 100 }
        ),
        async (operations) => {
          // Create player with arms
          const player = new ToolControllsPlayerBase();
          
          // Create mock model with multiple mesh children
          const mockModel = new Group();
          const meshes = [];
          
          // Create 3 meshes as direct children
          for (let i = 0; i < 3; i++) {
            const mesh = new Mesh(
              new BoxGeometry(1, 1, 1),
              new MeshStandardMaterial()
            );
            mesh.name = `ArmsMesh_${i}`;
            mesh.isMesh = true; // Ensure isMesh property is set
            mockModel.add(mesh);
            meshes.push(mesh);
          }
          
          // Create mock animations
          const mockAnimations = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          
          // Initialize arms - this should set castShadow and receiveShadow to true
          player.setArms(mockModel, mockAnimations);
          
          // Property: Immediately after setArms, all meshes should have shadows enabled
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
          
          // Execute random sequence of operations
          for (const operation of operations) {
            switch (operation.type) {
              case 'update':
                player.updateArmsAnimation(operation.deltaTime);
                break;
              
              case 'animation':
                player.playArmsAnimation(operation.state, operation.loop);
                break;
              
              case 'combatMode':
                player.setCombatMode(operation.enabled);
                break;
              
              case 'blockBreak':
                player.onBlockBreak();
                break;
              
              case 'verifyTransform':
                player.verifyArmsTransformInvariance();
                break;
            }
            
            // Property: After each operation, shadows should still be enabled
            for (const mesh of meshes) {
              expect(mesh.castShadow).toBe(true);
              expect(mesh.receiveShadow).toBe(true);
            }
          }
          
          // Property: At the end of the lifecycle, shadows should still be enabled
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
        }
      ),
      { numRuns: 100 } // Run 100 iterations as specified in design document
    );
  });

  /**
   * Additional property test: Shadow configuration persists across save/load cycles
   * This extends Property 15 to cover the save/load functionality
   */
  test('Property 15 Extended: Shadow configuration persists across save/load cycles', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random animation states and combat modes for save/load testing
        fc.record({
          animationState: fc.constantFrom(...Object.keys(ANIMATION_STATES)),
          combatMode: fc.boolean(),
          performOperationsBeforeSave: fc.boolean(),
          performOperationsAfterLoad: fc.boolean()
        }),
        async (testCase) => {
          // Create player with arms
          const player = new ToolControllsPlayerBase();
          
          // Create mock model with mesh children
          const mockModel = new Group();
          const meshes = [
            new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial()),
            new Mesh(new BoxGeometry(1, 1, 1), new MeshStandardMaterial())
          ];
          meshes.forEach(mesh => {
            mesh.isMesh = true; // Ensure isMesh property is set
            mockModel.add(mesh);
          });
          
          // Create mock animations
          const mockAnimations = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          
          // Initialize arms
          player.setArms(mockModel, mockAnimations);
          
          // Property: Shadows enabled after initialization
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
          
          // Set up state before save
          player.playArmsAnimation(testCase.animationState, true);
          player.setCombatMode(testCase.combatMode);
          
          if (testCase.performOperationsBeforeSave) {
            // Perform some operations before save
            player.updateArmsAnimation(0.016);
            player.onBlockBreak();
            player.updateArmsAnimation(0.016);
          }
          
          // Property: Shadows still enabled before save
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
          
          // Save animation state
          const savedState = player.getAnimationState();
          
          // Change state (simulating different gameplay)
          player.playArmsAnimation('IDLE', true);
          player.setCombatMode(!testCase.combatMode);
          
          if (testCase.performOperationsAfterLoad) {
            // Perform operations after state change
            player.updateArmsAnimation(0.033);
            player.verifyArmsTransformInvariance();
          }
          
          // Property: Shadows still enabled after state changes
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
          
          // Restore saved state
          player.setAnimationState(savedState);
          
          // Property: Shadows still enabled after load
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
          
          // Verify combat mode was restored correctly
          expect(player.armsController.combatMode).toBe(testCase.combatMode);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Additional property test: Shadow configuration is set correctly on model with varying mesh counts
   * Tests that the shadow configuration works regardless of model complexity
   */
  test('Property 15 Extended: Shadow configuration works with varying mesh counts', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random mesh counts to test different model complexities
        fc.integer({ min: 1, max: 10 }),
        async (meshCount) => {
          // Create player
          const player = new ToolControllsPlayerBase();
          
          // Create mock model with variable number of meshes
          const mockModel = new Group();
          const meshes = [];
          
          for (let i = 0; i < meshCount; i++) {
            const mesh = new Mesh(
              new BoxGeometry(1, 1, 1),
              new MeshStandardMaterial()
            );
            mesh.name = `Mesh_${i}`;
            mesh.isMesh = true; // Ensure isMesh property is set
            mockModel.add(mesh);
            meshes.push(mesh);
          }
          
          // Create mock animations
          const mockAnimations = Object.values(ANIMATION_STATES).map(name => {
            return new AnimationClip(name, 1.0, []);
          });
          
          // Initialize arms
          player.setArms(mockModel, mockAnimations);
          
          // Property: All meshes should have shadows enabled, regardless of count
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
          
          // Perform some operations
          player.updateArmsAnimation(0.016);
          player.onBlockBreak();
          player.updateArmsAnimation(0.016);
          
          // Property: Shadows should still be enabled after operations
          for (const mesh of meshes) {
            expect(mesh.castShadow).toBe(true);
            expect(mesh.receiveShadow).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
