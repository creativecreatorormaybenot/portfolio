import * as THREE from 'three';

// ============================================================================
// TRON HERO TEXT - Tron: Legacy style with bold glowing letters
// ============================================================================

// Letter path definitions - each letter as filled polygon shapes
// Format: arrays of [x, y] vertices forming closed shapes
// Coordinates are in 0-1 range, will be scaled
const LETTER_SHAPES = {
  'c': {
    outer: [[0.85, 0], [0.85, 0.15], [0.25, 0.15], [0.15, 0.25], [0.15, 0.75], [0.25, 0.85], [0.85, 0.85], [0.85, 1], [0.2, 1], [0, 0.8], [0, 0.2], [0.2, 0]],
    holes: []
  },
  'r': {
    outer: [[0, 0], [0.15, 0], [0.15, 0.35], [0.55, 0], [0.75, 0], [0.3, 0.42], [0.65, 0.42], [0.8, 0.55], [0.8, 0.85], [0.6, 1], [0, 1], [0, 0.85], [0.55, 0.85], [0.65, 0.75], [0.65, 0.6], [0.55, 0.55], [0.15, 0.55], [0.15, 0.85], [0, 0.85]],
    holes: []
  },
  'e': {
    outer: [[0, 0], [0.8, 0], [0.8, 0.15], [0.15, 0.15], [0.15, 0.42], [0.65, 0.42], [0.65, 0.58], [0.15, 0.58], [0.15, 0.85], [0.8, 0.85], [0.8, 1], [0, 1]],
    holes: []
  },
  'a': {
    outer: [[0.35, 1], [0, 0], [0.15, 0], [0.35, 0.42], [0.65, 0.42], [0.85, 0], [1, 0], [0.65, 1]],
    inner: [[0.4, 0.55], [0.5, 0.85], [0.6, 0.55]]
  },
  't': {
    outer: [[0, 0.85], [0.35, 0.85], [0.35, 0], [0.5, 0], [0.5, 0.85], [0.85, 0.85], [0.85, 1], [0, 1]],
    holes: []
  },
  'i': {
    outer: [[0.25, 0], [0.55, 0], [0.55, 0.78], [0.25, 0.78]],
    dot: [[0.25, 0.88], [0.55, 0.88], [0.55, 1], [0.25, 1]]
  },
  'v': {
    outer: [[0, 1], [0.35, 0], [0.5, 0], [0.85, 1], [0.7, 1], [0.425, 0.25], [0.15, 1]],
    holes: []
  },
  'm': {
    outer: [[0, 0], [0.15, 0], [0.15, 0.7], [0.4, 0.35], [0.5, 0.35], [0.75, 0.7], [0.75, 0], [0.9, 0], [0.9, 1], [0.75, 1], [0.45, 0.55], [0.15, 1], [0, 1]],
    holes: []
  },
  'y': {
    outer: [[0, 1], [0.3, 0.5], [0.3, 0], [0.45, 0], [0.45, 0.5], [0.75, 1], [0.6, 1], [0.375, 0.6], [0.15, 1]],
    holes: []
  },
  'b': {
    outer: [[0, 0], [0.6, 0], [0.8, 0.15], [0.8, 0.4], [0.65, 0.5], [0.8, 0.6], [0.8, 0.85], [0.6, 1], [0, 1]],
    holes: [
      [[0.15, 0.15], [0.55, 0.15], [0.65, 0.25], [0.65, 0.4], [0.55, 0.45], [0.15, 0.45]],
      [[0.15, 0.55], [0.55, 0.55], [0.65, 0.6], [0.65, 0.75], [0.55, 0.85], [0.15, 0.85]]
    ]
  },
  'n': {
    outer: [[0, 0], [0.15, 0], [0.15, 0.6], [0.65, 0], [0.8, 0], [0.8, 1], [0.65, 1], [0.65, 0.4], [0.15, 1], [0, 1]],
    holes: []
  },
  'o': {
    outer: [[0.2, 0], [0.65, 0], [0.85, 0.2], [0.85, 0.8], [0.65, 1], [0.2, 1], [0, 0.8], [0, 0.2]],
    holes: [[[0.25, 0.15], [0.6, 0.15], [0.7, 0.25], [0.7, 0.75], [0.6, 0.85], [0.25, 0.85], [0.15, 0.75], [0.15, 0.25]]]
  }
};

// Letter widths for spacing (adjusted for filled letters)
const LETTER_WIDTHS = {
  'c': 0.85,
  'r': 0.8,
  'e': 0.8,
  'a': 1.0,
  't': 0.85,
  'i': 0.55,
  'v': 0.85,
  'm': 0.9,
  'y': 0.75,
  'b': 0.8,
  'n': 0.8,
  'o': 0.85
};

// ============================================================================
// CREATE FILLED LETTER SHAPE
// ============================================================================

function createLetterMesh(letter, scale, color) {
  const shapeData = LETTER_SHAPES[letter];
  if (!shapeData) return null;

  const group = new THREE.Group();

  // Create main shape
  const shape = new THREE.Shape();
  const outer = shapeData.outer;

  if (outer && outer.length > 0) {
    shape.moveTo(outer[0][0] * scale, outer[0][1] * scale);
    for (let i = 1; i < outer.length; i++) {
      shape.lineTo(outer[i][0] * scale, outer[i][1] * scale);
    }
    shape.closePath();
  }

  // Add holes if present
  if (shapeData.holes && shapeData.holes.length > 0) {
    shapeData.holes.forEach(holeData => {
      const hole = new THREE.Path();
      hole.moveTo(holeData[0][0] * scale, holeData[0][1] * scale);
      for (let i = 1; i < holeData.length; i++) {
        hole.lineTo(holeData[i][0] * scale, holeData[i][1] * scale);
      }
      hole.closePath();
      shape.holes.push(hole);
    });
  }

  // Create geometry with extrusion for 3D depth
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: scale * 0.08,
    bevelEnabled: true,
    bevelThickness: scale * 0.02,
    bevelSize: scale * 0.02,
    bevelSegments: 2
  });
  geometry.center();

  // Main material - emissive for glow
  const mainMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0
  });

  const mesh = new THREE.Mesh(geometry, mainMaterial);
  mesh.position.z = scale * 0.04;
  mesh.renderOrder = 100; // Ensure title renders on top
  group.add(mesh);

  // Inner bright core (slightly smaller, brighter)
  const coreGeometry = geometry.clone();
  const coreMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0
  });
  const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
  coreMesh.scale.setScalar(0.92);
  coreMesh.position.z = scale * 0.06;
  coreMesh.renderOrder = 101; // Render core on top of main
  group.add(coreMesh);

  // Handle special cases (like 'i' with a dot, 'a' with inner)
  if (shapeData.dot) {
    const dotShape = new THREE.Shape();
    const dot = shapeData.dot;
    dotShape.moveTo(dot[0][0] * scale, dot[0][1] * scale);
    for (let i = 1; i < dot.length; i++) {
      dotShape.lineTo(dot[i][0] * scale, dot[i][1] * scale);
    }
    dotShape.closePath();

    const dotGeometry = new THREE.ExtrudeGeometry(dotShape, {
      depth: scale * 0.08,
      bevelEnabled: true,
      bevelThickness: scale * 0.02,
      bevelSize: scale * 0.02,
      bevelSegments: 2
    });

    // Center the dot geometry
    dotGeometry.center();

    // Calculate the offset needed to position dot above the stem
    // Stem at Y: 0-0.78, center at 0.39
    // Dot at Y: 0.88-1, center at 0.94
    // Offset: 0.94 - 0.39 = 0.55
    const dotYOffset = scale * 0.55;

    const dotMainMaterial = mainMaterial.clone();
    const dotMesh = new THREE.Mesh(dotGeometry, dotMainMaterial);
    dotMesh.position.z = scale * 0.04;
    dotMesh.position.y = dotYOffset;
    dotMesh.renderOrder = 100;
    group.add(dotMesh);

    const dotCoreMaterial = coreMaterial.clone();
    const dotCoreMesh = new THREE.Mesh(dotGeometry.clone(), dotCoreMaterial);
    dotCoreMesh.scale.setScalar(0.92);
    dotCoreMesh.position.z = scale * 0.06;
    dotCoreMesh.position.y = dotYOffset;
    dotCoreMesh.renderOrder = 101;
    group.add(dotCoreMesh);
  }

  if (shapeData.inner) {
    // For 'a' - the inner triangle is a hole, not a separate shape
    // Already handled by the main shape system
  }

  // Store references for animation
  group.userData.mainMesh = mesh;
  group.userData.coreMesh = coreMesh;
  group.userData.mainMaterial = mainMaterial;
  group.userData.coreMaterial = coreMaterial;

  // Adjust 'i' position so its baseline aligns with other letters
  // Other letters have center at 0.5, 'i' stem center is at 0.39
  // Shift down by (0.5 - 0.39) * scale to align baselines
  if (letter === 'i') {
    group.position.y = -0.11 * scale;
  }

  return group;
}

// ============================================================================
// CREATE GLOW PLANE (for outer bloom effect)
// ============================================================================

function createGlowPlane(width, height, color) {
  const geometry = new THREE.PlaneGeometry(width * 1.8, height * 1.8);

  // Create gradient texture for glow - stronger like Tron: Legacy
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  gradient.addColorStop(0.15, 'rgba(0, 212, 255, 0.8)');
  gradient.addColorStop(0.4, 'rgba(0, 212, 255, 0.3)');
  gradient.addColorStop(0.7, 'rgba(0, 180, 255, 0.1)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const plane = new THREE.Mesh(geometry, material);
  plane.position.z = -0.1;
  plane.renderOrder = 99; // Render glow behind letters but above background

  return plane;
}

// ============================================================================
// CREATE TRON HERO TEXT
// ============================================================================

export function createTronHeroText(text, options = {}) {
  const {
    letterHeight = 1.8,           // Much smaller - fits in viewport
    letterSpacing = 0.12,         // Space between letters
    color = 0x00d4ff,             // Main cyan color
    glowIntensity = 0.6,          // Glow strength
    drawDuration = 3.0,           // Time to draw all letters
    electricInterval = 2.0,       // Time between electric pulses
    isMobile = false
  } = options;

  const group = new THREE.Group();
  group.userData.letterGroups = [];
  group.userData.electricParticles = [];
  group.userData.drawProgress = 0;
  group.userData.drawDuration = drawDuration;
  group.userData.electricInterval = electricInterval;
  group.userData.lastElectricTime = 0;
  group.userData.color = color;
  group.userData.glowIntensity = glowIntensity;

  const scale = letterHeight;
  const letters = text.toLowerCase().split('');

  // Calculate total width for centering
  let totalWidth = 0;
  letters.forEach((letter, i) => {
    const width = LETTER_WIDTHS[letter] || 0.7;
    totalWidth += width * scale;
    if (i < letters.length - 1) {
      totalWidth += letterSpacing * scale;
    }
  });

  // Create each letter
  let currentX = -totalWidth / 2;

  letters.forEach((letter, letterIndex) => {
    const letterMesh = createLetterMesh(letter, scale, color);
    if (!letterMesh) return;

    const width = (LETTER_WIDTHS[letter] || 0.7) * scale;

    // Position letter
    letterMesh.position.x = currentX + width / 2;
    letterMesh.userData.letterIndex = letterIndex;
    letterMesh.userData.totalLetters = letters.length;

    // Add glow plane behind letter
    const glowPlane = createGlowPlane(width, scale, color);
    glowPlane.position.x = currentX + width / 2;
    letterMesh.userData.glowPlane = glowPlane;
    group.add(glowPlane);

    group.add(letterMesh);
    group.userData.letterGroups.push(letterMesh);

    currentX += width + letterSpacing * scale;
  });

  // Create electric particle system
  const particleCount = 50;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3);
  const lifetimes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = -1000; // Hidden initially
    velocities[i * 3] = 0;
    velocities[i * 3 + 1] = 0;
    velocities[i * 3 + 2] = 0;
    lifetimes[i] = 0;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: isMobile ? 0.08 : 0.05,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  group.add(particles);

  group.userData.particles = particles;
  group.userData.particleVelocities = velocities;
  group.userData.particleLifetimes = lifetimes;
  group.userData.nextParticle = 0;

  // Add the animation function
  group.userData.animate = (time) => {
    animateTronHeroText(group, time);
  };

  return group;
}

// ============================================================================
// ANIMATION
// ============================================================================

function animateTronHeroText(group, time) {
  const {
    letterGroups,
    glowIntensity,
    color
  } = group.userData;

  // Calculate draw progress (0 to 1)
  group.userData.drawProgress = Math.min(1, group.userData.drawProgress + 0.012);
  const drawProgress = group.userData.drawProgress;

  // Animate each letter's draw-in
  letterGroups.forEach((letterGroup, letterIndex) => {
    const { mainMaterial, coreMaterial, glowPlane, totalLetters } = letterGroup.userData;

    // Calculate when this letter should start and end drawing
    const letterStart = letterIndex / totalLetters;
    const letterEnd = (letterIndex + 1) / totalLetters;
    const letterProgress = Math.max(0, Math.min(1,
      (drawProgress - letterStart) / (letterEnd - letterStart)
    ));

    // Smooth easing for opacity
    const easeProgress = letterProgress < 0.5
      ? 2 * letterProgress * letterProgress
      : 1 - Math.pow(-2 * letterProgress + 2, 2) / 2;

    // Update materials
    if (mainMaterial) {
      mainMaterial.opacity = easeProgress;
    }
    if (coreMaterial) {
      coreMaterial.opacity = easeProgress * 0.5;
    }

    // Update glow plane
    if (glowPlane && glowPlane.material) {
      glowPlane.material.opacity = easeProgress * glowIntensity * 0.4;
    }

    // Update all children (for letters with multiple parts like 'i')
    letterGroup.children.forEach(child => {
      if (child.material && child !== letterGroup.userData.mainMesh && child !== letterGroup.userData.coreMesh) {
        child.material.opacity = easeProgress;
      }
    });

    // Add pulse effect after fully drawn
    if (letterProgress >= 1) {
      const pulse = Math.sin(time * 2 + letterIndex * 0.3) * 0.1 + 0.9;
      if (mainMaterial) {
        mainMaterial.opacity = pulse;
      }
      if (coreMaterial) {
        coreMaterial.opacity = pulse * 0.5;
      }
      if (glowPlane && glowPlane.material) {
        glowPlane.material.opacity = pulse * glowIntensity * 0.4;
      }
    }
  });

  // Electric spark effects - only after fully drawn
  if (drawProgress >= 1) {
    const timeSinceLastElectric = time - group.userData.lastElectricTime;

    if (timeSinceLastElectric > group.userData.electricInterval + Math.random() * 2) {
      group.userData.lastElectricTime = time;
      spawnElectricSparks(group);
    }

    // Update existing particles
    updateElectricParticles(group, time);
  }

  // Subtle shimmer effect on all letters
  letterGroups.forEach((letterGroup, letterIndex) => {
    if (letterGroup.userData.mainMaterial && letterGroup.userData.mainMaterial.opacity > 0) {
      const shimmer = Math.sin(time * 6 + letterIndex * 1.5) * 0.08;
      const baseColor = new THREE.Color(color);
      const shimmerColor = baseColor.clone();
      shimmerColor.r = Math.min(1, baseColor.r + shimmer);
      shimmerColor.g = Math.min(1, baseColor.g + shimmer);
      shimmerColor.b = Math.min(1, baseColor.b + shimmer);
      letterGroup.userData.mainMaterial.color = shimmerColor;
    }
  });
}

function spawnElectricSparks(group) {
  const { letterGroups, particles, particleVelocities, particleLifetimes } = group.userData;

  // Pick a random letter
  const letterIndex = Math.floor(Math.random() * letterGroups.length);
  const letterGroup = letterGroups[letterIndex];

  // Get world position of the letter
  const worldPos = new THREE.Vector3();
  letterGroup.getWorldPosition(worldPos);

  // Spawn particles around the letter
  const positions = particles.geometry.attributes.position.array;
  const sparkCount = 5 + Math.floor(Math.random() * 5);

  for (let i = 0; i < sparkCount; i++) {
    const particleIndex = group.userData.nextParticle;
    group.userData.nextParticle = (group.userData.nextParticle + 1) % 50;

    // Random position around the letter
    const x = letterGroup.position.x + (Math.random() - 0.5) * 1.5;
    const y = letterGroup.position.y + (Math.random() - 0.5) * 2;
    const z = 0.2;

    positions[particleIndex * 3] = x;
    positions[particleIndex * 3 + 1] = y;
    positions[particleIndex * 3 + 2] = z;

    // Random velocity outward
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.6;
    particleVelocities[particleIndex * 3] = Math.cos(angle) * speed;
    particleVelocities[particleIndex * 3 + 1] = Math.sin(angle) * speed;
    particleVelocities[particleIndex * 3 + 2] = (Math.random() - 0.5) * 0.3;

    particleLifetimes[particleIndex] = 1.0;
  }

  particles.geometry.attributes.position.needsUpdate = true;
}

function updateElectricParticles(group, time) {
  const { particles, particleVelocities, particleLifetimes } = group.userData;
  const positions = particles.geometry.attributes.position.array;

  const deltaTime = 0.016; // Approximate frame time

  for (let i = 0; i < 50; i++) {
    if (particleLifetimes[i] > 0) {
      // Update position
      positions[i * 3] += particleVelocities[i * 3] * deltaTime;
      positions[i * 3 + 1] += particleVelocities[i * 3 + 1] * deltaTime;
      positions[i * 3 + 2] += particleVelocities[i * 3 + 2] * deltaTime;

      // Apply gravity-like effect
      particleVelocities[i * 3 + 1] -= 1.5 * deltaTime;

      // Decay lifetime
      particleLifetimes[i] -= deltaTime * 2;

      if (particleLifetimes[i] <= 0) {
        // Hide dead particles
        positions[i * 3 + 2] = -1000;
      }
    }
  }

  particles.geometry.attributes.position.needsUpdate = true;
}

// ============================================================================
// CREATE LIGHT BEAM EFFECT (for draw-in visual)
// ============================================================================

export function createLightBeamTracer(color = 0x00d4ff) {
  const geometry = new THREE.SphereGeometry(0.08, 8, 8);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 1
  });

  const tracer = new THREE.Mesh(geometry, material);

  // Add glow sphere
  const glowGeometry = new THREE.SphereGeometry(0.2, 8, 8);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  tracer.add(glow);

  tracer.visible = false;

  return tracer;
}

// ============================================================================
// CREATE COMPLETE HERO SECTION
// ============================================================================

export function createTronHeroSection(text, tagline, socials, options = {}) {
  const {
    isMobile = false,
    mainColor = 0x00d4ff,
    accentColor = 0xff6600
  } = options;

  const group = new THREE.Group();

  // Main title with Tron filled style - bold glowing letters like Tron: Legacy
  const mainTitle = createTronHeroText(text, {
    letterHeight: isMobile ? 1.4 : 2.2,
    letterSpacing: 0.08,
    color: mainColor,
    glowIntensity: 1.0,
    drawDuration: 2.5,
    electricInterval: 3.0,
    isMobile
  });
  mainTitle.position.set(0, isMobile ? 8 : 10, 0);
  group.add(mainTitle);

  // Store reference for animation
  group.userData.mainTitle = mainTitle;

  // Animation function
  group.userData.animate = (time) => {
    // Animate main title
    if (mainTitle.userData.animate) {
      mainTitle.userData.animate(time);
    }

    // Very subtle floating motion
    mainTitle.position.y = (isMobile ? 8 : 10) + Math.sin(time * 0.5) * 0.08;
  };

  return group;
}

// ============================================================================
// BACKGROUND GRID FOR HERO (unused but kept for reference)
// ============================================================================

function createBackgroundGrid(color, isMobile) {
  const group = new THREE.Group();

  const gridWidth = isMobile ? 18 : 30;
  const gridHeight = isMobile ? 8 : 12;
  const spacing = 1.5;

  const material = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.08
  });

  // Horizontal lines
  for (let y = -gridHeight / 2; y <= gridHeight / 2; y += spacing) {
    const points = [
      new THREE.Vector3(-gridWidth / 2, y, 0),
      new THREE.Vector3(gridWidth / 2, y, 0)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material.clone());
    line.userData.baseY = y;
    group.add(line);
  }

  // Vertical lines
  for (let x = -gridWidth / 2; x <= gridWidth / 2; x += spacing) {
    const points = [
      new THREE.Vector3(x, -gridHeight / 2, 0),
      new THREE.Vector3(x, gridHeight / 2, 0)
    ];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, material.clone());
    line.userData.baseX = x;
    group.add(line);
  }

  return group;
}

function animateBackgroundGrid(gridGroup, time) {
  gridGroup.children.forEach((line, index) => {
    // Subtle opacity pulse
    const pulse = Math.sin(time * 0.5 + index * 0.1) * 0.03 + 0.08;
    line.material.opacity = pulse;
  });
}
