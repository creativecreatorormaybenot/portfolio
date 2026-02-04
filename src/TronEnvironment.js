import * as THREE from 'three';

// Create the Tron-style grid floor
export function createGridFloor(size = 500, divisions = 100) {
  const group = new THREE.Group();

  // Main grid
  const gridHelper = new THREE.GridHelper(size, divisions, 0x00d4ff, 0x003344);
  gridHelper.material.opacity = 0; // Start hidden for transition
  gridHelper.material.transparent = true;
  gridHelper.userData.baseOpacity = 0.3;
  group.add(gridHelper);

  // Secondary finer grid
  const fineGrid = new THREE.GridHelper(size, divisions * 2, 0x00d4ff, 0x001122);
  fineGrid.material.opacity = 0; // Start hidden for transition
  fineGrid.material.transparent = true;
  fineGrid.userData.baseOpacity = 0.1;
  fineGrid.position.y = 0.01;
  group.add(fineGrid);

  // Glowing floor plane
  const floorGeometry = new THREE.PlaneGeometry(size, size);
  const floorMaterial = new THREE.MeshBasicMaterial({
    color: 0x000511,
    transparent: true,
    opacity: 0, // Start hidden for transition
    side: THREE.DoubleSide
  });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.1;
  floor.userData.baseOpacity = 0.9;
  group.add(floor);

  return group;
}

// Create glowing neon lines that form the corridor
export function createNeonLine(start, end, color = 0x00d4ff, intensity = 1) {
  const group = new THREE.Group();

  // Main line
  const points = [
    new THREE.Vector3(start.x, start.y, start.z),
    new THREE.Vector3(end.x, end.y, end.z)
  ];

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const baseOpacity = 0.8 * intensity;
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0 // Start hidden for transition
  });
  material.userData = { baseOpacity };

  const line = new THREE.Line(geometry, material);
  line.userData.baseOpacity = baseOpacity;
  group.add(line);

  // Glow effect using a thicker transparent line
  const glowBaseOpacity = 0.3 * intensity;
  const glowMaterial = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0, // Start hidden for transition
    linewidth: 3
  });
  glowMaterial.userData = { baseOpacity: glowBaseOpacity };

  const glowLine = new THREE.Line(geometry.clone(), glowMaterial);
  glowLine.userData.baseOpacity = glowBaseOpacity;
  group.add(glowLine);

  return group;
}

// Create a corridor of neon lines
export function createCorridor(length = 200, width = 30, height = 20) {
  const group = new THREE.Group();
  const color = 0x00d4ff;
  const accentColor = 0xff6600;

  // Floor lines (lengthwise)
  const lineSpacing = 3;
  const numLines = Math.floor(width / lineSpacing);

  for (let i = -numLines / 2; i <= numLines / 2; i++) {
    const xPos = i * lineSpacing;
    const line = createNeonLine(
      { x: xPos, y: 0, z: 10 },
      { x: xPos, y: 0, z: -length },
      i % 5 === 0 ? accentColor : color,
      i % 5 === 0 ? 1 : 0.5
    );
    group.add(line);
  }

  // Cross lines on floor
  for (let z = 0; z > -length; z -= 10) {
    const line = createNeonLine(
      { x: -width / 2, y: 0, z },
      { x: width / 2, y: 0, z },
      color,
      0.3
    );
    group.add(line);
  }

  // Wall lines (vertical)
  const wallSegments = Math.floor(length / 20);

  for (let i = 0; i < wallSegments; i++) {
    const z = -i * 20;

    // Left wall
    const leftLine = createNeonLine(
      { x: -width / 2, y: 0, z },
      { x: -width / 2, y: height, z },
      i % 3 === 0 ? accentColor : color,
      i % 3 === 0 ? 0.8 : 0.4
    );
    group.add(leftLine);

    // Right wall
    const rightLine = createNeonLine(
      { x: width / 2, y: 0, z },
      { x: width / 2, y: height, z },
      i % 3 === 0 ? accentColor : color,
      i % 3 === 0 ? 0.8 : 0.4
    );
    group.add(rightLine);
  }

  // Ceiling lines (horizontal on top)
  for (let i = -numLines / 2; i <= numLines / 2; i += 2) {
    const xPos = i * lineSpacing;
    const line = createNeonLine(
      { x: xPos, y: height, z: 10 },
      { x: xPos, y: height, z: -length },
      color,
      0.2
    );
    group.add(line);
  }

  return group;
}

// Create decorative furniture/objects
export function createTronFurniture(type = 'pillar', color = 0x00d4ff) {
  const group = new THREE.Group();

  switch (type) {
    case 'pillar': {
      // Glowing pillar
      const pillarGeo = new THREE.BoxGeometry(1, 15, 1);
      const edges = new THREE.EdgesGeometry(pillarGeo);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = 7.5;
      group.add(wireframe);

      // Inner glow
      const innerGeo = new THREE.BoxGeometry(0.8, 14.8, 0.8);
      const innerMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.1
      });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.y = 7.5;
      group.add(inner);
      break;
    }

    case 'cube': {
      // Floating rotating cube
      const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
      const edges = new THREE.EdgesGeometry(cubeGeo);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      group.add(wireframe);

      // Inner faces
      const innerMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide
      });
      const innerCube = new THREE.Mesh(cubeGeo, innerMat);
      group.add(innerCube);

      group.userData.animate = (time) => {
        group.rotation.x = time * 0.5;
        group.rotation.y = time * 0.3;
      };
      break;
    }

    case 'ring': {
      // Glowing ring
      const ringGeo = new THREE.TorusGeometry(3, 0.1, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Outer glow ring
      const glowRingGeo = new THREE.TorusGeometry(3, 0.3, 16, 100);
      const glowRingMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.2
      });
      const glowRing = new THREE.Mesh(glowRingGeo, glowRingMat);
      group.add(glowRing);

      group.userData.animate = (time) => {
        group.rotation.x = Math.PI / 4 + Math.sin(time * 0.5) * 0.2;
        group.rotation.z = time * 0.3;
      };
      break;
    }

    case 'sphere': {
      // Wireframe sphere
      const sphereGeo = new THREE.IcosahedronGeometry(2, 1);
      const edges = new THREE.EdgesGeometry(sphereGeo);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.7 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      group.add(wireframe);

      group.userData.animate = (time) => {
        group.rotation.y = time * 0.2;
      };
      break;
    }

    case 'pyramid': {
      // Glowing pyramid
      const pyramidGeo = new THREE.ConeGeometry(2, 4, 4);
      const edges = new THREE.EdgesGeometry(pyramidGeo);
      const lineMat = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.8 });
      const wireframe = new THREE.LineSegments(edges, lineMat);
      wireframe.position.y = 2;
      group.add(wireframe);

      group.userData.animate = (time) => {
        group.rotation.y = time * 0.4;
      };
      break;
    }
  }

  group.userData.type = 'furniture';
  return group;
}

// Create particle system for ambient effect
export function createParticleSystem(count = 500, bounds = { x: 50, y: 20, z: 200 }) {
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const cyan = new THREE.Color(0x00d4ff);
  const orange = new THREE.Color(0xff6600);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    positions[i3] = (Math.random() - 0.5) * bounds.x;
    positions[i3 + 1] = Math.random() * bounds.y;
    positions[i3 + 2] = -Math.random() * bounds.z;

    const color = Math.random() > 0.8 ? orange : cyan;
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 0.5;
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particles, material);

  particleSystem.userData.animate = (time) => {
    const positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.01;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
  };

  return particleSystem;
}

// Create a backing board/panel for content sections (Tron aesthetic)
export function createBackingBoard(width = 20, height = 12, options = {}) {
  const {
    color = 0x00d4ff,
    backgroundColor = 0x000a15,
    opacity = 0.85,
    borderOpacity = 0.6,
    glowIntensity = 0.3
  } = options;

  const group = new THREE.Group();

  // Main backing panel - semi-transparent dark background
  const panelGeo = new THREE.PlaneGeometry(width, height);
  const panelMat = new THREE.MeshBasicMaterial({
    color: backgroundColor,
    transparent: true,
    opacity: opacity,
    side: THREE.DoubleSide,
    depthWrite: false // Prevent depth-fighting with other transparent objects
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.z = -1.0; // Further behind content to avoid clipping
  group.add(panel);

  // Glowing border
  const borderGeo = new THREE.EdgesGeometry(panelGeo);
  const borderMat = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: borderOpacity
  });
  const border = new THREE.LineSegments(borderGeo, borderMat);
  border.position.z = -0.9;
  group.add(border);

  // Inner glow frame (subtle)
  const innerWidth = width - 0.5;
  const innerHeight = height - 0.5;
  const innerGeo = new THREE.PlaneGeometry(innerWidth, innerHeight);
  const innerEdges = new THREE.EdgesGeometry(innerGeo);
  const innerMat = new THREE.LineBasicMaterial({
    color: color,
    transparent: true,
    opacity: glowIntensity
  });
  const innerBorder = new THREE.LineSegments(innerEdges, innerMat);
  innerBorder.position.z = -0.8;
  group.add(innerBorder);

  // Corner accent pieces (Tron style)
  const cornerSize = Math.min(width, height) * 0.15;
  const cornerPositions = [
    { x: -width / 2 + cornerSize / 2, y: height / 2 - cornerSize / 2 },
    { x: width / 2 - cornerSize / 2, y: height / 2 - cornerSize / 2 },
    { x: -width / 2 + cornerSize / 2, y: -height / 2 + cornerSize / 2 },
    { x: width / 2 - cornerSize / 2, y: -height / 2 + cornerSize / 2 }
  ];

  cornerPositions.forEach(pos => {
    const cornerGeo = new THREE.PlaneGeometry(cornerSize, cornerSize);
    const cornerEdges = new THREE.EdgesGeometry(cornerGeo);
    const cornerMat = new THREE.LineBasicMaterial({
      color: 0xff6600, // Orange accent
      transparent: true,
      opacity: 0.7
    });
    const corner = new THREE.LineSegments(cornerEdges, cornerMat);
    corner.position.set(pos.x, pos.y, -0.7);
    group.add(corner);
  });

  group.userData.type = 'backingBoard';
  return group;
}

// Create the end wall with services section - Tron Legacy inspired minimalist design
export function createEndWall(data) {
  const group = new THREE.Group();

  const wallWidth = 36;
  const wallHeight = 18;  // Reduced from 25 for better viewport fit
  const hw = wallWidth / 2;
  const hh = wallHeight / 2;

  // Wall background - darker, more subtle
  const wallGeo = new THREE.PlaneGeometry(wallWidth, wallHeight);
  const wallMat = new THREE.MeshBasicMaterial({
    color: 0x000a14,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false
  });
  const wall = new THREE.Mesh(wallGeo, wallMat);
  wall.renderOrder = 0;
  group.add(wall);

  // Main border - thin elegant line (Tron "ribbon of light" style)
  const borderGeo = new THREE.EdgesGeometry(wallGeo);
  const borderMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.6
  });
  const border = new THREE.LineSegments(borderGeo, borderMat);
  border.renderOrder = 1;
  group.add(border);

  // Inner frame line - subtle depth effect (Tron minimalist aesthetic)
  const innerMargin = 0.8;
  const innerGeo = new THREE.PlaneGeometry(wallWidth - innerMargin * 2, wallHeight - innerMargin * 2);
  const innerEdges = new THREE.EdgesGeometry(innerGeo);
  const innerMat = new THREE.LineBasicMaterial({
    color: 0x00d4ff,
    transparent: true,
    opacity: 0.25
  });
  const innerBorder = new THREE.LineSegments(innerEdges, innerMat);
  innerBorder.position.z = 0.05;
  innerBorder.renderOrder = 1;
  group.add(innerBorder);

  // Angular L-bracket corners (Tron Legacy style - minimal, geometric)
  const bracketLength = 2.5;
  const bracketThickness = 0.15;
  const cornerOffset = 0.3;  // Slight inset from edge

  const createCornerBracket = (cx, cy, dirX, dirY) => {
    // L-shaped bracket with two lines meeting at corner
    const positions = new Float32Array([
      cx, cy + dirY * bracketLength, 0.1,
      cx, cy, 0.1,
      cx + dirX * bracketLength, cy, 0.1
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  };

  const bracketMat = new THREE.LineBasicMaterial({
    color: 0xff6600,
    transparent: true,
    opacity: 0.85
  });

  // Four corner brackets - positioned just inside the border
  const brackets = [
    { cx: -hw + cornerOffset, cy: hh - cornerOffset, dirX: 1, dirY: -1 },   // Top-left
    { cx: hw - cornerOffset, cy: hh - cornerOffset, dirX: -1, dirY: -1 },   // Top-right
    { cx: -hw + cornerOffset, cy: -hh + cornerOffset, dirX: 1, dirY: 1 },   // Bottom-left
    { cx: hw - cornerOffset, cy: -hh + cornerOffset, dirX: -1, dirY: 1 }    // Bottom-right
  ];

  brackets.forEach(b => {
    const bracketGeo = createCornerBracket(b.cx, b.cy, b.dirX, b.dirY);
    const bracket = new THREE.Line(bracketGeo, bracketMat.clone());
    bracket.renderOrder = 2;
    group.add(bracket);
  });

  // Small corner accent dots (Tron node style)
  const dotPositions = new Float32Array([
    -hw + cornerOffset, hh - cornerOffset, 0.12,
    hw - cornerOffset, hh - cornerOffset, 0.12,
    -hw + cornerOffset, -hh + cornerOffset, 0.12,
    hw - cornerOffset, -hh + cornerOffset, 0.12
  ]);
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3));
  const dotMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.7
  });
  const dots = new THREE.Points(dotGeo, dotMat);
  dots.renderOrder = 3;
  group.add(dots);

  return group;
}
