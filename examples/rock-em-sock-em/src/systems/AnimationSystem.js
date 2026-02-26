// =============================================================================
// AnimationSystem.js — Animates robot meshes based on GameState
//
// Reads punch/block/headPop state from GameState and animates:
//   - Gloves extending forward during punches (primitives) / lunge (GLB)
//   - Arms raising during block (primitives) / tilt back (GLB)
//   - Head popping up on knockout (both primitives and GLB)
//   - Idle bob animation (both)
//
// When a GLB model is present (robot.userData.glbModel), the system animates
// the entire model as a single unit since Meshy AI static models have no
// identifiable sub-parts. When using primitives, it animates individual parts.
// =============================================================================

import { COMBAT, ROBOT } from '../core/Constants.js';
import { gameState } from '../core/GameState.js';

// Temp vars to avoid per-frame allocations
let t = 0;

export class AnimationSystem {
  constructor(playerRobot, opponentRobot) {
    this.playerRobot = playerRobot;
    this.opponentRobot = opponentRobot;
    this.elapsedTime = 0;

    // Store initial head Y for pop animation
    this.playerHeadBaseY = playerRobot.userData.headGroup.position.y;
    this.opponentHeadBaseY = opponentRobot.userData.headGroup.position.y;

    // GLB wrapper groups start at y=0, so base Y for animation offsets is always 0
    this.playerGlbBaseY = 0;
    this.opponentGlbBaseY = 0;
  }

  update(delta) {
    this.elapsedTime += delta;

    const playerHasGlb = !!this.playerRobot.userData.glbModel;
    const opponentHasGlb = !!this.opponentRobot.userData.glbModel;

    // --- Idle bob ---
    const bobAmount = Math.sin(this.elapsedTime * 2.5) * 0.02;

    if (playerHasGlb) {
      // Only apply bob if head is not popped (head pop takes priority on Y)
      if (!gameState.playerHeadPopped) {
        this.playerRobot.userData.glbModel.position.y = bobAmount;
      }
    } else {
      if (!gameState.playerHeadPopped) {
        this.playerRobot.userData.body.position.y = ROBOT.BODY_Y + bobAmount;
      }
    }

    if (opponentHasGlb) {
      if (!gameState.opponentHeadPopped) {
        this.opponentRobot.userData.glbModel.position.y = bobAmount * 0.8;
      }
    } else {
      if (!gameState.opponentHeadPopped) {
        this.opponentRobot.userData.body.position.y = ROBOT.BODY_Y + bobAmount * 0.8;
      }
    }

    // --- Player punch animation ---
    if (playerHasGlb) {
      this.animateGlbPunch(
        this.playerRobot,
        gameState.playerPunching,
        gameState.playerPunchTimer
      );
    } else {
      this.animatePunch(
        this.playerRobot,
        gameState.playerPunching,
        gameState.playerPunchTimer
      );
    }

    // --- Opponent punch animation ---
    if (opponentHasGlb) {
      this.animateGlbPunch(
        this.opponentRobot,
        gameState.opponentPunching,
        gameState.opponentPunchTimer
      );
    } else {
      this.animatePunch(
        this.opponentRobot,
        gameState.opponentPunching,
        gameState.opponentPunchTimer
      );
    }

    // --- Player block animation ---
    if (playerHasGlb) {
      this.animateGlbBlock(this.playerRobot, gameState.playerBlocking);
    } else {
      this.animateBlock(this.playerRobot, gameState.playerBlocking);
    }

    // --- Opponent block animation ---
    if (opponentHasGlb) {
      this.animateGlbBlock(this.opponentRobot, gameState.opponentBlocking);
    } else {
      this.animateBlock(this.opponentRobot, gameState.opponentBlocking);
    }

    // --- Head pop animations ---
    if (playerHasGlb) {
      this.animateGlbHeadPop(
        this.playerRobot,
        gameState.playerHeadPopped,
        this.playerGlbBaseY,
        delta
      );
    } else {
      this.animateHeadPop(
        this.playerRobot,
        gameState.playerHeadPopped,
        this.playerHeadBaseY,
        delta
      );
    }

    if (opponentHasGlb) {
      this.animateGlbHeadPop(
        this.opponentRobot,
        gameState.opponentHeadPopped,
        this.opponentGlbBaseY,
        delta
      );
    } else {
      this.animateHeadPop(
        this.opponentRobot,
        gameState.opponentHeadPopped,
        this.opponentHeadBaseY,
        delta
      );
    }
  }

  // =========================================================================
  // GLB model animations — animate the whole model as a single unit
  // =========================================================================

  /**
   * GLB punch: lunge the whole model forward toward the opponent.
   * Also tilts slightly for a more dynamic feel.
   */
  animateGlbPunch(robot, punchingSide, punchTimer) {
    const wrapper = robot.userData.glbModel;
    const facing = robot.userData.facing;

    if (punchingSide) {
      const progress = 1 - (punchTimer / COMBAT.PUNCH_DURATION);
      t = Math.sin(progress * Math.PI);

      // Lunge the whole model forward toward the opponent
      const targetZ = facing * COMBAT.PUNCH_REACH * 0.6 * t;
      wrapper.position.z += (targetZ - wrapper.position.z) * 0.3;

      // Slight tilt: lean into the punch
      const targetTiltX = t * 0.08 * facing;
      wrapper.rotation.x += (targetTiltX - wrapper.rotation.x) * 0.3;

      // Slight rotation toward punching side
      const targetTiltZ = punchingSide === 'left' ? t * 0.06 : -t * 0.06;
      wrapper.rotation.z += (targetTiltZ - wrapper.rotation.z) * 0.3;
    } else {
      // Return to rest position (wrapper starts at 0,0,0)
      wrapper.position.z += (0 - wrapper.position.z) * 0.15;
      wrapper.rotation.x += (0 - wrapper.rotation.x) * 0.15;
      wrapper.rotation.z += (0 - wrapper.rotation.z) * 0.15;
    }
  }

  /**
   * GLB block: tilt the model back and raise slightly.
   */
  animateGlbBlock(robot, isBlocking) {
    const wrapper = robot.userData.glbModel;
    const facing = robot.userData.facing;

    const targetRotX = isBlocking ? -0.15 * facing : 0;
    const targetY = isBlocking ? 0.08 : 0;

    wrapper.rotation.x += (targetRotX - wrapper.rotation.x) * 0.12;
    // Small upward shift during block
    wrapper.position.y += (targetY - wrapper.position.y) * 0.12;
  }

  /**
   * GLB head pop: the whole model shoots upward and tilts.
   */
  animateGlbHeadPop(robot, isPopped, baseY, delta) {
    const wrapper = robot.userData.glbModel;

    if (isPopped) {
      const targetY = baseY + ROBOT.HEAD_POP_DISTANCE;
      wrapper.position.y += (targetY - wrapper.position.y) * ROBOT.HEAD_POP_SPEED * delta;
      // Tilt backward for dramatic effect
      wrapper.rotation.x += (0.3 - wrapper.rotation.x) * 0.1;
    } else {
      const returnSpeed = COMBAT.HEAD_RESET_SPEED * delta;
      wrapper.position.y += (baseY - wrapper.position.y) * returnSpeed;
      wrapper.rotation.x += (0 - wrapper.rotation.x) * 0.1;
    }
  }

  // =========================================================================
  // Primitive animations — original implementation targeting sub-groups
  // =========================================================================

  /**
   * Animate a punch: glove extends forward, then retracts.
   */
  animatePunch(robot, punchingSide, punchTimer) {
    const facing = robot.userData.facing;
    const leftGlove = robot.userData.leftGlove;
    const rightGlove = robot.userData.rightGlove;
    const leftRest = robot.userData.leftGloveRest;
    const rightRest = robot.userData.rightGloveRest;

    if (punchingSide) {
      // Calculate punch progress (0 to 1, peaks at 0.5)
      const progress = 1 - (punchTimer / COMBAT.PUNCH_DURATION);
      // Sine curve for smooth extend/retract
      t = Math.sin(progress * Math.PI);

      const reach = COMBAT.PUNCH_REACH * t;

      if (punchingSide === 'left') {
        leftGlove.position.z = leftRest.z + facing * reach;
        leftGlove.position.y = leftRest.y + t * 0.1;
        // Other glove stays at rest
        rightGlove.position.copy(rightRest);
      } else {
        rightGlove.position.z = rightRest.z + facing * reach;
        rightGlove.position.y = rightRest.y + t * 0.1;
        leftGlove.position.copy(leftRest);
      }
    } else {
      // Return to rest
      leftGlove.position.lerp(leftRest, 0.2);
      rightGlove.position.lerp(rightRest, 0.2);
    }
  }

  /**
   * Animate block: both arms raise to protect head.
   */
  animateBlock(robot, isBlocking) {
    const leftArmGroup = robot.userData.leftArmGroup;
    const rightArmGroup = robot.userData.rightArmGroup;

    const targetRotX = isBlocking ? -0.6 : 0;
    const targetOffsetX = isBlocking ? -0.15 : 0;

    // Smooth interpolation
    leftArmGroup.rotation.x += (targetRotX - leftArmGroup.rotation.x) * 0.15;
    rightArmGroup.rotation.x += (targetRotX - rightArmGroup.rotation.x) * 0.15;

    // Move arms inward slightly when blocking
    const leftBaseX = -ROBOT.ARM_OFFSET_X;
    const rightBaseX = ROBOT.ARM_OFFSET_X;
    leftArmGroup.position.x += ((leftBaseX - targetOffsetX) - leftArmGroup.position.x) * 0.15;
    rightArmGroup.position.x += ((rightBaseX + targetOffsetX) - rightArmGroup.position.x) * 0.15;

    // Raise arms when blocking
    const targetY = isBlocking ? ROBOT.ARM_Y + 0.25 : ROBOT.ARM_Y;
    leftArmGroup.position.y += (targetY - leftArmGroup.position.y) * 0.15;
    rightArmGroup.position.y += (targetY - rightArmGroup.position.y) * 0.15;
  }

  /**
   * Animate head popping up on knockout.
   */
  animateHeadPop(robot, isPopped, baseY, delta) {
    const headGroup = robot.userData.headGroup;

    if (isPopped) {
      // Animate head upward
      const targetY = baseY + ROBOT.HEAD_POP_DISTANCE;
      headGroup.position.y += (targetY - headGroup.position.y) * ROBOT.HEAD_POP_SPEED * delta;
    } else {
      // Return to base
      const returnSpeed = COMBAT.HEAD_RESET_SPEED * delta;
      headGroup.position.y += (baseY - headGroup.position.y) * returnSpeed;
    }
  }

  /**
   * Update robot references (after restart creates new robots).
   */
  setRobots(playerRobot, opponentRobot) {
    this.playerRobot = playerRobot;
    this.opponentRobot = opponentRobot;
    this.playerHeadBaseY = playerRobot.userData.headGroup.position.y;
    this.opponentHeadBaseY = opponentRobot.userData.headGroup.position.y;
    this.playerGlbBaseY = 0;
    this.opponentGlbBaseY = 0;
  }
}
