# GigaChad Gym Simulator — Progress

## Original Prompt
GigaChad Gym Simulator - endless gym workout simulator where GigaChad catches falling weights to build Chad Score. Rhythm/timing game meets weightlifting sim in a 3D gym environment.

## Step 1: Scaffold (Complete)

### What was built
- Full Three.js game with event-driven modular architecture
- GigaChad character built from box primitives (wide torso, thick arms, small head)
- Three weight types: dumbbell (blue, 1pt), barbell (red, 3pt), kettlebell (gold, 5pt)
- Protein shake powerup (green glow, 2x multiplier for 8s)
- 3-life system with screen shake on miss
- Combo tracking with visual feedback
- Flex mechanic (Space key) for bonus points during catch
- Difficulty ramp: speed/frequency increase every 10s up to level 15
- Entrance animation: GigaChad bounces in from off-screen
- Gym environment: dark rubber floor, walls with accent stripes, ceiling, dramatic lighting
- Mobile support: virtual joystick + flex button
- Full `render_game_to_text()` with all game state
- `advanceTime(ms)` for testing
- Game over overlay with score, best, combo stats + keyboard restart
- Play.fun safe zone respected on all overlays

### Architecture
- `core/` — Game.js (orchestrator), EventBus.js (18 events), GameState.js, Constants.js
- `gameplay/` — Player.js, WeightManager.js, PowerupManager.js
- `systems/` — InputSystem.js (keyboard + touch)
- `level/` — LevelBuilder.js (gym environment), AssetLoader.js (for future GLB models)
- `ui/` — Menu.js (game over + HUD lives/multiplier/combo)

### Decisions
- Fixed camera (no OrbitControls) — keeps focus on falling weights
- Auto-catch mechanic (no button press needed) — more accessible, especially on mobile
- Flex is optional bonus mechanic, not required to play
- Player built from boxes (Step 2 will replace with 3D models)
- Weights built from basic geometries (Step 2 will improve)

### TODOs for next steps
- [x] Step 1.5: Replace primitives with Meshy AI GLB models
- [ ] Step 3: Add particles (catch sparks, miss impact, combo fire), transitions, screen effects
- [ ] Step 4: Record promo video
- [ ] Step 5: Add BGM (gym beats) + SFX (catch clank, miss thud, powerup chime, flex grunt)
- [ ] Step 6: Deploy to here.now
- [ ] Step 7: Monetize with Play.fun

## Step 1.5: 3D Assets (Complete)

### Models used (all Meshy AI-generated)
- **gigachad.glb** (1.6 MB) — Rigged character with skeleton, base pose
- **gigachad-walk.glb** (1.6 MB) — Walking animation clip
- **gigachad-run.glb** (1.6 MB) — Running animation clip
- **barbell.glb** (1.7 MB) — Red barbell weight prop
- **dumbbell.glb** (715 KB) — Blue dumbbell weight prop
- **kettlebell.glb** (719 KB) — Gold kettlebell weight prop
- **protein-shake.glb** (588 KB) — Green protein shake powerup

### What was changed
- **Constants.js** — Added `MODELS` config section with paths, scales, and rotation for all 7 GLB files
- **Player.js** — Replaced primitive box character with rigged GLB model using `SkeletonUtils.clone()` via `loadAnimatedModel()`. Walk/run animations loaded from separate GLB files. `AnimationMixer` drives smooth `fadeToAction()` transitions between idle and walk states. Primitive box model retained as `.catch()` fallback
- **WeightManager.js** — All 3 weight types (dumbbell, barbell, kettlebell) now load GLB models via `loadModel()`. Models are cloned per spawn with independent materials for opacity fading on catch. Primitive geometries retained as fallback
- **PowerupManager.js** — Protein shake GLB loaded and cloned per spawn. Green glow sphere preserved around the model. Primitive cylinder fallback retained
- **Game.js** — Added `preloadAll()` call before `startGame()` that loads all 7 GLB paths in parallel. Render loop starts immediately (gym environment visible during load). Game begins after preload completes (or gracefully falls back on failure)

### Scale/orientation adjustments
- GigaChad: scale 2.0, rotationY = Math.PI (Meshy models face +Z, flipped to face camera)
- Weights: dumbbell 0.8, barbell 0.5, kettlebell 0.7 (scaled to match game proportions)
- Protein shake: scale 0.8
- All models auto-aligned to floor via bounding box calculation (`position.y = -bbox.min.y`)

### Issues / Notes
- Animation clip names from Meshy vary per model — clips logged to console on load for debugging
- Walk/run clips loaded from separate GLB files (Meshy exports animations as separate files)
- All model loads have `.catch()` fallback to original primitive geometries — game fully playable even if all GLBs fail to load
- Materials cloned per instance for weight fade-out animation (opacity changes must be independent)
