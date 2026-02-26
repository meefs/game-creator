// =============================================================================
// AnimationSystem.js — Animates robot meshes based on GameState
//
// Reads punch/block/headPop state from GameState and animates:
//   - Gloves extending forward during punches
//   - Arms raising during block
//   - Head popping up on knockout
//   - Idle bob animation
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
  }

  update(delta) {
    this.elapsedTime += delta;

    // --- Idle bob ---
    const bobAmount = Math.sin(this.elapsedTime * 2.5) * 0.02;
    if (!gameState.playerHeadPopped) {
      this.playerRobot.userData.body.position.y = ROBOT.BODY_Y + bobAmount;
    }
    if (!gameState.opponentHeadPopped) {
      this.opponentRobot.userData.body.position.y = ROBOT.BODY_Y + bobAmount * 0.8;
    }

    // --- Player punch animation ---
    this.animatePunch(
      this.playerRobot,
      gameState.playerPunching,
      gameState.playerPunchTimer
    );

    // --- Opponent punch animation ---
    this.animatePunch(
      this.opponentRobot,
      gameState.opponentPunching,
      gameState.opponentPunchTimer
    );

    // --- Player block animation ---
    this.animateBlock(this.playerRobot, gameState.playerBlocking);

    // --- Opponent block animation ---
    this.animateBlock(this.opponentRobot, gameState.opponentBlocking);

    // --- Head pop animations ---
    this.animateHeadPop(
      this.playerRobot,
      gameState.playerHeadPopped,
      this.playerHeadBaseY,
      delta
    );
    this.animateHeadPop(
      this.opponentRobot,
      gameState.opponentHeadPopped,
      this.opponentHeadBaseY,
      delta
    );
  }

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
  }
}
