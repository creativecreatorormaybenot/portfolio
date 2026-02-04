# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install                    # Install dependencies
VITE_NO_OPEN=true npm run dev  # Start dev server (preferred - no browser popup)
npm run build                  # Production build to dist/
npm run preview                # Preview production build locally
```

**IMPORTANT for Claude**: ALWAYS use `VITE_NO_OPEN=true npm run dev` when starting the development server. NEVER use plain `npm run dev` as it auto-opens the browser which is disruptive to the user.

**Note**: The `--open false` CLI flag does NOT work in Vite (the string 'false' is truthy). Use the `VITE_NO_OPEN=true` environment variable instead, which is checked in vite.config.js.

## Architecture Overview

This is a Three.js 3D portfolio with a Tron: Legacy aesthetic. The entire experience is a WebGL scene where users scroll through 3D space to view project cards.

### Core Concepts

**Scroll System**: Virtual scroll distance (4500 units) maps to camera movement along Z-axis (260 units). Scroll progress drives all animations and camera positioning.

**Camera Behavior**: Starts at `(0, 5, 15)` and moves toward negative Z. Desktop mode uses dynamic look-at based on upcoming project cards; mobile uses fixed look-ahead.

**Text Rendering**: All text is rendered to HTML5 Canvas, converted to Three.js textures, and applied to plane meshes. Multiple glow layers create the neon effect.

**Interactivity**: Raycasting detects mouse/touch intersections with clickable objects (links, buttons). Objects with `userData.url` open links on click.

**Animation Loop**: Objects with `userData.animate` function get called each frame with `(object, time, delta)`.

### Source Files

- **main.js** - Scene initialization, camera control, scroll handling, event listeners, animation loop
- **NeonText.js** - Canvas-to-texture text rendering: `createNeonText()`, `createNeonLink()`, `createProjectCard()`
- **TronEnvironment.js** - 3D environment: grid floor, corridor, particles, decorative furniture, walls
- **TronHeroText.js** - Hero section with custom letter shapes and draw-in animation
- **data.js** - Portfolio content (projects, socials, contact info)

### Key Variables in main.js

- `TOTAL_SCROLL_DISTANCE` (4500) - Virtual scroll range
- `CAMERA_PATH_LENGTH` (260) - Actual Z distance camera travels
- `CONTENT_SPACING` (12) - Gap between project cards
- `scrollProgress` / `targetScrollProgress` - Current and target scroll (0-1)
- `contentSections[]` - Array of positioned content for camera look-at calculations
- `clickableObjects[]` - Objects checked by raycaster for interactions

## Common Modifications

**Add a project**: Add entry to `portfolioData.projects` array in data.js with title, description, tags[], and links[].

**Change theme colors**: Primary cyan is `#00d4ff`, accent orange is `#ff6600`. These appear throughout NeonText.js and TronEnvironment.js.

**Adjust scroll speed**: Decrease `TOTAL_SCROLL_DISTANCE` for faster scrolling, or adjust the lerp factor in `animate()`.

## UI Testing & Screenshot Validation

When taking screenshots with Puppeteer for validation:

```bash
# Check if server is already running, if not start without auto-opening browser
curl -s http://localhost:5173 > /dev/null 2>&1 || VITE_NO_OPEN=true npm run dev &
sleep 3  # Wait for server to start
```

Then use Puppeteer in headless mode to scroll and capture:
```javascript
const browser = await puppeteer.launch({ headless: 'new' });
// ... scroll with page.mouse.wheel({ deltaY: 500 }) in a loop
// ... take screenshots with page.screenshot()
```

**Important**: Do NOT use `npm run dev -- --open false` - it doesn't work (opens `/false` route instead). The `VITE_NO_OPEN=true` env var is the correct approach.

**Cleanup**: Always stop the dev server after screenshot validation:
```bash
pkill -f "vite" 2>/dev/null || true
```

## End Section (Services Tile) Details

The end section is positioned at `endZ = CONTENT_START_Z - projects.length * CONTENT_SPACING - 20` (approximately z=-218).

**Key positioning constraints**:
- Wall height reduced to 18 units (from original 25) to fit viewport
- Wall positioned at Y=9.5 within endGroup (bottom at Y=0.5, above floor)
- Camera stops at `endZ + 22` for readable text while showing full tile
- Corridor length (210) stops wall lines before they appear behind the tile

**Rendering order for transparent objects**:
- Wall background: `renderOrder = 0`, `depthWrite: false`
- Border/frame lines: `renderOrder = 1-2`
- Text content: `renderOrder = 10`

## Tron Legacy Design Principles

Based on GMUNK's work (https://gmunk.com/TRON-Legacy):

- **Minimalist approach**: Clean surfaces, simple geometry
- **Angular L-brackets**: For corners instead of bulky squares
- **Ribbons of light**: Thin glowing lines, not heavy borders
- **Neon glows against dark backgrounds**: High contrast for readability
- **Grid-based layouts**: Structured, aligned elements
- **Accent colors**: Primary cyan `#00d4ff`, accent orange `#ff6600`

## Environment Sizing

- **Corridor length**: 280 units (floor lines extend to z=-280, fading into fog naturally)
- **Particle bounds**: z=300 to cover full scene depth
- **Decorative furniture**: Placed from z=-20 to z=-193, avoiding the end section area
- **End section**: Located at approximately z=-218

## Deployment

GitHub Actions automatically deploys the main branch to GitHub Pages at https://portfolio.creativemaybeno.dev when changes are pushed to src/, public/, index.html, package files, or vite.config.js.
