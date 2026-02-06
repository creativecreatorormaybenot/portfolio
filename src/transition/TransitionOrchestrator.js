/**
 * TransitionOrchestrator.js
 *
 * Main coordinator that ties all transition systems together.
 * Manages the loading-to-experience transition with:
 * - Energy Convergence (loading animation collapses to center)
 * - Grid Emergence (radial spread from ignition point)
 * - Light Line Formation (tracers race outward)
 * - Scan Line Reveal (shader-based bottom-to-top content reveal)
 *
 * Timeline:
 * - 0.0s: Convergence collapse triggered (loading complete)
 * - 0.4s: Convergence flash + loading screen fade begins
 * - 0.5s: Grid emergence + tracers start (synced with flash)
 * - 0.5s: Hero text begins drawing
 * - 0.7s: Scan line reveal begins (furniture/decorations)
 * - 1.2s: User can interact (scroll enabled)
 * - 4.5s: Scan line reveal completes
 * - 5.0s: Transition complete, materials restored
 */

import * as THREE from 'three';

import { PerformanceDetector } from './PerformanceDetector.js';
import { GridEmergenceController } from './GridEmergenceController.js';
import { LightTracerSystem } from './LightTracerSystem.js';
import { ScanLineRevealSystem } from './ScanLineReveal.js';

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
    this.scanLineSystem = null;

    // State
    this.isInitialized = false;
    this.isTransitioning = false;
    this.transitionStartTime = null;
    this.phase = 'idle';
    this.interactionEnabled = false;
    this.isComplete = false;

    // Content reveal tracking
    this.contentRevealProgress = 0;
    this.hiddenContent = [];      // Objects hidden during transition (fade-in only)
    this.scanLineContent = [];    // Objects using scan line reveal
    this.heroDrawStarted = false; // Track if hero draw has started

    // Scene element references
    this.sceneElements = {};

    // Callbacks
    this.onHeroStart = null;
    this.onInteractive = null;
    this.onComplete = null;
  }

  async init(sceneElements) {
    this.sceneElements = sceneElements;

    // Hide content immediately before anything else to prevent flash
    this.hideAllContent();

    // Start convergence animation (particles begin orbiting more tightly)
    if (window.loadingAnimation?.startConvergence) {
      window.loadingAnimation.startConvergence();
    }

    // Detect device capabilities
    this.capabilities = await this.performanceDetector.detect();
    console.log('Transition capabilities:', this.capabilities);

    // Update loading progress as we initialize
    if (window.loadingAnimation?.setProgress) {
      window.loadingAnimation.setProgress(0.3);
    }

    if (window.loadingAnimation?.setProgress) {
      window.loadingAnimation.setProgress(0.5);
    }

    // Initialize grid emergence (always)
    this.gridEmergence = new GridEmergenceController();
    this.gridEmergence.init(this.scene, {
      gridFloor: sceneElements.gridFloor,
      corridor: sceneElements.corridor
    });

    if (window.loadingAnimation?.setProgress) {
      window.loadingAnimation.setProgress(0.7);
    }

    // Initialize light tracers (always, but simplified on low-end)
    this.lightTracers = new LightTracerSystem(this.scene, {
      simplified: this.capabilities.lowPerformance
    });

    if (window.loadingAnimation?.setProgress) {
      window.loadingAnimation.setProgress(1.0);
    }

    this.isInitialized = true;
    return this.capabilities;
  }

  /**
   * Check if an object should use the scan-line reveal effect.
   * Content tiles and decorations are revealed by a rising scan line from the grid;
   * hero elements (tagline, buttons) use a simple fade.
   */
  shouldScanUpward(object) {
    // First, check the object itself - some types must NOT use scan reveal
    // regardless of parent (e.g., links have hover animations that need original materials)
    if (object.userData) {
      const type = object.userData.type;
      // Links have hover animations that need their original material
      if (type === 'link') {
        return false;
      }
      // Hero group elements should NOT scan upward
      if (type === 'heroGroup' || type === 'tagline' || type === 'button') {
        return false;
      }
    }

    // Check if object or any parent has scan-upward type
    let current = object;
    while (current) {
      if (current.userData) {
        const type = current.userData.type;
        // Project cards, furniture, and backing boards should scan upward
        if (type === 'projectCard' || type === 'furniture' || type === 'backingBoard') {
          return true;
        }
        // Hero group elements should NOT scan upward
        if (type === 'heroGroup' || type === 'tagline' || type === 'button') {
          return false;
        }
      }
      current = current.parent;
    }

    // Default: check if it's part of a group that was marked as scan-upward
    // by looking at the parent hierarchy for any group with the right userData
    current = object.parent;
    while (current) {
      if (current.userData && current.userData.type === 'projectCard') {
        return true;
      }
      current = current.parent;
    }

    return false;
  }

  /**
   * Hide all content in the scene except grid/corridor
   * This ensures a clean reveal during transition
   */
  hideAllContent() {
    this.hiddenContent = [];
    this.scanLineContent = [];

    // Initialize scan line system with renderer and scene for clipping planes + visual
    this.scanLineSystem = new ScanLineRevealSystem(this.renderer, this.scene);

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
        // Determine if this object should use scan-upward effect
        const useScanUpward = this.shouldScanUpward(object);

        if (useScanUpward) {
          // Use clipping plane reveal - adds clipping to existing material
          if (this.scanLineSystem.addObject(object)) {
            this.scanLineContent.push({ object });
          } else {
            // Fallback to opacity-based hide if clipping fails
            this.addToHiddenContent(object, originalOpacity, originalVisible, false);
          }
        } else {
          // Normal fade-in for hero elements (tagline, buttons)
          this.addToHiddenContent(object, originalOpacity, originalVisible, false);
        }
      }
    });

    console.log(`Hidden ${this.hiddenContent.length} fade objects, ${this.scanLineContent.length} scan line objects`);
  }

  /**
   * Helper to add an object to hiddenContent with opacity-based hiding
   */
  addToHiddenContent(object, originalOpacity, originalVisible, useScanUpward) {
    this.hiddenContent.push({
      object,
      originalOpacity: originalOpacity > 0 ? originalOpacity : 1,
      originalVisible,
      useScanUpward
    });

    // Hide immediately and force material update
    if (object.material.transparent !== true) {
      object.material.transparent = true;
    }
    object.material.opacity = 0;
    object.material.needsUpdate = true;
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
   * Easing function for scan-upward effect (smoother start and end)
   */
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  /**
   * Gradually reveal content based on progress (0-1)
   * Scan line objects are revealed by shader clipping
   * Hero elements (tagline, buttons) fade in normally
   */
  revealContent(progress) {
    this.contentRevealProgress = progress;

    // Update scan line system - this reveals furniture/decorations via shader clipping
    if (this.scanLineSystem) {
      // Use eased progress for smoother scan line movement
      const scanProgress = this.easeOutQuart(progress);
      this.scanLineSystem.update(scanProgress);
    }

    // Ease the progress for fade-in elements
    const easedProgress = this.easeOutCubic(progress);

    // Fade in non-scan objects (hero tagline, buttons)
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
    this.phase = 'starting';

    // Listen for convergence completion from loading animation
    const onConvergenceComplete = () => {
      window.removeEventListener('loadingConvergenceComplete', onConvergenceComplete);
      this.startGridIgnition();
    };
    window.addEventListener('loadingConvergenceComplete', onConvergenceComplete);

    // Trigger the convergence collapse animation
    // The loading animation will collapse particles to center, then fire the event
    if (window.loadingAnimation?.triggerCollapse) {
      window.loadingAnimation.triggerCollapse();
    } else {
      // Fallback if loading animation isn't available
      console.warn('Loading animation not available, starting directly');
      this.startGridIgnition();
    }
  }

  /**
   * Start the 3D grid ignition after convergence completes
   * This is called when the loading animation flash triggers
   */
  startGridIgnition() {
    this.transitionStartTime = performance.now() * 0.001;
    this.phase = 'running';

    // Fade out loading screen (synced with flash)
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('fade-out');
    }

    // Stop the loading animation
    if (window.loadingAnimation?.stop) {
      window.loadingAnimation.stop();
    }

    // Start grid emergence immediately (synced with flash)
    this.gridEmergence.start();
    this.lightTracers.start();

    // Spawn tracers - radiating from center of grid
    // This creates the "explosion" effect that continues from the convergence
    const origin = new THREE.Vector3(0, 0.02, 5);
    this.lightTracers.spawnGridTracers(origin, 100, 25);

    // Hero text starts at 500ms after ignition
    // Mark that hero draw has started so content reveal can begin
    setTimeout(() => {
      this.heroDrawStarted = true;
      if (this.onHeroStart) {
        this.onHeroStart();
      }
    }, 500);

    // Enable scroll interaction at configured delay
    setTimeout(() => {
      this.enableInteraction();
    }, this.capabilities.interactionDelay);

    console.log('Grid ignition started');
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

    // Content reveal starts ONLY AFTER hero draw begins
    // This ensures content doesn't appear before the main title
    // Scan line rises slowly for an elegant reveal effect
    const revealStart = 0.7;
    const revealEnd = 4.5;  // ~3.8s duration for slow, elegant scan
    if (elapsed > revealStart && this.heroDrawStarted) {
      const revealProgress = Math.min(1, (elapsed - revealStart) / (revealEnd - revealStart));
      this.revealContent(revealProgress);
    }

    // Check completion (after scan reveal finishes)
    if (elapsed > 5.0 && !this.isComplete) {
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

    // Restore original materials for scan line objects after a brief delay
    // This ensures the scan line effect completes visually before restoration
    setTimeout(() => {
      if (this.scanLineSystem) {
        // Restore original materials
        // Dispose cleans up clipping planes on all materials
        this.scanLineSystem.dispose();
        this.scanLineSystem = null;
        this.scanLineContent = [];
      }
    }, 300);

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
