// ============================================================================
//  SHAILESH PORTFOLIO — Premium 3D Interactive Experience
//  Three.js r128 · Vanilla JS · Zero Dependencies
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ==========================================================================
  // 1. CONFIGURATION & CONSTANTS
  // ==========================================================================

  const CONFIG = {
    // Colors
    colors: {
      cyan:   0x00d4ff,
      purple: 0x7b61ff,
      mint:   0x00f5d4,
      pink:   0xff6b9d,
      white:  0xffffff,
    },

    // Particles
    particleCount: window.innerWidth < 768 ? 800 : 2000,
    particleSphereRadius: 50,
    particleSizeMin: 0.08,
    particleSizeMax: 0.15,
    particleRotationSpeed: 0.0002,

    // Camera
    cameraZ: 30,
    cameraParallaxFactor: 0.05,
    cameraMaxOffset: 2,

    // Geometric objects
    geoCount: window.innerWidth < 768 ? 5 : 10,
    geoSpreadX: 15,
    geoSpreadY: 10,
    geoSpreadZ: { min: -10, max: 5 },

    // Tilt cards
    tiltMax: 10,
    tiltPerspective: 1000,

    // Typing effect
    typingStrings: [
      'Computer Science Engineer',
      'Full Stack Developer',
      'Problem Solver',
      'Software Developer',
    ],
    typingSpeed: 80,
    deletingSpeed: 40,
    pauseAfterType: 1800,
    pauseAfterDelete: 500,

    // Counter animation
    counterDuration: 2000,

    // Scroll / nav
    navbarHeight: 80,
    navScrollThreshold: 50,

    // Intro
    introDuration: 2500,

    // Custom cursor
    cursorDotSize: 8,
    cursorRingSize: 40,
    cursorLerpFactor: 0.15,
    cursorMinWidth: 1024,

    // Scroll progress
    progressHeight: 3,
  };

  // Shared state
  const mouse = { x: 0, y: 0, clientX: 0, clientY: 0 };
  let isTabVisible = true;
  let animationFrameId = null;

  // ==========================================================================
  // 2. UTILITY HELPERS
  // ==========================================================================

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function throttle(fn, ms) {
    let last = 0;
    return function (...args) {
      const now = performance.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  }

  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  // ==========================================================================
  // 3. SCROLL PROGRESS BAR (dynamic element)
  // ==========================================================================

  const progressBar = document.createElement('div');
  progressBar.id = 'scroll-progress';
  Object.assign(progressBar.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    height: CONFIG.progressHeight + 'px',
    width: '0%',
    background: 'linear-gradient(90deg, #00d4ff, #7b61ff)',
    zIndex: '9998',
    transition: 'width 0.1s linear',
    pointerEvents: 'none',
  });
  document.body.appendChild(progressBar);

  function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  // ==========================================================================
  // 4. CUSTOM CURSOR (Desktop Only)
  // ==========================================================================

  let cursorDot = null;
  let cursorRing = null;
  let cursorPos = { x: 0, y: 0 };
  let cursorRingPos = { x: 0, y: 0 };
  let cursorVisible = false;
  let cursorEnlarged = false;

  function initCustomCursor() {
    if (window.innerWidth <= CONFIG.cursorMinWidth) return;

    // Create dot
    cursorDot = document.createElement('div');
    cursorDot.classList.add('cursor-dot');
    Object.assign(cursorDot.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: CONFIG.cursorDotSize + 'px',
      height: CONFIG.cursorDotSize + 'px',
      background: '#00d4ff',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '99999',
      transform: 'translate(-50%, -50%)',
      transition: 'opacity 0.3s, background 0.3s',
      opacity: '0',
      boxShadow: '0 0 10px #00d4ff88',
    });
    document.body.appendChild(cursorDot);

    // Create ring
    cursorRing = document.createElement('div');
    cursorRing.classList.add('cursor-ring');
    Object.assign(cursorRing.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: CONFIG.cursorRingSize + 'px',
      height: CONFIG.cursorRingSize + 'px',
      border: '2px solid rgba(0, 212, 255, 0.5)',
      borderRadius: '50%',
      pointerEvents: 'none',
      zIndex: '99998',
      transform: 'translate(-50%, -50%)',
      transition: 'width 0.3s, height 0.3s, border-color 0.3s, opacity 0.3s',
      opacity: '0',
    });
    document.body.appendChild(cursorRing);

    // Hide default cursor
    document.body.style.cursor = 'none';

    // Track all interactive elements
    const interactiveSelectors = 'a, button, .project-card, .nav-toggle, input, textarea, [role="button"]';
    document.querySelectorAll(interactiveSelectors).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursorEnlarged = true;
        cursorRing.style.width = (CONFIG.cursorRingSize * 1.6) + 'px';
        cursorRing.style.height = (CONFIG.cursorRingSize * 1.6) + 'px';
        cursorRing.style.borderColor = 'rgba(123, 97, 255, 0.7)';
        cursorDot.style.background = '#7b61ff';
        cursorDot.style.boxShadow = '0 0 14px #7b61ff88';
      });
      el.addEventListener('mouseleave', () => {
        cursorEnlarged = false;
        cursorRing.style.width = CONFIG.cursorRingSize + 'px';
        cursorRing.style.height = CONFIG.cursorRingSize + 'px';
        cursorRing.style.borderColor = 'rgba(0, 212, 255, 0.5)';
        cursorDot.style.background = '#00d4ff';
        cursorDot.style.boxShadow = '0 0 10px #00d4ff88';
      });
    });

    document.addEventListener('mouseenter', () => {
      cursorVisible = true;
      if (cursorDot) cursorDot.style.opacity = '1';
      if (cursorRing) cursorRing.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
      cursorVisible = false;
      if (cursorDot) cursorDot.style.opacity = '0';
      if (cursorRing) cursorRing.style.opacity = '0';
    });
  }

  function updateCustomCursor() {
    if (!cursorDot || !cursorRing) return;

    cursorPos.x = mouse.clientX;
    cursorPos.y = mouse.clientY;

    cursorRingPos.x = lerp(cursorRingPos.x, mouse.clientX, CONFIG.cursorLerpFactor);
    cursorRingPos.y = lerp(cursorRingPos.y, mouse.clientY, CONFIG.cursorLerpFactor);

    cursorDot.style.left = cursorPos.x + 'px';
    cursorDot.style.top = cursorPos.y + 'px';

    cursorRing.style.left = cursorRingPos.x + 'px';
    cursorRing.style.top = cursorRingPos.y + 'px';
  }

  // ==========================================================================
  // 5. CINEMATIC INTRO ANIMATION
  // ==========================================================================

  function playCinematicIntro() {
    const overlay = document.querySelector('.intro-overlay');
    const logo = document.querySelector('.intro-logo');
    const introText = document.querySelector('.intro-text');

    if (!overlay) {
      initMainExperience();
      return;
    }

    // Lock scroll during intro
    document.body.style.overflow = 'hidden';

    // Logo scale-up animation
    if (logo) {
      logo.style.transform = 'scale(0.5)';
      logo.style.opacity = '0';
      logo.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease';
      requestAnimationFrame(() => {
        logo.style.transform = 'scale(1)';
        logo.style.opacity = '1';
      });

      // Glow pulse via box-shadow animation
      let pulseCount = 0;
      const pulseInterval = setInterval(() => {
        pulseCount++;
        const intensity = Math.sin(pulseCount * 0.3) * 10 + 15;
        logo.style.filter = `drop-shadow(0 0 ${intensity}px rgba(0, 212, 255, 0.6))`;
        if (pulseCount > 30) clearInterval(pulseInterval);
      }, 80);
    }

    // Intro text fade-in after delay
    if (introText) {
      introText.style.opacity = '0';
      introText.style.transform = 'translateY(20px)';
      introText.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      setTimeout(() => {
        introText.style.opacity = '1';
        introText.style.transform = 'translateY(0)';
      }, 500);
    }

    // After introDuration, fade out overlay
    setTimeout(() => {
      overlay.style.transition = 'opacity 0.8s ease';
      overlay.style.opacity = '0';

      setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        initMainExperience();
      }, 800);
    }, CONFIG.introDuration);
  }

  // ==========================================================================
  // 6. THREE.JS 3D SCENE
  // ==========================================================================

  let scene, camera, renderer;
  let particleSystem, geoMeshes = [];
  let lights = {};
  let clock;

  function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  function createParticleSystem() {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(CONFIG.particleCount * 3);
    const colors = new Float32Array(CONFIG.particleCount * 3);
    const sizes = new Float32Array(CONFIG.particleCount);

    const colorCyan = new THREE.Color(CONFIG.colors.cyan);
    const colorPurple = new THREE.Color(CONFIG.colors.purple);
    const colorMint = new THREE.Color(CONFIG.colors.mint);

    for (let i = 0; i < CONFIG.particleCount; i++) {
      // Distribute particles in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = CONFIG.particleSphereRadius * Math.cbrt(Math.random());

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Color: mix of cyan, purple, mint
      const roll = Math.random();
      let color;
      if (roll < 0.45) {
        color = colorCyan.clone().lerp(colorPurple, Math.random());
      } else if (roll < 0.8) {
        color = colorPurple.clone().lerp(colorMint, Math.random() * 0.5);
      } else {
        color = colorMint.clone();
      }
      colors[i * 3]     = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      sizes[i] = randomRange(CONFIG.particleSizeMin, CONFIG.particleSizeMax);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: createParticleTexture(),
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
  }

  function createFloatingGeometry() {
    const geometries = [
      () => new THREE.IcosahedronGeometry(randomRange(0.5, 1.2), 0),
      () => new THREE.OctahedronGeometry(randomRange(0.5, 1.0), 0),
      () => new THREE.TorusGeometry(randomRange(0.5, 1.0), randomRange(0.15, 0.3), 8, 16),
      () => new THREE.TetrahedronGeometry(randomRange(0.6, 1.1), 0),
      () => new THREE.DodecahedronGeometry(randomRange(0.5, 1.0), 0),
      () => new THREE.IcosahedronGeometry(randomRange(0.8, 1.5), 1),
      () => new THREE.OctahedronGeometry(randomRange(0.7, 1.2), 1),
      () => new THREE.TorusGeometry(randomRange(0.6, 0.9), 0.2, 6, 24),
    ];

    const colorPalette = [
      CONFIG.colors.cyan,
      CONFIG.colors.purple,
      CONFIG.colors.mint,
      CONFIG.colors.pink,
    ];

    for (let i = 0; i < CONFIG.geoCount; i++) {
      const geoFactory = geometries[i % geometries.length];
      const geometry = geoFactory();
      const isWireframe = Math.random() > 0.4;
      const color = colorPalette[i % colorPalette.length];

      const material = new THREE.MeshStandardMaterial({
        color: color,
        wireframe: isWireframe,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: isWireframe ? randomRange(0.3, 0.55) : randomRange(0.15, 0.35),
        emissive: color,
        emissiveIntensity: isWireframe ? 0.15 : 0.05,
      });

      const mesh = new THREE.Mesh(geometry, material);

      const x = randomRange(-CONFIG.geoSpreadX, CONFIG.geoSpreadX);
      const y = randomRange(-CONFIG.geoSpreadY, CONFIG.geoSpreadY);
      const z = randomRange(CONFIG.geoSpreadZ.min, CONFIG.geoSpreadZ.max);

      mesh.position.set(x, y, z);
      mesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      // Store animation metadata
      mesh.userData = {
        initialPos: { x, y, z },
        rotSpeedX: randomRange(0.001, 0.006) * (Math.random() > 0.5 ? 1 : -1),
        rotSpeedY: randomRange(0.001, 0.008) * (Math.random() > 0.5 ? 1 : -1),
        floatSpeed: randomRange(0.3, 0.8),
        floatAmplitude: randomRange(0.3, 1.0),
        phase: Math.random() * Math.PI * 2,
      };

      scene.add(mesh);
      geoMeshes.push(mesh);
    }
  }

  function createLights() {
    // Ambient
    const ambient = new THREE.AmbientLight(CONFIG.colors.white, 0.3);
    scene.add(ambient);

    // Point light 1 — cyan
    const light1 = new THREE.PointLight(CONFIG.colors.cyan, 1.5, 100);
    light1.position.set(10, 10, 10);
    scene.add(light1);

    // Point light 2 — purple
    const light2 = new THREE.PointLight(CONFIG.colors.purple, 1.2, 100);
    light2.position.set(-10, -10, 5);
    scene.add(light2);

    // Point light 3 — pink
    const light3 = new THREE.PointLight(CONFIG.colors.pink, 0.8, 80);
    light3.position.set(0, 5, -10);
    scene.add(light3);

    lights = { ambient, light1, light2, light3 };
  }

  function initThreeScene() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.z = CONFIG.cameraZ;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Clock for consistent timing
    clock = new THREE.Clock();

    // Build the scene
    createParticleSystem();
    createFloatingGeometry();
    createLights();

    // Start animation
    animate();
  }

  // ==========================================================================
  // 7. THREE.JS ANIMATION LOOP
  // ==========================================================================

  function animate() {
    if (!isTabVisible) {
      animationFrameId = requestAnimationFrame(animate);
      return;
    }

    const elapsed = clock.getElapsedTime();

    // --- Particle rotation ---
    if (particleSystem) {
      particleSystem.rotation.y += CONFIG.particleRotationSpeed;
      particleSystem.rotation.x += CONFIG.particleRotationSpeed * 0.3;
    }

    // --- Geometric object animation ---
    geoMeshes.forEach(mesh => {
      const ud = mesh.userData;

      // Rotation
      mesh.rotation.x += ud.rotSpeedX;
      mesh.rotation.y += ud.rotSpeedY;

      // Floating sine motion
      mesh.position.y = ud.initialPos.y +
        Math.sin(elapsed * ud.floatSpeed + ud.phase) * ud.floatAmplitude;
      mesh.position.x = ud.initialPos.x +
        Math.sin(elapsed * ud.floatSpeed * 0.5 + ud.phase) * ud.floatAmplitude * 0.3;

      // Mouse parallax on objects (opposite direction)
      mesh.position.x += mouse.x * -0.3;
      mesh.position.y += mouse.y * -0.2;
    });

    // --- Camera parallax ---
    const targetCamX = mouse.x * CONFIG.cameraMaxOffset;
    const targetCamY = mouse.y * CONFIG.cameraMaxOffset;
    camera.position.x = lerp(camera.position.x, targetCamX, CONFIG.cameraParallaxFactor);
    camera.position.y = lerp(camera.position.y, targetCamY, CONFIG.cameraParallaxFactor);
    camera.lookAt(0, 0, 0);

    // --- Light oscillation ---
    if (lights.light1) {
      lights.light1.position.x = 10 + Math.sin(elapsed * 0.5) * 3;
      lights.light1.position.y = 10 + Math.cos(elapsed * 0.4) * 2;
    }
    if (lights.light2) {
      lights.light2.position.x = -10 + Math.cos(elapsed * 0.6) * 3;
      lights.light2.position.z = 5 + Math.sin(elapsed * 0.3) * 4;
    }
    if (lights.light3) {
      lights.light3.position.y = 5 + Math.sin(elapsed * 0.7) * 3;
      lights.light3.position.x = Math.cos(elapsed * 0.5) * 5;
    }

    // Render
    renderer.render(scene, camera);

    // Custom cursor
    updateCustomCursor();

    animationFrameId = requestAnimationFrame(animate);
  }

  // ==========================================================================
  // 8. MOUSE TRACKING & PARALLAX
  // ==========================================================================

  function onMouseMove(e) {
    mouse.clientX = e.clientX;
    mouse.clientY = e.clientY;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Hero content parallax
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      const px = mouse.x * 15;
      const py = -mouse.y * 10;
      heroContent.style.transform = `translate(${px}px, ${py}px)`;
    }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true });

  // ==========================================================================
  // 9. SCROLL REVEAL (IntersectionObserver)
  // ==========================================================================

  function initScrollReveal() {
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-scale'
    );

    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(el => observer.observe(el));
  }

  // ==========================================================================
  // 10. NAVBAR SCROLL EFFECTS
  // ==========================================================================

  function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');

    function updateNavbar() {
      if (!navbar) return;

      // Scrolled class
      if (window.scrollY > CONFIG.navScrollThreshold) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active section
      let currentSection = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop - CONFIG.navbarHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', throttle(updateNavbar, 100), { passive: true });
    updateNavbar();
  }

  // ==========================================================================
  // 11. SMOOTH SCROLL NAVIGATION
  // ==========================================================================

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        const top = target.offsetTop - CONFIG.navbarHeight;
        window.scrollTo({ top, behavior: 'smooth' });

        // Close mobile menu if open
        const navLinksContainer = document.querySelector('.nav-links');
        if (navLinksContainer) {
          navLinksContainer.classList.remove('active');
        }
      });
    });
  }

  // ==========================================================================
  // 12. 3D TILT EFFECT ON PROJECT CARDS
  // ==========================================================================

  function initCardTilt() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => {
      // Create glare overlay
      const glare = document.createElement('div');
      Object.assign(glare.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        borderRadius: 'inherit',
        background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0%, transparent 60%)',
        opacity: '0',
        transition: 'opacity 0.3s ease',
        zIndex: '2',
      });
      // Ensure card is positioned
      if (getComputedStyle(card).position === 'static') {
        card.style.position = 'relative';
      }
      card.style.overflow = 'hidden';
      card.appendChild(glare);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * CONFIG.tiltMax;
        const rotateX = ((centerY - y) / centerY) * CONFIG.tiltMax;

        card.style.transform =
          `perspective(${CONFIG.tiltPerspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        card.style.transition = 'transform 0.1s ease';

        // Move glare
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;
        glare.style.background =
          `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
        glare.style.opacity = '1';
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transform =
          `perspective(${CONFIG.tiltPerspective}px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
        card.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
        glare.style.opacity = '0';
      });
    });
  }

  // ==========================================================================
  // 13. SKILL SPHERE ANIMATIONS
  // ==========================================================================

  function initSkillSpheres() {
    const spheres = document.querySelectorAll('.skill-sphere');

    spheres.forEach((sphere, i) => {
      // Random floating animation delay
      sphere.style.animationDelay = (i * 0.15 + Math.random() * 0.5) + 's';
      sphere.style.animationDuration = randomRange(3, 5) + 's';

      // Apply a subtle float if no CSS animation is defined
      if (!getComputedStyle(sphere).animationName || getComputedStyle(sphere).animationName === 'none') {
        const keyframes = [
          { transform: 'translateY(0px)' },
          { transform: `translateY(${randomRange(-8, -4)}px)` },
          { transform: 'translateY(0px)' },
        ];
        sphere.animate(keyframes, {
          duration: randomRange(3000, 5000),
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: i * 150 + Math.random() * 500,
        });
      }
    });

    // Skill level bars animate on scroll
    const skillFills = document.querySelectorAll('.skill-level-fill');
    if (skillFills.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const fill = entry.target;
              const targetWidth = fill.getAttribute('data-width') || fill.style.width || '0%';
              fill.style.width = '0%';
              fill.style.transition = 'width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.2s';
              requestAnimationFrame(() => {
                fill.style.width = targetWidth;
              });
              observer.unobserve(fill);
            }
          });
        },
        { threshold: 0.3 }
      );
      skillFills.forEach(fill => {
        // Store target width before zeroing
        const computed = fill.style.width || getComputedStyle(fill).width;
        if (!fill.getAttribute('data-width')) {
          fill.setAttribute('data-width', computed);
        }
        observer.observe(fill);
      });
    }
  }

  // ==========================================================================
  // 14. ANIMATED COUNTERS
  // ==========================================================================

  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target;
            if (el.dataset.counted) return;
            el.dataset.counted = 'true';

            const target = parseInt(el.getAttribute('data-target'), 10) || 0;
            const startTime = performance.now();

            function updateCounter(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / CONFIG.counterDuration, 1);
              const easedProgress = easeOutCubic(progress);
              const current = Math.round(target * easedProgress);
              el.textContent = current + '+';

              if (progress < 1) {
                requestAnimationFrame(updateCounter);
              } else {
                el.textContent = target + '+';
              }
            }

            requestAnimationFrame(updateCounter);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(c => observer.observe(c));
  }

  // ==========================================================================
  // 15. MOBILE MENU TOGGLE
  // ==========================================================================

  function initMobileMenu() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      toggle.classList.toggle('active');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !toggle.contains(e.target)) {
        navLinks.classList.remove('active');
        toggle.classList.remove('active');
      }
    });
  }

  // ==========================================================================
  // 16. TYPING EFFECT
  // ==========================================================================

  function initTypingEffect() {
    const el = document.querySelector('.hero-subtitle');
    if (!el) return;

    const strings = CONFIG.typingStrings;
    let stringIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimeout = null;

    // Create cursor element
    const cursor = document.createElement('span');
    cursor.classList.add('typing-cursor');
    cursor.textContent = '|';
    Object.assign(cursor.style, {
      display: 'inline-block',
      animation: 'blink-cursor 0.7s step-end infinite',
      marginLeft: '2px',
      fontWeight: '100',
      color: '#00d4ff',
    });

    // Inject keyframe for cursor blink if not exists
    if (!document.getElementById('typing-cursor-style')) {
      const style = document.createElement('style');
      style.id = 'typing-cursor-style';
      style.textContent = `
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    // Create a span for typed text
    const textSpan = document.createElement('span');
    textSpan.classList.add('typed-text');
    el.textContent = '';
    el.appendChild(textSpan);
    el.appendChild(cursor);

    function type() {
      const currentString = strings[stringIndex];

      if (!isDeleting) {
        // Typing
        textSpan.textContent = currentString.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === currentString.length) {
          isDeleting = true;
          typingTimeout = setTimeout(type, CONFIG.pauseAfterType);
          return;
        }
        typingTimeout = setTimeout(type, CONFIG.typingSpeed + Math.random() * 40);
      } else {
        // Deleting
        textSpan.textContent = currentString.substring(0, charIndex - 1);
        charIndex--;

        if (charIndex === 0) {
          isDeleting = false;
          stringIndex = (stringIndex + 1) % strings.length;
          typingTimeout = setTimeout(type, CONFIG.pauseAfterDelete);
          return;
        }
        typingTimeout = setTimeout(type, CONFIG.deletingSpeed);
      }
    }

    // Start after a brief delay
    setTimeout(type, 600);
  }

  // ==========================================================================
  // 17. PAGE VISIBILITY (Pause/Resume)
  // ==========================================================================

  function initVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isTabVisible = false;
      } else {
        isTabVisible = true;
        if (clock) clock.getDelta(); // Reset delta to avoid huge jump
      }
    });
  }

  // ==========================================================================
  // 18. WINDOW RESIZE HANDLER
  // ==========================================================================

  function onWindowResize() {
    if (camera) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    }
    if (renderer) {
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
  }

  window.addEventListener('resize', debounce(onWindowResize, 200));

  // ==========================================================================
  // 19. SCROLL HANDLER (combined)
  // ==========================================================================

  function onScroll() {
    updateScrollProgress();
  }

  window.addEventListener('scroll', throttle(onScroll, 50), { passive: true });

  // ==========================================================================
  // 20. INITIALIZATION
  // ==========================================================================

  function initMainExperience() {
    initThreeScene();
    initScrollReveal();
    initNavbar();
    initSmoothScroll();
    initCardTilt();
    initSkillSpheres();
    initCounters();
    initMobileMenu();
    initTypingEffect();
    initCustomCursor();
    initVisibilityHandler();
    updateScrollProgress();
  }

  // Kick off the intro (or go straight to main experience if no overlay)
  playCinematicIntro();
});
