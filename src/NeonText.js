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

// Create a clickable neon link button
export function createNeonLink(text, url, options = {}) {
  const {
    fontSize = 32,
    color = '#00d4ff',
    hoverColor = '#ffffff',
    padding = { x: 30, y: 15 }
  } = options;

  const group = new THREE.Group();

  // Create text sprite
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  ctx.font = `500 ${fontSize}px Orbitron, sans-serif`;
  const textMetrics = ctx.measureText(text);
  const textWidth = textMetrics.width;

  canvas.width = Math.ceil(textWidth + padding.x * 2);
  canvas.height = Math.ceil(fontSize * 2 + padding.y * 2);

  // Draw button background with border
  ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const cornerRadius = 8;
  roundRect(ctx, 4, 4, canvas.width - 8, canvas.height - 8, cornerRadius);
  ctx.fill();
  ctx.stroke();

  // Add glow to border
  ctx.shadowColor = color;
  ctx.shadowBlur = 15;
  ctx.stroke();

  // Draw text
  ctx.font = `500 ${fontSize}px Orbitron, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.shadowBlur = 10;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // White core
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.5;
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

  mesh.userData = {
    type: 'link',
    url,
    text,
    originalColor: color,
    hoverColor,
    isHovered: false
  };
  mesh.renderOrder = 200; // Ensure links render on top

  group.add(mesh);
  group.userData = mesh.userData;

  // Helper to propagate renderOrder to children
  group.userData.setRenderOrder = (order) => {
    mesh.renderOrder = order;
  };

  return group;
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

  // Links
  const linkSpacing = 3;
  const linksStartX = -(project.links.length - 1) * linkSpacing / 2;

  project.links.forEach((link, i) => {
    const linkBtn = createNeonLink(link.hint || link.site, link.url, {
      fontSize: 20,
      color: project.color || '#00d4ff'
    });
    linkBtn.position.x = linksStartX + i * linkSpacing;
    linkBtn.position.y = -3;
    group.add(linkBtn);
  });

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
