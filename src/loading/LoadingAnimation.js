/**
 * LoadingAnimation.js
 *
 * Energy Convergence Ring - Tron-style loading animation
 * Features:
 * - Sharp, crisp particle aesthetics matching Tron aesthetic
 * - Smooth ring collapse with proper easing
 * - Orange color scheme matching the 3D ignition
 * - Positioned to align with where 3D ignition appears
 */

// Configuration
const PARTICLE_COUNT = 12;
const BASE_RADIUS = 60;         // Starting orbit radius
const MIN_RADIUS = 4;           // Final collapse radius
const ORBIT_SPEED = 0.03;       // Base orbital speed
const PULSE_INTERVAL = 1.2;     // Seconds between energy pulses

// Orange color to match 3D ignition
const PRIMARY_COLOR = [255, 102, 0];
const ACCENT_COLOR = [255, 150, 50];  // Lighter orange accent

/**
 * Initialize and run the loading animation on a canvas element
 * @param {HTMLCanvasElement} canvas - The canvas to draw on
 * @returns {Object} API for controlling the animation
 */
export function initLoadingAnimation(canvas) {
  const ctx = canvas.getContext('2d');

  // Set canvas size with device pixel ratio for sharpness
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const cx = width / 2;
  // Center the ring at the canvas center (aligned with 3D ignition position)
  const cy = height * 0.5;

  // State
  let particles = [];
  let pulseParticles = [];
  let time = 0;
  let lastTimestamp = null;
  let lastPulseTime = 0;
  let isConverging = false;
  let convergenceProgress = 0;
  let targetConvergenceProgress = 0; // Target for smooth interpolation
  let isCollapsing = false;
  let collapseStartTime = 0;
  let animationId = null;

  // Initialize orbital particles
  function initParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const angle = (i / PARTICLE_COUNT) * Math.PI * 2;
      particles.push({
        baseAngle: angle,
        angle: angle,
        radius: BASE_RADIUS,
        size: 2 + Math.random() * 1.5,
        speed: ORBIT_SPEED * (0.9 + Math.random() * 0.2),
        phase: Math.random() * Math.PI * 2,
        brightness: 0.7 + Math.random() * 0.3
      });
    }
  }

  // Create an energy pulse particle that moves toward center
  function createPulseParticle() {
    const angle = Math.random() * Math.PI * 2;
    pulseParticles.push({
      angle: angle,
      radius: BASE_RADIUS * (0.9 + Math.random() * 0.1),
      targetRadius: 0,
      speed: 60 + Math.random() * 30,
      size: 2 + Math.random() * 2,
      life: 1.0,
      isAccent: Math.random() < 0.3
    });
  }

  // Draw sharp Tron-style particle with defined edges
  function drawParticle(x, y, size, brightness, isAccent = false) {
    const color = isAccent ? ACCENT_COLOR : PRIMARY_COLOR;

    // Thin outer glow ring (Tron style)
    ctx.beginPath();
    ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color.join(',')}, ${brightness * 0.2})`;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sharp core circle with subtle gradient
    const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${brightness})`);
    coreGradient.addColorStop(0.5, `rgba(${color.join(',')}, ${brightness})`);
    coreGradient.addColorStop(1, `rgba(${color.join(',')}, ${brightness * 0.3})`);
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Crisp white center dot
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.fill();
  }

  // Draw faint orbit ring with orange color
  function drawOrbitRing(radius, alpha) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${PRIMARY_COLOR.join(',')}, ${alpha * 0.12})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Easing functions for smooth animations
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Main draw function
  function draw(timestamp) {
    const delta = timestamp ? (timestamp - (lastTimestamp || timestamp)) / 1000 : 0.016;
    lastTimestamp = timestamp;
    time += delta;

    ctx.clearRect(0, 0, width, height);

    // Smooth interpolation of convergence progress for fluid radius changes
    convergenceProgress += (targetConvergenceProgress - convergenceProgress) * 0.02;

    // Calculate current orbit radius based on convergence
    let currentRadius = BASE_RADIUS;
    let collapseAlpha = 1; // For fade out during collapse

    if (isConverging && !isCollapsing) {
      // Smooth convergence using eased progress
      const easedProgress = easeInOutCubic(convergenceProgress);
      // Converge from BASE_RADIUS (60) to 30 as loading progresses
      currentRadius = BASE_RADIUS - (BASE_RADIUS - 30) * easedProgress;
    } else if (isCollapsing) {
      // Smooth collapse with proper easing
      const collapseElapsed = time - collapseStartTime;
      const collapseDuration = 0.6;
      const collapseProgress = Math.min(1, collapseElapsed / collapseDuration);
      const eased = easeInOutCubic(collapseProgress);
      // Collapse from 30 to MIN_RADIUS
      currentRadius = 30 * (1 - eased) + MIN_RADIUS * eased;
      collapseAlpha = 1 - eased;

      // Fade out and dispatch event when collapse completes
      if (collapseProgress >= 1) {
        finishAnimation();
        return;
      }
    }

    // Draw faint orbit ring
    drawOrbitRing(currentRadius, collapseAlpha);

    // Update and draw orbital particles
    particles.forEach((p, i) => {
      // Update angle (orbit)
      const speedMultiplier = isCollapsing ? (2 + (1 - collapseAlpha) * 2) : 1;
      p.angle += p.speed * speedMultiplier;

      // Calculate position - no wobble for cleaner Tron look
      const r = currentRadius;
      const x = cx + Math.cos(p.angle) * r;
      const y = cy + Math.sin(p.angle) * r;

      // Pulsing brightness
      const pulse = 0.8 + Math.sin(time * 4 + p.phase) * 0.2;
      const brightness = p.brightness * pulse * collapseAlpha;

      // Draw the particle
      const size = p.size * (isCollapsing ? (1 + (1 - collapseAlpha) * 0.5) : 1);
      if (brightness > 0.05) {
        drawParticle(x, y, size, brightness);
      }
    });

    // Create periodic pulse particles
    if (!isCollapsing && time - lastPulseTime > PULSE_INTERVAL) {
      createPulseParticle();
      lastPulseTime = time;
    }

    // Update and draw pulse particles (moving toward center)
    pulseParticles = pulseParticles.filter(p => {
      p.radius -= p.speed * delta;
      p.life -= delta * 0.6;

      if (p.radius <= MIN_RADIUS || p.life <= 0) {
        return false;
      }

      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius;
      const adjustedLife = p.life * collapseAlpha;

      if (adjustedLife > 0.05) {
        drawParticle(x, y, p.size * p.life, adjustedLife, p.isAccent);
      }
      return true;
    });

    // Draw central disc matching 3D ignition style (flat disc with sharp edge + glow rings)
    if (convergenceProgress > 0.1 || isCollapsing) {
      const glowIntensity = (isCollapsing ? 0.8 : convergenceProgress * 0.4) * collapseAlpha;
      const discSize = isCollapsing ? 8 + (1 - currentRadius / 40) * 10 : 4 + convergenceProgress * 6;

      // Outer glow ring (thin, Tron-style) - matches ignition's outer bloom ring
      ctx.beginPath();
      ctx.arc(cx, cy, discSize * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${PRIMARY_COLOR.join(',')}, ${glowIntensity * 0.25})`;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Middle glow ring - matches ignition's inner glow ring
      ctx.beginPath();
      ctx.arc(cx, cy, discSize * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${PRIMARY_COLOR.join(',')}, ${glowIntensity * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sharp-edged core disc (flat, not gradient blob) - matches ignition's sphere
      // Use a gradient that stays solid longer then drops off sharply at the edge
      const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, discSize);
      coreGradient.addColorStop(0, `rgba(255, 255, 255, ${glowIntensity})`);
      coreGradient.addColorStop(0.6, `rgba(255, 200, 150, ${glowIntensity * 0.9})`);
      coreGradient.addColorStop(0.85, `rgba(${PRIMARY_COLOR.join(',')}, ${glowIntensity * 0.8})`);
      coreGradient.addColorStop(1, `rgba(${PRIMARY_COLOR.join(',')}, 0)`);
      ctx.beginPath();
      ctx.arc(cx, cy, discSize, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Crisp white center point
      ctx.beginPath();
      ctx.arc(cx, cy, discSize * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity})`;
      ctx.fill();
    }

    animationId = requestAnimationFrame(draw);
  }

  // Finish animation and hand off to 3D ignition
  function finishAnimation() {
    // Dispatch event for main.js to start the 3D transition
    window.dispatchEvent(new CustomEvent('loadingConvergenceComplete'));

    // Stop the animation
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  }

  // Initialize and start
  initParticles();
  draw();

  // Return API for external control
  return {
    // Start convergence (call when loading begins making progress)
    startConvergence: function() {
      isConverging = true;
    },

    // Update convergence progress (0-1) - uses target for smooth interpolation
    setProgress: function(progress) {
      targetConvergenceProgress = Math.min(1, Math.max(0, progress));
    },

    // Trigger final collapse (call when loading is complete)
    triggerCollapse: function() {
      if (!isCollapsing) {
        isCollapsing = true;
        collapseStartTime = time;
        // Add extra pulse particles for dramatic effect
        for (let i = 0; i < 4; i++) {
          createPulseParticle();
        }
      }
    },

    // Stop animation
    stop: function() {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    }
  };
}

/**
 * Initialize the loading animation on page load
 * Sets up the canvas and exposes the API on window.loadingAnimation
 */
export function setupLoadingAnimation() {
  const canvas = document.getElementById('convergence-canvas');
  if (!canvas) {
    console.warn('Loading animation canvas not found');
    return;
  }

  window.loadingAnimation = initLoadingAnimation(canvas);
}
