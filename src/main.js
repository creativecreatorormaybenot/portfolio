import * as THREE from 'three';
import { portfolioData } from './data.js';
import { createNeonText, createNeonLink, createProjectCard, layoutButtonsHorizontally } from './NeonText.js';
import { createTronHeroSection } from './TronHeroText.js';
import {
  createGridFloor,
  createCorridor,
  createTronFurniture,
  createParticleSystem,
  createEndWall,
  createBackingBoard
} from './TronEnvironment.js';
import { TransitionOrchestrator } from './transition/TransitionOrchestrator.js';

// ============================================================================
// GLOBAL STATE
// ============================================================================

let scene, camera, renderer;
let scrollProgress = 0;
let targetScrollProgress = 0;
let scrollSpeed = 0;
let isMobile = false;
let touchStartY = 0;
let lastTouchY = 0;

// Transition system
let transitionOrchestrator = null;
let clock = null;
let scrollEnabled = false; // Scroll disabled until transition allows it

// Camera path configuration
const TOTAL_SCROLL_DISTANCE = 4500; // Virtual scroll distance - increased for more content
const CAMERA_PATH_LENGTH = 260; // Actual 3D world distance
const CONTENT_START_Z = -30; // Project cards start position (visible in background)
const CAMERA_BASE_Y = 5; // Base camera height (modified by floating effect)
const TARGET_LOOK_AT_Y = 6; // Base height the camera looks at
const CONTENT_SPACING = 12;

// Camera look-at state for smooth transitions
let currentLookAtX = 0;
let currentLookAtY = TARGET_LOOK_AT_Y;
let targetLookAtX = 0;
let targetLookAtY = TARGET_LOOK_AT_Y;

const animatedObjects = [];
const clickableObjects = [];
const contentSections = [];

// Effective scroll limit (calculated after content is created)
let effectiveMaxScroll = TOTAL_SCROLL_DISTANCE;

// Easing function for smooth scrolling
const lerp = (start, end, factor) => start + (end - start) * factor;

// ============================================================================
// INITIALIZATION
// ============================================================================

async function init() {
  // Detect mobile
  isMobile = window.innerWidth < 768 || 'ontouchstart' in window;

  // Create clock for delta time
  clock = new THREE.Clock();

  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000308);
  // Fog: starts closer to dim background while keeping hero clear
  scene.fog = new THREE.Fog(0x000308, 15, 70);

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, CAMERA_BASE_Y, 15);  // Camera position to match project tiles
  camera.lookAt(0, TARGET_LOOK_AT_Y, 0);  // Look at point matching project tile height

  // Renderer setup
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  document.getElementById('canvas-container').appendChild(renderer.domElement);

  // Create the environment (stores references for transition)
  const { floor, corridor } = createEnvironment();

  // Create content (stores reference to hero for transition)
  const { heroGroup, tronHero } = createContent();

  // Setup event listeners
  setupEventListeners();

  // Listen for interaction-ready event from transition
  window.addEventListener('transitionInteractive', () => {
    scrollEnabled = true;
    console.log('Scroll interaction enabled');
  });

  // Initialize transition orchestrator
  transitionOrchestrator = new TransitionOrchestrator(renderer, scene, camera);
  await transitionOrchestrator.init({
    gridFloor: floor,
    corridor: corridor,
    heroGroup: heroGroup,
    heroText: tronHero
  });

  // Set callbacks
  transitionOrchestrator.setOnHeroStart(() => {
    console.log('Starting hero text draw');
    if (tronHero?.userData?.startDraw) {
      tronHero.userData.startDraw();
    }
  });

  transitionOrchestrator.setOnComplete(() => {
    console.log('Transition complete!');
  });

  // Start animation loop
  animate();

  // Start transition after brief delay for scene to settle
  setTimeout(() => {
    transitionOrchestrator.start();
  }, 300);
}

// ============================================================================
// ENVIRONMENT CREATION
// ============================================================================

function createEnvironment() {
  // Grid floor
  const floor = createGridFloor(500, 100);
  scene.add(floor);

  // Corridor - length 280 extends floor lines well past end section (z=-218)
  // so they fade naturally into fog/darkness rather than ending abruptly
  // (vertical wall lines at x=±20 are outside the main view area)
  const corridor = createCorridor(280, 40, 25);
  scene.add(corridor);

  // Particles - extended to cover full scene depth including past end section
  const particles = createParticleSystem(800, { x: 60, y: 25, z: 300 });
  scene.add(particles);
  animatedObjects.push(particles);

  // Decorative furniture along the path
  const furnitureTypes = ['pillar', 'cube', 'ring', 'sphere', 'pyramid'];
  const furnitureColors = [0x00d4ff, 0xff6600, 0x00ff88, 0xff3366, 0x9966ff];

  // Left side decorations
  for (let i = 0; i < 15; i++) {
    const type = furnitureTypes[i % furnitureTypes.length];
    const color = furnitureColors[i % furnitureColors.length];
    const furniture = createTronFurniture(type, color);

    furniture.position.set(
      -18 - Math.random() * 5,
      type === 'cube' || type === 'ring' || type === 'sphere' ? 8 + Math.random() * 5 : 0,
      -20 - i * 12  // Start at z=-20 (visible behind hero)
    );

    if (type === 'cube' || type === 'ring' || type === 'sphere' || type === 'pyramid') {
      furniture.scale.setScalar(0.8 + Math.random() * 0.5);
    }

    scene.add(furniture);
    if (furniture.userData.animate) {
      animatedObjects.push(furniture);
    }
  }

  // Right side decorations
  for (let i = 0; i < 15; i++) {
    const type = furnitureTypes[(i + 2) % furnitureTypes.length];
    const color = furnitureColors[(i + 1) % furnitureColors.length];
    const furniture = createTronFurniture(type, color);

    furniture.position.set(
      18 + Math.random() * 5,
      type === 'cube' || type === 'ring' || type === 'sphere' ? 8 + Math.random() * 5 : 0,
      -25 - i * 12  // Start at z=-25
    );

    if (type === 'cube' || type === 'ring' || type === 'sphere' || type === 'pyramid') {
      furniture.scale.setScalar(0.8 + Math.random() * 0.5);
    }

    scene.add(furniture);
    if (furniture.userData.animate) {
      animatedObjects.push(furniture);
    }
  }

  // Ambient light (subtle)
  const ambientLight = new THREE.AmbientLight(0x001133, 0.5);
  scene.add(ambientLight);

  // Return references for transition system
  return { floor, corridor };
}

// ============================================================================
// CONTENT CREATION
// ============================================================================

function createContent() {
  // === HERO SECTION: Tron Legacy style "creativemaybeno" with draw-in animation ===
  const heroGroup = new THREE.Group();

  // Subtle backdrop behind tagline/buttons to improve legibility
  // Semi-transparent so content tiles remain faintly visible but don't compete for contrast
  const backdropWidth = isMobile ? 26 : 38;
  const backdropHeight = isMobile ? 4 : 4.5;
  const backdropGeometry = new THREE.PlaneGeometry(backdropWidth, backdropHeight);
  const backdropMaterial = new THREE.MeshBasicMaterial({
    color: 0x000308,      // Scene background color
    transparent: true,
    opacity: 0.5,         // Semi-transparent - dims background without blocking
    depthWrite: false,    // Don't write depth to avoid occlusion issues
    depthTest: true,
    side: THREE.DoubleSide
  });

  const backdrop = new THREE.Mesh(backdropGeometry, backdropMaterial);
  // Position behind tagline (y=3) and buttons (y=1.5), centered around y=2.25
  backdrop.position.set(0, 2.25, 5.5);  // Slightly behind tagline/buttons at z=6
  heroGroup.add(backdrop);

  // Create the new Tron-style hero with outline letters and draw-in animation
  // autoStart: false - wait for transition to trigger
  // drawSpeed: 0.033 - 500ms draw-in (Material Design compliant)
  const tronHero = createTronHeroSection('creativemaybeno', portfolioData.tagline, portfolioData.socials, {
    isMobile,
    mainColor: 0x00d4ff,
    accentColor: 0xff6600,
    autoStart: false,
    drawSpeed: 0.033
  });
  tronHero.position.set(0, -4, 0);
  heroGroup.add(tronHero);

  // Tagline below the main title (smaller, elegant styling)
  const tagline = createNeonText(portfolioData.tagline, {
    fontSize: isMobile ? 16 : 24,
    color: '#ff6600',
    fontWeight: '400',
    maxWidth: isMobile ? 600 : 1200  // Much wider to prevent truncation
  });
  tagline.position.set(0, isMobile ? 3.5 : 3, 6); // Move forward in Z to render in front
  tagline.renderOrder = 500; // High renderOrder to draw on top of project cards behind
  heroGroup.add(tagline);

  // Social links in hero - create all buttons first, then layout with equal edge spacing
  const socialFontSize = isMobile ? 11 : 13;
  const socialButtons = portfolioData.socials.map((social) => {
    const socialLink = createNeonLink(social.site, social.url, {
      fontSize: socialFontSize,
      color: '#88ccff'
    });

    // Set Y and Z position (X will be set by layoutButtonsHorizontally)
    socialLink.position.y = isMobile ? 1.5 : 1.5;
    socialLink.position.z = 6;

    // High renderOrder to draw on top of project cards behind
    socialLink.traverse(child => {
      if (child.isMesh || child.isLine || child.isPoints) child.renderOrder = 500;
    });
    heroGroup.add(socialLink);
    clickableObjects.push(socialLink);
    return socialLink;
  });

  // Layout buttons with equal edge-to-edge spacing
  layoutButtonsHorizontally(socialButtons, 0.3);

  heroGroup.position.set(0, 2, -5);  // Position hero section to match camera Y=8
  scene.add(heroGroup);

  contentSections.push({
    group: heroGroup,
    position: -5,
    xOffset: 0,
    isLeft: null, // Hero is centered
    isEndSection: false
  });

  // Animated effects for the hero
  heroGroup.userData.animate = (time) => {
    // Animate the Tron hero (draw-in, electric effects, etc.)
    if (tronHero.userData.animate) {
      tronHero.userData.animate(time);
    }
    // Tagline has constant opacity (no animation needed)
  };
  animatedObjects.push(heroGroup);

  // === PROJECT SECTIONS ===
  portfolioData.projects.forEach((project, index) => {
    const card = createProjectCard(project, index);

    // Alternating left/right positioning - embrace 3D with larger offsets
    const isLeft = index % 2 === 0;
    const xOffset = isMobile ? 0 : (isLeft ? -15 : 15);
    const zPos = CONTENT_START_Z - index * CONTENT_SPACING;

    card.position.set(xOffset, 6, zPos);

    // Pre-rotate tiles to face the camera when it looks at them
    // Camera looks at tiles from Z+15 (ahead) with the tile's X offset
    // The tile should rotate to face towards where the camera will be
    if (!isMobile && xOffset !== 0) {
      // Calculate angle: the camera will be at (0, y, zPos + ~12-15) looking at (xOffset, y, zPos)
      // Tile should face back towards the camera position
      // atan2(deltaX, deltaZ) gives us the Y rotation needed
      const cameraViewingZ = zPos + 12; // Camera typically views from ~12 units ahead
      const deltaX = 0 - xOffset; // Camera X is 0, tile X is xOffset
      const deltaZ = cameraViewingZ - zPos; // Camera Z - tile Z
      const angleToCamera = Math.atan2(deltaX, deltaZ);
      card.rotation.y = angleToCamera;
    }

    scene.add(card);

    // Register clickable links within the card
    card.children.forEach(child => {
      if (child.userData && child.userData.type === 'link') {
        clickableObjects.push(child);
      }
    });

    contentSections.push({
      group: card,
      position: zPos,
      xOffset: xOffset, // Store the tile's X position for camera look-at
      isLeft: isLeft,
      isEndSection: false
    });
  });

  // === END SECTION: Services & Contact ===
  const endZ = CONTENT_START_Z - portfolioData.projects.length * CONTENT_SPACING - 20;

  // Create end section group with backing board
  const endGroup = new THREE.Group();

  const endWall = createEndWall(portfolioData.endSection);
  // Wall is 36x18, centered at Y=9.5 puts bottom at Y=0.5 (just above floor)
  endWall.position.set(0, 9.5, 0);
  endGroup.add(endWall);

  // Services title - positioned within the new wall dimensions
  const servicesTitle = createNeonText('SERVICES', {
    fontSize: 56,
    color: '#ff6600',
    fontWeight: '800'
  });
  servicesTitle.position.set(0, 15, 2);
  servicesTitle.renderOrder = 10;
  endGroup.add(servicesTitle);

  const comingSoon = createNeonText('Coming Soon', {
    fontSize: 28,
    color: '#666699',
    fontWeight: '500'
  });
  comingSoon.position.set(0, 11.5, 2);
  comingSoon.renderOrder = 10;
  endGroup.add(comingSoon);

  // Contact section
  const contactTitle = createNeonText('GET IN TOUCH', {
    fontSize: 36,
    color: '#00d4ff',
    fontWeight: '700'
  });
  contactTitle.position.set(0, 7.5, 2);
  contactTitle.renderOrder = 10;
  endGroup.add(contactTitle);

  const emailLink = createNeonLink(
    portfolioData.endSection.email,
    `mailto:${portfolioData.endSection.email}`,
    { fontSize: 22, color: '#00ff88' }  // Slightly larger for readability
  );
  emailLink.position.set(0, 4.5, 2);
  emailLink.renderOrder = 10;
  endGroup.add(emailLink);
  clickableObjects.push(emailLink);

  const calendlyNote = createNeonText(portfolioData.endSection.calendlyNote, {
    fontSize: 18,  // Increased from 16 for better readability
    color: '#777788',  // Slightly brighter for visibility
    fontWeight: '400'
  });
  calendlyNote.position.set(0, 2, 2);
  calendlyNote.renderOrder = 10;
  endGroup.add(calendlyNote);

  // Position endGroup at Y=0 with wall bottom just above floor
  endGroup.position.set(0, 0, endZ);
  scene.add(endGroup);

  contentSections.push({
    group: endGroup,
    position: endZ,
    xOffset: 0,
    isLeft: null, // End section is centered
    isEndSection: true
  });

  // Calculate the effective max scroll based on where the camera should stop
  // Camera starts at Z=15 and should stop at endZ + 22 (22 units in front of the wall)
  // Close enough to read text, far enough to see full tile with new shorter wall height
  // scrollRatio = (15 - targetZ) / CAMERA_PATH_LENGTH
  // So maxScrollRatio = (15 - (endZ + 22)) / CAMERA_PATH_LENGTH
  const minCameraZ = endZ + 22;
  const maxScrollRatio = (15 - minCameraZ) / CAMERA_PATH_LENGTH;
  effectiveMaxScroll = Math.min(TOTAL_SCROLL_DISTANCE, maxScrollRatio * TOTAL_SCROLL_DISTANCE);

  // Return references for transition system
  return { heroGroup, tronHero };
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function setupEventListeners() {
  // Window resize
  window.addEventListener('resize', onWindowResize);

  // Scroll / wheel
  window.addEventListener('wheel', onWheel, { passive: false });

  // Touch events for mobile
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: false });
  window.addEventListener('touchend', onTouchEnd, { passive: true });

  // Click / tap for links
  renderer.domElement.addEventListener('click', onClick);
  renderer.domElement.addEventListener('touchend', onTap);

  // Mouse move for hover effects
  renderer.domElement.addEventListener('mousemove', onMouseMove);

  // Keyboard navigation
  window.addEventListener('keydown', onKeyDown);
}

function onWindowResize() {
  isMobile = window.innerWidth < 768;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.fov = isMobile ? 85 : 75;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  // Update transition orchestrator
  if (transitionOrchestrator) {
    transitionOrchestrator.onResize(window.innerWidth, window.innerHeight);
  }
}

function onWheel(event) {
  event.preventDefault();

  // Check if scroll is enabled (transition allows interaction)
  if (!scrollEnabled) return;

  const delta = event.deltaY * 0.5;
  scrollSpeed = delta;
  targetScrollProgress += delta;

  // Clamp scroll to effective limit (stops when Services wall fills screen)
  targetScrollProgress = Math.max(0, Math.min(effectiveMaxScroll, targetScrollProgress));

  // Hide scroll indicator after first scroll
  if (targetScrollProgress > 100) {
    const scrollIndicator = document.getElementById('scroll-indicator');
    scrollIndicator.classList.add('hidden');
    scrollIndicator.style.opacity = ''; // Clear inline style so CSS class takes effect
  }
}

function onTouchStart(event) {
  touchStartY = event.touches[0].clientY;
  lastTouchY = touchStartY;
}

function onTouchMove(event) {
  event.preventDefault();

  // Check if scroll is enabled (transition allows interaction)
  if (!scrollEnabled) return;

  const currentY = event.touches[0].clientY;
  const delta = (lastTouchY - currentY) * 3;
  lastTouchY = currentY;

  scrollSpeed = delta;
  targetScrollProgress += delta;
  targetScrollProgress = Math.max(0, Math.min(effectiveMaxScroll, targetScrollProgress));

  // Hide scroll indicator
  if (targetScrollProgress > 100) {
    const scrollIndicator = document.getElementById('scroll-indicator');
    scrollIndicator.classList.add('hidden');
    scrollIndicator.style.opacity = ''; // Clear inline style so CSS class takes effect
  }
}

function onTouchEnd() {
  // Check if scroll is enabled (transition allows interaction)
  if (!scrollEnabled) return;

  // Add momentum
  targetScrollProgress += scrollSpeed * 10;
  targetScrollProgress = Math.max(0, Math.min(effectiveMaxScroll, targetScrollProgress));
}

function onKeyDown(event) {
  // Check if scroll is enabled (transition allows interaction)
  if (!scrollEnabled) return;

  const scrollAmount = 200;

  switch (event.key) {
    // Reversing arrow up/down vs. page up/down and home/end
    // because arrow up means moving forward in games too.
    case 'ArrowUp':
    case ' ':
    case 'PageDown':
      event.preventDefault();
      targetScrollProgress += scrollAmount;
      break;
    case 'ArrowDown':
    case 'PageUp':
      event.preventDefault();
      targetScrollProgress -= scrollAmount;
      break;
    case 'Home':
      event.preventDefault();
      targetScrollProgress = 0;
      break;
    case 'End':
      event.preventDefault();
      targetScrollProgress = effectiveMaxScroll;
      break;
  }

  targetScrollProgress = Math.max(0, Math.min(effectiveMaxScroll, targetScrollProgress));

  if (targetScrollProgress > 100) {
    const scrollIndicator = document.getElementById('scroll-indicator');
    scrollIndicator.classList.add('hidden');
    scrollIndicator.style.opacity = ''; // Clear inline style so CSS class takes effect
  }
}

function onClick(event) {
  handleInteraction(event.clientX, event.clientY);
}

function onTap(event) {
  if (event.changedTouches && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    handleInteraction(touch.clientX, touch.clientY);
  }
}

function handleInteraction(clientX, clientY) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check all clickable objects
  const allClickables = [];
  clickableObjects.forEach(obj => {
    obj.traverse(child => {
      if (child.userData && child.userData.type === 'link') {
        allClickables.push(child);
      }
      if (child instanceof THREE.Mesh && child.userData?.type === 'link') {
        allClickables.push(child);
      }
    });
  });

  const intersects = raycaster.intersectObjects(allClickables, true);

  if (intersects.length > 0) {
    // Filter intersections to only include objects within the current focus area
    // Objects should be in front of the camera (closer Z) and within a reasonable distance
    const cameraZ = camera.position.z;
    const maxClickDistance = 30; // Only allow clicking objects within this Z distance from camera

    for (const intersect of intersects) {
      // Get the world position of the intersected point
      const objectZ = intersect.point.z;
      const distanceFromCamera = cameraZ - objectZ;

      // Only allow clicking if the object is in front of camera and within range
      if (distanceFromCamera > 0 && distanceFromCamera < maxClickDistance) {
        let clickedObj = intersect.object;

        // Traverse up to find link data
        while (clickedObj && !clickedObj.userData?.url) {
          clickedObj = clickedObj.parent;
        }

        if (clickedObj && clickedObj.userData?.url) {
          window.open(clickedObj.userData.url, '_blank', 'noopener,noreferrer');
          return; // Exit after opening first valid link
        }
      }
    }
  }
}

function onMouseMove(event) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Collect all link meshes from clickable objects
  const allLinks = [];
  clickableObjects.forEach(obj => {
    obj.traverse(child => {
      if (child instanceof THREE.Mesh && child.userData?.type === 'link') {
        allLinks.push(child);
      }
    });
  });

  const intersects = raycaster.intersectObjects(allLinks, true);

  // Reset cursor
  renderer.domElement.style.cursor = 'default';

  // Reset all link hover states (no scaling to prevent overlap)
  allLinks.forEach(mesh => {
    if (mesh.userData?.isHovered) {
      mesh.userData.isHovered = false;
    }
  });

  if (intersects.length > 0) {
    // Filter to only consider objects within the current focus area
    const cameraZ = camera.position.z;
    const maxHoverDistance = 30;

    for (const intersect of intersects) {
      const objectZ = intersect.point.z;
      const distanceFromCamera = cameraZ - objectZ;

      // Only show hover if object is in front of camera and within range
      if (distanceFromCamera > 0 && distanceFromCamera < maxHoverDistance) {
        const hoveredMesh = intersect.object;
        if (hoveredMesh.userData?.type === 'link') {
          renderer.domElement.style.cursor = 'pointer';
          if (!hoveredMesh.userData.isHovered) {
            hoveredMesh.userData.isHovered = true;
          }
          break; // Only hover the first valid link
        }
      }
    }
  }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

function animate() {
  requestAnimationFrame(animate);

  const time = performance.now() * 0.001;
  const delta = clock ? clock.getDelta() : 0.016;

  // Update transition if active
  if (transitionOrchestrator) {
    transitionOrchestrator.update(time, delta);
  }

  // Smooth scroll interpolation
  scrollProgress = lerp(scrollProgress, targetScrollProgress, 0.08);
  scrollSpeed *= 0.95; // Decay scroll speed

  // Update progress bar - use effectiveMaxScroll to reach 100% at end
  const progressPercent = (scrollProgress / effectiveMaxScroll) * 100;
  document.getElementById('progress-bar').style.width = `${Math.min(100, progressPercent)}%`;

  // Update camera position based on scroll
  updateCamera(time);

  // Animate objects
  animatedObjects.forEach(obj => {
    if (obj.userData && obj.userData.animate) {
      obj.userData.animate(time);
    }
  });

  // Animate clickable objects (buttons with hover effects)
  // Only animate after transition is complete to avoid overriding hidden state
  if (transitionOrchestrator?.isComplete) {
    clickableObjects.forEach(obj => {
      if (obj.userData && obj.userData.animate) {
        obj.userData.animate(time);
      }
    });
  }

  // Render - use orchestrator's render if shader is active, otherwise normal render
  const handledByOrchestrator = transitionOrchestrator?.render();
  if (!handledByOrchestrator) {
    renderer.render(scene, camera);
  }
}

function updateCamera(time) {
  // Map scroll progress to camera Z position
  const scrollRatio = scrollProgress / TOTAL_SCROLL_DISTANCE;

  // Find the end section to calculate scroll limit
  const endSection = contentSections.find(s => s.isEndSection);
  const endWallZ = endSection ? endSection.position : -200;

  // Stop camera before it would pass through the Services wall
  // Camera should stop close enough to read text (about 22 units in front of it)
  const minCameraZ = endWallZ + 22;
  const maxCameraZ = 15;

  // Calculate target Z with scroll limit
  let targetZ = maxCameraZ - scrollRatio * CAMERA_PATH_LENGTH;
  targetZ = Math.max(minCameraZ, targetZ);

  // Find the upcoming content section (the one we're approaching)
  // We want to look at a tile BEFORE we reach it
  let targetSection = null;

  // Configuration for look-at behavior
  const lookAheadDistance = 25; // Start transitioning this far before a tile
  const lookBehindDistance = 8; // Keep looking at a tile this far after passing it

  // Find which tile we should be looking at based on camera Z
  // Use the ACTUAL camera position (which lags behind targetZ due to lerp)
  const cameraZ = camera.position.z;

  // Find the closest tile that's in our viewing window
  // Priority: tiles we're approaching or just passing
  let bestSection = null;
  let bestScore = -Infinity;

  for (let i = 0; i < contentSections.length; i++) {
    const section = contentSections[i];
    const sectionZ = section.position;

    // Distance to section: positive = section is ahead (camera Z > section Z, meaning section is in -Z direction)
    const dist = cameraZ - sectionZ;

    // Check if this section is in our viewing window
    // We can look at tiles from lookAheadDistance ahead to lookBehindDistance behind
    if (dist >= -lookBehindDistance && dist <= lookAheadDistance) {
      // Score tiles: prefer ones slightly ahead of us
      // Best score when tile is about 10-15 units ahead
      const idealDistance = 12;
      const score = -Math.abs(dist - idealDistance);

      if (score > bestScore) {
        bestScore = score;
        bestSection = section;
      }
    }
  }

  targetSection = bestSection;

  // Check if we're near the end section - should always look straight there
  const endSectionRef = contentSections.find(s => s.isEndSection);
  const distToEnd = endSectionRef ? cameraZ - endSectionRef.position : Infinity;
  const nearEndSection = distToEnd >= -10 && distToEnd <= 40;  // Within range of end section

  // Determine where the camera should look
  if (!isMobile && targetSection) {
    const distToTarget = cameraZ - targetSection.position;

    if (targetSection.isEndSection || nearEndSection) {
      // End section or near it: always look straight ahead
      targetLookAtX = 0;
      targetLookAtY = TARGET_LOOK_AT_Y;
    } else if (targetSection.isLeft !== null) {
      // Project tiles: look towards the tile
      // Full strength when within viewing range
      const viewingStart = lookAheadDistance;
      const viewingEnd = -lookBehindDistance;

      // Calculate how much to look at this tile (0 to 1)
      let lookStrength;
      if (distToTarget > viewingStart) {
        // Haven't reached viewing range yet - start transitioning
        lookStrength = Math.max(0, 1 - (distToTarget - viewingStart) / CONTENT_SPACING);
      } else if (distToTarget < viewingEnd) {
        // Past the tile - fade out
        lookStrength = Math.max(0, 1 + (distToTarget - viewingEnd) / 5);
      } else {
        // In the sweet spot - full view
        lookStrength = 1;
      }

      // Look towards the tile's X offset
      targetLookAtX = targetSection.xOffset * 0.6 * lookStrength;
      targetLookAtY = TARGET_LOOK_AT_Y;
    } else {
      // Hero section: look straight
      targetLookAtX = 0;
      targetLookAtY = TARGET_LOOK_AT_Y;
    }
  } else {
    // Mobile or no section: look straight
    targetLookAtX = 0;
    targetLookAtY = TARGET_LOOK_AT_Y;
  }

  // Smooth interpolation of camera look-at target
  const lookLerpFactor = 0.02; // Slightly faster for more responsive feel
  currentLookAtX = lerp(currentLookAtX, targetLookAtX, lookLerpFactor);
  currentLookAtY = lerp(currentLookAtY, targetLookAtY, lookLerpFactor);

  // Smooth camera position movement (keep camera centered on the path)
  const targetCameraX = 0; // Camera stays centered
  const targetCameraY = CAMERA_BASE_Y; // Camera stays at base height

  camera.position.x = lerp(camera.position.x, targetCameraX, 0.03);
  camera.position.y = lerp(camera.position.y, targetCameraY, 0.03);
  camera.position.z = lerp(camera.position.z, targetZ, 0.08);

  // Add subtle floating motion
  camera.position.y += Math.sin(time * 0.5) * 0.05;

  // Calculate look-at point: ahead of camera with X offset to look at tiles
  // Closer look-at point for better tile visibility
  const lookAtZ = camera.position.z - 15;
  const lookAtTarget = new THREE.Vector3(currentLookAtX, currentLookAtY, lookAtZ);

  camera.lookAt(lookAtTarget);
}

// ============================================================================
// START
// ============================================================================

// Wait for fonts to load with explicit font face check
async function waitForFonts() {
  // Wait for document.fonts to be ready
  await document.fonts.ready;

  // Explicitly try to load Orbitron to ensure it's available
  try {
    await document.fonts.load('700 16px Orbitron');
    await document.fonts.load('500 16px Orbitron');
  } catch (e) {
    // Font load failed, but we'll continue with fallback
    console.warn('Orbitron font loading failed, using fallback');
  }

  // Small delay to ensure font rendering is stable
  await new Promise(resolve => setTimeout(resolve, 100));

  await init();
}

waitForFonts();
