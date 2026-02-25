// =============================================================================
// Constants.js — Every magic number, color, timing, speed, and config value.
// Zero hardcoded values in game logic.
// =============================================================================

export const GAME = {
  FOV: 60,
  NEAR: 0.1,
  FAR: 200,
  MAX_DELTA: 0.05,
  MAX_DPR: 2,
};

export const IS_MOBILE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1);

// Play.fun SDK widget renders a 75px fixed bar at top:0, z-index:9999.
// All HTML overlays must account for this with padding-top or safe offset.
export const SAFE_ZONE = {
  TOP_PX: 75,
  TOP_PERCENT: 8,
};

// Arena dimensions
export const ARENA = {
  WIDTH: 20,
  DEPTH: 12,
  GROUND_COLOR: 0x444466,
  WALL_HEIGHT: 0.4,
  WALL_COLOR: 0x6666aa,
  EDGE_GLOW_COLOR: 0x8888ff,
};

// Player (Trump) config
export const PLAYER = {
  SPEED: 8,
  HEALTH: 5,
  THROW_COOLDOWN: 0.5,
  START_X: 0,
  START_Y: 0,
  START_Z: 5,
  COLOR: 0xff6b35,        // Orange — Trump placeholder
  SIZE_W: 0.8,            // Box width
  SIZE_H: 1.8,            // Box height
  SIZE_D: 0.6,            // Box depth
  HIT_RADIUS: 0.6,        // Collision radius
};

// Opponent (Biden) config
export const OPPONENT = {
  SPEED: 4,
  HEALTH: Infinity,
  THROW_INTERVAL: 1.5,
  START_X: 0,
  START_Y: 0,
  START_Z: -5,
  COLOR: 0x3366cc,        // Blue — Biden placeholder
  SIZE_W: 0.8,
  SIZE_H: 1.8,
  SIZE_D: 0.6,
  HIT_RADIUS: 0.6,
  // AI movement pattern
  MOVE_AMPLITUDE: 7,      // How far left/right Biden sways
  MOVE_FREQUENCY: 0.6,    // Oscillation speed
  RANDOM_OFFSET: 2,       // Random jitter amplitude
};

// Projectile config
export const PROJECTILE = {
  SPEED: 15,
  SIZE: 0.3,
  PLAYER_COLOR: 0xff4444,
  OPPONENT_COLOR: 0x4444ff,
  TRAIL_LENGTH: 5,
  TRAIL_OPACITY: 0.3,
  MAX_DISTANCE: 30,       // Remove if traveled too far
};

// Camera config — fixed spectator view
export const CAMERA = {
  POSITION_X: 0,
  POSITION_Y: 8,
  POSITION_Z: 12,
  LOOK_AT_X: 0,
  LOOK_AT_Y: 0,
  LOOK_AT_Z: 0,
};

// Lighting
export const COLORS = {
  SKY: 0x1a1a2e,
  AMBIENT_LIGHT: 0xffffff,
  AMBIENT_INTENSITY: 0.5,
  DIR_LIGHT: 0xffeedd,
  DIR_INTENSITY: 0.9,
  POINT_LIGHT: 0xff6644,
  POINT_INTENSITY: 0.3,
  FOG_COLOR: 0x1a1a2e,
  FOG_NEAR: 15,
  FOG_FAR: 60,
};

// Combo / scoring
export const SCORING = {
  HIT_POINTS: 1,
  COMBO_THRESHOLD: 3,     // Hits needed for combo bonus
  COMBO_BONUS: 2,         // Extra points on combo
  COMBO_TIMEOUT: 3.0,     // Seconds before combo resets
};

// Trump animation clip map (gesture model)
export const TRUMP_CLIPS = {
  idle: 'root|TrumpStillLook_BipTrump',
  clap: 'root|TrumpClap1_BipTrump',
  dance: 'root|Trumpdance1_BipTrump',
  point: 'root|TrumpPoint_BipTrump',
  talk: 'root|TrumpTalk1_BipTrump',
  twist: 'root|TrumpTwist_BipTrump',
};

// Biden animation clip map (gesture model)
export const BIDEN_CLIPS = {
  idle: 'mixamo.com',
};

// Asset paths (populated in Step 1.5 when models are added)
export const ASSET_PATHS = {
  TRUMP_MODEL: 'assets/models/trump.glb',
  BIDEN_MODEL: 'assets/models/biden.glb',
};

// Per-model transforms
export const MODEL_CONFIG = {
  trump: {
    scale: 1,
    offsetY: 0,
    facingOffset: Math.PI,
    clipMap: TRUMP_CLIPS,
  },
  biden: {
    scale: 1,
    offsetY: 0,
    facingOffset: Math.PI,
    clipMap: BIDEN_CLIPS,
  },
};
