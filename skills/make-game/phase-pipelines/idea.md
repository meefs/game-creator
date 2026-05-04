# Idea phase

Help the user shape a fuzzy idea into a concrete plan: gameplay loop, art style, engine choice, and a written `docs/gameplan.md` + `docs/tech.md` + first ADR. This phase ends when those docs exist and the user is ready to scaffold.

## When to use

- The user has a game idea but no codebase yet
- A project directory exists but `docs/gameplan.md` is missing
- The user wants to revisit the core concept (rare — usually triggers an ADR rather than a re-run of this phase)

## Inputs

- The user's idea, however vague
- (Optional) Concept art, lore, mood references the user provides
- The user's prior experience with engines, languages, art tooling

## Steps

**1. Discuss the gameplay loop**

- What does the loop look like for a player from start to finish? Single-player story? Board-like? Strategy? Roguelike? Make sure the user is not trying to do too much.
- How does this stand out from existing games in its category? What's the hook?
- What aspects do players of this genre look for, and how does this idea include them?

This is the highest-leverage step in the whole skill. Misalignment here causes the most refactoring later. Use `AskUserQuestion` with multiple-choice options when the user seems uncertain — pulling from concrete examples helps them sharpen their own answer.

**2. Discuss the art style**

- 3D? Pixel-art 2D? 2.5D? Text-based? Each implies a different engine shortlist.
- Does the user have artistic experience, or do they intend to make assets themselves?
- Are AI-generated placeholders acceptable during development?

**3. Discuss the engine and stack**

Use answers from steps 1 and 2 to narrow engine candidates. Also factor in the user's existing experience — a JS/TS dev with no game-engine background is usually better off with Phaser or Three.js than starting fresh in Unity. Present 2–3 options with pros/cons (language, GUI editor, ecosystem, asset pipeline) and let the user choose.

**4. Solidify the plan**

Resolve any open questions, then write the plan. The plan must include:

- **Pitch** — 1–2 sentences with a hook
- **Core gameplay loop** — start to finish, named verbs
- **Game rules** — only those a player or developer must know
- **Art style** — perspective, palette, mood, references
- **Tech stack** — engine, language, libraries, test framework
- **Open questions** — anything still unresolved

Write this to `docs/gameplan.md` using the [doc skeleton](../templates/gameplan.md). Write the stack to `docs/tech.md` using [its skeleton](../templates/tech.md). Create `docs/architectural-decisions/` and write `0001-engine-and-stack.md` using the [ADR skeleton](../templates/adr.md) — locking engine/language/art-style here is the highest-leverage anti-drift act in the whole project.

**5. Hand off to scaffold phase**

If the project directory does not exist yet, ask the user for permission to create it, then write `docs/` there. Tell the user to start a new session in that directory and provide a short prompt to resume from. Do not start scaffolding from a different working directory.

## Outputs

- `docs/gameplan.md`
- `docs/tech.md`
- `docs/architectural-decisions/0001-engine-and-stack.md`
- (If new directory) the project directory with `docs/` populated
- A handoff prompt for the next session

## Exit criteria

- All four bullets above exist on disk
- The user agrees the gameplan reflects their idea
- The user knows the next step is scaffolding (and, if they need to switch directories, has the resume prompt)
