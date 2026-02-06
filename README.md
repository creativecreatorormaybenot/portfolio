# creativecreatorormaybenot/portfolio [![Twitter Follow](https://img.shields.io/twitter/follow/creativemaybeno?label=Follow&style=social)](https://twitter.com/creativemaybeno)

A portfolio showcasing public work that I think is relevant to what I currently do (creativecreatorormaybenot).

Built with Three.js featuring a Tron: Legacy inspired 3D experience. [View it live here](https://portfolio.creativemaybeno.dev).

[![Web app build status](https://github.com/creativecreatorormaybenot/portfolio/workflows/web%20app/badge.svg)](https://github.com/creativecreatorormaybenot/portfolio/actions?query=workflow%3A"web+app")

## Loading Transition

The portfolio features a GMUNK-inspired loading transition with smooth grid emergence:

1. **Grid Emergence** - Grid lines fade in from center, walls trace upward
2. **Light Tracers** - Bright points race along grid lines as it activates
3. **Content Reveal** - Hero text draws in, then remaining content fades in smoothly

### Animation Timeline

```
Time:   0.0s      0.5s      1.0s      1.5s      2.0s      2.5s      3.0s
        │         │         │         │         │         │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
LOADING │▓▓▓░░░   │         │         │         │         │         │
SCREEN  │ Fast    │         │         │         │         │         │
        │ fade    │         │         │         │         │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
GRID    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░│         │
EMERGE  │ Ignite + Radial + Walls (compressed, parallel)  │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
LIGHT   │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│░░░░░░░░░│         │
TRACERS │ Race along grid lines from center               │ Fade    │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
HERO    │         │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│         │         │         │
TEXT    │         │ Draw-in animation │         │         │         │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
CONTENT │         │         │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│         │
REVEAL  │         │         │ Tagline, buttons, decorations fade in │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
INTERACT│         │    ════════════════════════════════════════════▶│
        │         │    ↑ SCROLL ENABLED @ 1.2s                      │
        ├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
INDICATE│         │         │▓▓▓▓▓▓▓▓▓│         │         │         │
SCROLL  │         │         │ Fade in (if user is not yet scrolling)│
        └─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### Key Design Decisions

- **User can interact (scroll) at 1.2 seconds** - doesn't wait for animations to complete
- **Hero text draws in smoothly** - letter-by-letter reveal with glow effects
- **Content hidden initially** - clean reveal as grid emerges
- **Total animation: 3.0 seconds** - but most happens in the first 2s
- **Remaining animations are non-blocking** - content reveal finishes in background

### Performance Tiers

The transition automatically adapts based on device capabilities:

| Tier | GPU | Tracers | Interaction Delay |
|------|-----|---------|-------------------|
| High | RTX/M1/M2/M3 | All | 1.2s |
| Medium | GTX/Intel Iris | All | 1.2s |
| Low | Older/Mobile | Simplified | 1.0s |

## Development

```bash
npm install       # Install dependencies
npm run dev       # Start development server
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

## Architecture

The experience is built with vanilla Three.js. Key files:

- **src/main.js** - Scene initialization, camera control, scroll handling, animation loop
- **src/NeonText.js** - Canvas-to-texture text rendering with neon glow effects
- **src/TronEnvironment.js** - 3D environment: grid floor, corridor, particles, decorations
- **src/TronHeroText.js** - Hero section with custom letter shapes and draw-in animation
- **src/transition/** - Loading transition system:
  - `TransitionOrchestrator.js` - Main coordinator
  - `GridEmergenceController.js` - Grid/wall animation
  - `LightTracerSystem.js` - Light tracer effects
  - `PerformanceDetector.js` - Device capability detection

## License

This project is my personal portfolio. Feel free to use it as inspiration, but please don't copy it directly.
