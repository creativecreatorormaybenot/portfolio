/**
 * LightTracerSystem.js
 *
 * Manages animated light tracers that follow paths.
 * Creates the "light racing along grid lines" effect.
 * Simplified version - focused on clear, visible grid tracers.
 */

import * as THREE from 'three';

/**
 * Individual light tracer with bright head and trailing line
 */
class LightTracer {
  constructor(startPoint, endPoint, options = {}) {
    this.startPoint = startPoint.clone();
    this.endPoint = endPoint.clone();
    this.progress = 0;
    this.speed = options.speed || 0.5;
    this.color = options.color || 0x00d4ff;
    this.trailLength = options.trailLength || 0.15;
    this.delay = options.delay || 0;
    this.onComplete = options.onComplete || null;
    this.isComplete = false;
    this.delayElapsed = 0;
    this.size = options.size || 1.0;

    this.group = new THREE.Group();
    this.createVisuals();
  }

  createVisuals() {
    // Bright head point - larger and more visible
    const headGeo = new THREE.SphereGeometry(0.12 * this.size, 8, 8);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1
    });
    this.head = new THREE.Mesh(headGeo, headMat);

    // Glow around head - more visible
    const glowGeo = new THREE.SphereGeometry(0.3 * this.size, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.head.add(this.glow);

    // Trail line - visible path behind tracer
    const trailPointCount = 20;
    this.trailPositions = new Float32Array(trailPointCount * 3);
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));

    const trailMat = new THREE.LineBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.trail = new THREE.Line(this.trailGeometry, trailMat);

    // Initialize at start position (hidden)
    this.head.position.copy(this.startPoint);
    this.head.visible = false;

    this.group.add(this.head);
    this.group.add(this.trail);
  }

  update(delta) {
    if (this.isComplete) return false;

    // Handle delay
    if (this.delayElapsed < this.delay) {
      this.delayElapsed += delta;
      return true; // Still active, just waiting
    }

    this.head.visible = true;
    this.progress = Math.min(1, this.progress + delta * this.speed);

    const easedProgress = this.easeOutQuad(this.progress);

    // Update head position
    this.head.position.lerpVectors(this.startPoint, this.endPoint, easedProgress);

    // Update trail
    this.updateTrail(easedProgress);

    // Pulse the glow
    const pulse = 0.7 + Math.sin(this.progress * Math.PI * 4) * 0.25;
    this.glow.material.opacity = pulse;

    if (this.progress >= 1) {
      this.isComplete = true;
      if (this.onComplete) this.onComplete();
      return false;
    }

    return true;
  }

  updateTrail(progress) {
    const positions = this.trailPositions;
    const pointCount = positions.length / 3;

    for (let i = 0; i < pointCount; i++) {
      const trailProgress = Math.max(0, progress - (i / pointCount) * this.trailLength);
      const pos = new THREE.Vector3().lerpVectors(
        this.startPoint,
        this.endPoint,
        this.easeOutQuad(trailProgress)
      );

      positions[i * 3] = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;
    }

    this.trailGeometry.attributes.position.needsUpdate = true;
  }

  dispose() {
    this.head.geometry.dispose();
    this.head.material.dispose();
    this.glow.geometry.dispose();
    this.glow.material.dispose();
    this.trailGeometry.dispose();
    this.trail.material.dispose();
  }

  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }
}

/**
 * Manages all light tracers in the scene
 */
export class LightTracerSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.tracerGroup = new THREE.Group();
    this.activeTracers = [];
    this.completedTracers = [];
    this.isActive = false;
    this.simplified = options.simplified || false;

    this.scene.add(this.tracerGroup);
  }

  start() {
    this.isActive = true;
  }

  spawnTracer(startPoint, endPoint, options = {}) {
    if (!this.isActive) return null;

    const tracer = new LightTracer(startPoint, endPoint, options);
    this.activeTracers.push(tracer);
    this.tracerGroup.add(tracer.group);

    return tracer;
  }

  /**
   * Spawn tracers radiating outward on the floor from origin
   * Creates visible "power-on" effect as grid comes alive
   */
  spawnGridTracers(originPoint, gridExtent = 100, spacing = 25) {
    const tracers = [];

    // Fewer tracers for cleaner effect - 8 directions radiating out
    const directions = [
      { x: 0, z: -1 },   // Forward
      { x: 1, z: -1 },   // Forward-right
      { x: 1, z: 0 },    // Right
      { x: -1, z: -1 },  // Forward-left
      { x: -1, z: 0 },   // Left
    ];

    // Main forward tracers - most prominent
    directions.forEach((dir, i) => {
      const isAccent = i === 0; // Forward tracer is accent color
      const distance = gridExtent * (dir.z === 0 ? 0.4 : 1);

      const tracer = this.spawnTracer(
        originPoint.clone(),
        new THREE.Vector3(
          originPoint.x + dir.x * distance * 0.8,
          originPoint.y,
          originPoint.z + dir.z * distance
        ),
        {
          speed: 0.4,
          color: isAccent ? 0xff6600 : 0x00d4ff,
          delay: i * 0.05,
          trailLength: 0.2,
          size: isAccent ? 1.5 : 1.0
        }
      );
      if (tracer) tracers.push(tracer);
    });

    // Additional tracers spread across grid (if not simplified)
    if (!this.simplified) {
      const sideSpacing = spacing;
      for (let x = -gridExtent * 0.5; x <= gridExtent * 0.5; x += sideSpacing) {
        if (Math.abs(x) < 5) continue; // Skip center (already have main tracer)

        const delay = 0.2 + Math.abs(x) / gridExtent * 0.3;
        const tracer = this.spawnTracer(
          new THREE.Vector3(x, originPoint.y, originPoint.z),
          new THREE.Vector3(x, originPoint.y, -gridExtent * 0.7),
          {
            speed: 0.5,
            color: 0x00d4ff,
            delay: delay,
            trailLength: 0.15,
            size: 0.7
          }
        );
        if (tracer) tracers.push(tracer);
      }
    }

    return tracers;
  }

  update(delta) {
    if (!this.isActive) return;

    // Update all active tracers
    this.activeTracers = this.activeTracers.filter(tracer => {
      const stillActive = tracer.update(delta);

      if (!stillActive) {
        // Move to completed, schedule cleanup
        this.completedTracers.push(tracer);
        setTimeout(() => this.cleanupTracer(tracer), 300);
      }

      return stillActive;
    });
  }

  cleanupTracer(tracer) {
    const idx = this.completedTracers.indexOf(tracer);
    if (idx !== -1) {
      this.completedTracers.splice(idx, 1);
      this.tracerGroup.remove(tracer.group);
      tracer.dispose();
    }
  }

  dispose() {
    // Clean up all tracers
    [...this.activeTracers, ...this.completedTracers].forEach(tracer => {
      this.tracerGroup.remove(tracer.group);
      tracer.dispose();
    });
    this.activeTracers = [];
    this.completedTracers = [];
    this.scene.remove(this.tracerGroup);
  }
}
