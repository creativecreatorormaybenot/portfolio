import * as THREE from 'three';

// Create neon text as a sprite with canvas-rendered text
export function createNeonText(text, options = {}) {
  const {
    fontSize = 64,
    color = '#00d4ff',
    glowColor = null,
    fontFamily = 'Orbitron, sans-serif',
    fontWeight = '700',
    maxWidth = 800,
    align = 'center'
  } = options;

  // Create canvas for text
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set up font
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  // Measure text and handle multi-line
  const lines = wrapText(ctx, text, maxWidth);
  const lineHeight = fontSize * 1.3;
  const textWidth = Math.max(...lines.map(line => ctx.measureText(line).width));
  const textHeight = lines.length * lineHeight;

  // Set canvas size with padding for glow
  const padding = fontSize;
  canvas.width = Math.ceil(textWidth + padding * 2);
  canvas.height = Math.ceil(textHeight + padding * 2);

  // Reset font after resize
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  const actualGlowColor = glowColor || color;

  // Draw glow layers
  for (let i = 5; i >= 1; i--) {
    ctx.shadowColor = actualGlowColor;
    ctx.shadowBlur = fontSize * 0.3 * i;
    ctx.fillStyle = `rgba(${hexToRgb(color).join(',')}, ${0.1 * i})`;

    lines.forEach((line, index) => {
      const x = align === 'center' ? canvas.width / 2 : padding;
      const y = padding + lineHeight * index + lineHeight / 2;
      ctx.fillText(line, x, y);
    });
  }

  // Draw main text
  ctx.shadowColor = actualGlowColor;
  ctx.shadowBlur = fontSize * 0.2;
  ctx.fillStyle = color;

  lines.forEach((line, index) => {
    const x = align === 'center' ? canvas.width / 2 : padding;
    const y = padding + lineHeight * index + lineHeight / 2;
    ctx.fillText(line, x, y);
  });

  // Inner bright core
  ctx.shadowBlur = 2;
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.7;

  lines.forEach((line, index) => {
    const x = align === 'center' ? canvas.width / 2 : padding;
    const y = padding + lineHeight * index + lineHeight / 2;
    ctx.fillText(line, x, y);
  });

  // Create texture and plane mesh (instead of sprite for stationary text)
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  const scale = fontSize / 50;
  const planeWidth = canvas.width / fontSize * scale;
  const planeHeight = canvas.height / fontSize * scale;

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);

  // Store metadata for interaction
  mesh.userData = {
    type: 'neonText',
    originalColor: color,
    canvas,
    text
  };

  return mesh;
}

// Create a clickable neon link button with Tron: Legacy styling
export function createNeonLink(text, url, options = {}) {
  const {
    fontSize = 32,
    color = '#00d4ff',
    hoverColor = '#ffffff',
    padding = { x: 30, y: 15 }
  } = options;

  const group = new THREE.Group();

  // Create text-only canvas (no border - border is handled by Three.js geometry)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `500 ${fontSize}px Orbitron, sans-serif`;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  canvas.width = Math.ceil(textWidth + padding.x * 2);
  canvas.height = Math.ceil(fontSize * 2 + padding.y * 2);

  // Minimal dark background fill only (no border)
  ctx.fillStyle = 'rgba(0, 12, 24, 0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw text with subtle glow
  ctx.font = `500 ${fontSize}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.fillStyle = color;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // White core for brightness
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.4;
  ctx.shadowBlur = 0;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  const scale = fontSize / 40;
  const planeWidth = canvas.width / fontSize * scale;
  const planeHeight = canvas.height / fontSize * scale;

  const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 200;
  group.add(mesh);

  // === TRON-STYLE GEOMETRIC BORDER & EFFECTS ===

  const btnColor = new THREE.Color(color);
  const hw = planeWidth / 2;
  const hh = planeHeight / 2;
  const cornerSize = Math.min(hw, hh) * 0.35; // Corner bracket size

  // 1. Main border frame - rectangular outline
  const borderGeometry = new THREE.BufferGeometry();
  const borderPositions = new Float32Array([
    -hw, hh, 0.01,
    hw, hh, 0.01,
    hw, -hh, 0.01,
    -hw, -hh, 0.01
  ]);
  borderGeometry.setAttribute('position', new THREE.BufferAttribute(borderPositions, 3));

  const borderMaterial = new THREE.LineBasicMaterial({
    color: btnColor,
    transparent: true,
    opacity: 0.5
  });
  const borderMesh = new THREE.LineLoop(borderGeometry, borderMaterial);
  borderMesh.renderOrder = 201;
  group.add(borderMesh);

  // 2. Corner brackets - L-shaped accents at each corner (Tron signature look)
  const createCornerBracket = (cx, cy, dirX, dirY) => {
    const positions = new Float32Array([
      cx, cy + dirY * cornerSize, 0.015,
      cx, cy, 0.015,
      cx + dirX * cornerSize, cy, 0.015
    ]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  };

  const bracketMaterial = new THREE.LineBasicMaterial({
    color: btnColor,
    transparent: true,
    opacity: 0.7
  });

  // Four corner brackets
  const brackets = [
    new THREE.Line(createCornerBracket(-hw, hh, 1, -1), bracketMaterial.clone()),  // Top-left
    new THREE.Line(createCornerBracket(hw, hh, -1, -1), bracketMaterial.clone()),  // Top-right
    new THREE.Line(createCornerBracket(hw, -hh, -1, 1), bracketMaterial.clone()),  // Bottom-right
    new THREE.Line(createCornerBracket(-hw, -hh, 1, 1), bracketMaterial.clone())   // Bottom-left
  ];
  brackets.forEach(b => {
    b.renderOrder = 202;
    group.add(b);
  });

  // 3. Circuit trace - bright point traveling around the perimeter
  const traceGeometry = new THREE.BufferGeometry();
  traceGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0.02]), 3));

  const traceMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.07,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const traceMesh = new THREE.Points(traceGeometry, traceMaterial);
  traceMesh.renderOrder = 205;
  group.add(traceMesh);

  // 4. Corner node points - bright dots at corners
  const cornerGeometry = new THREE.BufferGeometry();
  const cornerPositions = new Float32Array([
    -hw, hh, 0.02,
    hw, hh, 0.02,
    hw, -hh, 0.02,
    -hw, -hh, 0.02
  ]);
  cornerGeometry.setAttribute('position', new THREE.BufferAttribute(cornerPositions, 3));

  const cornerMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.04,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  const cornerMesh = new THREE.Points(cornerGeometry, cornerMaterial);
  cornerMesh.renderOrder = 203;
  group.add(cornerMesh);

  // === ANIMATION STATE ===
  const animState = {
    hoverProgress: 0,
    traceProgress: Math.random(), // Random start position for variety
    time: 0
  };

  // Helper: get position along rectangular perimeter (t = 0 to 1)
  const getPerimeterPosition = (t, halfW, halfH) => {
    t = ((t % 1) + 1) % 1;
    const topLen = halfW * 2;
    const rightLen = halfH * 2;
    const bottomLen = halfW * 2;
    const leftLen = halfH * 2;
    const total = topLen + rightLen + bottomLen + leftLen;
    const d = t * total;

    let x, y;
    if (d < topLen) {
      x = -halfW + d;
      y = halfH;
    } else if (d < topLen + rightLen) {
      x = halfW;
      y = halfH - (d - topLen);
    } else if (d < topLen + rightLen + bottomLen) {
      x = halfW - (d - topLen - rightLen);
      y = -halfH;
    } else {
      x = -halfW;
      y = -halfH + (d - topLen - rightLen - bottomLen);
    }
    return { x, y };
  };

  // Store all refs in userData
  mesh.userData = {
    type: 'link',
    url,
    text,
    originalColor: color,
    hoverColor,
    isHovered: false,
    width: planeWidth,
    height: planeHeight,
    // Hover effect refs
    borderMesh,
    borderMaterial,
    brackets,
    traceMesh,
    traceGeometry,
    traceMaterial,
    cornerMesh,
    cornerMaterial,
    animState,
    mainMesh: mesh,
    hw,
    hh,
    getPerimeterPosition
  };

  group.userData = mesh.userData;

  // === ANIMATION FUNCTION ===
  group.userData.animate = (time) => {
    const data = group.userData;
    const state = data.animState;
    state.time = time;

    // Smooth hover transition
    const targetHover = data.isHovered ? 1 : 0;
    state.hoverProgress += (targetHover - state.hoverProgress) * 0.12;

    // Clamp for stability
    if (state.hoverProgress < 0.01) state.hoverProgress = 0;
    if (state.hoverProgress > 0.99) state.hoverProgress = 1;

    const hp = state.hoverProgress;

    // 1. Border frame - brightens on hover
    data.borderMaterial.opacity = 0.5 + hp * 0.4;

    // 2. Corner brackets - brighten on hover
    data.brackets.forEach(bracket => {
      bracket.material.opacity = 0.7 + hp * 0.3;
    });

    // 3. Circuit trace - travels around perimeter, visible on hover
    const traceSpeed = 0.012;
    state.traceProgress = (state.traceProgress + traceSpeed) % 1;
    const tracePos = data.getPerimeterPosition(state.traceProgress, data.hw, data.hh);
    data.traceGeometry.attributes.position.setXYZ(0, tracePos.x, tracePos.y, 0.02);
    data.traceGeometry.attributes.position.needsUpdate = true;
    data.traceMaterial.opacity = hp * 0.95;
    data.traceMaterial.size = 0.07 + hp * 0.03;

    // 4. Corner nodes - brighten on hover
    data.cornerMaterial.opacity = 0.4 + hp * 0.5;
    data.cornerMaterial.size = 0.04 + hp * 0.03;

    // 5. Main mesh brightness boost
    const brightness = 1 + hp * 0.3;
    data.mainMesh.material.color.setRGB(brightness, brightness, brightness);
  };

  // Helper to propagate renderOrder to children
  group.userData.setRenderOrder = (order) => {
    mesh.renderOrder = order;
    borderMesh.renderOrder = order + 1;
    cornerMesh.renderOrder = order + 2;
    traceMesh.renderOrder = order + 3;
  };

  return group;
}

// Layout buttons horizontally with equal edge-to-edge spacing
// Returns the positioned buttons (modifies their position.x in place)
export function layoutButtonsHorizontally(buttons, gap = 0.5) {
  if (buttons.length === 0) return;

  // Get widths of all buttons
  const widths = buttons.map(btn => btn.userData.width || 2);
  const totalWidth = widths.reduce((sum, w) => sum + w, 0);
  const totalGaps = (buttons.length - 1) * gap;
  const fullWidth = totalWidth + totalGaps;

  // Position each button so edges are equally spaced
  let currentX = -fullWidth / 2;

  buttons.forEach((btn, i) => {
    const width = widths[i];
    // Position is at center, so add half width
    btn.position.x = currentX + width / 2;
    currentX += width + gap;
  });
}

// Create a simple backing board for project cards
function createCardBackingBoard(width, height, color) {
  const group = new THREE.Group();

  // Main backing panel
  const panelGeo = new THREE.PlaneGeometry(width, height);
  const panelMat = new THREE.MeshBasicMaterial({
    color: 0x000a12,
    transparent: true,
    opacity: 0.75,
    side: THREE.DoubleSide,
    depthWrite: false // Prevent depth-fighting with other transparent objects
  });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.z = -1.0; // Push further back to avoid clipping with content
  group.add(panel);

  // Glowing border
  const borderGeo = new THREE.EdgesGeometry(panelGeo);
  const borderMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.5
  });
  const border = new THREE.LineSegments(borderGeo, borderMat);
  border.position.z = -0.9;
  group.add(border);

  // Corner accents
  const cornerSize = Math.min(width, height) * 0.12;
  const corners = [
    { x: -width / 2 + cornerSize / 2, y: height / 2 - cornerSize / 2 },
    { x: width / 2 - cornerSize / 2, y: height / 2 - cornerSize / 2 },
    { x: -width / 2 + cornerSize / 2, y: -height / 2 + cornerSize / 2 },
    { x: width / 2 - cornerSize / 2, y: -height / 2 + cornerSize / 2 }
  ];

  corners.forEach(pos => {
    const cornerGeo = new THREE.PlaneGeometry(cornerSize, cornerSize);
    const cornerEdges = new THREE.EdgesGeometry(cornerGeo);
    const cornerMat = new THREE.LineBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.6
    });
    const corner = new THREE.LineSegments(cornerEdges, cornerMat);
    corner.position.set(pos.x, pos.y, -0.8);
    group.add(corner);
  });

  return group;
}

// Create a project card with neon styling
export function createProjectCard(project, index) {
  const group = new THREE.Group();

  // Add backing board behind the card content
  const backingBoard = createCardBackingBoard(16, 10, project.color || '#00d4ff');
  backingBoard.position.y = -0.5; // Center it on the content
  group.add(backingBoard);

  // Project title
  const title = createNeonText(project.title, {
    fontSize: 48,
    color: project.color || '#00d4ff',
    fontWeight: '700'
  });
  title.position.y = 2;
  group.add(title);

  // Description
  const desc = createNeonText(project.description, {
    fontSize: 24,
    color: '#88ccff',
    fontWeight: '400',
    maxWidth: 600
  });
  desc.position.y = 0;
  group.add(desc);

  // Tags
  const tagsText = project.tags.join(' | ');
  const tags = createNeonText(tagsText, {
    fontSize: 18,
    color: '#666699',
    fontWeight: '400'
  });
  tags.position.y = -1.5;
  group.add(tags);

  // Links - create all buttons first, then layout with equal spacing
  const linkButtons = project.links.map((link) => {
    const linkBtn = createNeonLink(link.hint || link.site, link.url, {
      fontSize: 20,
      color: project.color || '#00d4ff'
    });
    linkBtn.position.y = -3;
    group.add(linkBtn);
    return linkBtn;
  });

  // Layout buttons with equal edge-to-edge spacing
  layoutButtonsHorizontally(linkButtons, 0.3);

  group.userData = {
    type: 'projectCard',
    project,
    index
  };

  return group;
}

// Helper: wrap text into multiple lines
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// Helper: convert hex to RGB array
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 212, 255];
}

// Helper: draw rounded rectangle
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
