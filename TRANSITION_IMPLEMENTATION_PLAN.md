# Combined Loading Transition Implementation Plan

## Executive Summary

This plan combines three GMUNK-inspired Tron: Legacy transition strategies into a cohesive, performant loading experience:

1. **Grid Emergence** (Base Layer - Always Runs) - Grid lines draw outward from center, walls trace upward
2. **Light Line Formation** (Base Layer - Always Runs) - Light tracers race along paths, converge to hero text
3. **Digital Materialization** (Enhancement - Modern Devices Only) - Full-screen shader with noise clearing effect

**Key Design Decisions:**
- **User can interact (scroll) at 1.0 second** - doesn't wait for animations to complete
- **Hero text draws in 500ms** - compliant with Material Design animation guidelines
- **All three effects run in parallel** - creates visual density without extending duration
- **Total animation: 3.0 seconds** - but most happens in the first 1.5s
- **Remaining animations are non-blocking** - walls/tracers finish in background

The base layers work together seamlessly, while the shader enhancement is enabled only on devices that can handle the GPU overhead.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TransitionOrchestrator                           │
│  (Detects device capability, coordinates all transition systems)    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐                │
│  │  GridEmergence       │  │  LightLineFormation  │   BASE LAYER   │
│  │  - Radial grid draw  │  │  - Light tracers     │   (Always)     │
│  │  - Wall trace up     │  │  - Hero convergence  │                │
│  │  - Ceiling draw      │  │  - Trail effects     │                │
│  └──────────────────────┘  └──────────────────────┘                │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  DigitalMaterialization (Post-Processing Shader)            │   │
│  │  - Noise overlay → clarity                                  │   │ ENHANCEMENT
│  │  - Scan lines                                               │   │ (Modern Only)
│  │  - Sector resolution                                        │   │
│  │  [ENABLED ONLY IF: GPU benchmark passes]                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase Timeline (Total: 3.0 seconds, Interactive at 1.0s)

**Design Principles:**
- User can interact (scroll) after just 1.0 second
- Grid emergence and light tracers run in parallel for visual density
- Hero text draw-in is 500ms (Material Design guideline: max 500ms for UI animations)
- Remaining animations are non-blocking eye candy

```
Time:   0.0s      0.5s      1.0s      1.5s      2.0s      2.5s      3.0s
        │         │         │         │         │         │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
LOADING │▓▓▓░░░   │         │         │         │         │         │
SCREEN  │ Fast    │         │         │         │         │         │
        │ fade    │         │         │         │         │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
SHADER* │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░│         │         │
(opt)   │ Noise → Sector Clear (parallel with below)     │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
GRID    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░│         │
EMERGE  │ Ignite + Radial + Walls (compressed, parallel) │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
LIGHT   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░│
TRACERS │ Grid + Corridor tracers (runs WITH grid emerge)│ Settle  │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
HERO    │         │    │▓▓▓▓▓▓▓▓▓▓▓▓▓│░░       │         │         │
TEXT    │         │    500ms draw-in │         │         │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
INTERACT│         │    ════════════════════════════════════════════▶
        │         │    ↑ SCROLL ENABLED @ 1.0s                     │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
SCROLL  │         │         │▓▓▓▓▓▓▓▓▓│         │         │         │
INDIC   │         │         │ Fade In │ (user may already be scrolling)
        └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

* Shader phase only runs on modern devices, does NOT add to total time
```

**Key Timing Decisions:**
- **1.0s**: User can scroll - hero is visible, grid mostly formed
- **1.5s**: Hero text complete - core experience ready
- **2.0s**: Shader finishes - full clarity on capable devices
- **2.5s**: Grid/walls complete - environment fully formed
- **3.0s**: Tracer cleanup - final polish

**Why this works:**
1. The "wow" moment happens in the first second (ignition + rapid grid formation)
2. User isn't blocked - they can scroll as soon as hero is readable
3. Background animations (walls completing, tracers settling) feel like ambient polish
4. If user scrolls early, remaining animations gracefully complete without disruption

---

## File Structure

```
src/
├── main.js                      (MODIFY) - Integrate orchestrator, update render loop
├── TronEnvironment.js           (MODIFY) - Add per-line references, opacity controls
├── TronHeroText.js              (MODIFY) - Add external trigger for draw animation
├── NeonText.js                  (NO CHANGE)
├── data.js                      (NO CHANGE)
├── transition/                  (NEW DIRECTORY)
│   ├── TransitionOrchestrator.js    (NEW) - Main coordinator
│   ├── GridEmergenceController.js   (NEW) - Grid/wall animation
│   ├── LightTracerSystem.js         (NEW) - Light tracer effects
│   ├── MaterializationShader.js     (NEW) - Post-processing shader
│   └── PerformanceDetector.js       (NEW) - Device capability detection
└── index.html                   (MODIFY) - CSS transition classes

```

---

## Implementation Tasks

### Task 1: Performance Detection System
**File:** `src/transition/PerformanceDetector.js`

Creates a lightweight GPU benchmark to determine if the device can handle shader effects.

```javascript
// PerformanceDetector.js
export class PerformanceDetector {
  constructor() {
    this.capabilities = {
      highPerformance: false,
      mediumPerformance: false,
      lowPerformance: true,
      isMobile: false,
      gpuTier: 0, // 0=low, 1=medium, 2=high
      maxParticles: 200,
      enableShader: false,
      enableFullTracers: true
    };
  }

  async detect() {
    // Check for mobile
    this.capabilities.isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      return this.capabilities; // Minimal capabilities
    }

    // Get GPU info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      this.capabilities.gpuTier = this.classifyGPU(renderer);
    }

    // Run mini benchmark (render 100 frames, measure time)
    const benchmarkScore = await this.runBenchmark(gl);

    // Set capabilities based on benchmark
    if (benchmarkScore > 55) { // 55+ FPS
      this.capabilities.highPerformance = true;
      this.capabilities.enableShader = true;
      this.capabilities.maxParticles = 500;
      this.capabilities.gpuTier = 2;
    } else if (benchmarkScore > 30) { // 30-55 FPS
      this.capabilities.mediumPerformance = true;
      this.capabilities.enableShader = !this.capabilities.isMobile; // Shader only on desktop
      this.capabilities.maxParticles = 300;
      this.capabilities.gpuTier = 1;
    } else { // <30 FPS
      this.capabilities.lowPerformance = true;
      this.capabilities.enableShader = false;
      this.capabilities.enableFullTracers = false; // Simplified tracers
      this.capabilities.maxParticles = 100;
      this.capabilities.gpuTier = 0;
    }

    canvas.remove();
    return this.capabilities;
  }

  classifyGPU(renderer) {
    const highEnd = /RTX|RX 6|RX 7|M1|M2|M3|Apple GPU|AMD Radeon Pro/i;
    const midEnd = /GTX 10|GTX 16|RX 5|Intel Iris|Intel UHD/i;

    if (highEnd.test(renderer)) return 2;
    if (midEnd.test(renderer)) return 1;
    return 0;
  }

  async runBenchmark(gl) {
    // Simple shader compilation + draw benchmark
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, `
      attribute vec2 pos;
      void main() { gl_Position = vec4(pos, 0.0, 1.0); }
    `);
    gl.compileShader(vertShader);

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, `
      precision mediump float;
      uniform float time;
      void main() {
        float n = fract(sin(time * 12.9898) * 43758.5453);
        gl_FragColor = vec4(n, n, n, 1.0);
      }
    `);
    gl.compileShader(fragShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');

    // Measure 60 frames
    const frameCount = 60;
    const startTime = performance.now();

    for (let i = 0; i < frameCount; i++) {
      gl.uniform1f(timeLoc, i * 0.016);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.finish(); // Force sync
    }

    const elapsed = performance.now() - startTime;
    const fps = (frameCount / elapsed) * 1000;

    // Cleanup
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);

    return fps;
  }
}
```

**Validation:**
- [ ] Benchmark completes in <500ms
- [ ] Correct classification on desktop Chrome (high-end GPU)
- [ ] Correct classification on iPhone Safari (mobile, likely medium)
- [ ] Correct classification on old Android device (low)

---

### Task 2: Grid Emergence Controller
**File:** `src/transition/GridEmergenceController.js`

Handles the radial grid drawing and wall tracing animations. **Runs in parallel with Light Tracers.**

```javascript
// GridEmergenceController.js
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

    // Ignition point (temporary)
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

    // Remove when done
    if (progress >= 1) {
      this.scene.remove(this.ignitionPoint);
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

    // Update floor grid lines based on distance from center
    if (this.gridFloor?.userData?.lengthwiseLines) {
      this.gridFloor.userData.lengthwiseLines.forEach(line => {
        const dist = line.userData.distanceFromCenter || 0;
        if (dist <= currentRadius) {
          const lineProgress = Math.min(1, (currentRadius - dist) / 40);
          line.material.opacity = this.easeOutQuad(lineProgress) * (line.userData.baseOpacity || 0.3);
        }
      });
    }

    if (this.gridFloor?.userData?.crossLines) {
      this.gridFloor.userData.crossLines.forEach(line => {
        const dist = Math.abs(line.userData.zPosition || 0);
        if (dist <= currentRadius) {
          const lineProgress = Math.min(1, (currentRadius - dist) / 30);
          line.material.opacity = this.easeOutQuad(lineProgress) * (line.userData.baseOpacity || 0.15);
        }
      });
    }

    // Floor plane fades in
    if (this.gridFloor?.userData?.floorPlane) {
      this.gridFloor.userData.floorPlane.material.opacity = progress * 0.9;
    }
  }

  updateWallsUp(elapsed) {
    const { start, end } = this.config.phases.wallsUp;
    if (elapsed < start) return;

    const progress = Math.min(1, (elapsed - start) / (end - start));
    const easedProgress = this.easeOutQuad(progress);

    // Reveal corridor walls from bottom to top
    if (this.corridor?.userData?.wallLines) {
      this.corridor.userData.wallLines.forEach(line => {
        const zDist = Math.abs(15 - (line.userData.zPosition || 0));
        const stagger = Math.max(0, (200 - zDist) / 200) * 0.2;
        const lineProgress = Math.min(1, (progress - stagger) / 0.8);

        if (lineProgress > 0) {
          // Update line visibility (draw from bottom up)
          const drawHeight = this.easeOutQuad(lineProgress) * (line.userData.fullHeight || 25);
          this.updateLineDrawHeight(line, drawHeight);
          line.material.opacity = lineProgress * (line.userData.baseOpacity || 0.4);
        }
      });
    }
  }

  updateCeiling(elapsed) {
    const { start, end } = this.config.phases.ceiling;
    if (elapsed < start) return;

    const progress = Math.min(1, (elapsed - start) / (end - start));

    if (this.corridor?.userData?.ceilingLines) {
      this.corridor.userData.ceilingLines.forEach(line => {
        line.material.opacity = this.easeOutQuad(progress) * (line.userData.baseOpacity || 0.2);
      });
    }
  }

  updateLineDrawHeight(line, height) {
    // For vertical lines, update the Y coordinate of the top vertex
    const positions = line.geometry.attributes.position.array;
    positions[4] = Math.min(height, line.userData.fullHeight || 25);
    line.geometry.attributes.position.needsUpdate = true;
  }

  setGridOpacity(opacity) {
    if (!this.gridFloor) return;
    this.gridFloor.traverse(child => {
      if (child.material) {
        child.material.opacity = opacity * (child.userData.baseOpacity || 1);
      }
    });
  }

  setCorridorOpacity(opacity) {
    if (!this.corridor) return;
    this.corridor.traverse(child => {
      if (child.material) {
        child.material.opacity = opacity * (child.userData.baseOpacity || 1);
      }
    });
  }

  complete() {
    this.isComplete = true;
    this.isActive = false;

    // Ensure everything is fully visible
    this.setGridOpacity(1);
    this.setCorridorOpacity(1);
  }

  easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
}
```

**Validation:**
- [ ] Ignition point appears at center and pulses outward
- [ ] Grid lines draw radially from center
- [ ] Wall lines trace from bottom to top
- [ ] All elements reach full opacity by end of phase
- [ ] No visible z-fighting or flickering

---

### Task 3: Light Tracer System
**File:** `src/transition/LightTracerSystem.js`

Manages animated light tracers that follow paths.

```javascript
// LightTracerSystem.js
import * as THREE from 'three';

class LightTracer {
  constructor(startPoint, endPoint, options = {}) {
    this.startPoint = startPoint.clone();
    this.endPoint = endPoint.clone();
    this.progress = 0;
    this.speed = options.speed || 0.5;
    this.color = options.color || 0x00d4ff;
    this.trailLength = options.trailLength || 0.12;
    this.delay = options.delay || 0;
    this.onComplete = options.onComplete || null;
    this.isComplete = false;
    this.delayElapsed = 0;

    this.group = new THREE.Group();
    this.createVisuals();
  }

  createVisuals() {
    // Bright head
    const headGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1
    });
    this.head = new THREE.Mesh(headGeo, headMat);

    // Glow around head
    const glowGeo = new THREE.SphereGeometry(0.15, 8, 8);
    const glowMat = new THREE.MeshBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending
    });
    this.glow = new THREE.Mesh(glowGeo, glowMat);
    this.head.add(this.glow);

    // Trail line
    const trailPointCount = 20;
    this.trailPositions = new Float32Array(trailPointCount * 3);
    this.trailGeometry = new THREE.BufferGeometry();
    this.trailGeometry.setAttribute('position', new THREE.BufferAttribute(this.trailPositions, 3));

    const trailMat = new THREE.LineBasicMaterial({
      color: this.color,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    this.trail = new THREE.Line(this.trailGeometry, trailMat);

    // Initialize at start position
    this.head.position.copy(this.startPoint);
    this.head.visible = false; // Hidden until delay passes

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

  easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }
}

export class LightTracerSystem {
  constructor(scene, options = {}) {
    this.scene = scene;
    this.tracerGroup = new THREE.Group();
    this.activeTracers = [];
    this.completedTracers = [];
    this.isActive = false;
    this.simplified = options.simplified || false; // For low-end devices

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

  spawnGridTracers(originPoint, gridExtent = 200, spacing = 10) {
    // Spawn tracers radiating outward on the floor
    const tracers = [];

    // X-direction lines
    for (let x = -gridExtent; x <= gridExtent; x += spacing) {
      const delay = Math.abs(x) / gridExtent * 0.3; // Stagger by distance
      const isAccent = x % (spacing * 5) === 0;

      tracers.push(this.spawnTracer(
        originPoint,
        new THREE.Vector3(x, 0.02, -gridExtent),
        {
          speed: 0.4,
          color: isAccent ? 0xff6600 : 0x00d4ff,
          delay: delay
        }
      ));
    }

    // Z-direction lines (spawn after X lines start)
    for (let z = 0; z >= -gridExtent; z -= spacing) {
      const delay = 0.4 + Math.abs(z) / gridExtent * 0.2;

      tracers.push(this.spawnTracer(
        new THREE.Vector3(-gridExtent, 0.02, z),
        new THREE.Vector3(gridExtent, 0.02, z),
        {
          speed: 0.5,
          color: 0x00d4ff,
          delay: delay
        }
      ));
    }

    return tracers;
  }

  spawnCorridorTracers(floorY = 0, ceilingY = 25, corridorWidth = 20, length = 200) {
    const tracers = [];
    const wallX = [corridorWidth / 2, -corridorWidth / 2];

    // Wall tracers - rise from floor to ceiling
    for (let z = 0; z >= -length; z -= 20) {
      wallX.forEach((x, idx) => {
        const delay = 0.8 + Math.abs(z) / length * 0.4;

        tracers.push(this.spawnTracer(
          new THREE.Vector3(x, floorY, z),
          new THREE.Vector3(x, ceilingY, z),
          {
            speed: 0.6,
            color: z % 60 === 0 ? 0xff6600 : 0x00d4ff,
            delay: delay
          }
        ));
      });
    }

    return tracers;
  }

  spawnConvergenceTracers(targetPoint, sourcePoints) {
    const tracers = [];

    sourcePoints.forEach((source, i) => {
      tracers.push(this.spawnTracer(
        source,
        targetPoint,
        {
          speed: 0.8,
          color: 0x00d4ff,
          delay: i * 0.08 // Slight stagger
        }
      ));
    });

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
        setTimeout(() => this.cleanupTracer(tracer), 500);
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
    [...this.activeTracers, ...this.completedTracers].forEach(t => {
      this.tracerGroup.remove(t.group);
      t.dispose();
    });
    this.activeTracers = [];
    this.completedTracers = [];
    this.scene.remove(this.tracerGroup);
  }
}
```

**Validation:**
- [ ] Tracers spawn with correct delay timing
- [ ] Trail renders behind moving head
- [ ] Tracers complete and get cleaned up
- [ ] Memory usage stable (no leaks from continuous spawning)
- [ ] Simplified mode works on low-end devices

---

### Task 4: Digital Materialization Shader
**File:** `src/transition/MaterializationShader.js`

Post-processing shader for the noise-to-clarity effect (modern devices only).

```javascript
// MaterializationShader.js
import * as THREE from 'three';

export const MaterializationShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'uTime': { value: 0.0 },
    'uProgress': { value: 0.0 },
    'uResolution': { value: new THREE.Vector2() },
    'uNoiseScale': { value: 40.0 },
    'uScanLineCount': { value: 6.0 },
    'uPrimaryColor': { value: new THREE.Color(0x00d4ff) },
    'uAccentColor': { value: new THREE.Color(0xff6600) }
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform float uNoiseScale;
    uniform float uScanLineCount;
    uniform vec3 uPrimaryColor;
    uniform vec3 uAccentColor;

    varying vec2 vUv;

    // Hash function
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    // Value noise
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    // Digital noise with scan artifacts
    float digitalNoise(vec2 uv, float time) {
      float n = noise(uv * uNoiseScale + time * 8.0);

      // Horizontal scan artifact
      float scanArtifact = step(0.97, noise(vec2(uv.y * 80.0, time * 4.0)));
      n = mix(n, 1.0, scanArtifact * 0.25);

      return n;
    }

    // Scan line effect
    float scanLine(float y, float progress) {
      float lineProgress = progress * 1.3;
      float dist = abs(y - lineProgress);
      return smoothstep(0.03, 0.0, dist) * step(0.01, lineProgress) * step(lineProgress, 1.1);
    }

    // Sector-based resolution
    float sectorMask(vec2 uv, float progress) {
      vec2 sectorCount = vec2(6.0, 5.0);
      vec2 sectorId = floor(uv * sectorCount);
      vec2 center = sectorCount * 0.5;
      float dist = length(sectorId - center) / length(center);

      float sectorRandom = hash(sectorId) * 0.25;
      float threshold = progress * 1.5 - dist * 0.4 + sectorRandom;

      return smoothstep(0.0, 0.12, threshold);
    }

    void main() {
      vec4 sceneColor = texture2D(tDiffuse, vUv);

      // Early exit if transition complete
      if (uProgress >= 1.0) {
        gl_FragColor = sceneColor;
        return;
      }

      // Generate noise
      float noiseVal = digitalNoise(vUv, uTime);
      vec3 noiseColor = mix(
        vec3(0.0, 0.015, 0.03),
        uPrimaryColor * 0.25,
        noiseVal
      );

      // Calculate reveal masks
      float scanEffect = 0.0;
      for (float i = 0.0; i < 6.0; i++) {
        float offset = i / uScanLineCount;
        scanEffect += scanLine(vUv.y, uProgress - offset * 0.15);
      }
      scanEffect = clamp(scanEffect, 0.0, 1.0);

      float sectorResolved = sectorMask(vUv, uProgress);
      float revealMask = max(sectorResolved, scanEffect * 0.25);
      revealMask = smoothstep(0.0, 1.0, revealMask);

      // Edge flicker
      float edgeFlicker = step(0.35, revealMask) * step(revealMask, 0.65);
      edgeFlicker *= step(0.65, hash(vUv + uTime * 80.0));
      revealMask += edgeFlicker * 0.2;

      // Mix noise and scene
      vec3 finalColor = mix(noiseColor, sceneColor.rgb, revealMask);

      // Scan line glow
      vec3 scanGlow = mix(uPrimaryColor, uAccentColor, step(0.75, scanEffect));
      finalColor += scanGlow * scanEffect * 0.35 * (1.0 - uProgress);

      // Completion flash
      float flash = smoothstep(0.92, 1.0, uProgress) * smoothstep(1.0, 0.92, uProgress + 0.08);
      finalColor += uPrimaryColor * flash * 0.25;

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
};

// Controller for shader transition
export class MaterializationController {
  constructor(shaderPass, options = {}) {
    this.shaderPass = shaderPass;
    this.duration = options.duration || 2.5;
    this.startTime = null;
    this.isActive = false;
    this.isComplete = false;
    this.onComplete = options.onComplete || (() => {});
  }

  start(delay = 0) {
    setTimeout(() => {
      this.startTime = performance.now() * 0.001;
      this.isActive = true;
      this.shaderPass.enabled = true;
    }, delay);
  }

  update(time) {
    if (!this.isActive || this.isComplete) return;

    const elapsed = time - this.startTime;
    const progress = Math.min(1, elapsed / this.duration);
    const easedProgress = this.easeOutCubic(progress);

    this.shaderPass.uniforms.uProgress.value = easedProgress;
    this.shaderPass.uniforms.uTime.value = time;

    if (progress >= 1) {
      this.complete();
    }
  }

  complete() {
    this.isComplete = true;
    this.isActive = false;
    this.shaderPass.enabled = false;
    this.onComplete();
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}
```

**Validation:**
- [ ] Shader compiles without errors
- [ ] Noise renders with correct Tron colors
- [ ] Scan lines sweep top-to-bottom
- [ ] Sectors resolve from center outward
- [ ] Transition disables cleanly at completion
- [ ] No GPU errors on Safari/Firefox

---

### Task 5: Transition Orchestrator
**File:** `src/transition/TransitionOrchestrator.js`

Main coordinator that ties all systems together.

```javascript
// TransitionOrchestrator.js
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import { PerformanceDetector } from './PerformanceDetector.js';
import { GridEmergenceController } from './GridEmergenceController.js';
import { LightTracerSystem } from './LightTracerSystem.js';
import { MaterializationShader, MaterializationController } from './MaterializationShader.js';

export class TransitionOrchestrator {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    this.performanceDetector = new PerformanceDetector();
    this.capabilities = null;

    // Sub-controllers
    this.gridEmergence = null;
    this.lightTracers = null;
    this.materialization = null;

    // Post-processing (only if shader enabled)
    this.composer = null;
    this.materializationPass = null;

    // State
    this.isInitialized = false;
    this.isTransitioning = false;
    this.transitionStartTime = null;
    this.phase = 'idle';

    // Scene element references
    this.sceneElements = {};

    // Callbacks
    this.onHeroStart = null;
    this.onComplete = null;
  }

  async init(sceneElements) {
    this.sceneElements = sceneElements;

    // Detect device capabilities
    this.capabilities = await this.performanceDetector.detect();
    console.log('Device capabilities:', this.capabilities);

    // Initialize grid emergence (always)
    this.gridEmergence = new GridEmergenceController();
    this.gridEmergence.init(this.scene, {
      gridFloor: sceneElements.gridFloor,
      corridor: sceneElements.corridor
    });

    // Initialize light tracers (always, but simplified on low-end)
    this.lightTracers = new LightTracerSystem(this.scene, {
      simplified: this.capabilities.lowPerformance
    });

    // Initialize shader (only on capable devices)
    if (this.capabilities.enableShader) {
      this.setupPostProcessing();
    }

    this.isInitialized = true;
    return this.capabilities;
  }

  setupPostProcessing() {
    this.composer = new EffectComposer(this.renderer);

    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.materializationPass = new ShaderPass(MaterializationShader);
    this.materializationPass.uniforms.uResolution.value.set(
      window.innerWidth,
      window.innerHeight
    );
    this.materializationPass.enabled = false; // Starts disabled
    this.composer.addPass(this.materializationPass);

    this.materialization = new MaterializationController(this.materializationPass, {
      duration: 1.5, // Fast shader clear - doesn't block interaction
      onComplete: () => console.log('Shader transition complete')
    });
  }

  start() {
    if (!this.isInitialized) {
      console.error('TransitionOrchestrator not initialized');
      return;
    }

    this.isTransitioning = true;
    this.transitionStartTime = performance.now() * 0.001;
    this.phase = 'starting';

    // Fast fade out loading screen (300ms)
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.transition = 'opacity 0.3s ease-out';
    loadingScreen.classList.add('fade-out');

    // Start ALL transition systems simultaneously (parallel execution)
    setTimeout(() => {
      // All three run in parallel for maximum visual density
      this.gridEmergence.start();
      this.lightTracers.start();

      if (this.materialization) {
        this.materialization.start(0); // No delay - runs with others
      }

      // Spawn grid + corridor tracers together (parallel with grid emergence)
      const origin = new THREE.Vector3(0, 0.02, 15);
      this.lightTracers.spawnGridTracers(origin, 150, 20); // Wider spacing = fewer tracers
      this.lightTracers.spawnCorridorTracers(0, 25, 40, 200); // Start immediately

      // Hero text starts at 600ms - gives grid a moment to form
      setTimeout(() => {
        if (this.onHeroStart) this.onHeroStart();
      }, 600);

      // Enable scroll interaction at 1000ms (non-blocking)
      setTimeout(() => {
        this.enableInteraction();
      }, 1000);

      // Hero convergence tracers (eye candy, doesn't block)
      setTimeout(() => {
        this.spawnHeroConvergence();
      }, 800);

    }, 300); // Start after loading screen begins fading
  }

  enableInteraction() {
    // Allow scrolling even while animations complete
    this.interactionEnabled = true;

    // Show scroll indicator
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.style.opacity = '1';
    }

    // Emit event for main.js to enable scroll handling
    window.dispatchEvent(new CustomEvent('transitionInteractive'));
  }

  spawnHeroConvergence() {
    const heroCenter = this.sceneElements.heroGroup?.position || new THREE.Vector3(0, 6, -5);

    const sourcePoints = [
      new THREE.Vector3(-15, 0.02, -10),
      new THREE.Vector3(15, 0.02, -10),
      new THREE.Vector3(0, 0.02, -20),
      new THREE.Vector3(-20, 5, -15),
      new THREE.Vector3(20, 5, -15),
    ];

    this.lightTracers.spawnConvergenceTracers(heroCenter, sourcePoints);
  }

  update(time, delta) {
    if (!this.isTransitioning) return;

    // Update sub-controllers
    this.gridEmergence.update(time);
    this.lightTracers.update(delta);

    if (this.materialization) {
      this.materialization.update(time);
    }

    // Check completion (animations done at 3.0s, but interaction enabled earlier)
    const elapsed = time - this.transitionStartTime;
    if (elapsed > 3.0 && !this.isComplete) {
      this.complete();
    }
  }

  complete() {
    this.isTransitioning = false;
    this.isComplete = true;
    this.phase = 'complete';

    // Cleanup tracers
    setTimeout(() => {
      this.lightTracers.dispose();
    }, 1000);

    // Show scroll indicator
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.classList.remove('hidden');
    }

    if (this.onComplete) this.onComplete();
  }

  render() {
    // Use composer if shader is active, otherwise normal render
    if (this.composer && this.materialization?.isActive) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  onResize(width, height) {
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    if (this.materializationPass) {
      this.materializationPass.uniforms.uResolution.value.set(width, height);
    }
  }

  // Set callback for when hero text should start drawing
  setOnHeroStart(callback) {
    this.onHeroStart = callback;
  }

  // Set callback for transition complete
  setOnComplete(callback) {
    this.onComplete = callback;
  }
}
```

**Validation:**
- [ ] Performance detection runs and returns valid capabilities
- [ ] Grid emergence starts and completes
- [ ] Light tracers spawn and animate
- [ ] Shader enables only on capable devices
- [ ] Hero text trigger fires at correct time
- [ ] Scroll indicator appears at end
- [ ] Clean completion without errors

---

### Task 6: Modify TronEnvironment.js
**File:** `src/TronEnvironment.js`

Add per-line references and opacity controls to grid/corridor creation.

**Changes needed:**
1. Modify `createGridFloor()` to return individual line references
2. Modify `createCorridor()` to return individual line references
3. Add `userData.baseOpacity` to all materials
4. Add `userData.distanceFromCenter`, `userData.zPosition`, etc.

```javascript
// In createGridFloor - add to existing function
export function createGridFloor(size = 500, divisions = 100) {
  const group = new THREE.Group();

  // Store line references for animation
  group.userData.lengthwiseLines = [];
  group.userData.crossLines = [];

  const halfSize = size / 2;
  const spacing = size / divisions;
  const cyan = 0x00d4ff;
  const dimCyan = 0x003344;

  // Create lengthwise lines (Z-direction)
  for (let i = -divisions / 2; i <= divisions / 2; i++) {
    const xPos = i * spacing;
    const isAccent = i % 10 === 0;
    const color = isAccent ? cyan : dimCyan;
    const opacity = isAccent ? 0.3 : 0.15;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([xPos, 0.01, halfSize, xPos, 0.01, -halfSize]), 3
    ));

    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0 // Start hidden for transition
    });

    const line = new THREE.Line(geometry, material);
    line.userData = {
      type: 'lengthwise',
      xPosition: xPos,
      distanceFromCenter: Math.abs(xPos),
      baseOpacity: opacity
    };

    group.add(line);
    group.userData.lengthwiseLines.push(line);
  }

  // Create cross lines (X-direction)
  for (let i = -divisions / 2; i <= divisions / 2; i++) {
    const zPos = i * spacing;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(
      new Float32Array([-halfSize, 0.01, zPos, halfSize, 0.01, zPos]), 3
    ));

    const material = new THREE.LineBasicMaterial({
      color: dimCyan,
      transparent: true,
      opacity: 0
    });

    const line = new THREE.Line(geometry, material);
    line.userData = {
      type: 'cross',
      zPosition: zPos,
      distanceFromCenter: Math.abs(zPos),
      baseOpacity: 0.1
    };

    group.add(line);
    group.userData.crossLines.push(line);
  }

  // Floor plane
  const floorGeo = new THREE.PlaneGeometry(size, size);
  const floorMat = new THREE.MeshBasicMaterial({
    color: 0x000511,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.05;
  floor.userData.baseOpacity = 0.9;
  group.add(floor);
  group.userData.floorPlane = floor;

  return group;
}
```

**Validation:**
- [ ] Grid lines have userData with distance/position info
- [ ] All materials start at opacity 0
- [ ] baseOpacity values are correct for accent vs normal lines
- [ ] Floor plane included with baseOpacity

---

### Task 7: Modify TronHeroText.js
**File:** `src/TronHeroText.js`

Add external trigger capability and faster draw speed (500ms total instead of ~1500ms).

```javascript
// Add to createTronHeroText options
export function createTronHeroText(text, options = {}) {
  const {
    // ... existing options ...
    autoStart = true,  // NEW: whether to auto-start draw animation
    drawSpeed = 0.012  // NEW: configurable draw speed (default preserves old behavior)
  } = options;

  // Store draw speed for animation
  group.userData.drawSpeed = drawSpeed;

  // ... existing code ...

  // Set initial state based on autoStart
  group.userData.drawProgress = autoStart ? 0 : -1; // -1 = waiting for trigger

  // NEW: Method to externally trigger draw start
  group.userData.startDraw = function() {
    if (group.userData.drawProgress < 0) {
      group.userData.drawProgress = 0;
    }
  };

  // ... rest of function ...
}

// Modify animateTronHeroText to use configurable speed
function animateTronHeroText(group, time) {
  // Skip if waiting for external trigger
  if (group.userData.drawProgress < 0) return;

  // Use faster draw speed: 0.033 = ~500ms total (vs 0.012 = ~1400ms)
  const speed = group.userData.drawSpeed || 0.012;
  group.userData.drawProgress = Math.min(1, group.userData.drawProgress + speed);

  // ... existing animation code ...
}
```

**Validation:**
- [ ] With autoStart=true, animation starts immediately (default behavior)
- [ ] With autoStart=false, animation waits until startDraw() called
- [ ] startDraw() can be called multiple times safely
- [ ] Animation completes normally after triggered

---

### Task 8: Modify main.js
**File:** `src/main.js`

Integrate TransitionOrchestrator into initialization and render loop.

```javascript
// Add imports at top
import { TransitionOrchestrator } from './transition/TransitionOrchestrator.js';

// Add global variables
let transitionOrchestrator;
let clock; // For delta time

// In init() function:
async function init() {
  // ... existing setup (renderer, scene, camera) ...

  clock = new THREE.Clock();

  // Create environment with transition support
  const floor = createGridFloor(500, 100); // Modified version
  scene.add(floor);

  const corridor = createCorridor(280, 40, 25); // Modified version
  scene.add(corridor);

  // ... create hero text with autoStart: false and faster draw speed ...
  const tronHero = createTronHeroText('creativemaybeno', {
    autoStart: false,  // Wait for transition trigger
    drawSpeed: 0.033   // 500ms draw-in (Material Design compliant)
  });

  // ... rest of scene setup ...

  // Scroll starts disabled, enabled by transition
  let scrollEnabled = false;

  // Listen for interaction-ready event from transition
  window.addEventListener('transitionInteractive', () => {
    scrollEnabled = true;
    console.log('Scroll interaction enabled');
  });

  // Initialize transition orchestrator
  transitionOrchestrator = new TransitionOrchestrator(renderer, scene, camera);
  const capabilities = await transitionOrchestrator.init({
    gridFloor: floor,
    corridor: corridor,
    heroGroup: heroGroup,
    heroText: tronHero
  });

  // Set callbacks
  transitionOrchestrator.setOnHeroStart(() => {
    tronHero.userData.startDraw();
  });

  transitionOrchestrator.setOnComplete(() => {
    console.log('Transition complete!');
  });

  // Start transition after brief delay (500ms feels snappy)
  setTimeout(() => {
    transitionOrchestrator.start();
  }, 500);
}

// In animate() function:
function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  const delta = clock.getDelta();

  // Update transition
  if (transitionOrchestrator) {
    transitionOrchestrator.update(time, delta);
  }

  // ... existing animation code ...

  // Use orchestrator for rendering
  if (transitionOrchestrator) {
    transitionOrchestrator.render();
  } else {
    renderer.render(scene, camera);
  }
}

// In onWindowResize():
function onWindowResize() {
  // ... existing resize code ...

  if (transitionOrchestrator) {
    transitionOrchestrator.onResize(window.innerWidth, window.innerHeight);
  }
}
```

**Validation:**
- [ ] Transition starts after init completes
- [ ] Delta time calculated correctly
- [ ] Resize updates composer size
- [ ] Hero text triggered at correct time
- [ ] Normal rendering resumes after transition

---

### Task 9: Update index.html CSS
**File:** `index.html`

Add CSS classes for loading screen transition phases.

```css
/* Add to existing styles */

#loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

#loading-screen.fade-out .loading-circuit {
  animation: circuitAccelerate 0.5s ease-out forwards;
}

@keyframes circuitAccelerate {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); filter: brightness(1.5); }
  100% { transform: scale(1.1); opacity: 0; filter: brightness(2); }
}

#loading-screen.fade-out .loading-text,
#loading-screen.fade-out .loading-subtitle {
  animation: textDissolve 0.4s ease-out forwards;
}

@keyframes textDissolve {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-8px); filter: blur(3px); }
}

/* Scroll indicator starts hidden */
#scroll-indicator {
  opacity: 0;
  transition: opacity 0.8s ease;
}

#scroll-indicator.visible {
  opacity: 1;
}
```

**Validation:**
- [ ] Loading screen fades out smoothly
- [ ] Circuit animation accelerates before fade
- [ ] Text dissolves with blur effect
- [ ] Scroll indicator fades in at end

---

## Validation Test Plan

### Unit Tests (Manual)

| Test ID | Component | Test | Expected Result |
|---------|-----------|------|-----------------|
| T1 | PerformanceDetector | Run on MacBook Pro M1 | gpuTier=2, enableShader=true |
| T2 | PerformanceDetector | Run on old Android phone | gpuTier=0, enableShader=false |
| T3 | GridEmergence | Start with all hidden | All grid/corridor opacity=0 |
| T4 | GridEmergence | After ignition phase | Center point pulses, grid starts |
| T5 | GridEmergence | After floor phase | Grid lines visible, radial pattern |
| T6 | GridEmergence | After walls phase | Walls traced up from bottom |
| T7 | LightTracers | Spawn grid tracers | Tracers radiate from center |
| T8 | LightTracers | Tracer completion | Tracers clean up after done |
| T9 | Materialization | On capable device | Noise clears to reveal scene |
| T10 | Materialization | On low-end device | Shader disabled, no errors |
| T11 | HeroText | With autoStart=false | Text waits for trigger |
| T12 | HeroText | After startDraw() | Text begins drawing in |
| T13 | Orchestrator | Full sequence | All phases execute in order |
| T14 | Orchestrator | Completion | Scroll indicator visible |

### Integration Tests (UI Automation)

```javascript
// test/transition.test.js (Puppeteer)

const puppeteer = require('puppeteer');

describe('Transition Integration', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({ headless: true });
    page = await browser.newPage();
    await page.goto('http://localhost:5173');
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Loading screen fades out quickly', async () => {
    await page.waitForTimeout(800); // Should be fading by 800ms
    const opacity = await page.$eval('#loading-screen', el =>
      getComputedStyle(el).opacity
    );
    expect(parseFloat(opacity)).toBeLessThan(0.5);
  });

  test('Scroll interaction enabled by 1.0s', async () => {
    await page.reload();
    await page.waitForTimeout(1200); // 1.0s + buffer
    const scrollEnabled = await page.evaluate(() => {
      // Check if scroll indicator is visible
      const indicator = document.getElementById('scroll-indicator');
      return indicator && parseFloat(getComputedStyle(indicator).opacity) > 0.5;
    });
    expect(scrollEnabled).toBe(true);
  });

  test('Hero text drawing complete by 1.5s', async () => {
    await page.reload();
    await page.waitForTimeout(1700); // 1.5s + buffer
    // Hero text should be fully visible
    const heroVisible = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas !== null; // Basic check - detailed check would inspect Three.js state
    });
    expect(heroVisible).toBe(true);
  });

  test('No console errors during transition', async () => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.reload();
    await page.waitForTimeout(3500); // Full transition + buffer
    expect(errors.length).toBe(0);
  });

  test('WebGL context not lost', async () => {
    await page.reload();
    await page.waitForTimeout(3500);
    const contextLost = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return canvas?.getContext('webgl')?.isContextLost?.() ||
             canvas?.getContext('webgl2')?.isContextLost?.() || false;
    });
    expect(contextLost).toBe(false);
  });

  test('User can scroll during transition', async () => {
    await page.reload();
    await page.waitForTimeout(1200); // Wait for interaction enabled
    // Attempt to scroll
    await page.evaluate(() => {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }));
    });
    // Should not throw error
    expect(true).toBe(true);
  });
});
```

### Visual Regression Tests

Use screenshots at key timestamps to verify visual quality:

```javascript
// Capture at key moments (compressed timeline)
await page.screenshot({ path: 'transition-0.3s.png' }); // Loading fade + ignition
await page.screenshot({ path: 'transition-0.8s.png' }); // Grid forming + tracers
await page.screenshot({ path: 'transition-1.2s.png' }); // Hero drawing, interactive
await page.screenshot({ path: 'transition-2.0s.png' }); // Shader complete, walls up
await page.screenshot({ path: 'transition-3.0s.png' }); // Complete
```

---

## Performance Optimization Checklist

### Always Applied (All Devices)
- [ ] Use `THREE.BufferGeometry` for all dynamic geometry
- [ ] Dispose unused geometries/materials/textures
- [ ] Limit tracer count based on capabilities
- [ ] Use `LineBasicMaterial` (no lighting calculations)
- [ ] Additive blending for glows (single pass)

### Mobile-Specific
- [ ] Reduce tracer count by 50%
- [ ] Simplify tracer trails (10 points vs 20)
- [ ] Disable convergence tracers
- [ ] Interaction enabled at 0.8s

### Low-End Devices
- [ ] Disable shader entirely
- [ ] Minimal tracers (grid only, no corridor)
- [ ] Simple opacity fade for hero text
- [ ] Interaction enabled at 0.8s (even faster)

### Memory Management
- [ ] Clean up tracers after completion
- [ ] Dispose shader pass after transition
- [ ] Remove ignition point after phase
- [ ] Null references after cleanup

---

## Estimated Development Timeline

| Phase | Tasks | Duration |
|-------|-------|----------|
| 1. Foundation | PerformanceDetector, base project structure | 2 hours |
| 2. Grid Emergence | GridEmergenceController + TronEnvironment mods | 4 hours |
| 3. Light Tracers | LightTracerSystem | 3 hours |
| 4. Shader | MaterializationShader + controller | 3 hours |
| 5. Orchestrator | TransitionOrchestrator + main.js integration | 3 hours |
| 6. Polish | CSS, timing adjustments, hero text mods | 2 hours |
| 7. Testing | All validation tests, bug fixes | 3 hours |
| 8. Performance | Optimization, mobile testing | 2 hours |

**Total: ~22 hours**

## User Experience Timeline Summary

| Time | What User Sees | Can Interact? |
|------|---------------|---------------|
| 0.0s | Loading screen with circuit animation | No |
| 0.3s | Loading fades, ignition spark appears | No |
| 0.5s | Grid forming rapidly, tracers racing | No |
| 0.8s | Hero text begins drawing | No |
| **1.0s** | **Grid visible, hero readable, scroll indicator** | **YES** |
| 1.3s | Hero text complete | Yes |
| 1.5s | Shader clears (if enabled) | Yes |
| 2.0s | Walls mostly complete | Yes |
| 3.0s | All animations done, tracers cleaned up | Yes |

---

## Fallback Strategy

If any component fails:

1. **Shader fails to compile**: Orchestrator detects, disables shader, continues with base layers
2. **Low FPS detected**: Simplified tracers, reduced particle count
3. **WebGL context lost**: Show error message, attempt reload
4. **Complete failure**: Fall back to simple CSS opacity fade

```javascript
// In TransitionOrchestrator
try {
  this.setupPostProcessing();
} catch (e) {
  console.warn('Shader setup failed, using fallback:', e);
  this.capabilities.enableShader = false;
  this.materialization = null;
}
```

---

## Implementation Order

1. **Week 1, Day 1-2**: Tasks 1 (PerformanceDetector), 6 (TronEnvironment mods)
2. **Week 1, Day 3-4**: Task 2 (GridEmergenceController)
3. **Week 1, Day 5**: Task 3 (LightTracerSystem)
4. **Week 2, Day 1**: Task 4 (MaterializationShader)
5. **Week 2, Day 2**: Tasks 5 (Orchestrator), 7 (TronHeroText)
6. **Week 2, Day 3**: Task 8 (main.js), Task 9 (CSS)
7. **Week 2, Day 4-5**: Testing, optimization, polish

---

## Success Criteria

The implementation is complete when:

1. ✓ Loading screen fades within 300ms
2. ✓ Grid lines draw radially from center (Grid Emergence)
3. ✓ Light tracers race along grid/corridor paths (Light Line Formation)
4. ✓ On capable devices, noise shader clears to reveal scene (Digital Materialization)
5. ✓ Hero text draws in within 500ms (Material Design compliant)
6. ✓ **User can scroll by 1.0 second** (critical UX requirement)
7. ✓ Scroll indicator appears at 1.0s
8. ✓ Total animation completes by 3.0s
9. ✓ No console errors on any device
10. ✓ FPS stays above 30 during transition
11. ✓ Works on desktop Chrome, Safari, Firefox
12. ✓ Works on mobile Safari (iOS) and Chrome (Android)
13. ✓ Graceful degradation on low-end devices
14. ✓ Remaining animations (walls, tracers) don't block user interaction
