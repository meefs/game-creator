// =============================================================================
// LevelBuilder.js — Constructs the boxing ring and arena environment
//
// Boxing ring with platform, ropes, corner posts, and arena lighting.
// =============================================================================

import * as THREE from 'three';
import { RING, COLORS } from '../core/Constants.js';

export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;
    this.meshes = [];

    this.buildFloor();
    this.buildRingPlatform();
    this.buildRopes();
    this.buildCornerPosts();
    this.buildLighting();
  }

  buildFloor() {
    // Dark arena floor
    const floorGeo = new THREE.PlaneGeometry(RING.FLOOR_SIZE, RING.FLOOR_SIZE);
    const floorMat = new THREE.MeshLambertMaterial({ color: RING.FLOOR_COLOR });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);
    this.meshes.push(floor);
  }

  buildRingPlatform() {
    // Raised platform
    const platformGeo = new THREE.BoxGeometry(
      RING.PLATFORM_WIDTH,
      RING.PLATFORM_HEIGHT,
      RING.PLATFORM_DEPTH
    );
    const platformMat = new THREE.MeshLambertMaterial({ color: RING.PLATFORM_COLOR });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.y = RING.PLATFORM_HEIGHT / 2;
    platform.receiveShadow = true;
    platform.castShadow = true;
    this.scene.add(platform);
    this.meshes.push(platform);

    // Canvas (top surface)
    const canvasGeo = new THREE.BoxGeometry(
      RING.PLATFORM_WIDTH - 0.1,
      RING.CANVAS_HEIGHT,
      RING.PLATFORM_DEPTH - 0.1
    );
    const canvasMat = new THREE.MeshLambertMaterial({ color: RING.CANVAS_COLOR });
    const canvas = new THREE.Mesh(canvasGeo, canvasMat);
    canvas.position.y = RING.PLATFORM_HEIGHT + RING.CANVAS_HEIGHT / 2;
    canvas.receiveShadow = true;
    this.scene.add(canvas);
    this.meshes.push(canvas);

    // Ring apron (skirt around the platform)
    const apronMat = new THREE.MeshLambertMaterial({ color: 0x222244 });
    const sides = [
      { w: RING.PLATFORM_WIDTH, d: 0.05, x: 0, z: RING.PLATFORM_DEPTH / 2 },
      { w: RING.PLATFORM_WIDTH, d: 0.05, x: 0, z: -RING.PLATFORM_DEPTH / 2 },
      { w: 0.05, d: RING.PLATFORM_DEPTH, x: RING.PLATFORM_WIDTH / 2, z: 0 },
      { w: 0.05, d: RING.PLATFORM_DEPTH, x: -RING.PLATFORM_WIDTH / 2, z: 0 },
    ];
    sides.forEach(({ w, d, x, z }) => {
      const geo = new THREE.BoxGeometry(w, RING.PLATFORM_HEIGHT, d);
      const mesh = new THREE.Mesh(geo, apronMat);
      mesh.position.set(x, RING.PLATFORM_HEIGHT / 2, z);
      this.scene.add(mesh);
      this.meshes.push(mesh);
    });
  }

  buildCornerPosts() {
    const postGeo = new THREE.CylinderGeometry(
      RING.POST_RADIUS, RING.POST_RADIUS, RING.POST_HEIGHT, 8
    );
    const postMat = new THREE.MeshLambertMaterial({ color: RING.POST_COLOR });

    const halfW = RING.PLATFORM_WIDTH / 2 - 0.1;
    const halfD = RING.PLATFORM_DEPTH / 2 - 0.1;
    const corners = [
      [halfW, halfD], [halfW, -halfD],
      [-halfW, halfD], [-halfW, -halfD],
    ];

    // Turnbuckle caps (colored)
    const capGeo = new THREE.SphereGeometry(RING.POST_RADIUS * 1.8, 8, 8);
    const capColors = [0xcc2222, 0x2266cc, 0xcc2222, 0x2266cc];

    corners.forEach(([x, z], i) => {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(x, RING.PLATFORM_HEIGHT + RING.POST_HEIGHT / 2, z);
      post.castShadow = true;
      this.scene.add(post);
      this.meshes.push(post);

      // Cap
      const capMat = new THREE.MeshLambertMaterial({ color: capColors[i] });
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(x, RING.PLATFORM_HEIGHT + RING.POST_HEIGHT + 0.05, z);
      this.scene.add(cap);
      this.meshes.push(cap);
    });
  }

  buildRopes() {
    const ropeGeo = new THREE.CylinderGeometry(
      RING.ROPE_RADIUS, RING.ROPE_RADIUS, 1, 6
    );
    const ropeMat = new THREE.MeshLambertMaterial({ color: RING.ROPE_COLOR });

    const halfW = RING.PLATFORM_WIDTH / 2 - 0.1;
    const halfD = RING.PLATFORM_DEPTH / 2 - 0.1;
    const heights = [RING.ROPE_HEIGHT_1, RING.ROPE_HEIGHT_2, RING.ROPE_HEIGHT_3];

    // Horizontal ropes along each side
    const ropeSides = [
      // Front and back (along X)
      { length: RING.PLATFORM_WIDTH - 0.2, rotZ: 0, rotY: 0, x: 0, z: halfD },
      { length: RING.PLATFORM_WIDTH - 0.2, rotZ: 0, rotY: 0, x: 0, z: -halfD },
      // Left and right (along Z)
      { length: RING.PLATFORM_DEPTH - 0.2, rotZ: 0, rotY: Math.PI / 2, x: halfW, z: 0 },
      { length: RING.PLATFORM_DEPTH - 0.2, rotZ: 0, rotY: Math.PI / 2, x: -halfW, z: 0 },
    ];

    heights.forEach(h => {
      ropeSides.forEach(({ length, rotY, x, z }) => {
        const rope = new THREE.Mesh(ropeGeo, ropeMat);
        rope.scale.y = length;
        rope.rotation.z = Math.PI / 2;
        rope.rotation.y = rotY;
        rope.position.set(x, RING.PLATFORM_HEIGHT + h, z);
        this.scene.add(rope);
        this.meshes.push(rope);
      });
    });
  }

  buildLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(COLORS.AMBIENT_LIGHT, COLORS.AMBIENT_INTENSITY);
    this.scene.add(ambient);

    // Main directional (sun/arena light)
    const dirLight = new THREE.DirectionalLight(COLORS.DIR_LIGHT, COLORS.DIR_INTENSITY);
    dirLight.position.set(3, 8, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 20;
    dirLight.shadow.camera.left = -5;
    dirLight.shadow.camera.right = 5;
    dirLight.shadow.camera.top = 5;
    dirLight.shadow.camera.bottom = -5;
    this.scene.add(dirLight);

    // Overhead spotlight (arena spotlight effect)
    const spot = new THREE.SpotLight(COLORS.SPOT_LIGHT, COLORS.SPOT_INTENSITY);
    spot.position.set(0, 8, 0);
    spot.angle = Math.PI / 4;
    spot.penumbra = 0.5;
    spot.decay = 1.5;
    spot.distance = 20;
    spot.target.position.set(0, 0, 0);
    this.scene.add(spot);
    this.scene.add(spot.target);

    // Colored rim lights for each side
    const blueLight = new THREE.PointLight(0x4488ff, 0.4, 10);
    blueLight.position.set(0, 3, 4);
    this.scene.add(blueLight);

    const redLight = new THREE.PointLight(0xff4444, 0.4, 10);
    redLight.position.set(0, 3, -4);
    this.scene.add(redLight);
  }

  dispose() {
    this.meshes.forEach(mesh => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
    this.meshes = [];
  }
}
