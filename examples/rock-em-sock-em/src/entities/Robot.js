// =============================================================================
// Robot.js — Builds a boxing robot from Three.js primitives
//
// Each robot is a THREE.Group with named child groups for animation:
//   - body, head, leftArm, rightArm, leftGlove, rightGlove, legs
// The head group can be animated upward for the "head pop" knockout.
// Gloves animate forward for punches.
// =============================================================================

import * as THREE from 'three';
import { ROBOT } from '../core/Constants.js';

/**
 * Create a robot mesh group.
 * @param {{ body: number, dark: number, glove: number, accent: number }} colors
 * @param {boolean} facingPositiveZ — true if robot faces +Z (toward camera)
 * @returns {THREE.Group} Robot group with named parts
 */
export function createRobot(colors, facingPositiveZ) {
  const group = new THREE.Group();
  const facing = facingPositiveZ ? 1 : -1;

  // --- Shared materials ---
  const bodyMat = new THREE.MeshLambertMaterial({ color: colors.body });
  const darkMat = new THREE.MeshLambertMaterial({ color: colors.dark });
  const gloveMat = new THREE.MeshLambertMaterial({ color: colors.glove });
  const accentMat = new THREE.MeshLambertMaterial({ color: colors.accent });
  const eyeWhiteMat = new THREE.MeshLambertMaterial({ color: ROBOT.EYE_COLOR });
  const pupilMat = new THREE.MeshLambertMaterial({ color: ROBOT.PUPIL_COLOR });

  // --- Body ---
  const bodyGeo = new THREE.BoxGeometry(ROBOT.BODY_WIDTH, ROBOT.BODY_HEIGHT, ROBOT.BODY_DEPTH);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = ROBOT.BODY_Y;
  body.castShadow = true;
  group.add(body);
  group.userData.body = body;

  // Chest plate accent
  const chestGeo = new THREE.BoxGeometry(ROBOT.BODY_WIDTH * 0.7, ROBOT.BODY_HEIGHT * 0.5, ROBOT.BODY_DEPTH * 0.05);
  const chest = new THREE.Mesh(chestGeo, accentMat);
  chest.position.set(0, ROBOT.BODY_Y + 0.05, facing * (ROBOT.BODY_DEPTH / 2 + 0.01));
  group.add(chest);

  // --- Head group (animated for head pop) ---
  const headGroup = new THREE.Group();
  headGroup.position.y = ROBOT.HEAD_Y;
  group.add(headGroup);
  group.userData.headGroup = headGroup;

  // Head box
  const headGeo = new THREE.BoxGeometry(ROBOT.HEAD_SIZE, ROBOT.HEAD_SIZE, ROBOT.HEAD_SIZE);
  const head = new THREE.Mesh(headGeo, darkMat);
  head.castShadow = true;
  headGroup.add(head);

  // Jaw / chin accent
  const jawGeo = new THREE.BoxGeometry(ROBOT.HEAD_SIZE * 0.8, ROBOT.HEAD_SIZE * 0.3, ROBOT.HEAD_SIZE * 0.6);
  const jaw = new THREE.Mesh(jawGeo, bodyMat);
  jaw.position.y = -ROBOT.HEAD_SIZE * 0.25;
  headGroup.add(jaw);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(ROBOT.EYE_RADIUS, 8, 8);
  const pupilGeo = new THREE.SphereGeometry(ROBOT.EYE_RADIUS * 0.5, 6, 6);

  [-1, 1].forEach(side => {
    const eyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
    eyeWhite.position.set(
      side * ROBOT.EYE_OFFSET_X,
      ROBOT.EYE_Y - ROBOT.HEAD_Y,
      facing * ROBOT.EYE_Z
    );
    headGroup.add(eyeWhite);

    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    pupil.position.set(
      side * ROBOT.EYE_OFFSET_X,
      ROBOT.EYE_Y - ROBOT.HEAD_Y,
      facing * (ROBOT.EYE_Z + ROBOT.EYE_RADIUS * 0.5)
    );
    headGroup.add(pupil);
  });

  // --- Shoulders (small spheres connecting arms to body) ---
  const shoulderGeo = new THREE.SphereGeometry(ROBOT.ARM_RADIUS * 1.3, 8, 8);
  [-1, 1].forEach(side => {
    const shoulder = new THREE.Mesh(shoulderGeo, darkMat);
    shoulder.position.set(side * (ROBOT.BODY_WIDTH / 2 + ROBOT.ARM_RADIUS), ROBOT.ARM_Y + 0.1, 0);
    group.add(shoulder);
  });

  // --- Arms + Gloves (separate groups for punch animation) ---
  const armGeo = new THREE.CylinderGeometry(ROBOT.ARM_RADIUS, ROBOT.ARM_RADIUS, ROBOT.ARM_LENGTH, 8);
  const gloveGeo = new THREE.SphereGeometry(ROBOT.GLOVE_RADIUS, 10, 10);

  // Left arm group
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-ROBOT.ARM_OFFSET_X, ROBOT.ARM_Y, 0);
  group.add(leftArmGroup);
  group.userData.leftArmGroup = leftArmGroup;

  const leftArm = new THREE.Mesh(armGeo, darkMat);
  leftArm.rotation.z = Math.PI / 2 * 0.3;
  leftArm.rotation.x = facing * -0.3;
  leftArm.castShadow = true;
  leftArmGroup.add(leftArm);

  const leftGlove = new THREE.Mesh(gloveGeo, gloveMat);
  leftGlove.position.set(0, 0, facing * ROBOT.GLOVE_REST_Z);
  leftGlove.castShadow = true;
  leftArmGroup.add(leftGlove);
  group.userData.leftGlove = leftGlove;

  // Right arm group
  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(ROBOT.ARM_OFFSET_X, ROBOT.ARM_Y, 0);
  group.add(rightArmGroup);
  group.userData.rightArmGroup = rightArmGroup;

  const rightArm = new THREE.Mesh(armGeo, darkMat);
  rightArm.rotation.z = -Math.PI / 2 * 0.3;
  rightArm.rotation.x = facing * -0.3;
  rightArm.castShadow = true;
  rightArmGroup.add(rightArm);

  const rightGlove = new THREE.Mesh(gloveGeo, gloveMat);
  rightGlove.position.set(0, 0, facing * ROBOT.GLOVE_REST_Z);
  rightGlove.castShadow = true;
  rightArmGroup.add(rightGlove);
  group.userData.rightGlove = rightGlove;

  // --- Legs ---
  const legGeo = new THREE.CylinderGeometry(ROBOT.LEG_RADIUS, ROBOT.LEG_RADIUS * 1.1, ROBOT.LEG_LENGTH, 8);
  [-1, 1].forEach(side => {
    const leg = new THREE.Mesh(legGeo, darkMat);
    leg.position.set(side * ROBOT.LEG_OFFSET_X, ROBOT.LEG_Y, 0);
    leg.castShadow = true;
    group.add(leg);
  });

  // Feet (flat boxes)
  const footGeo = new THREE.BoxGeometry(0.18, 0.1, 0.28);
  [-1, 1].forEach(side => {
    const foot = new THREE.Mesh(footGeo, darkMat);
    foot.position.set(side * ROBOT.LEG_OFFSET_X, 0.15, facing * 0.05);
    foot.castShadow = true;
    group.add(foot);
  });

  // Store facing direction and rest positions for animation
  group.userData.facing = facing;
  group.userData.colors = colors;

  // Store rest positions for gloves (local to arm group)
  group.userData.leftGloveRest = leftGlove.position.clone();
  group.userData.rightGloveRest = rightGlove.position.clone();

  return group;
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
