/**
 * TransitionOrchestrator.js
 *
 * Main coordinator that ties all transition systems together.
 * Manages the loading-to-experience transition with:
 * - Grid Emergence (always runs)
 * - Light Line Formation (always runs)
 * - Content reveal (fades in content as grid emerges)
 *
 * Timeline:
 * - 0.0s: Loading screen begins fading, all content hidden
 * - 0.3s: Grid emergence + tracers start
 * - 0.8s: Hero text begins drawing
 * - 1.0s: Content begins fading in
 * - 1.2s: User can interact (scroll enabled)
 * - 2.5s: All content fully visible
 * - 3.0s: Full cleanup
 */

import * as THREE from 'three';

import { PerformanceDetector } from './PerformanceDetector.js';
import { GridEmergenceController } from './GridEmergenceController.js';
import { LightTracerSystem } from './LightTracerSystem.js';

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

    // State
    this.isInitialized = false;
    this.isTransitioning = false;
    this.transitionStartTime = null;
    this.phase = 'idle';
    this.interactionEnabled = false;
    this.isComplete = false;

    // Content reveal tracking
    this.contentRevealProgress = 0;
    this.hiddenContent = []; // Objects hidden during transition

    // Scene element references
    this.sceneElements = {};

    // Callbacks
    this.onHeroStart = null;
    this.onInteractive = null;
    this.onComplete = null;
  }

  async init(sceneElements) {
    this.sceneElements = sceneElements;

    // Detect device capabilities
    this.capabilities = await this.performanceDetector.detect();
    console.log('Transition capabilities:', this.capabilities);

    // Hide ALL content initially (this is the key fix)
    this.hideAllContent();

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

    this.isInitialized = true;
    return this.capabilities;
  }

  /**
   * Hide all content in the scene except grid/corridor
   * This ensures a clean reveal during transition
   */
  hideAllContent() {
    this.hiddenContent = [];

    // Track hero text separately - it has its own draw animation
    const heroText = this.sceneElements.heroText;

    this.scene.traverse((object) => {
      // Skip grid floor and corridor (they're handled separately)
      if (object === this.sceneElements.gridFloor ||
          object === this.sceneElements.corridor ||
          this.isChildOf(object, this.sceneElements.gridFloor) ||
          this.isChildOf(object, this.sceneElements.corridor)) {
        return;
      }

      // Skip the hero text group (it has its own draw-in animation)
      // But we still want to hide other parts of heroGroup (tagline, buttons)
      if (heroText && (object === heroText || this.isChildOf(object, heroText))) {
        return;
      }

      // Skip non-renderable objects
      if (!object.isMesh && !object.isLine && !object.isLineSegments && !object.isPoints) {
        return;
      }

      // Skip objects already hidden or without materials
      if (!object.material) return;

      // Store original visibility/opacity for restore
      const originalVisible = object.visible;
      const originalOpacity = object.material.opacity;

      // Only hide objects that were visible (or have non-zero original opacity)
      // Note: Some objects start with opacity=0 but should eventually be visible
      if (originalVisible) {
        // Store for restoration
        this.hiddenContent.push({
          object,
          originalOpacity: originalOpacity > 0 ? originalOpacity : 1,
          originalVisible
        });

        // Hide immediately
        if (object.material.transparent !== true) {
          object.material.transparent = true;
        }
        object.material.opacity = 0;
      }
    });

    console.log(`Hidden ${this.hiddenContent.length} objects for transition`);
  }

  /**
   * Check if an object is a descendant of another
   */
  isChildOf(object, parent) {
    if (!parent) return false;
    let current = object.parent;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    return false;
  }

  /**
   * Gradually reveal content based on progress (0-1)
   */
  revealContent(progress) {
    this.contentRevealProgress = progress;

    // Ease the progress for smoother appearance
    const easedProgress = this.easeOutCubic(progress);

    this.hiddenContent.forEach(item => {
      if (item.object.material) {
        item.object.material.opacity = easedProgress * item.originalOpacity;
      }
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
    if (loadingScreen) {
      loadingScreen.style.transition = 'opacity 0.3s ease-out';
      loadingScreen.classList.add('fade-out');
    }

    // Start transition systems after loading screen fades
    setTimeout(() => {
      this.phase = 'running';

      // Start grid emergence
      this.gridEmergence.start();
      this.lightTracers.start();

      // Spawn tracers - radiating from center of grid
      const origin = new THREE.Vector3(0, 0.02, 5);
      this.lightTracers.spawnGridTracers(origin, 100, 25);

      // Hero text starts at 800ms
      setTimeout(() => {
        if (this.onHeroStart) {
          this.onHeroStart();
        }
      }, 500);

      // Enable scroll interaction at configured delay
      setTimeout(() => {
        this.enableInteraction();
      }, this.capabilities.interactionDelay);

    }, 300);
  }

  enableInteraction() {
    if (this.interactionEnabled) return;

    this.interactionEnabled = true;
    this.phase = 'interactive';

    // Show scroll indicator
    const scrollIndicator = document.getElementById('scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.classList.remove('hidden');
      scrollIndicator.style.opacity = '1';
    }

    // Emit event for main.js to enable scroll handling
    window.dispatchEvent(new CustomEvent('transitionInteractive'));

    if (this.onInteractive) {
      this.onInteractive();
    }

    console.log('Transition interactive at', (performance.now() * 0.001 - this.transitionStartTime).toFixed(2), 's');
  }

  update(time, delta) {
    if (!this.isTransitioning) return;

    const elapsed = time - this.transitionStartTime;

    // Update grid emergence
    if (this.gridEmergence) {
      this.gridEmergence.update(time);
    }

    // Update light tracers
    if (this.lightTracers) {
      this.lightTracers.update(delta);
    }

    // Content reveal: starts at 1.0s, completes by 2.5s
    const revealStart = 1.0;
    const revealEnd = 2.5;
    if (elapsed > revealStart) {
      const revealProgress = Math.min(1, (elapsed - revealStart) / (revealEnd - revealStart));
      this.revealContent(revealProgress);
    }

    // Check completion (animations done at 3.0s)
    if (elapsed > 3.0 && !this.isComplete) {
      this.complete();
    }
  }

  complete() {
    if (this.isComplete) return;

    this.isComplete = true;
    this.isTransitioning = false;
    this.phase = 'complete';

    // Ensure interaction is enabled
    if (!this.interactionEnabled) {
      this.enableInteraction();
    }

    // Ensure all content is fully visible
    this.revealContent(1);

    // Cleanup tracers after a delay
    setTimeout(() => {
      if (this.lightTracers) {
        this.lightTracers.dispose();
      }
    }, 500);

    // Ensure grid/corridor are fully visible
    if (this.gridEmergence) {
      this.gridEmergence.complete();
    }

    if (this.onComplete) {
      this.onComplete();
    }

    console.log('Transition complete');
  }

  render() {
    // No custom rendering - always use normal render
    return false;
  }

  onResize(width, height) {
    // Nothing to resize without shader
  }

  // Set callback for when hero text should start drawing
  setOnHeroStart(callback) {
    this.onHeroStart = callback;
  }

  // Set callback for when interaction is enabled
  setOnInteractive(callback) {
    this.onInteractive = callback;
  }

  // Set callback for transition complete
  setOnComplete(callback) {
    this.onComplete = callback;
  }

  // Check if transition is still running
  isRunning() {
    return this.isTransitioning && !this.isComplete;
  }

  // Check if user can interact
  canInteract() {
    return this.interactionEnabled;
  }

  // Easing function
  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }
}
