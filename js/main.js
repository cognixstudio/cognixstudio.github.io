/**
 * COGNIX STUDIO — Flagship Ecosystem Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  initTypewriter();
  initVideoPlayer();
  initMermaidDiagrams();
  initIntentSimulator();
  initVoiceVisualizer();
  initTerminalSandbox();
  initMobileMenu();
});

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
