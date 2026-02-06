/**
 * ScanLineReveal.js
 *
 * Scan line reveal effect using Three.js clipping planes.
 * Objects are clipped above the scan line and revealed as it rises from below.
 * Uses native clipping which preserves exact material appearance.
 * Includes a glowing laser line visual at the scan position.
 */

import * as THREE from 'three';

/**
 * ScanLineRevealSystem - manages scan line reveal using clipping planes
 */
export class ScanLineRevealSystem {
  constructor(renderer, scene) {
    this.renderer = renderer;
    this.scene = scene;
    this.scanObjects = []; // Objects with clipping enabled

    // Scan line RISES from below floor to above content
    this.startY = -5;      // Start below floor (everything hidden)
    this.endY = 25;        // End above all content (everything visible)
    this.currentClipY = this.startY;

    // Create a horizontal clipping plane (clips everything ABOVE the plane)
    // Plane normal points DOWN (0, -1, 0), so it clips geometry above the plane
    this.clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), this.startY);

    // Enable clipping on the renderer
    if (this.renderer) {
      this.renderer.localClippingEnabled = true;
    }

    // Create the visual scan line (glowing laser)
    this.scanLineGroup = this.createScanLineVisual();
    if (this.scene && this.scanLineGroup) {
      this.scene.add(this.scanLineGroup);
      this.scanLineGroup.position.y = this.startY;
      this.scanLineGroup.visible = false; // Hidden until animation starts
    }
  }

  /**
   * Create the visual glowing scan line - positioned in 3D space behind hero
   */
  createScanLineVisual() {
    const group = new THREE.Group();

    // The scan line extends from the back of the scene forward
    // but stops before the hero area (hero is around z=5-10)
    // Line goes from z=-250 to z=-5 (behind hero)
    const lineLength = 250;
    const lineStartZ = 5; // Stop before hero

    // Main bright core line - thin and bright
    const coreGeometry = new THREE.PlaneGeometry(60, 0.1);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true, // Proper depth testing in 3D space
      blending: THREE.AdditiveBlending
    });
    const coreLine = new THREE.Mesh(coreGeometry, coreMaterial);
    coreLine.rotation.x = -Math.PI / 2; // Lay flat horizontally
    coreLine.position.z = -lineLength / 2 + lineStartZ;
    group.add(coreLine);

    // Inner glow - cyan, wider
    const innerGlowGeometry = new THREE.PlaneGeometry(60, 0.4);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    innerGlow.rotation.x = -Math.PI / 2;
    innerGlow.position.z = -lineLength / 2 + lineStartZ;
    innerGlow.position.y = -0.01;
    group.add(innerGlow);

    // Outer glow - softer, wider spread
    const outerGlowGeometry = new THREE.PlaneGeometry(60, 1.0);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlow.rotation.x = -Math.PI / 2;
    outerGlow.position.z = -lineLength / 2 + lineStartZ;
    outerGlow.position.y = -0.02;
    group.add(outerGlow);

    // Store materials for animation
    group.userData.coreMaterial = coreMaterial;
    group.userData.innerGlowMaterial = innerGlowMaterial;
    group.userData.outerGlowMaterial = outerGlowMaterial;

    return group;
  }

  /**
   * Add an object to the scan line system
   * Enables clipping on the object's material and adds edge glow
   */
  addObject(object) {
    if (!object.material) return false;

    const material = object.material;

    // Store original state
    const originalClippingPlanes = material.clippingPlanes;
    const originalClipShadows = material.clipShadows;
    const originalOnBeforeCompile = material.onBeforeCompile;

    // Enable clipping on this material
    material.clippingPlanes = [this.clipPlane];
    material.clipShadows = true;

    // Inject edge glow into the material's shader
    const clipPlane = this.clipPlane;
    material.onBeforeCompile = (shader) => {
      // Call original if it exists
      if (originalOnBeforeCompile) {
        originalOnBeforeCompile(shader);
      }

      // Add uniform for scan line glow
      shader.uniforms.uScanClipY = { value: clipPlane.constant };
      shader.uniforms.uScanGlowColor = { value: new THREE.Color(0x00ffff) };

      // Inject varying for world position at the top of vertex shader
      shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        `#include <common>
        varying vec3 vWorldPosition;`
      );

      // Compute world position before clipping planes vertex (reliable injection point)
      // When clipping is enabled, worldPosition is already computed in worldpos_vertex
      // But we inject our own calculation just after begin_vertex for reliability
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;`
      );

      // Inject edge glow into fragment shader
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
        uniform float uScanClipY;
        uniform vec3 uScanGlowColor;
        varying vec3 vWorldPosition;`
      );

      // Add glow effect just before the final output
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        // Edge glow where geometry meets scan line
        // uScanClipY is above the geometry, so distToScan is positive for visible parts
        float distToScan = uScanClipY - vWorldPosition.y;
        // Glow strongest right at the edge (0.0), fading over 0.8 units
        float edgeGlow = smoothstep(0.8, 0.0, distToScan) * smoothstep(-0.1, 0.0, distToScan);
        gl_FragColor.rgb += uScanGlowColor * edgeGlow * 1.2;`
      );

      // Store shader reference for uniform updates
      material.userData.scanShader = shader;
    };

    material.needsUpdate = true;

    this.scanObjects.push({
      object,
      material,
      originalClippingPlanes,
      originalClipShadows,
      originalOnBeforeCompile
    });

    return true;
  }

  /**
   * Update the scan line position based on progress (0-1)
   */
  update(progress) {
    // Calculate current clip Y: rises from startY to endY
    this.currentClipY = this.startY + progress * (this.endY - this.startY);

    // Update the clipping plane constant
    this.clipPlane.constant = this.currentClipY;

    // Update edge glow uniforms on all materials
    for (const item of this.scanObjects) {
      if (item.material.userData.scanShader) {
        item.material.userData.scanShader.uniforms.uScanClipY.value = this.currentClipY;
      }
    }

    // Update visual scan line position
    if (this.scanLineGroup) {
      this.scanLineGroup.visible = progress > 0 && progress < 1;
      this.scanLineGroup.position.y = this.currentClipY;

      // Pulse the glow slightly for more dynamic effect
      const pulse = 0.9 + Math.sin(Date.now() * 0.01) * 0.1;
      if (this.scanLineGroup.userData.coreMaterial) {
        this.scanLineGroup.userData.coreMaterial.opacity = 1.0 * pulse;
      }
      if (this.scanLineGroup.userData.innerGlowMaterial) {
        this.scanLineGroup.userData.innerGlowMaterial.opacity = 0.7 * pulse;
      }
    }
  }

  /**
   * Complete the reveal - move clip plane above all geometry
   */
  complete() {
    this.currentClipY = this.endY;
    this.clipPlane.constant = this.endY;
  }

  /**
   * Restore all original material clipping settings and cleanup
   */
  dispose() {
    for (const item of this.scanObjects) {
      if (item.material) {
        item.material.clippingPlanes = item.originalClippingPlanes || null;
        item.material.clipShadows = item.originalClipShadows || false;
        item.material.onBeforeCompile = item.originalOnBeforeCompile || null;
        delete item.material.userData.scanShader;
        item.material.needsUpdate = true;
      }
    }
    this.scanObjects = [];

    // Remove visual scan line from scene
    if (this.scanLineGroup && this.scene) {
      this.scene.remove(this.scanLineGroup);
      // Dispose geometries and materials
      this.scanLineGroup.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) child.material.dispose();
      });
      this.scanLineGroup = null;
    }

    // Disable local clipping if no longer needed
    if (this.renderer) {
      this.renderer.localClippingEnabled = false;
    }
  }

  /**
   * Get the current clip Y position
   */
  getClipY() {
    return this.currentClipY;
  }
}

// Legacy exports for compatibility (no longer needed but kept for safety)
export function convertToScanLineMaterial(object, initialClipY) {
  return null; // Not used with clipping planes approach
}

export function restoreOriginalMaterial(object) {
  return false; // Not used with clipping planes approach
}
