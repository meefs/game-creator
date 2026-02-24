# Progress

## Game Concept
- **Name**: nick-land-dodger
- **Engine**: Phaser 3
- **Description**: Nick Land (accelerationist philosopher) dodges accelerating falling bits — binary digits, code symbols, and philosophical glyphs that speed up over time. Cyberpunk aesthetic with dark background and neon colors.

## Step 1: Scaffold
- **Entities**: Player.js (Nick Land — dark cloaked philosopher with green glowing eyes), Bit.js (falling text character with neon glow)
- **Events**: GAME_START, GAME_OVER, GAME_RESTART, PLAYER_MOVE, PLAYER_HIT, PLAYER_DIED, BIT_SPAWNED, BIT_DODGED, SPEED_INCREASED, SCORE_CHANGED, PARTICLES_EMIT, SPECTACLE_ENTRANCE/ACTION/HIT/COMBO/STREAK/NEAR_MISS, AUDIO_INIT, MUSIC_MENU/GAMEPLAY/GAMEOVER/STOP, AUDIO_TOGGLE_MUTE
- **Constants keys**: GAME, SAFE_ZONE, PLAYER, BIT, ACCELERATION, COLORS, UI, TRANSITION, NEAR_MISS
- **Scoring system**: Time-based (+1 point per second survived)
- **Fail condition**: Collision with a falling bit
- **Input scheme**: Left/right arrow keys + A/D, mobile tap zones (left half = left, right half = right)
- **Acceleration**: Speed multiplier starts at 1.0, +0.03/sec, caps at 4.0x. Spawn rate decays by 0.985x/sec.

## Characters
- nick-land: NOT in character library — will need photo search or pixel art fallback (Tier 2-5)

## Step 1.5: Assets
- **Character**: nick-land — Tier 3 (3 unique photos, 1 duplicate, photo-composite spritesheet)
- **Spritesheet**: `public/assets/characters/nick-land/nick-land-expressions.png` (800x300, 4 frames at 200x300 each)
- **Frame indices**: 0=normal, 1=happy, 2=angry, 3=surprised
- **Expression wiring**: SCORE_CHANGED->happy, PLAYER_HIT->angry, SPECTACLE_NEAR_MISS->surprised, SPEED_INCREASED->surprised (1000ms hold)
- **Expression auto-revert**: Non-normal expressions revert to normal after EXPRESSION_HOLD_MS (600ms default, 1000ms for speed milestones)
- **Player sprite**: Replaced Graphics-based drawing with spritesheet-based physics sprite using setDisplaySize() and setFlipX() for direction
- **Background**: Enhanced grid at depth -10 + matrix rain effect at depth -5 (20 pooled text objects, 0.1-0.2 alpha, recycling on off-screen)
- **Bits**: Kept as neon text rendering with glow shadows (no change needed — text IS their visual identity)
- **Depth layering**: Background grid at -10, matrix rain at -5, gameplay entities at 0+, player at 1
- **Scene cleanup**: Added shutdown() to GameScene with EventBus listener removal and object destruction to prevent leaks on restart
- **Constants added**: EXPRESSION, EXPRESSION_HOLD_MS, MATRIX_RAIN

## Decisions / Known Issues
- No gravity (GAME.GRAVITY = 0) — bits fall via custom velocity
- Player moves horizontally only at bottom of screen
- Architecture validator flagged minor magic numbers in Bit.js, Player.js, GameOverScene.js (cosmetic constants)
- Monospace font ("Courier New") used for cyberpunk aesthetic
