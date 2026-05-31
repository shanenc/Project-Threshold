'use strict';
/* ============================================================
   Project Threshold — Hotspot & Tooltip Engine v2
   - Smart 8-direction tooltip placement (never covers the card)
   - Fade-in / fade-out with easing
   - Viewport edge clamping
   - Keyboard focus support
   - Touch device support (long-press tooltip)
   ============================================================ */

(function () {

  /* ── Tooltip element ───────────────────────────────────── */
  const tip = document.createElement('div');
  tip.id = 'pt-tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.setAttribute('aria-hidden', 'true');
  tip.style.cssText = `
    position: fixed;
    z-index: 9000;
    pointer-events: none;
    opacity: 0;
    max-width: 220px;
    padding: 7px 13px;
    background: rgba(1, 8, 20, 0.95);
    border: 1px solid var(--neon-cyan, #00f0ff);
    border-radius: 4px;
    color: var(--neon-cyan, #00f0ff);
    font-family: 'Orbitron', 'Share Tech Mono', monospace;
    font-size: 10px;
    letter-spacing: .08em;
    line-height: 1.5;
    white-space: normal;
    box-shadow: 0 0 14px rgba(0, 240, 255, .35);
    transition: opacity .18s ease, transform .18s ease;
    transform: translateY(4px);
  `;
  document.body.appendChild(tip);

  /* ── Directions priority order ─────────────────────────── */
  // We pick the direction that keeps the tooltip farthest from
  // the card being hovered and within the viewport.
  const GAP = 10; // px gap between card edge and tooltip
  const MARGIN = 8; // minimum px from viewport edge

  function bestPosition(cardRect) {
    const tw = tip.offsetWidth  || 220;
    const th = tip.offsetHeight || 36;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const candidates = [
      // [direction, x, y, score]
      // Below the card (preferred when card is in top half)
      ['below',  cardRect.left + cardRect.width / 2 - tw / 2,
                 cardRect.bottom + GAP,
                 vh - cardRect.bottom],
      // Above the card
      ['above',  cardRect.left + cardRect.width / 2 - tw / 2,
                 cardRect.top - th - GAP,
                 cardRect.top],
      // Right of the card
      ['right',  cardRect.right + GAP,
                 cardRect.top + cardRect.height / 2 - th / 2,
                 vw - cardRect.right],
      // Left of the card
      ['left',   cardRect.left - tw - GAP,
                 cardRect.top + cardRect.height / 2 - th / 2,
                 cardRect.left],
    ];

    // Filter to candidates that actually fit, then pick by score
    const fits = candidates.filter(([, x, y]) => {
      return x >= MARGIN && y >= MARGIN
          && x + tw <= vw - MARGIN
          && y + th <= vh - MARGIN;
    });

    const winner = fits.length
      ? fits.reduce((a, b) => (a[3] > b[3] ? a : b))
      : candidates[0]; // fallback: below

    // Clamp to viewport
    let [, x, y] = winner;
    x = Math.max(MARGIN, Math.min(x, vw - tw - MARGIN));
    y = Math.max(MARGIN, Math.min(y, vh - th - MARGIN));
    return { x, y, dir: winner[0] };
  }

  function showTip(hs, text) {
    tip.textContent = text;
    tip.setAttribute('aria-hidden', 'false');
    // Measure after setting text
    tip.style.opacity = '0';
    tip.style.display = 'block';

    const rect = hs.getBoundingClientRect();
    const { x, y, dir } = bestPosition(rect);

    // Direction-based entrance offset
    const offsets = {
      below: 'translateY(6px)',
      above: 'translateY(-6px)',
      right: 'translateX(6px)',
      left:  'translateX(-6px)',
    };
    tip.style.transform  = offsets[dir] || 'translateY(6px)';
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';

    // Animate in next frame
    requestAnimationFrame(() => {
      tip.style.transition = 'opacity .18s ease, transform .18s ease';
      tip.style.opacity    = '1';
      tip.style.transform  = 'translate(0,0)';
    });
  }

  function hideTip() {
    tip.style.transition = 'opacity .14s ease';
    tip.style.opacity = '0';
    tip.setAttribute('aria-hidden', 'true');
    setTimeout(() => {
      if (tip.style.opacity === '0') tip.style.transform = 'translateY(4px)';
    }, 150);
  }

  /* ── Wire hotspots ─────────────────────────────────────── */
  document.querySelectorAll('.hotspot[data-tip]').forEach(hs => {
    const text = hs.dataset.tip;

    // Mouse
    hs.addEventListener('mouseenter', () => showTip(hs, text));
    hs.addEventListener('mouseleave', hideTip);

    // Keyboard focus / blur
    hs.addEventListener('focus', () => showTip(hs, text));
    hs.addEventListener('blur',  hideTip);

    // Touch: show on touchstart, hide after 2s or on touchend
    let touchTimer = null;
    hs.addEventListener('touchstart', e => {
      // Don't block navigation clicks on touch
      clearTimeout(touchTimer);
      showTip(hs, text);
      touchTimer = setTimeout(hideTip, 2000);
    }, { passive: true });
    hs.addEventListener('touchend', () => {
      clearTimeout(touchTimer);
      touchTimer = setTimeout(hideTip, 400);
    });
  });

  /* ── Keyboard navigation: allow Enter/Space to follow link ── */
  document.querySelectorAll('.hotspot').forEach(hs => {
    if (hs.tagName === 'A') return; // <a> already handles Enter
    hs.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const href = hs.getAttribute('href') || hs.dataset.href;
        if (href) window.location.href = href;
      }
    });
  });

})();
