// ScrewAI Pro - WebGL Particle System
(function() {
  'use strict';

  const canvas = document.getElementById('particles-canvas');
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

  if (!gl) {
    console.warn('WebGL not supported, falling back to canvas 2D');
    initCanvas2D();
    return;
  }

  // Particle configuration
  const PARTICLE_COUNT = 150;
  const ORBIT_PARTICLE_RATIO = 0.48;
  const COLORS = [
    [177, 114, 255],  // Grape
    [139, 96, 234],   // Plum
    [212, 148, 255],  // Lavender
    [116, 92, 214],   // Indigo
    [201, 128, 255],  // Lilac
  ];

  // Vertex shader
  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute vec3 a_color;
    attribute float a_alpha;
    
    uniform vec2 u_resolution;
    
    varying vec3 v_color;
    varying float v_alpha;
    
    void main() {
      vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
      gl_PointSize = a_size;
      v_color = a_color;
      v_alpha = a_alpha;
    }
  `;

  // Fragment shader
  const fragmentShaderSource = `
    precision mediump float;
    
    varying vec3 v_color;
    varying float v_alpha;
    
    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);
      
      // Soft circular particle with glow
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha *= v_alpha;
      
      // Add glow effect
      float glow = exp(-dist * 3.0) * 0.5;
      
      gl_FragColor = vec4(v_color, alpha + glow * v_alpha);
    }
  `;

  // Create shader
  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  // Create program
  function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }

  // Initialize WebGL
  const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
  const program = createProgram(vertexShader, fragmentShader);

  if (!program) {
    initCanvas2D();
    return;
  }

  // Get attribute and uniform locations
  const positionLoc = gl.getAttribLocation(program, 'a_position');
  const sizeLoc = gl.getAttribLocation(program, 'a_size');
  const colorLoc = gl.getAttribLocation(program, 'a_color');
  const alphaLoc = gl.getAttribLocation(program, 'a_alpha');
  const resolutionLoc = gl.getUniformLocation(program, 'u_resolution');

  // Create buffers
  const positionBuffer = gl.createBuffer();
  const sizeBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const alphaBuffer = gl.createBuffer();

  function getHeroOrbitAnchor() {
    const heroLogo = document.querySelector('.hero-logo');
    if (!heroLogo) return null;

    const rect = heroLogo.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const dpr = window.devicePixelRatio || 1;
    return {
      x: (rect.left + rect.width * 0.5) * dpr,
      y: (rect.top + rect.height * 0.5) * dpr,
      radius: Math.max(rect.width, rect.height) * 0.68 * dpr
    };
  }

  // Particle class
  class Particle {
    constructor(index) {
      this.isOrbiting = index < Math.floor(PARTICLE_COUNT * ORBIT_PARTICLE_RATIO);
      this.reset();
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.size = Math.random() * 4 + 2;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.targetAlpha = this.alpha;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.r = color[0] / 255;
      this.g = color[1] / 255;
      this.b = color[2] / 255;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulsePhase = Math.random() * Math.PI * 2;

      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitSpeed = Math.random() * 0.01 + 0.004;
      this.orbitRadiusFactor = Math.random() * 0.5 + 0.95;
      this.orbitRadius = Math.random() * 120 + 80;
      this.orbitWobble = Math.random() * 18 + 10;
      this.orbitOffset = Math.random() * Math.PI * 2;
    }

    update(anchor) {
      this.pulsePhase += this.pulseSpeed;
      this.alpha = this.targetAlpha + Math.sin(this.pulsePhase) * 0.1;

      if (this.isOrbiting && anchor) {
        this.orbitAngle += this.orbitSpeed;
        const targetRadius = anchor.radius * this.orbitRadiusFactor;
        this.orbitRadius += (targetRadius - this.orbitRadius) * 0.06;

        const wobble = Math.sin(this.pulsePhase * 0.9 + this.orbitOffset) * this.orbitWobble;
        const orbitX = anchor.x + Math.cos(this.orbitAngle) * (this.orbitRadius + wobble);
        const orbitY = anchor.y + Math.sin(this.orbitAngle) * (this.orbitRadius + wobble);

        this.x += (orbitX - this.x) * 0.085;
        this.y += (orbitY - this.y) * 0.085;
        return;
      }

      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < -this.size) this.x = canvas.width + this.size;
      if (this.x > canvas.width + this.size) this.x = -this.size;
      if (this.y < -this.size) this.y = canvas.height + this.size;
      if (this.y > canvas.height + this.size) this.y = -this.size;
    }
  }

  // Create particles
  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => new Particle(i));

  // Resize handler
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  // Animation loop
  function render() {
    // Clear
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Use program
    gl.useProgram(program);

    // Update resolution uniform
    gl.uniform2f(resolutionLoc, canvas.width, canvas.height);

    // Update particles
    const positions = new Float32Array(PARTICLE_COUNT * 2);
    const sizes = new Float32Array(PARTICLE_COUNT);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const alphas = new Float32Array(PARTICLE_COUNT);
    const orbitAnchor = getHeroOrbitAnchor();

    particles.forEach((p, i) => {
      p.update(orbitAnchor);
      positions[i * 2] = p.x;
      positions[i * 2 + 1] = p.y;
      sizes[i] = p.size * (window.devicePixelRatio || 1);
      colors[i * 3] = p.r;
      colors[i * 3 + 1] = p.g;
      colors[i * 3 + 2] = p.b;
      alphas[i] = p.alpha;
    });

    // Update buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(sizeLoc);
    gl.vertexAttribPointer(sizeLoc, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(alphaLoc);
    gl.vertexAttribPointer(alphaLoc, 1, gl.FLOAT, false, 0, 0);

    // Draw
    gl.drawArrays(gl.POINTS, 0, PARTICLE_COUNT);

    requestAnimationFrame(render);
  }

  // Canvas 2D fallback
  function initCanvas2D() {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function getHeroOrbitAnchor2D() {
      const heroLogo = document.querySelector('.hero-logo');
      if (!heroLogo) return null;

      const rect = heroLogo.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;

      return {
        x: rect.left + rect.width * 0.5,
        y: rect.top + rect.height * 0.5,
        radius: Math.max(rect.width, rect.height) * 0.68
      };
    }

    const particles2D = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 4 + 2,
      alpha: Math.random() * 0.5 + 0.1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      isOrbiting: i < Math.floor(PARTICLE_COUNT * ORBIT_PARTICLE_RATIO),
      orbitAngle: Math.random() * Math.PI * 2,
      orbitSpeed: Math.random() * 0.01 + 0.004,
      orbitRadiusFactor: Math.random() * 0.5 + 0.95,
      orbitRadius: Math.random() * 120 + 80,
      orbitWobble: Math.random() * 18 + 10,
      orbitOffset: Math.random() * Math.PI * 2
    }));

    function resize2D() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function render2D() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const orbitAnchor = getHeroOrbitAnchor2D();

      particles2D.forEach(p => {
        p.pulsePhase += p.pulseSpeed;

        if (p.isOrbiting && orbitAnchor) {
          p.orbitAngle += p.orbitSpeed;
          const targetRadius = orbitAnchor.radius * p.orbitRadiusFactor;
          p.orbitRadius += (targetRadius - p.orbitRadius) * 0.06;

          const wobble = Math.sin(p.pulsePhase * 0.9 + p.orbitOffset) * p.orbitWobble;
          const orbitX = orbitAnchor.x + Math.cos(p.orbitAngle) * (p.orbitRadius + wobble);
          const orbitY = orbitAnchor.y + Math.sin(p.orbitAngle) * (p.orbitRadius + wobble);

          p.x += (orbitX - p.x) * 0.085;
          p.y += (orbitY - p.y) * 0.085;
        } else {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < -p.size) p.x = canvas.width + p.size;
          if (p.x > canvas.width + p.size) p.x = -p.size;
          if (p.y < -p.size) p.y = canvas.height + p.size;
          if (p.y > canvas.height + p.size) p.y = -p.size;
        }

        const alpha = p.alpha + Math.sin(p.pulsePhase) * 0.1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha})`;
        ctx.fill();

        // Glow effect
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        gradient.addColorStop(0, `rgba(${p.color[0]}, ${p.color[1]}, ${p.color[2]}, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(render2D);
    }

    window.addEventListener('resize', resize2D);
    resize2D();
    render2D();
  }

  // Start WebGL
  window.addEventListener('resize', resize);
  resize();
  render();
})();
