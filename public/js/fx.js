'use strict';
/* ============================================================
   Project Threshold — Visual FX
   1. Ambient floating particles (canvas, background)
   2. Sparkle burst on hotspot hover + click
   3. Animated neon border march on hotspots
   4. Smooth page transitions (fade + slide)
   ============================================================ */

/* ── 1. AMBIENT PARTICLES ─────────────────────────────────── */
(function initAmbient() {
  const canvas = document.createElement('canvas');
  canvas.id = 'ambient-canvas';
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const COLORS = ['#00f0ff','#39ff14','#ff00c8','#ffe600','#ff6a00'];
  const COUNT  = 55;
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function mkParticle() {
    const col = COLORS[Math.random() * COLORS.length | 0];
    return {
      x:     Math.random() * W,
      y:     Math.random() * H,
      r:     Math.random() * 1.4 + 0.3,
      vx:    (Math.random() - 0.5) * 0.25,
      vy:    (Math.random() - 0.5) * 0.25 - 0.12,
      alpha: Math.random() * 0.35 + 0.08,
      fade:  (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
      col,
    };
  }

  function init() {
    resize();
    particles = Array.from({length: COUNT}, mkParticle);
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.alpha += p.fade;
      if (p.alpha <= 0.04 || p.alpha >= 0.45) p.fade *= -1;
      if (p.x < -4) p.x = W + 4;
      if (p.x > W + 4) p.x = -4;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W; }
      if (p.y > H + 4) { p.y = -4; p.x = Math.random() * W; }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.shadowColor = p.col;
      ctx.shadowBlur  = 6;
      ctx.fillStyle   = p.col;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize);
  init();
  tick();
})();


/* ── 2. SPARKLE BURST ─────────────────────────────────────── */
(function initSparkles() {
  const COLORS = ['#00f0ff','#39ff14','#ffe600','#ff00c8','#ffffff'];

  function burst(x, y, count = 14, col = null) {
    for (let i = 0; i < count; i++) {
      const el  = document.createElement('div');
      const c   = col || COLORS[Math.random() * COLORS.length | 0];
      const ang = Math.random() * Math.PI * 2;
      const spd = Math.random() * 70 + 30;
      const sz  = Math.random() * 5 + 2;
      el.className = 'sparkle-dot';
      el.style.cssText = `
        position:fixed;
        left:${x}px; top:${y}px;
        width:${sz}px; height:${sz}px;
        border-radius:50%;
        background:${c};
        box-shadow:0 0 ${sz*2}px ${c};
        pointer-events:none;
        z-index:9999;
        transform:translate(-50%,-50%);
        transition: none;
      `;
      document.body.appendChild(el);

      const dx = Math.cos(ang) * spd;
      const dy = Math.sin(ang) * spd;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 0.55s cubic-bezier(.2,.8,.4,1), opacity 0.55s ease';
        el.style.transform  = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
        el.style.opacity    = '0';
      });
      setTimeout(() => el.remove(), 580);
    }
  }

  // Sparkle on hotspot hover (small burst)
  document.querySelectorAll('.hotspot').forEach(hs => {
    let hovered = false;
    hs.addEventListener('mouseenter', e => {
      if (hovered) return;
      hovered = true;
      burst(e.clientX, e.clientY, 8);
    });
    hs.addEventListener('mouseleave', () => { hovered = false; });
    hs.addEventListener('click', e => {
      burst(e.clientX, e.clientY, 22);
    });
  });

  // Click sparkle on any interactive element on section pages
  document.querySelectorAll('.btn-primary, .report-item, .card, .forum-thread').forEach(el => {
    el.addEventListener('click', e => burst(e.clientX, e.clientY, 12));
  });

  // Expose for external use
  window.ptSparkle = burst;
})();


/* ── 3. ANIMATED NEON BORDER (border-image dash march) ───── */
(function initNeonBorders() {
  // Draws an SVG-based animated dashed border on each hotspot via
  // an absolutely-positioned <svg> overlay so the dash-offset can animate.
  const hotspots = document.querySelectorAll('.hotspot');
  if (!hotspots.length) return;

  const NS = 'http://www.w3.org/2000/svg';
  const COLOR_MAP = {
    'hotspot--cyan':    '#00f0ff',
    'hotspot--green':   '#39ff14',
    'hotspot--yellow':  '#ffe600',
    'hotspot--magenta': '#ff00c8',
    'hotspot--orange':  '#ff6a00',
  };

  hotspots.forEach(hs => {
    let col = '#00f0ff';
    for (const [cls, c] of Object.entries(COLOR_MAP)) {
      if (hs.classList.contains(cls)) { col = c; break; }
    }

    const svg  = document.createElementNS(NS, 'svg');
    const rect = document.createElementNS(NS, 'rect');

    svg.style.cssText = 'position:absolute;inset:-3px;width:calc(100%+6px);height:calc(100%+6px);pointer-events:none;overflow:visible;opacity:0;transition:opacity .3s;';
    rect.setAttribute('x', '2');
    rect.setAttribute('y', '2');
    rect.setAttribute('rx', '6');
    rect.setAttribute('ry', '6');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', col);
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('stroke-dasharray', '6 5');
    rect.setAttribute('stroke-dashoffset', '0');
    rect.style.filter = `drop-shadow(0 0 4px ${col})`;

    const anim = document.createElementNS(NS, 'animateTransform');
    // Use a CSS animation instead of SMIL for smoother control
    svg.appendChild(rect);
    hs.style.position = 'absolute'; // already is, safety
    hs.appendChild(svg);

    // Animate via rAF for full control
    let offset = 0;
    let running = false;
    function march() {
      if (!running) return;
      offset = (offset + 0.4) % 22;
      rect.setAttribute('stroke-dashoffset', -offset);
      requestAnimationFrame(march);
    }

    hs.addEventListener('mouseenter', () => {
      svg.style.opacity = '1';
      running = true;
      march();
    });
    hs.addEventListener('mouseleave', () => {
      svg.style.opacity = '0';
      running = false;
    });
  });
})();


/* ── 4. SMOOTH PAGE TRANSITIONS ──────────────────────────── */
(function initTransitions() {
  // Inject the page-transition overlay
  const veil = document.createElement('div');
  veil.id = 'pt-veil';
  veil.style.cssText = `
    position:fixed;inset:0;
    background:#010a10;
    z-index:99998;
    pointer-events:none;
    opacity:0;
    transition:opacity 0.32s ease;
  `;
  document.body.appendChild(veil);

  // Fade in on page load
  requestAnimationFrame(() => {
    // page is already visible; nothing to fade from on first load
    veil.style.opacity = '0';
  });

  // Intercept all same-origin anchor clicks
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto')) return;
    try {
      const dest = new URL(href, location.href);
      if (dest.origin !== location.origin) return;
      e.preventDefault();
      veil.style.pointerEvents = 'all';
      veil.style.opacity = '1';
      setTimeout(() => { window.location.href = dest.href; }, 340);
    } catch (_) {}
  });

  // Fade-in when arriving
  window.addEventListener('pageshow', () => {
    veil.style.transition = 'none';
    veil.style.opacity = '1';
    veil.style.pointerEvents = 'none';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        veil.style.transition = 'opacity 0.38s ease';
        veil.style.opacity = '0';
      });
    });
  });
})();
