/**
 * COGNIX STUDIO — Flagship Ecosystem Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initLaunchIntro();
  initLaunchSequence();
  initStudioCore();
  initGlassSweep();
  initMagneticButtons();
  initScrollReveal();
  initTypewriter();
  initVideoPlayer();
  initMermaidDiagrams();
  initIntentSimulator();
  initVoiceVisualizer();
  initTerminalSandbox();
  initMobileMenu();
});

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ==========================================================================
   3D LAUNCH INTRO — full-screen particle-text assembly on first load
   "WELCOME TO" + "COGNIX STUDIO" converge from 3D depth, then launch-flash
   into the page. Runs once per browser session; skippable.
   ========================================================================== */
function initLaunchIntro() {
  const overlay = document.getElementById('launch-overlay');
  const canvas = document.getElementById('launch-canvas');
  const skipBtn = document.getElementById('launch-skip-btn');
  const progressFill = document.getElementById('launch-progress-fill');
  if (!overlay || !canvas) return;

  const alreadyPlayed = sessionStorage.getItem('cognix-intro-played') === '1';

  if (alreadyPlayed || PREFERS_REDUCED_MOTION) {
    overlay.remove();
    return;
  }

  document.body.classList.add('is-launching');
  sessionStorage.setItem('cognix-intro-played', '1');

  const ctx = canvas.getContext('2d');
  let width, height, dpr;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Sample target particle positions from offscreen text render ---
  function sampleTextPoints(lines, opts) {
    const off = document.createElement('canvas');
    off.width = width;
    off.height = height;
    const octx = off.getContext('2d');
    octx.fillStyle = '#fff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';

    const points = [];
    lines.forEach(line => {
      octx.clearRect(0, 0, width, height);
      octx.font = `${line.weight} ${line.size}px ${line.font}`;
      octx.fillText(line.text, width / 2, line.y);
      const imgData = octx.getImageData(0, 0, width, height).data;
      const step = line.step;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = imgData[(y * width + x) * 4 + 3];
          if (alpha > 128) {
            points.push({ x, y, group: line.group });
          }
        }
      }
    });
    return points;
  }

  const isSmall = width < 640;
  const titleSize = isSmall ? Math.round(width * 0.108) : Math.min(96, width * 0.075);
  const subSize = isSmall ? 15 : 18;
  // Shift the text block down so it sits clearly below the animated logo mark
  const midY = height / 2 + (isSmall ? 78 : 96);

  let targetPoints = sampleTextPoints([
    {
      text: 'W E L C O M E   T O',
      font: "'JetBrains Mono', monospace",
      size: subSize,
      weight: 600,
      y: midY - titleSize * 0.62,
      step: 3,
      group: 'sub'
    },
    {
      text: 'COGNIX STUDIO',
      font: "'Plus Jakarta Sans', sans-serif",
      size: titleSize,
      weight: 800,
      y: midY + titleSize * 0.06,
      step: isSmall ? 3 : 2.4,
      group: 'title'
    }
  ]);

  // Cap particle count for perf, sampling evenly across the point set
  const MAX_PARTICLES = isSmall ? 900 : 1800;
  if (targetPoints.length > MAX_PARTICLES) {
    const stride = targetPoints.length / MAX_PARTICLES;
    const sampled = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      sampled.push(targetPoints[Math.floor(i * stride)]);
    }
    targetPoints = sampled;
  }

  const hueColors = { title: '0, 240, 255', sub: '255, 46, 154' };

  const particles = targetPoints.map(p => {
    const angle = Math.random() * Math.PI * 2;
    const depth = 300 + Math.random() * 700; // simulated z-distance particles fly in from
    const spread = 260 + Math.random() * 420;
    return {
      x: width / 2 + Math.cos(angle) * spread,
      y: height / 2 + Math.sin(angle) * spread,
      z: depth,
      tx: p.x,
      ty: p.y,
      group: p.group,
      delay: Math.random() * 0.35,
      size: p.group === 'title' ? (Math.random() * 1.3 + 1.1) : (Math.random() * 0.9 + 0.7)
    };
  });

  const DURATION = 3400; // ms, total sequence before wipe
  const ASSEMBLE_END = 0.72;   // fraction of duration where assembly completes
  const FLASH_AT = 0.82;       // fraction where launch flash fires
  let startTime = null;
  let flashFired = false;
  let finished = false;

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }
  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function drawGrid(alpha) {
    ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
    ctx.lineWidth = 1;
    const spacing = 44;
    ctx.beginPath();
    for (let x = 0; x < width; x += spacing) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += spacing) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  function frame(now) {
    if (startTime === null) startTime = now;
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / DURATION);

    ctx.clearRect(0, 0, width, height);

    // Faint receding grid, fades as assembly progresses
    const gridAlpha = 0.05 * (1 - Math.min(1, t / ASSEMBLE_END));
    if (gridAlpha > 0.002) drawGrid(gridAlpha);

    const assembleT = Math.min(1, t / ASSEMBLE_END);

    particles.forEach(p => {
      const localT = Math.max(0, Math.min(1, (assembleT - p.delay) / (1 - p.delay)));
      const eased = easeOutExpo(localT);
      const x = p.x + (p.tx - p.x) * eased;
      const y = p.y + (p.ty - p.y) * eased;
      const z = p.z * (1 - eased);
      const scale = 1 + z / 900;
      const alpha = 0.25 + eased * 0.75;
      const color = hueColors[p.group];

      ctx.fillStyle = `rgba(${color}, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size * scale, 0, Math.PI * 2);
      ctx.fill();
    });

    // Launch flash — bright core burst once text has assembled
    if (t >= FLASH_AT && !flashFired) {
      flashFired = true;
    }
    if (flashFired) {
      const flashT = Math.min(1, (t - FLASH_AT) / (1 - FLASH_AT));
      const flashAlpha = Math.sin(flashT * Math.PI) * 0.9;
      if (flashAlpha > 0.01) {
        const grad = ctx.createRadialGradient(
          width / 2, height / 2, 0,
          width / 2, height / 2, Math.max(width, height) * 0.7
        );
        grad.addColorStop(0, `rgba(255,255,255,${flashAlpha * 0.5})`);
        grad.addColorStop(0.25, `rgba(0,240,255,${flashAlpha * 0.25})`);
        grad.addColorStop(1, 'rgba(0,240,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }
    }

    if (progressFill) {
      progressFill.style.width = (easeInOutCubic(t) * 100).toFixed(1) + '%';
    }

    if (t < 1 && !finished) {
      requestAnimationFrame(frame);
    } else if (!finished) {
      finishIntro();
    }
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    overlay.classList.add('is-hidden');
    document.body.classList.remove('is-launching');
    window.dispatchEvent(new Event('cognix:introComplete'));
    setTimeout(() => {
      overlay.remove();
    }, 750);
  }

  skipBtn?.addEventListener('click', finishIntro);
  overlay.addEventListener('click', finishIntro);
  window.addEventListener('keydown', function skipOnKey(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
      finishIntro();
      window.removeEventListener('keydown', skipOnKey);
    }
  });

  requestAnimationFrame(frame);
}

/* ==========================================================================
   LAUNCH SEQUENCE — hero entrance: elements assemble/glow to life
   ========================================================================== */
function initLaunchSequence() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const targets = ['.badge-tag', '.hero-title', '.typewriter-container', '.hero-subtitle', '.hero-actions']
    .map(sel => hero.querySelector(sel))
    .filter(Boolean);

  if (PREFERS_REDUCED_MOTION) {
    hero.classList.remove('launch-init');
    return;
  }

  const overlayActive = document.body.classList.contains('is-launching');

  function playHeroLaunch() {
    requestAnimationFrame(() => {
      targets.forEach(el => el.classList.add('launch-in'));
      setTimeout(() => hero.classList.remove('launch-init'), 1800);
    });
  }

  if (overlayActive) {
    // Wait for the full-screen intro to hand off before the hero assembles
    window.addEventListener('cognix:introComplete', playHeroLaunch, { once: true });
  } else {
    playHeroLaunch();
  }
}

/* ==========================================================================
   INTERACTIVE 3D STUDIO CORE — pointer-reactive wireframe reactor
   Lightweight hand-rolled 3D (perspective projection + z-sort), no deps.
   ========================================================================== */
function initStudioCore() {
  const canvas = document.getElementById('core-canvas');
  const stage = document.getElementById('core-stage');
  if (!canvas || !stage) return;

  const ctx = canvas.getContext('2d');
  let width, height, dpr;
  let pointerX = 0, pointerY = 0;   // normalized -1..1
  let targetRotX = 0.35, targetRotY = 0.4;
  let rotX = targetRotX, rotY = targetRotY;
  let launchProgress = PREFERS_REDUCED_MOTION ? 1 : 0;
  let autoSpin = 0;

  // Icosahedron-ish core vertices (unit sphere sample) + orbiting ring nodes
  const PHI = (1 + Math.sqrt(5)) / 2;
  const coreVerts = [
    [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
    [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
    [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1]
  ].map(v => normalize(v, 1));

  const coreEdges = [
    [0,1],[0,5],[0,7],[0,10],[0,11],[1,5],[1,7],[1,8],[1,9],
    [2,3],[2,4],[2,6],[2,10],[2,11],[3,4],[3,6],[3,8],[3,9],
    [4,5],[4,9],[4,11],[5,9],[5,11],[6,7],[6,8],[6,10],
    [7,8],[7,10],[8,9],[10,11]
  ];

  // Orbiting ring particles
  const ringCount = 22;
  const rings = [];
  for (let i = 0; i < ringCount; i++) {
    const angle = (i / ringCount) * Math.PI * 2;
    rings.push({
      angle,
      speed: 0.15 + (i % 3) * 0.05,
      radius: 1.7 + (i % 4) * 0.12,
      tilt: (i % 2 === 0) ? 0.15 : -0.2,
      size: 1.4 + (i % 3) * 0.6,
      hue: i % 3 // 0 cyan, 1 magenta, 2 cobalt
    });
  }

  function normalize(v, scale) {
    const len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    return [v[0]/len*scale, v[1]/len*scale, v[2]/len*scale];
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = stage.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function project(x, y, z, scale, focal) {
    const f = focal / (focal + z);
    return { x: x * f * scale, y: y * f * scale, f };
  }

  function rotatePoint(p, rx, ry) {
    // Rotate around X axis
    let y = p[1] * Math.cos(rx) - p[2] * Math.sin(rx);
    let z = p[1] * Math.sin(rx) + p[2] * Math.cos(rx);
    let x = p[0];
    // Rotate around Y axis
    let x2 = x * Math.cos(ry) + z * Math.sin(ry);
    let z2 = -x * Math.sin(ry) + z * Math.cos(ry);
    return [x2, y, z2];
  }

  const hueColors = {
    0: '0, 240, 255',    // cyan
    1: '255, 46, 154',   // magenta
    2: '76, 95, 255'     // cobalt
  };

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const baseScale = Math.min(width, height) * 0.30 * (0.85 + launchProgress * 0.15);
    const focal = 4.2;

    // Ease rotation toward pointer target for smooth "tilt" feel
    rotX += (targetRotX - rotX) * 0.06;
    rotY += (targetRotY - rotY) * 0.06;
    autoSpin += 0.0022;

    const ry = rotY + autoSpin;
    const rx = rotX;

    // --- Draw orbiting ring particles (behind + in front, z-sorted with core) ---
    const projectedRing = rings.map(r => {
      const a = r.angle + time * 0.00035 * (1 + r.speed);
      const rad = r.radius;
      const x = Math.cos(a) * rad;
      const z = Math.sin(a) * rad;
      const y = Math.sin(a * 1.3) * r.tilt * rad;
      const rotated = rotatePoint([x, y, z], rx, ry);
      const proj = project(rotated[0], rotated[1], rotated[2], baseScale, focal);
      return { ...proj, z: rotated[2], size: r.size, hue: r.hue };
    });

    // --- Project core vertices ---
    const projectedCore = coreVerts.map(v => {
      const rotated = rotatePoint(v, rx, ry);
      const proj = project(rotated[0], rotated[1], rotated[2], baseScale * 0.62, focal);
      return { ...proj, z: rotated[2] };
    });

    // Combine for z-sort of translucent elements (draw far to near)
    const drawables = [];
    projectedRing.forEach(p => drawables.push({ type: 'particle', ...p }));
    drawables.sort((a, b) => a.z - b.z);

    // Back particles
    drawables.filter(d => d.z < 0).forEach(p => drawParticle(p, cx, cy));

    // Core wireframe edges
    ctx.lineWidth = 1.1;
    coreEdges.forEach(([i, j]) => {
      const a = projectedCore[i];
      const b = projectedCore[j];
      const avgZ = (a.z + b.z) / 2;
      const alpha = 0.25 + (avgZ + 1) * 0.28 * launchProgress;
      ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0.05, alpha)})`;
      ctx.beginPath();
      ctx.moveTo(cx + a.x, cy + a.y);
      ctx.lineTo(cx + b.x, cy + b.y);
      ctx.stroke();
    });

    // Core vertex nodes with glow
    projectedCore.forEach(p => {
      const alpha = (0.4 + (p.z + 1) * 0.35) * launchProgress;
      const r = 2.4 * p.f;
      const grad = ctx.createRadialGradient(cx + p.x, cy + p.y, 0, cx + p.x, cy + p.y, r * 4);
      grad.addColorStop(0, `rgba(255,255,255,${alpha})`);
      grad.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx + p.x, cy + p.y, r * 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Inner glowing nucleus
    const nucleusR = baseScale * 0.16 * launchProgress;
    const nucGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, nucleusR * 2.2);
    nucGrad.addColorStop(0, 'rgba(255,255,255,0.9)');
    nucGrad.addColorStop(0.35, 'rgba(0,240,255,0.55)');
    nucGrad.addColorStop(1, 'rgba(255,46,154,0)');
    ctx.fillStyle = nucGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, nucleusR * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Front particles
    drawables.filter(d => d.z >= 0).forEach(p => drawParticle(p, cx, cy));

    if (launchProgress < 1) {
      launchProgress = Math.min(1, launchProgress + 0.018);
    }

    requestAnimationFrame(draw);
  }

  function drawParticle(p, cx, cy) {
    const alpha = (0.35 + (p.z + 2) * 0.18) * launchProgress;
    const color = hueColors[p.hue];
    const r = p.size * p.f;
    ctx.fillStyle = `rgba(${color}, ${Math.min(0.85, alpha)})`;
    ctx.beginPath();
    ctx.arc(cx + p.x, cy + p.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pointer interaction: tilt core toward cursor (desktop) / touch (mobile)
  function updatePointer(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    pointerX = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointerY = ((clientY - rect.top) / rect.height) * 2 - 1;
    targetRotY = 0.4 + pointerX * 0.6;
    targetRotX = 0.35 - pointerY * 0.5;
  }

  function resetPointer() {
    targetRotX = 0.35;
    targetRotY = 0.4;
  }

  stage.addEventListener('pointermove', (e) => updatePointer(e.clientX, e.clientY));
  stage.addEventListener('pointerleave', resetPointer);
  stage.addEventListener('touchmove', (e) => {
    if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

/* ==========================================================================
   FLUID GLASS — mouse-tracked refraction sweep on glass-card hover
   ========================================================================== */
function initGlassSweep() {
  const cards = document.querySelectorAll('.glass-card');
  if (!cards.length) return;

  cards.forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const mx = ((e.clientX - rect.left) / rect.width) * 100;
      const my = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', mx + '%');
      card.style.setProperty('--my', my + '%');
    });
  });
}

/* ==========================================================================
   MAGNETIC BUTTONS — subtle pull toward cursor within a radius
   ========================================================================== */
function initMagneticButtons() {
  if (PREFERS_REDUCED_MOTION) return;
  const buttons = document.querySelectorAll('.btn-magnetic');

  buttons.forEach(btn => {
    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      btn.style.setProperty('--tx', (relX * 0.18) + 'px');
      btn.style.setProperty('--ty', (relY * 0.28) + 'px');
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.setProperty('--tx', '0px');
      btn.style.setProperty('--ty', '0px');
    });
  });
}

/* ==========================================================================
   SCROLL REVEAL — sections fade/rise into view once
   ========================================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal-on-scroll');
  if (!targets.length) return;

  if (PREFERS_REDUCED_MOTION || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ==========================================================================
   0. TYPEWRITER & DELETING ANIMATION
   ========================================================================== */
function initTypewriter() {
  const textElement = document.getElementById('typewriter-text');
  if (!textElement) return;

  const phrases = [
    "Autonomous Multi-Agent Tool Orchestration",
    "Static AST Syntax Verification with Zero Server Risk",
    "Interactive Client-Side Mermaid.js Diagram Engine",
    "Real-Time PDF, DOCX & Markdown In-Memory Exports",
    "Bilingual Web Speech I/O in English & Hindi",
    "Zero-Trust Bring-Your-Own-Key Architecture"
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      textElement.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 30;
    } else {
      textElement.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 65;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      typingSpeed = 2000; // Pause when full sentence is typed
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typingSpeed = 400; // Pause before starting next sentence
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ==========================================================================
   1. HERO VIDEO SHOWCASE CONTROLLER
   ========================================================================== */
function initVideoPlayer() {
  const video = document.getElementById('hero-video');
  const playBtn = document.getElementById('video-play-btn');
  const muteBtn = document.getElementById('video-mute-btn');
  
  if (!video) return;

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (video.paused) {
        video.play();
        playBtn.innerHTML = '⏸';
      } else {
        video.pause();
        playBtn.innerHTML = '▶';
      }
    });
  }

  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.innerHTML = video.muted ? '🔇' : '🔊';
    });
  }
}

/* ==========================================================================
   2. MERMAID.JS LIVE DIAGRAM RENDERER
   ========================================================================== */
function initMermaidDiagrams() {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#030712',
        primaryColor: 'rgba(0, 240, 255, 0.15)',
        primaryTextColor: '#F8FAFC',
        primaryBorderColor: '#00F0FF',
        lineColor: '#3B82F6',
        secondaryColor: '#1E293B',
        tertiaryColor: '#0F172A'
      }
    });
  }

  window.renderDiagramSample = function(type) {
    const container = document.getElementById('mermaid-output-container');
    if (!container) return;

    let diagramCode = '';
    if (type === 'flowchart') {
      diagramCode = `
graph TD
  A[User Prompt] -->|Auto Intent Router| B(EKA Orchestrator)
  B -->|Code Request| C[Laguna-XS 2.1]
  B -->|Diagram Query| D[Mermaid Renderer]
  B -->|Doc Request| E[DocX / PDF Exporter]
  C --> F[AST Verified Output]
  D --> G[Live SVG Render]
  E --> H[In-Memory Export]
      `;
    } else if (type === 'sequence') {
      diagramCode = `
sequenceDiagram
  autonumber
  actor User
  participant Router as Nemotron-3 Router
  participant CodeModel as Laguna-XS Code
  participant AST as AST Syntax Checker

  User->>Router: "Write python binary search"
  Router->>CodeModel: Function Call Trigger
  CodeModel-->>AST: Send Generated AST
  AST-->>User: Verified Syntax & Code Output
      `;
    } else if (type === 'er') {
      diagramCode = `
erDiagram
  USER ||--o{ SESSION : has
  USER {
    string id
    string username
    string password_hash
  }
  SESSION {
    string token
    datetime expires_at
  }
      `;
    }

    container.innerHTML = `<div class="mermaid">${diagramCode}</div>`;
    if (typeof mermaid !== 'undefined') {
      mermaid.contentLoaded();
    }
  };
}

/* ==========================================================================
   3. AUTONOMOUS INTENT ROUTER SIMULATOR
   ========================================================================== */
function initIntentSimulator() {
  window.simulateIntent = function(promptText, targetTool, modelName) {
    const promptInput = document.getElementById('sim-active-prompt');
    const toolBadge = document.getElementById('sim-target-tool');
    const modelBadge = document.getElementById('sim-active-model');
    const statusText = document.getElementById('sim-status-text');

    if (promptInput) promptInput.textContent = `"${promptText}"`;
    if (toolBadge) toolBadge.textContent = `Tool: ${targetTool}`;
    if (modelBadge) modelBadge.textContent = `Router: ${modelName}`;
    if (statusText) statusText.textContent = `✓ Routed automatically without slash command`;
  };
}

/* ==========================================================================
   4. BILINGUAL VOICE I/O & AUDIO VISUALIZER
   ========================================================================== */
function initVoiceVisualizer() {
  window.speakSample = function(lang) {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    let text = lang === 'hi' 
      ? 'नमस्कार, मैं एका हूँ — कॉग्निक्स स्टूडियो का एआई एजेंट।'
      : 'Hello! I am EKA, the agentic tool orchestrator developed by Abhi Raj for Cognix Studio.';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 1.0;

    const waveBox = document.getElementById('voice-wave-visualizer');
    if (waveBox) {
      waveBox.style.borderColor = '#00F0FF';
      waveBox.style.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4)';
    }

    utterance.onend = () => {
      if (waveBox) {
        waveBox.style.borderColor = 'rgba(255, 255, 255, 0.06)';
        waveBox.style.boxShadow = 'none';
      }
    };

    window.speechSynthesis.speak(utterance);
  };
}

/* ==========================================================================
   5. INTERACTIVE TERMINAL SANDBOX
   ========================================================================== */
function initTerminalSandbox() {
  const termInput = document.getElementById('term-user-input');
  const termBody = document.getElementById('term-output-body');

  if (!termInput || !termBody) return;

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = termInput.value.trim();
      if (!val) return;

      appendTermLine(`> ${val}`, 'user');
      processTermCommand(val);
      termInput.value = '';
    }
  });

  window.runSampleTermCmd = function(cmd) {
    if (termInput) {
      termInput.value = cmd;
      appendTermLine(`> ${cmd}`, 'user');
      processTermCommand(cmd);
      termInput.value = '';
    }
  };

  function appendTermLine(text, type = 'output') {
    const line = document.createElement('div');
    line.className = type === 'user' ? 'term-line term-prompt' : 'term-output';
    line.textContent = text;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function processTermCommand(cmd) {
    const lower = cmd.toLowerCase();
    
    if (lower.startsWith('/avatar')) {
      appendTermLine('🤖 Generating DiceBear SVG Avatar for request...');
      appendTermLine('✓ Output: SVG Avatar generated successfully (bottts style).');
    } else if (lower.startsWith('/code')) {
      appendTermLine('💻 Invoking poolside/laguna-xs-2.1 code engine...');
      appendTermLine('ast.parse check: Passed 100% clean AST validation.');
      appendTermLine('✓ Code generated without server execution risk.');
    } else if (lower.startsWith('/diagram')) {
      appendTermLine('📊 Converting natural language to Mermaid.js SVG structure...');
      appendTermLine('✓ Interactive diagram rendered in client buffer.');
    } else if (lower.startsWith('/doc')) {
      appendTermLine('📄 Preparing In-Memory Document Export...');
      appendTermLine('✓ Generated DOCX/PDF buffer via ReportLab fallback pipeline.');
    } else if (lower === 'help') {
      appendTermLine('Available commands: /avatar <name>, /code <lang> <task>, /diagram <desc>, /doc <format> <topic>');
    } else {
      appendTermLine(`[EKA Router]: Processing "${cmd}" via Nemotron-3 Super auto-intent routing...`);
      appendTermLine(`✓ Execution completed. EKA agents ready.`);
    }
  }
}

/* ==========================================================================
   6. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.toggle('active');
    });

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('active');
      });
    });
  }
}
