---
name: threejs-perf
description: Three.js performance optimization patterns for draw calls, scene traversal, and instancing. Use when optimizing 3D scenes with 100+ repeated objects, thousands of moving entities, or draw calls above 500. Loaded by threejs-game and make-game for performance guidance.
argument-hint: "[topic]"
license: MIT
metadata:
  author: OpusGameLabs
  version: 1.3.0
  tags: [threejs, performance, instancing, draw-calls, optimization]
---

# Three.js Performance Optimization

Performance patterns for Three.js games, backed by measured before/after numbers on Three.js r183.

## Reference Files

- `instancing-static.md` — InstancedMesh for large static repeated objects (19,600 → 1 draw call)
- `instancing-moving.md` — Flat state buffer + batched InstancedMesh writes for moving entities (8,000 entities)
- `templates/` — Baseline vs optimized reference implementations for each pattern

## When to Use This Skill

- Scene has 100+ repeated objects sharing geometry/material
- Draw calls exceed 500 and frame time is unstable
- Thousands of moving entities need per-frame transform updates
- Profile shows scene-graph traversal as a bottleneck

## When NOT to Use

- Object count is low (<50 unique meshes) — simpler code wins
- Every object needs unique materials/shaders that defeat batching
- Geometry differs enough that instancing provides no batching benefit

## Pattern 1: Instancing Large Static Object Sets

**Problem**: Forests, debris, decorations as individual Meshes = unnecessary draw calls.

**Solution**: One `InstancedMesh` per shared geometry+material combo.

**Evidence**: 19,600 draw calls → 1. Traversal p95: 5.39ms → 0.002ms. See `instancing-static.md`.

```js
// Anti-pattern: one Mesh per prop
for (let i = 0; i < 19600; i++) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, 0, z);
  scene.add(mesh); // 19,600 draw calls
}

// Correct: one InstancedMesh
const im = new THREE.InstancedMesh(geometry, material, 19600);
const mat = new THREE.Matrix4();
for (let i = 0; i < 19600; i++) {
  mat.makeTranslation(x, 0, z);
  im.setMatrixAt(i, mat);
}
im.instanceMatrix.needsUpdate = true;
scene.add(im); // 1 draw call
```

## Pattern 2: Moving Entity Update Loops

**Problem**: Thousands of moving actors as individual Meshes = scene-graph churn + transform propagation.

**Solution**: Flat entity state buffer + batched `InstancedMesh.setMatrixAt()` writes.

**Evidence**: 8,000 draw calls → 1. Update p95: 1.11ms → 0.51ms. Traversal p95: 1.75ms → 0.007ms. See `instancing-moving.md`.

```js
// Anti-pattern: per-entity Mesh position writes
meshes.forEach((mesh, i) => {
  mesh.position.x = computeX(i, tick);
  mesh.position.y = computeY(i, tick);
});

// Correct: batched instance matrix writes
const mat = new THREE.Matrix4();
for (let i = 0; i < count; i++) {
  mat.makeTranslation(computeX(i, tick), computeY(i, tick), computeZ(i, tick));
  instancedMesh.setMatrixAt(i, mat);
}
instancedMesh.instanceMatrix.needsUpdate = true;
```

## Decision Tree

```
Is the object repeated 50+ times with same geometry+material?
├── YES → Is it static (no per-frame movement)?
│   ├── YES → Pattern 1: Static InstancedMesh (instancing-static.md)
│   └── NO  → Pattern 2: Moving InstancedMesh with batched writes (instancing-moving.md)
└── NO  → Standard Mesh is fine. Focus on material/geometry reuse.
```

## Measured Results

Numbers below come from Puppeteer runs on Three.js r183, measured over 120 simulation ticks.

| Scenario | Metric | Baseline | Optimized | Improvement |
|----------|--------|----------|-----------|-------------|
| Static World (19.6k) | Draw calls | 19,600 | 1 | 99.99% |
| Static World (19.6k) | Traversal p95 | 5.39ms | 0.002ms | 99.96% |
| Static World (19.6k) | Build p95 | 63.3ms | 3.0ms | 95.3% |
| Moving Entities (8k) | Draw calls | 8,000 | 1 | 99.99% |
| Moving Entities (8k) | Update p95 | 1.11ms | 0.51ms | 54.1% |
| Moving Entities (8k) | Traversal p95 | 1.75ms | 0.007ms | 99.6% |

A benchmark passes if draw calls decreased and traversal p95 did not regress.
