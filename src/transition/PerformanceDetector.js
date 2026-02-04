/**
 * PerformanceDetector.js
 *
 * Detects device GPU capabilities and sets appropriate transition settings.
 * Runs a quick benchmark to determine if shader effects should be enabled.
 */

export class PerformanceDetector {
  constructor() {
    this.capabilities = {
      highPerformance: false,
      mediumPerformance: false,
      lowPerformance: true,
      isMobile: false,
      gpuTier: 0, // 0=low, 1=medium, 2=high
      maxParticles: 200,
      enableShader: false,
      enableFullTracers: true,
      interactionDelay: 1000 // ms until scroll is enabled
    };
  }

  async detect() {
    // Check for mobile
    this.capabilities.isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (window.innerWidth < 768);

    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      console.warn('WebGL not available, using minimal capabilities');
      return this.capabilities;
    }

    // Get GPU info
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      this.capabilities.gpuTier = this.classifyGPU(renderer);
      console.log('GPU detected:', renderer, '-> tier', this.capabilities.gpuTier);
    }

    // Run mini benchmark
    const benchmarkScore = await this.runBenchmark(gl);
    console.log('Benchmark score:', benchmarkScore.toFixed(1), 'FPS');

    // Set capabilities based on benchmark
    // Note: shader is disabled - using simpler reveal effect
    if (benchmarkScore > 55) {
      // High performance: 55+ FPS
      this.capabilities.highPerformance = true;
      this.capabilities.mediumPerformance = false;
      this.capabilities.lowPerformance = false;
      this.capabilities.enableShader = false; // Shader disabled for cleaner UX
      this.capabilities.enableFullTracers = true;
      this.capabilities.maxParticles = 500;
      this.capabilities.gpuTier = Math.max(this.capabilities.gpuTier, 2);
      this.capabilities.interactionDelay = 1200;
    } else if (benchmarkScore > 30) {
      // Medium performance: 30-55 FPS
      this.capabilities.highPerformance = false;
      this.capabilities.mediumPerformance = true;
      this.capabilities.lowPerformance = false;
      this.capabilities.enableShader = false;
      this.capabilities.enableFullTracers = true;
      this.capabilities.maxParticles = 300;
      this.capabilities.gpuTier = Math.max(this.capabilities.gpuTier, 1);
      this.capabilities.interactionDelay = 1200;
    } else {
      // Low performance: <30 FPS
      this.capabilities.highPerformance = false;
      this.capabilities.mediumPerformance = false;
      this.capabilities.lowPerformance = true;
      this.capabilities.enableShader = false;
      this.capabilities.enableFullTracers = false; // Simplified tracers
      this.capabilities.maxParticles = 100;
      this.capabilities.gpuTier = 0;
      this.capabilities.interactionDelay = 1000; // Faster interaction for low-end
    }

    // Cleanup
    canvas.remove();

    return this.capabilities;
  }

  classifyGPU(renderer) {
    const rendererLower = renderer.toLowerCase();

    // High-end GPUs
    const highEnd = /rtx|rx 6|rx 7|radeon pro|m1|m2|m3|apple gpu|arc a/i;
    if (highEnd.test(rendererLower)) return 2;

    // Mid-range GPUs
    const midEnd = /gtx 10|gtx 16|rx 5|intel iris|intel uhd|radeon rx|geforce mx/i;
    if (midEnd.test(rendererLower)) return 1;

    // Check for integrated graphics (usually lower tier)
    const integrated = /intel hd|intel graphics|mali|adreno|powervr/i;
    if (integrated.test(rendererLower)) return 0;

    // Default to medium if unknown
    return 1;
  }

  async runBenchmark(gl) {
    // Create a simple shader program
    const vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShader, `
      attribute vec2 pos;
      void main() { gl_Position = vec4(pos, 0.0, 1.0); }
    `);
    gl.compileShader(vertShader);

    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
      console.warn('Vertex shader compile failed');
      return 30; // Default to medium
    }

    const fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShader, `
      precision mediump float;
      uniform float time;
      void main() {
        float n = fract(sin(time * 12.9898 + gl_FragCoord.x * 0.01) * 43758.5453);
        gl_FragColor = vec4(n, n, n, 1.0);
      }
    `);
    gl.compileShader(fragShader);

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.warn('Fragment shader compile failed');
      return 30;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('Shader program link failed');
      return 30;
    }

    gl.useProgram(program);

    // Create geometry
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');

    // Measure frames - use fewer frames for faster detection
    const frameCount = 30;
    const startTime = performance.now();

    for (let i = 0; i < frameCount; i++) {
      gl.uniform1f(timeLoc, i * 0.016);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      gl.finish(); // Force sync
    }

    const elapsed = performance.now() - startTime;
    const fps = (frameCount / elapsed) * 1000;

    // Cleanup
    gl.deleteShader(vertShader);
    gl.deleteShader(fragShader);
    gl.deleteProgram(program);
    gl.deleteBuffer(buffer);

    return fps;
  }
}
