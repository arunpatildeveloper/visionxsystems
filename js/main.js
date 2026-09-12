/* ══════════════════════════════════════════════════
   VISIONX — main.js
══════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ──────────────────────────────────────
     NAV
  ────────────────────────────────────── */
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('solid', window.scrollY > 10);
  }, { passive: true });

  burger.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });
  drawer.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => drawer.classList.remove('open'));
  });

  /* ──────────────────────────────────────
     SCROLL REVEAL
  ────────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

  /* ──────────────────────────────────────
     ACTIVE NAV
  ────────────────────────────────────── */
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__links a');

  const sio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
        });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(s => sio.observe(s));

  /* ──────────────────────────────────────
     HERO CANVAS — particle/grid animation
  ────────────────────────────────────── */
  const canvas = document.getElementById('heroCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.r  = Math.random() * 1.5 + 0.5;
      this.a  = Math.random() * 0.35 + 0.05;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > W) this.vx *= -1;
      if (this.y < 0 || this.y > H) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(45,212,191,${this.a})`;
      ctx.fill();
    }
  }

  function initParticles() {
    const count = Math.floor((W * H) / 14000);
    particles = Array.from({ length: count }, () => new Particle());
  }

  function drawGrid() {
    const step = 60;
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += step) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += step) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function drawConnections() {
    const DIST = 120;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < DIST) {
          const a = (1 - d / DIST) * 0.08;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(45,212,191,${a})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  /* ──────────────────────────────────────
     THREAT WEB — draw SVG lines
  ────────────────────────────────────── */
  function buildThreatWeb() {
    const svg     = document.getElementById('twSvg');
    const wrap    = svg ? svg.closest('.threat-web') : null;
    const center  = wrap ? wrap.querySelector('.tw-center') : null;
    const nodes   = wrap ? wrap.querySelectorAll('.tw-node') : [];
    if (!svg || !center || !nodes.length) return;

    function getCenter(el) {
      const wr = wrap.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      return {
        x: er.left + er.width  / 2 - wr.left,
        y: er.top  + er.height / 2 - wr.top
      };
    }

    function draw() {
      svg.innerHTML = '';
      const W = wrap.offsetWidth;
      const H = wrap.offsetHeight;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      const c = getCenter(center);
      nodes.forEach((node, i) => {
        const n = getCenter(node);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', c.x); line.setAttribute('y1', c.y);
        line.setAttribute('x2', n.x); line.setAttribute('y2', n.y);
        line.setAttribute('class', 'tw-line');
        line.style.strokeDasharray  = '3 4';
        line.style.opacity          = '0';
        line.style.transition = `opacity 0.6s ease ${i * 0.08}s`;
        svg.appendChild(line);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          line.style.opacity = '1';
        }));
      });
    }

    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { draw(); cio.disconnect(); } });
    }, { threshold: 0.3 });
    cio.observe(wrap);

    window.addEventListener('resize', () => {
      if (svg.childNodes.length) draw();
    });
  }
  buildThreatWeb();

  /* ──────────────────────────────────────
     PROTOTYPE signal bars — animate on enter
  ────────────────────────────────────── */
  const fills = document.querySelectorAll('.proto-sig__fill');
  const targets = ['40%', '62%', '78%', '28%'];
  let sigsFired = false;

  const spio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !sigsFired) {
        sigsFired = true;
        fills.forEach((f, i) => {
          setTimeout(() => { f.style.width = targets[i] || '40%'; }, i * 120);
        });
        spio.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const protoSection = document.querySelector('.proto-section');
  if (protoSection) spio.observe(protoSection);

  /* ──────────────────────────────────────
     SMOOTH SCROLL
  ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });

})();
