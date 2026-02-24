import Phaser from 'phaser';
import { PLAYER, GAME, PX, EXPRESSION, EXPRESSION_HOLD_MS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

/**
 * Nick Land player entity.
 * Uses a 4-frame expression spritesheet (normal, happy, angry, surprised).
 * Moves horizontally at the bottom of the screen.
 */
export class Player {
  constructor(scene) {
    this.scene = scene;

    // Create physics sprite from the nick-land spritesheet at the normal frame
    this.sprite = scene.physics.add.sprite(
      PLAYER.START_X,
      PLAYER.START_Y,
      'nick-land',
      EXPRESSION.NORMAL
    );

    // Size the sprite to match design dimensions
    this.sprite.setDisplaySize(PLAYER.WIDTH, PLAYER.HEIGHT);

    // Physics body sized to roughly 80% of the display for fair collision
    const bodyW = PLAYER.WIDTH * 0.8;
    const bodyH = PLAYER.HEIGHT * 0.9;
    this.sprite.body.setSize(
      (bodyW / PLAYER.WIDTH) * 200,   // scale back to frame-pixel space
      (bodyH / PLAYER.HEIGHT) * 300
    );
    // Center the body offset in frame-pixel space
    const offsetX = ((PLAYER.WIDTH - bodyW) / PLAYER.WIDTH) * 200 * 0.5;
    const offsetY = ((PLAYER.HEIGHT - bodyH) / PLAYER.HEIGHT) * 300 * 0.5;
    this.sprite.body.setOffset(offsetX, offsetY);

    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.body.setAllowGravity(false);

    // Depth: gameplay entities at 0+
    this.sprite.setDepth(1);

    // Expression state
    this.currentExpression = EXPRESSION.NORMAL;
    this._expressionTimer = null;

    // Track facing direction for flipX
    this._facingLeft = false;
  }

  /**
   * Change the displayed expression frame.
   * Automatically reverts to NORMAL after holdMs.
   * @param {number} expression - Frame index from EXPRESSION constants
   * @param {number} [holdMs=EXPRESSION_HOLD_MS] - Duration to hold before reverting
   */
  setExpression(expression, holdMs = EXPRESSION_HOLD_MS) {
    // Clear any pending revert timer
    if (this._expressionTimer) {
      this.scene.time.removeEvent(this._expressionTimer);
      this._expressionTimer = null;
    }

    this.currentExpression = expression;
    this.sprite.setFrame(expression);

    // Auto-revert to normal after hold duration (unless already normal)
    if (expression !== EXPRESSION.NORMAL) {
      this._expressionTimer = this.scene.time.delayedCall(holdMs, () => {
        this.currentExpression = EXPRESSION.NORMAL;
        this.sprite.setFrame(EXPRESSION.NORMAL);
        this._expressionTimer = null;
      });
    }
  }

  update(left, right) {
    const body = this.sprite.body;

    // Horizontal movement only
    if (left) {
      body.setVelocityX(-PLAYER.SPEED);
      if (!this._facingLeft) {
        this.sprite.setFlipX(true);
        this._facingLeft = true;
      }
      eventBus.emit(Events.SPECTACLE_ACTION, { direction: 'left' });
    } else if (right) {
      body.setVelocityX(PLAYER.SPEED);
      if (this._facingLeft) {
        this.sprite.setFlipX(false);
        this._facingLeft = false;
      }
      eventBus.emit(Events.SPECTACLE_ACTION, { direction: 'right' });
    } else {
      body.setVelocityX(0);
    }

    // No vertical movement -- player stays at bottom
    body.setVelocityY(0);
  }

  reset() {
    this.sprite.setPosition(PLAYER.START_X, PLAYER.START_Y);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setFlipX(false);
    this._facingLeft = false;
    this.setExpression(EXPRESSION.NORMAL);
  }

  destroy() {
    if (this._expressionTimer) {
      this.scene.time.removeEvent(this._expressionTimer);
      this._expressionTimer = null;
    }
    this.sprite.destroy();
  }
}
