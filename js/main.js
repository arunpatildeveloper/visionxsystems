/* ═══════════════════════════════════════════════
   VISIONX — main.js
   Background layers:
   1. Particle network (neural mesh)
   2. Multiple drifting face scans
   3. Dense digital rain (hex + katakana)
   4. Glitch rectangles (random corrupt blocks)
   5. Radial pulse rings
════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── Scroll reveal ─────────────────────────── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  document.querySelectorAll('.fade-up').forEach(function (el) { io.observe(el); });

  /* ── Hero tagline ─────────────────────────── */
  var tagline = document.querySelector('.hero__tagline');
  if (tagline) {
    tagline.style.opacity = '0';
    tagline.style.transform = 'translateY(28px)';
    tagline.style.transition = 'opacity .75s cubic-bezier(.4,0,.2,1), transform .75s cubic-bezier(.4,0,.2,1)';
    setTimeout(function () {
      tagline.style.opacity = '1';
      tagline.style.transform = 'none';
    }, 120);
  }

  /* ══════════════════════════════════════════════
     CANVAS SETUP
  ══════════════════════════════════════════════ */
  var canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none'; return;
  }
  var ctx = canvas.getContext('2d');
  var W, H;
  var mouse = { x: -9999, y: -9999 };

  /* palette */
  var V  = '108,60,233';
  var C  = '0,209,255';
  var MG = '150,80,255';
  var R  = '255,60,120';   /* hot-pink for glitch blocks */

  function rand(a, b) { return a + Math.random() * (b - a); }
  function randInt(a, b) { return Math.floor(rand(a, b)); }
  function pick(arr) { return arr[randInt(0, arr.length)]; }

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ══════════════════════════════════════════════
     LAYER 1 — PARTICLE NETWORK
  ══════════════════════════════════════════════ */
  var PCOUNT = 100;
  var PDIST  = 160;
  var particles = [];

  function Particle() {
    this.x   = rand(0, W);
    this.y   = rand(0, H);
    this.vx  = rand(-0.35, 0.35);
    this.vy  = rand(-0.35, 0.35);
    this.r   = rand(1.2, 2.8);
    this.col = Math.random() > 0.5 ? V : C;
    this.a   = rand(0.25, 0.8);
  }
  Particle.prototype.update = function () {
    this.x += this.vx; this.y += this.vy;
    if (this.x < -12) this.x = W + 12;
    if (this.x > W + 12) this.x = -12;
    if (this.y < -12) this.y = H + 12;
    if (this.y > H + 12) this.y = -12;
    var dx = this.x - mouse.x, dy = this.y - mouse.y;
    var d = Math.sqrt(dx*dx + dy*dy);
    if (d < 220) {
      var f = (1 - d/220) * 0.016;
      this.vx += (dx/d)*f; this.vy += (dy/d)*f;
    }
    this.vx *= 0.999; this.vy *= 0.999;
    if (Math.abs(this.vx) < 0.04) this.vx += rand(-0.05, 0.05);
    if (Math.abs(this.vy) < 0.04) this.vy += rand(-0.05, 0.05);
  };
  Particle.prototype.draw = function () {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
    ctx.fillStyle = 'rgba('+this.col+','+this.a+')';
    ctx.fill();
  };

  function drawNetwork() {
    for (var i = 0; i < particles.length; i++) {
      for (var j = i+1; j < particles.length; j++) {
        var a = particles[i], b = particles[j];
        var dx = a.x-b.x, dy = a.y-b.y;
        var d = Math.sqrt(dx*dx + dy*dy);
        if (d < PDIST) {
          var t = 1 - d/PDIST;
          var lc = (a.col===V && b.col===V) ? V : (a.col===C && b.col===C) ? C : MG;
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle = 'rgba('+lc+','+(t*0.35)+')';
          ctx.lineWidth = t*1.2; ctx.stroke();
        }
      }
    }
  }

  /* ══════════════════════════════════════════════
     LAYER 2 — MULTIPLE DRIFTING FACE MESHES
  ══════════════════════════════════════════════ */
  var FACE_PTS = [
    [-0.30,-0.42],[-0.29,-0.25],[-0.27,-0.07],[-0.24,0.10],[-0.19,0.26],
    [-0.11,0.38],[0.00,0.44],[0.11,0.38],[0.19,0.26],[0.24,0.10],
    [0.27,-0.07],[0.29,-0.25],[0.30,-0.42],
    [-0.27,-0.50],[-0.19,-0.55],[-0.10,-0.55],[-0.03,-0.52],
    [0.03,-0.52],[0.10,-0.55],[0.19,-0.55],[0.27,-0.50],
    [0.00,-0.46],[0.00,-0.36],[0.00,-0.26],[0.00,-0.16],
    [-0.10,-0.06],[-0.05,-0.03],[0.00,-0.01],[0.05,-0.03],[0.10,-0.06],
    [-0.22,-0.34],[-0.17,-0.38],[-0.11,-0.38],[-0.06,-0.34],[-0.11,-0.30],[-0.17,-0.30],
    [0.06,-0.34],[0.11,-0.38],[0.17,-0.38],[0.22,-0.34],[0.17,-0.30],[0.11,-0.30],
    [-0.12,0.14],[-0.06,0.10],[0.00,0.09],[0.06,0.10],[0.12,0.14],
    [0.06,0.20],[0.00,0.22],[-0.06,0.20]
  ];
  var FACE_EDGES = [
    [0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],
    [13,14],[14,15],[15,16],[17,18],[18,19],[19,20],
    [21,22],[22,23],[23,24],[25,26],[26,27],[27,28],[28,29],
    [30,31],[31,32],[32,33],[33,34],[34,35],[35,30],
    [36,37],[37,38],[38,39],[39,40],[40,41],[41,36],
    [42,43],[43,44],[44,45],[45,46],[46,47],[47,48],[48,42],[43,48],[45,47]
  ];

  function Face(cx, cy, scale, vx, vy, col) {
    this.cx = cx; this.cy = cy;
    this.scale = scale;
    this.vx = vx; this.vy = vy;
    this.col = col;
    this.t = rand(0, Math.PI*2);
    this.scanY = 0;
  }
  Face.prototype.update = function () {
    this.t += 0.007;
    this.cx += this.vx; this.cy += this.vy;
    if (this.cx < W*0.05 || this.cx > W*0.95) this.vx *= -1;
    if (this.cy < H*0.05 || this.cy > H*0.90) this.vy *= -1;
    this.scanY = (this.scanY + 0.9) % (this.scale * 1.15);
  };
  Face.prototype.draw = function () {
    var pulse = 0.08 + 0.05 * Math.sin(this.t);
    var col = this.col;
    ctx.save();
    FACE_EDGES.forEach(function (e) {
      var pa = FACE_PTS[e[0]], pb = FACE_PTS[e[1]];
      ctx.beginPath();
      ctx.moveTo(this.cx + pa[0]*this.scale, this.cy + pa[1]*this.scale);
      ctx.lineTo(this.cx + pb[0]*this.scale, this.cy + pb[1]*this.scale);
      ctx.strokeStyle = 'rgba('+col+','+pulse+')';
      ctx.lineWidth = 0.7; ctx.stroke();
    }, this);
    FACE_PTS.forEach(function (p) {
      ctx.beginPath();
      ctx.arc(this.cx + p[0]*this.scale, this.cy + p[1]*this.scale, 1.6, 0, Math.PI*2);
      ctx.fillStyle = 'rgba('+col+','+(pulse+0.1)+')';
      ctx.fill();
    }, this);
    /* scan bar */
    var sy = this.cy - this.scale*0.55 + this.scanY;
    var g = ctx.createLinearGradient(this.cx - this.scale*0.45, 0, this.cx + this.scale*0.45, 0);
    g.addColorStop(0,   'rgba('+col+',0)');
    g.addColorStop(0.5, 'rgba('+col+','+(pulse*2)+')');
    g.addColorStop(1,   'rgba('+col+',0)');
    ctx.beginPath();
    ctx.moveTo(this.cx - this.scale*0.45, sy);
    ctx.lineTo(this.cx + this.scale*0.45, sy);
    ctx.strokeStyle = g; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.restore();
  };

  var faces = [];
  function initFaces() {
    faces = [
      new Face(W*0.72, H*0.38, Math.min(W,H)*0.25,  0.16,  0.10, C),
      new Face(W*0.22, H*0.62, Math.min(W,H)*0.18, -0.12,  0.14, V),
      new Face(W*0.82, H*0.72, Math.min(W,H)*0.14,  0.10, -0.09, MG)
    ];
  }

  /* ══════════════════════════════════════════════
     LAYER 3 — DENSE DIGITAL RAIN
  ══════════════════════════════════════════════ */
  var CHARS = '0123456789ABCDEFabcdef01アイウエオカキクケコサシスセソタチツテトナニヌネノ∂∑∏√∞≠≈';
  var FS = 12;
  var rainCols = [];

  function initRain() {
    rainCols = [];
    var n = Math.floor(W / (FS * 1.6));
    for (var i = 0; i < n; i++) {
      if (Math.random() > 0.7) continue;
      rainCols.push({
        x:     i * FS * 1.6 + rand(0, FS),
        y:     rand(-H*1.2, H*0.2),
        speed: rand(0.5, 1.6),
        alpha: rand(0.05, 0.18),
        len:   randInt(8, 28),
        col:   pick([V, C, MG]),
        chars: []
      });
    }
  }

  function updateRain() {
    rainCols.forEach(function (col) {
      col.y += col.speed;
      if (col.y > H + FS*30) {
        col.y = rand(-H*0.8, -FS*5);
        col.alpha = rand(0.05, 0.18);
        col.col = pick([V, C, MG]);
      }
      if (Math.random() < 0.06) {
        col.chars.unshift(CHARS[randInt(0, CHARS.length)]);
        if (col.chars.length > col.len) col.chars.pop();
      }
    });
  }

  function drawRain() {
    ctx.font = '500 '+FS+'px "JetBrains Mono",monospace';
    rainCols.forEach(function (col) {
      col.chars.forEach(function (ch, i) {
        var a = col.alpha * (1 - i / col.chars.length);
        /* head character brighter */
        if (i === 0) a = Math.min(col.alpha * 2.5, 0.55);
        ctx.fillStyle = 'rgba('+col.col+','+a+')';
        ctx.fillText(ch, col.x, col.y - i*FS);
      });
    });
  }

  /* ══════════════════════════════════════════════
     LAYER 4 — GLITCH CORRUPT BLOCKS
     Random rectangles that flash briefly
  ══════════════════════════════════════════════ */
  var glitchBlocks = [];
  var glitchTimer = 0;

  function spawnGlitch() {
    var count = randInt(1, 5);
    for (var i = 0; i < count; i++) {
      var bw = rand(40, 280);
      var bh = rand(2, 18);
      glitchBlocks.push({
        x:     rand(0, W - bw),
        y:     rand(0, H),
        w:     bw,
        h:     bh,
        life:  rand(3, 12),
        col:   pick([V, C, MG, R]),
        alpha: rand(0.06, 0.22),
        offset: rand(-18, 18)   /* horizontal shift */
      });
    }
  }

  function updateGlitch() {
    glitchTimer--;
    if (glitchTimer <= 0) {
      spawnGlitch();
      glitchTimer = randInt(18, 80);  /* irregular cadence */
    }
    glitchBlocks = glitchBlocks.filter(function (b) { return b.life > 0; });
    glitchBlocks.forEach(function (b) { b.life--; });
  }

  function drawGlitch() {
    glitchBlocks.forEach(function (b) {
      ctx.save();
      ctx.fillStyle = 'rgba('+b.col+','+b.alpha+')';
      ctx.fillRect(b.x + b.offset, b.y, b.w, b.h);
      /* second offset layer */
      ctx.fillStyle = 'rgba('+b.col+','+(b.alpha*0.5)+')';
      ctx.fillRect(b.x - b.offset*0.5, b.y + b.h*0.4, b.w*0.6, b.h*0.5);
      ctx.restore();
    });
  }

  /* ══════════════════════════════════════════════
     LAYER 5 — RADIAL PULSE RINGS
     Expand from random points, fade out
  ══════════════════════════════════════════════ */
  var rings = [];
  var ringTimer = 0;

  function spawnRing() {
    rings.push({
      x:     rand(W*0.1, W*0.9),
      y:     rand(H*0.1, H*0.9),
      r:     0,
      maxR:  rand(60, 200),
      col:   pick([V, C, MG]),
      alpha: rand(0.12, 0.28)
    });
  }

  function updateRings() {
    ringTimer--;
    if (ringTimer <= 0) { spawnRing(); ringTimer = randInt(40, 100); }
    rings = rings.filter(function (r) { return r.r < r.maxR; });
    rings.forEach(function (r) { r.r += 0.9; });
  }

  function drawRings() {
    rings.forEach(function (r) {
      var t = r.r / r.maxR;
      var a = r.alpha * (1 - t);
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba('+r.col+','+a+')';
      ctx.lineWidth = 1.2 * (1 - t*0.6);
      ctx.stroke();
    });
  }

  /* ══════════════════════════════════════════════
     MAIN LOOP
  ══════════════════════════════════════════════ */
  function init() {
    particles = [];
    for (var i = 0; i < PCOUNT; i++) particles.push(new Particle());
    initFaces();
    initRain();
    glitchBlocks = [];
    rings = [];
    glitchTimer = 40;
    ringTimer = 30;
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    /* back to front order */
    updateRain();    drawRain();
    updateRings();   drawRings();
    updateGlitch();  drawGlitch();
    drawNetwork();
    particles.forEach(function (p) { p.update(); p.draw(); });
    faces.forEach(function (f) { f.update(); f.draw(); });

    requestAnimationFrame(animate);
  }

  /* ── Events ───────────────────────────────── */
  window.addEventListener('mousemove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', function () {
    mouse.x = -9999; mouse.y = -9999;
  });
  window.addEventListener('resize', function () {
    resize(); init();
  }, { passive: true });

  resize();
  init();
  animate();

})();
