'use strict';

/* ── Tooltip ──────────────────────────────────────────────── */
const tooltip = document.createElement('div');
tooltip.className = 'tooltip';
document.body.appendChild(tooltip);

document.querySelectorAll('.hotspot[data-tip]').forEach(hs => {
  hs.addEventListener('mouseenter', e => {
    tooltip.textContent = hs.dataset.tip;
    tooltip.classList.add('visible');
    moveTooltip(e);
  });
  hs.addEventListener('mousemove', moveTooltip);
  hs.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
});

function moveTooltip(e) {
  const x = e.clientX + 14;
  const y = e.clientY + 14;
  const tw = tooltip.offsetWidth;
  const vw = window.innerWidth;
  tooltip.style.left = (x + tw > vw ? x - tw - 28 : x) + 'px';
  tooltip.style.top  = y + 'px';
}

/* ── Modal ────────────────────────────────────────────────── */
const backdrop = document.getElementById('modal-backdrop');
const modalTitle = document.getElementById('modal-title');
const modalBody  = document.getElementById('modal-body');

document.querySelectorAll('.hotspot[data-modal]').forEach(hs => {
  hs.addEventListener('click', () => {
    const key = hs.dataset.modal;
    const info = MODAL_DATA[key];
    if (!info) return;
    modalTitle.textContent = info.title;
    modalBody.textContent  = info.body;
    backdrop.classList.add('open');
  });
});

document.getElementById('modal-close').addEventListener('click', closeModal);
backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function closeModal() { backdrop.classList.remove('open'); }

/* ── Modal content ────────────────────────────────────────── */
const MODAL_DATA = {
  login: {
    title: 'Login',
    body: 'Authentication portal. Enter your credentials to access classified encounter data, submit reports, and access the full research database.'
  },
  'report-experience': {
    title: 'Report an Experience',
    body: 'Share. Document. Make an Impact. Submit your first-hand encounter, sighting, or anomalous experience to the Project Threshold database for analysis and cross-referencing.'
  },
  'overlapping-reports': {
    title: 'Overlapping Reports',
    body: 'Cross-referenced encounter data revealing geographic, temporal, and behavioral patterns that appear across multiple independent witness reports. Biological DNA correlation analysis included.'
  },
  'encounter-reports': {
    title: 'Encounter Reports',
    body: 'First-hand witness accounts of direct contact with unidentified entities. Reports are classified by encounter type, intensity, and corroborating evidence.'
  },
  'fear-intimidation': {
    title: 'Fear & Intimidation Reports',
    body: 'Documented cases where witnesses experienced extreme psychological distress, paralysis, or fear responses. Hypothesized to be a deliberate biological control mechanism.'
  },
  'lessons-integrated': {
    title: 'Lessons — Integrated Reports',
    body: 'Synthesized research combining encounter data with theoretical frameworks. These reports integrate multiple evidence streams into actionable lessons for field researchers.'
  },
  'explore-theory': {
    title: 'Explore the Theory',
    body: 'The Speculative Hypothesis: entities exhibiting cryptid characteristics may represent a deliberate biological derivation deployed as a fear-based population control mechanism. Discover the evidence.'
  },
  'neutralizing-fear': {
    title: 'Neutralizing Fear Techniques',
    body: 'Evidence-based methodologies for counteracting the psychological impact of entity encounters. Techniques drawn from field researcher reports, meditative practices, and neurological studies.'
  },
  'evidence-encounters': {
    title: 'Evidence & Encounters',
    body: 'Physical, photographic, and anecdotal evidence catalogue. Includes audio recordings, thermal imagery, track castings, and multi-witness corroboration data.'
  },
  'community-forum': {
    title: 'Community Forum',
    body: 'Connect with fellow researchers, share field notes, and collaborate on open investigations. A peer-reviewed discussion space for serious inquiry.'
  },
  settings: {
    title: 'Settings',
    body: 'Manage your account preferences, notification settings, display options, security credentials, and account profile.'
  }
};
