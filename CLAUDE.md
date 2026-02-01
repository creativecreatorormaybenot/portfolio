# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install       # Install dependencies
npm run dev       # Start development server (auto-opens browser)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

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

## Deployment

GitHub Actions automatically deploys the main branch to GitHub Pages at https://portfolio.creativemaybeno.dev when changes are pushed to src/, public/, index.html, package files, or vite.config.js.
