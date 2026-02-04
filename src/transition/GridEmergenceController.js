/**
 * GridEmergenceController.js
 *
 * Handles the radial grid drawing and wall tracing animations.
 * Grid lines draw outward from center, walls trace upward.
 * Runs in parallel with LightTracerSystem.
 */

import * as THREE from 'three';

export class GridEmergenceController {
  constructor(options = {}) {
    this.config = {
      duration: 2.0, // seconds for grid emergence (compressed timeline)
      phases: {
        ignition: { start: 0, end: 0.15 },      // Quick spark (150ms)
        floorRadial: { start: 0.1, end: 0.8 },  // Grid draws fast (700ms)
        wallsUp: { start: 0.6, end: 1.5 },      // Walls trace up (overlaps floor)
        ceiling: { start: 1.2, end: 2.0 }       // Ceiling completes (background)
      },
      ...options
    };

    this.startTime = null;
    this.isActive = false;
    this.isComplete = false;

    // Scene references (set via init)
    this.scene = null;
    this.gridFloor = null;
    this.corridor = null;

    // Ignition point (temporary visual)
    this.ignitionPoint = null;
  }

  init(scene, { gridFloor, corridor }) {
    this.scene = scene;
    this.gridFloor = gridFloor;
    this.corridor = corridor;

    // Initially hide all elements
    this.setGridOpacity(0);
    this.setCorridorOpacity(0);
  }

  start() {
    this.startTime = performance.now() * 0.001;
    this.isActive = true;
    this.createIgnitionPoint();
  }

  update(time) {
    if (!this.isActive || this.isComplete) return;

    const elapsed = time - this.startTime;
    const progress = Math.min(1, elapsed / this.config.duration);

    this.updateIgnition(elapsed);
    this.updateFloorRadial(elapsed);
    this.updateWallsUp(elapsed);
    this.updateCeiling(elapsed);

    if (progress >= 1 && !this.isComplete) {
      this.complete();
    }
  }

  createIgnitionPoint() {
    // Central spark point
    const geo = new THREE.SphereGeometry(0.2, 16, 16);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending
    });
    this.ignitionPoint = new THREE.Mesh(geo, mat);
    this.ignitionPoint.position.set(0, 0.1, 0);

    // Glow ring
    const ringGeo = new THREE.RingGeometry(0.3, 1.5, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    this.ignitionPoint.add(ring);

    // Outer bloom
    const bloomGeo = new THREE.RingGeometry(1.0, 3.0, 32);
    const bloomMat = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const bloom = new THREE.Mesh(bloomGeo, bloomMat);
    bloom.rotation.x = -Math.PI / 2;
    this.ignitionPoint.add(bloom);

    this.scene.add(this.ignitionPoint);
  }

  updateIgnition(elapsed) {
    const { start, end } = this.config.phases.ignition;
    if (elapsed < start || !this.ignitionPoint) return;

    const progress = Math.min(1, (elapsed - start) / (end - start));

    // Pulse outward then fade
    const scale = 1 + this.easeOutCubic(progress) * 8;
    this.ignitionPoint.scale.setScalar(scale);
    this.ignitionPoint.material.opacity = 1 - progress;

    // Fade children too
    this.ignitionPoint.children.forEach(child => {
      if (child.material) {
        child.material.opacity = (1 - progress) * 0.5;
      }
    });

    // Remove when done
    if (progress >= 1) {
      this.scene.remove(this.ignitionPoint);
      this.ignitionPoint.geometry.dispose();
      this.ignitionPoint.material.dispose();
      this.ignitionPoint = null;
    }
  }

  updateFloorRadial(elapsed) {
    const { start, end } = this.config.phases.floorRadial;
    if (elapsed < start) return;

    const progress = Math.min(1, (elapsed - start) / (end - start));
    const easedProgress = this.easeOutCubic(progress);

    // Radial reveal - calculate current radius
    const maxRadius = 250;
    const currentRadius = easedProgress * maxRadius;

    // Update floor grid - works with both GridHelper and custom lines
    if (this.gridFloor) {
      // Handle GridHelper (the built-in grid)
      this.gridFloor.traverse(child => {
        if (child.isGridHelper || child.type === 'GridHelper') {
          // GridHelper doesn't support per-line animation, so just fade it in
          if (child.material) {
            const targetOpacity = child.userData?.baseOpacity || 0.3;
            child.material.opacity = easedProgress * targetOpacity;
          }
        } else if (child.isMesh && child.geometry?.type === 'PlaneGeometry') {
          // Floor plane
          if (child.material) {
            const targetOpacity = child.userData?.baseOpacity || 0.9;
            child.material.opacity = easedProgress * targetOpacity;
          }
        }
      });
    }
  }

  updateWallsUp(elapsed) {
    const { start, end } = this.config.phases.wallsUp;
    if (elapsed < start) return;

    const progress = Math.min(1, (elapsed - start) / (end - start));
    const easedProgress = this.easeOutQuad(progress);

    // Reveal corridor walls - traverse all lines
    if (this.corridor) {
      this.corridor.traverse(child => {
        if (child.isLine || child.type === 'Line' || child.type === 'LineSegments') {
          if (child.material) {
            const targetOpacity = child.userData?.baseOpacity || child.material.userData?.baseOpacity || 0.5;
            child.material.opacity = easedProgress * targetOpacity;
          }
        }
      });
    }
  }

  updateCeiling(elapsed) {
    const { start, end } = this.config.phases.ceiling;
    if (elapsed < start) return;

    const progress = Math.min(1, (elapsed - start) / (end - start));

    // Ceiling is part of corridor, already handled by wallsUp
    // This phase just ensures everything is fully visible
    if (progress >= 1) {
      this.setCorridorOpacity(1);
    }
  }

  setGridOpacity(opacity) {
    if (!this.gridFloor) return;
    this.gridFloor.traverse(child => {
      if (child.material) {
        const baseOpacity = child.userData?.baseOpacity ||
          child.material.userData?.baseOpacity ||
          (child.isGridHelper ? 0.3 : 0.9);
        child.material.opacity = opacity * baseOpacity;
      }
    });
  }

  setCorridorOpacity(opacity) {
    if (!this.corridor) return;
    this.corridor.traverse(child => {
      if (child.material) {
        const baseOpacity = child.userData?.baseOpacity ||
          child.material.userData?.baseOpacity || 0.5;
        child.material.opacity = opacity * baseOpacity;
      }
    });
  }

  complete() {
    this.isComplete = true;
    this.isActive = false;

    // Ensure everything is fully visible
    this.setGridOpacity(1);
    this.setCorridorOpacity(1);

    // Cleanup ignition if still exists
    if (this.ignitionPoint && this.ignitionPoint.parent) {
      this.scene.remove(this.ignitionPoint);
      this.ignitionPoint = null;
    }
  }

  // Easing functions
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
}
