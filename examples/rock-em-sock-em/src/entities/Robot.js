// =============================================================================
// Robot.js — Builds a boxing robot from a GLB model with primitive fallback
//
// Each robot is a THREE.Group with named child groups for animation:
//   - body, head, leftArm, rightArm, leftGlove, rightGlove, legs
// The head group can be animated upward for the "head pop" knockout.
// Gloves animate forward for punches.
//
// GLB models are static (not rigged) — the existing AnimationSystem drives
// all motion by manipulating group positions/rotations programmatically.
// =============================================================================

import * as THREE from 'three';
import { ROBOT, MODELS } from '../core/Constants.js';
import { loadModel } from '../level/AssetLoader.js';

/**
 * Create a robot mesh group with GLB model + animation helper groups.
 * Tries to load the GLB model first; falls back to primitives on error.
 *
 * @param {{ body: number, dark: number, glove: number, accent: number }} colors
 * @param {boolean} facingPositiveZ — true if robot faces +Z (toward camera)
 * @param {'player'|'opponent'} role — which robot to load
 * @returns {Promise<THREE.Group>} Robot group with named parts
 */
export async function createRobot(colors, facingPositiveZ, role) {
  const group = new THREE.Group();
  const facing = facingPositiveZ ? 1 : -1;

  // Determine which model config to use
  const modelConfig = role === 'player' ? MODELS.BLUE_BOMBER : MODELS.RED_ROCKER;

  // --- Create invisible animation helper groups ---
  // These exist purely for the AnimationSystem to target transforms.
  // They are positioned at the same locations the primitives would be.

  // Body helper (for idle bob)
  const bodyHelper = new THREE.Object3D();
  bodyHelper.position.y = ROBOT.BODY_Y;
  group.add(bodyHelper);
  group.userData.body = bodyHelper;

  // Head group (for head pop animation)
  const headGroup = new THREE.Group();
  headGroup.position.y = ROBOT.HEAD_Y;
  group.add(headGroup);
  group.userData.headGroup = headGroup;

  // Left arm group (for block animation)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-ROBOT.ARM_OFFSET_X, ROBOT.ARM_Y, 0);
  group.add(leftArmGroup);
  group.userData.leftArmGroup = leftArmGroup;

  // Left glove (for punch animation)
  const leftGlove = new THREE.Object3D();
  leftGlove.position.set(0, 0, facing * ROBOT.GLOVE_REST_Z);
  leftArmGroup.add(leftGlove);
  group.userData.leftGlove = leftGlove;

  // Right arm group (for block animation)
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(ROBOT.ARM_OFFSET_X, ROBOT.ARM_Y, 0);
  group.add(rightArmGroup);
  group.userData.rightArmGroup = rightArmGroup;

  // Right glove (for punch animation)
  const rightGlove = new THREE.Object3D();
  rightGlove.position.set(0, 0, facing * ROBOT.GLOVE_REST_Z);
  rightArmGroup.add(rightGlove);
  group.userData.rightGlove = rightGlove;

  // Store facing and colors
  group.userData.facing = facing;
  group.userData.colors = colors;
  group.userData.leftGloveRest = leftGlove.position.clone();
  group.userData.rightGloveRest = rightGlove.position.clone();

  // --- Try to load GLB model ---
  let glbLoaded = false;
  try {
    const model = await loadModel(modelConfig.path);

    // Apply scale
    const scale = modelConfig.scale;
    model.scale.set(scale, scale, scale);

    // Apply rotation so the model faces the correct direction
    model.rotation.y = modelConfig.rotationY;

    // Force world matrix update so bounding box accounts for scale + rotation
    model.updateMatrixWorld(true);

    // Compute bounding box in world space (includes scale and rotation)
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Position model so bottom aligns with y=0 of the wrapper, centered on X/Z
    model.position.y = -box.min.y;
    model.position.x = -center.x;
    model.position.z = -center.z;

    // Enable shadow casting on all meshes
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Wrap model in an animation group.
    // The model retains its centering position inside the wrapper.
    // The AnimationSystem animates the wrapper (position/rotation).
    const glbWrapper = new THREE.Group();
    glbWrapper.add(model);
    group.add(glbWrapper);

    // Store the wrapper as the animation target
    group.userData.glbModel = glbWrapper;
    glbLoaded = true;

    console.log(`[Robot] Loaded ${modelConfig.path} — size: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`);
  } catch (err) {
    console.warn(`[Robot] Failed to load ${modelConfig.path}, using primitive fallback:`, err.message);
  }

  // --- Primitive fallback (only if GLB failed) ---
  if (!glbLoaded) {
    buildPrimitiveRobot(group, colors, facing);
  }

  return group;
}

/**
 * Build primitive geometry robot as fallback.
 * This is the original implementation — box/cylinder/sphere shapes.
 */
function buildPrimitiveRobot(group, colors, facing) {
  const bodyMat = new THREE.MeshLambertMaterial({ color: colors.body });
  const darkMat = new THREE.MeshLambertMaterial({ color: colors.dark });
  const gloveMat = new THREE.MeshLambertMaterial({ color: colors.glove });
  const accentMat = new THREE.MeshLambertMaterial({ color: colors.accent });
  const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: ROBOT.EYE_COLOR });
  const pupilMat = new THREE.MeshLambertMaterial({ color: ROBOT.PUPIL_COLOR });

  // Body
  const bodyGeo = new THREE.BoxGeometry(ROBOT.BODY_WIDTH, ROBOT.BODY_HEIGHT, ROBOT.BODY_DEPTH);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = ROBOT.BODY_Y;
  body.castShadow = true;
  group.add(body);
  // Wire up the userData.body to the actual mesh for the primitive path
  group.userData.body = body;

  // Chest plate accent
  const chestGeo = new THREE.BoxGeometry(ROBOT.BODY_WIDTH * 0.7, ROBOT.BODY_HEIGHT * 0.5, ROBOT.BODY_DEPTH * 0.05);
  const chest = new THREE.Mesh(chestGeo, accentMat);
  chest.position.set(0, ROBOT.BODY_Y + 0.05, facing * (ROBOT.BODY_DEPTH / 2 + 0.01));
  group.add(chest);

  // Head group
  const headGroup = group.userData.headGroup;
  const headGeo = new THREE.BoxGeometry(ROBOT.HEAD_SIZE, ROBOT.HEAD_SIZE, ROBOT.HEAD_SIZE);
  const head = new THREE.Mesh(headGeo, darkMat);
  head.castShadow = true;
  headGroup.add(head);

  // Jaw
  const jawGeo = new THREE.BoxGeometry(ROBOT.HEAD_SIZE * 0.8, ROBOT.HEAD_SIZE * 0.3, ROBOT.HEAD_SIZE * 0.6);
  const jaw = new THREE.Mesh(jawGeo, bodyMat);
  jaw.position.y = -ROBOT.HEAD_SIZE * 0.25;
  headGroup.add(jaw);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(ROBOT.EYE_RADIUS, 8, 8);
  const pupilGeo = new THREE.SphereGeometry(ROBOT.EYE_RADIUS * 0.5, 6, 6);
  [-1, 1].forEach(side => {
    const eyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeWhite.position.set(side * ROBOT.EYE_OFFSET_X, ROBOT.EYE_Y - ROBOT.HEAD_Y, facing * ROBOT.EYE_Z);
    headGroup.add(eyeWhite);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(side * ROBOT.EYE_OFFSET_X, ROBOT.EYE_Y - ROBOT.HEAD_Y, facing * (ROBOT.EYE_Z + ROBOT.EYE_RADIUS * 0.5));
    headGroup.add(pupil);
  });

  // Shoulders
  const shoulderGeo = new THREE.SphereGeometry(ROBOT.ARM_RADIUS * 1.3, 8, 8);
  [-1, 1].forEach(side => {
    const shoulder = new THREE.Mesh(shoulderGeo, darkMat);
    shoulder.position.set(side * (ROBOT.BODY_WIDTH / 2 + ROBOT.ARM_RADIUS), ROBOT.ARM_Y + 0.1, 0);
    group.add(shoulder);
  });

  // Arms + Gloves (add meshes into the existing helper groups)
  const armGeo = new THREE.CylinderGeometry(ROBOT.ARM_RADIUS, ROBOT.ARM_RADIUS, ROBOT.ARM_LENGTH, 8);
  const gloveGeo = new THREE.SphereGeometry(ROBOT.GLOVE_RADIUS, 10, 10);

  // Left arm
  const leftArmGroup = group.userData.leftArmGroup;
  const leftArm = new THREE.Mesh(armGeo, darkMat);
  leftArm.rotation.z = Math.PI / 2 * 0.3;
  leftArm.rotation.x = facing * -0.3;
  leftArm.castShadow = true;
  leftArmGroup.add(leftArm);

  const leftGloveMesh = new THREE.Mesh(gloveGeo, gloveMat);
  leftGloveMesh.castShadow = true;
  group.userData.leftGlove.add(leftGloveMesh);

  // Right arm
  const rightArmGroup = group.userData.rightArmGroup;
  const rightArm = new THREE.Mesh(armGeo, darkMat);
  rightArm.rotation.z = -Math.PI / 2 * 0.3;
  rightArm.rotation.x = facing * -0.3;
  rightArm.castShadow = true;
  rightArmGroup.add(rightArm);

  const rightGloveMesh = new THREE.Mesh(gloveGeo, gloveMat);
  rightGloveMesh.castShadow = true;
  group.userData.rightGlove.add(rightGloveMesh);

  // Legs
  const legGeo = new THREE.CylinderGeometry(ROBOT.LEG_RADIUS, ROBOT.LEG_RADIUS * 1.1, ROBOT.LEG_LENGTH, 8);
  [-1, 1].forEach(side => {
    const leg = new THREE.Mesh(legGeo, darkMat);
    leg.position.set(side * ROBOT.LEG_OFFSET_X, ROBOT.LEG_Y, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  // Feet
  const footGeo = new THREE.BoxGeometry(0.18, 0.1, 0.28);
  [-1, 1].forEach(side => {
    const foot = new THREE.Mesh(footGeo, darkMat);
    foot.position.set(side * ROBOT.LEG_OFFSET_X, 0.15, facing * 0.05);
    foot.castShadow = true;
    group.add(foot);
  });
}

/**
 * Dispose all geometries and materials in a robot group.
 */
export function disposeRobot(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
