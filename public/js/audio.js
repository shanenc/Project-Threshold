'use strict';
/* ============================================================
   Project Threshold — Audio System
   100% synthesized via Web Audio API — zero audio file dependencies.
   fx.js calls window.ThresholdAudio.play() for click/navigation sounds.
   This module owns hover sounds, ambient, visual reaction, and settings.
   ============================================================ */

window.ThresholdAudio = (function () {

  /* ── Persistent prefs ───────────────────────────────────── */
  const STORAGE_KEY = 'pt_audio_v1';
  function _loadPrefs() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch (_) { return {}; }
  }
  function _savePrefs() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: _vol, muted: _muted })); }
    catch (_) {}
  }

  const _prefs = _loadPrefs();
  let _vol   = _prefs.volume !== undefined ? +_prefs.volume : 0.20;
  let _muted = !!_prefs.muted;

  /* ── Context (lazy, unlocked on first interaction) ─────── */
  let _ctx    = null;
  let _master = null;   // overall volume GainNode
  let _amb    = null;   // ambient bus GainNode
  let _sfx    = null;   // SFX bus GainNode
  let _ana    = null;   // AnalyserNode
  let _noise  = null;   // shared pink-noise AudioBuffer (4 s, looped)

  let _unlocked = false;
  let _ambStarted = false;
  const _IS_HOME     = !!document.querySelector('.hero');
  const _IS_SETTINGS = !!document.getElementById('audio-settings-panel');

  /* Public audio levels — read by fx.js in its rAF loop */
  const levels = { rms: 0, bass: 0, mid: 0 };

  /* ── First-interaction unlock ───────────────────────────── */
  function _unlock() {
    if (_unlocked) return;
    _unlocked = true;
    _initCtx();
    if (_ctx && _ctx.state === 'suspended') _ctx.resume();
    /* fade master in from 0 over 2.5 s */
    if (_master) {
      const now = _ctx.currentTime;
      _master.gain.cancelScheduledValues(now);
      _master.gain.setValueAtTime(0, now);
      _master.gain.linearRampToValueAtTime(_muted ? 0 : _vol, now + 2.5);
    }
  }
  ['click', 'keydown', 'touchstart'].forEach(ev =>
    document.addEventListener(ev, _unlock, { once: true })
  );

  /* ── Context init ───────────────────────────────────────── */
  function _initCtx() {
    if (_ctx) return;
    try { _ctx = new (window.AudioContext || window.webkitAudioContext)(); }
    catch (_) { return; }

    _ana = _ctx.createAnalyser();
    _ana.fftSize = 256;
    _ana.smoothingTimeConstant = 0.82;

    _master = _ctx.createGain();
    _master.gain.value = 0;   /* start silent; _unlock fades in */

    _amb = _ctx.createGain(); _amb.gain.value = 1;
    _sfx = _ctx.createGain(); _sfx.gain.value = 1;

    _amb.connect(_master); _sfx.connect(_master);
    _master.connect(_ana); _ana.connect(_ctx.destination);

    _noise = _buildPinkNoise(4);

    if (_IS_HOME)     { _startAmbient(); _startVisualReactor(); _mountWidget(); }
    if (_IS_SETTINGS) { _mountSettingsPanel(); }
    _wireHover();
  }

  /* ── Pink noise buffer (4 s, loops) ────────────────────── */
  function _buildPinkNoise(secs) {
    const len = Math.floor(_ctx.sampleRate * secs);
    const buf = _ctx.createBuffer(1, len, _ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
      b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
      b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
      d[i] = (b0+b1+b2+b3+b4+b5) * 0.11;
    }
    return buf;
  }
  function _mkNoise(loop = true) {
    if (!_noise) return null;
    const s = _ctx.createBufferSource(); s.buffer = _noise; s.loop = loop; return s;
  }

  /* ── ADSR envelope helper ───────────────────────────────── */
  function _env(g, t, a, peak, sus, rel) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setValueAtTime(peak, t + a + sus);
    g.gain.linearRampToValueAtTime(0.0001, t + a + sus + rel);
  }
  /* One-shot osc helper */
  function _osc(freq, type, t, dur, vol) {
    const o = _ctx.createOscillator(), g = _ctx.createGain();
    o.type = type; o.frequency.value = freq;
    _env(g, t, 0.003, vol, 0, dur - 0.003);
    o.connect(g); g.connect(_sfx);
    o.start(t); o.stop(t + dur + 0.04);
  }

  /* ════════════════════════════════════════════════════════
     AMBIENT SYSTEM
     ════════════════════════════════════════════════════════ */
  function _startAmbient() {
    if (_ambStarted) return;
    _ambStarted = true;
    _buildDrones();
    _buildWind();
    _scheduleForestEvents();
  }

  function _buildDrones() {
    const drones = [
      { f:40.0, det:  0, lfoHz:0.031, vol:0.028 },
      { f:55.5, det:  4, lfoHz:0.019, vol:0.020 },
      { f:67.2, det: -5, lfoHz:0.047, vol:0.016 },
      { f:81.0, det:  7, lfoHz:0.013, vol:0.012 },
    ];
    drones.forEach(({ f, det, lfoHz, vol }) => {
      const o = _ctx.createOscillator(), g = _ctx.createGain();
      const lfo = _ctx.createOscillator(), lg = _ctx.createGain();
      o.type = 'sine'; o.frequency.value = f; o.detune.value = det;
      lfo.type = 'sine'; lfo.frequency.value = lfoHz; lg.gain.value = vol * 0.45;
      g.gain.value = vol;
      lfo.connect(lg); lg.connect(g.gain);
      o.connect(g); g.connect(_amb);
      o.start(); lfo.start();
    });
    /* Sub-sonic feel: 36 Hz with LP */
    const r = _ctx.createOscillator(), rf = _ctx.createBiquadFilter(), rg = _ctx.createGain();
    const rl = _ctx.createOscillator(), rlg = _ctx.createGain();
    r.type = 'sine'; r.frequency.value = 36;
    rf.type = 'lowpass'; rf.frequency.value = 85;
    rg.gain.value = 0.026; rl.frequency.value = 0.05; rlg.gain.value = 0.010;
    rl.connect(rlg); rlg.connect(rg.gain);
    r.connect(rf); rf.connect(rg); rg.connect(_amb);
    r.start(); rl.start();
  }

  function _buildWind() {
    function windLayer(bpFreq, bpQ, vol, lfoHz, lfoDepth) {
      const s = _mkNoise(true); if (!s) return;
      const f = _ctx.createBiquadFilter(), g = _ctx.createGain();
      const lfo = _ctx.createOscillator(), lg = _ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = bpFreq; f.Q.value = bpQ;
      g.gain.value = vol; lfo.type = 'sine'; lfo.frequency.value = lfoHz;
      lg.gain.value = lfoDepth;
      lfo.connect(lg); lg.connect(g.gain);
      s.connect(f); f.connect(g); g.connect(_amb);
      s.start(); lfo.start();
    }
    windLayer(900,  0.4, 0.020, 0.06, 0.011);  /* main wind */
    windLayer(550,  0.6, 0.013, 0.04, 0.007);  /* low rustle */
    windLayer(2200, 1.2, 0.006, 0.09, 0.004);  /* high branch creak */
  }

  function _scheduleForestEvents() {
    function loop(fn, minMs, maxMs) {
      const delay = minMs + Math.random() * (maxMs - minMs);
      setTimeout(() => {
        if (_unlocked && _ctx && _ctx.state === 'running') fn();
        loop(fn, minMs, maxMs);
      }, delay);
    }
    loop(_playOwl,    12000, 28000);
    loop(_playCoyote, 35000, 80000);
  }

  function _playOwl() {
    const t = _ctx.currentTime + 0.1;
    [0, 0.7].forEach(offset => {
      const o = _ctx.createOscillator(), g = _ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(390 - offset*25, t + offset);
      o.frequency.exponentialRampToValueAtTime(330 - offset*20, t + offset + 0.34);
      _env(g, t + offset, 0.06, 0.014, 0.08, 0.22);
      o.connect(g); g.connect(_amb);
      o.start(t + offset); o.stop(t + offset + 0.44);
    });
  }

  function _playCoyote() {
    const t = _ctx.currentTime + 0.1;
    const o = _ctx.createOscillator(), g = _ctx.createGain();
    const vib = _ctx.createOscillator(), vg = _ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(280, t);
    o.frequency.linearRampToValueAtTime(780, t + 0.75);
    o.frequency.linearRampToValueAtTime(540, t + 1.35);
    vib.frequency.value = 7; vg.gain.value = 18;
    vib.connect(vg); vg.connect(o.frequency);
    _env(g, t, 0.10, 0.016, 0.72, 0.38);
    o.connect(g); g.connect(_amb);
    o.start(t); vib.start(t); o.stop(t + 1.6); vib.stop(t + 1.6);
  }

  /* ════════════════════════════════════════════════════════
     SFX LIBRARY — all synthesized
     ════════════════════════════════════════════════════════ */
  const _sfxLib = {

    hover() {
      const t = _ctx.currentTime;
      const o = _ctx.createOscillator(), g = _ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(500, t);
      o.frequency.linearRampToValueAtTime(1000, t + 0.072);
      _env(g, t, 0.003, 0.045, 0, 0.072);
      o.connect(g); g.connect(_sfx); o.start(t); o.stop(t + 0.09);
    },

    transition() {
      const t = _ctx.currentTime;
      const ns = _mkNoise(false);
      if (ns) {
        const f = _ctx.createBiquadFilter(), g = _ctx.createGain();
        f.type = 'bandpass'; f.Q.value = 1.8;
        f.frequency.setValueAtTime(100, t);
        f.frequency.exponentialRampToValueAtTime(5000, t + 0.30);
        _env(g, t, 0.022, 0.16, 0.5, 0.20);
        ns.connect(f); f.connect(g); g.connect(_sfx); ns.start(t); ns.stop(t + 0.55);
      }
      const o = _ctx.createOscillator(), og = _ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(90, t);
      o.frequency.exponentialRampToValueAtTime(1600, t + 0.30);
      _env(og, t, 0.014, 0.052, 0.6, 0.18);
      o.connect(og); og.connect(_sfx); o.start(t); o.stop(t + 0.52);
    },

    back() {
      const t = _ctx.currentTime;
      const ns = _mkNoise(false);
      if (ns) {
        const f = _ctx.createBiquadFilter(), g = _ctx.createGain();
        f.type = 'bandpass'; f.Q.value = 1.6;
        f.frequency.setValueAtTime(4200, t);
        f.frequency.exponentialRampToValueAtTime(100, t + 0.22);
        _env(g, t, 0.006, 0.14, 0.55, 0.12);
        ns.connect(f); f.connect(g); g.connect(_sfx); ns.start(t); ns.stop(t + 0.32);
      }
      const o = _ctx.createOscillator(), og = _ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1400, t);
      o.frequency.exponentialRampToValueAtTime(90, t + 0.22);
      _env(og, t, 0.004, 0.048, 0, 0.22);
      o.connect(og); og.connect(_sfx); o.start(t); o.stop(t + 0.28);
    },

    chime() {   /* Settings open — soft digital chime */
      const t = _ctx.currentTime;
      [[1760,0.058],[2640,0.030],[3520,0.014]].forEach(([f, v], i) => {
        const o = _ctx.createOscillator(), g = _ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        _env(g, t + i*0.018, 0.004, v, 0, 0.48);
        o.connect(g); g.connect(_sfx); o.start(t + i*0.018); o.stop(t + 0.6);
      });
    },

    terminal() {  /* Login — secure terminal activation */
      const t = _ctx.currentTime;
      [330, 440, 550, 660].forEach((f, i) => {
        _osc(f, 'square', t + i*0.065, 0.044, 0.036);
      });
    },

    /* ── Section-specific sounds ─────────────────────────── */

    report() {   /* Warm golden activation tone */
      const t = _ctx.currentTime;
      const o = _ctx.createOscillator(), g = _ctx.createGain();
      const vib = _ctx.createOscillator(), vg = _ctx.createGain();
      o.type = 'triangle'; o.frequency.value = 440;
      vib.type = 'sine'; vib.frequency.value = 5.2; vg.gain.value = 5;
      vib.connect(vg); vg.connect(o.frequency);
      _env(g, t, 0.018, 0.10, 0.80, 0.18);
      o.connect(g); g.connect(_sfx);
      o.start(t); vib.start(t); o.stop(t + 0.45); vib.stop(t + 0.45);
      _osc(880, 'triangle', t, 0.35, 0.034);  /* warm 2nd harmonic */
      const ns = _mkNoise(false);
      if (ns) {
        const f = _ctx.createBiquadFilter(), gn = _ctx.createGain();
        f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 4;
        _env(gn, t, 0.002, 0.038, 0, 0.09);
        ns.connect(f); f.connect(gn); gn.connect(_sfx); ns.start(t); ns.stop(t + 0.12);
      }
    },

    theory() {   /* Deep mysterious synth pulse */
      const t = _ctx.currentTime;
      [80, 120, 160].forEach((f, i) => {
        const o = _ctx.createOscillator(), filt = _ctx.createBiquadFilter(), g = _ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        filt.type = 'lowpass';
        filt.frequency.setValueAtTime(180, t);
        filt.frequency.exponentialRampToValueAtTime(650, t + 0.28);
        _env(g, t, 0.04, 0.088 / (i+1), 0, 0.42);
        o.connect(filt); filt.connect(g); g.connect(_sfx); o.start(t); o.stop(t + 0.68);
      });
      _osc(1200, 'sine', t + 0.06, 0.50, 0.024);  /* ethereal shimmer */
      _osc(1800, 'sine', t + 0.14, 0.40, 0.014);
    },

    encounter() {  /* Dark atmospheric pulse */
      const t = _ctx.currentTime;
      const o = _ctx.createOscillator(), filt = _ctx.createBiquadFilter(), g = _ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 88;
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(360, t);
      filt.frequency.exponentialRampToValueAtTime(140, t + 0.48);
      _env(g, t, 0.055, 0.12, 0, 0.42);
      o.connect(filt); filt.connect(g); g.connect(_sfx); o.start(t); o.stop(t + 0.62);
      const ns = _mkNoise(false);
      if (ns) {
        const f = _ctx.createBiquadFilter(), gn = _ctx.createGain();
        f.type = 'lowpass'; f.frequency.value = 320;
        _env(gn, t, 0.04, 0.058, 0, 0.38);
        ns.connect(f); f.connect(gn); gn.connect(_sfx); ns.start(t); ns.stop(t + 0.55);
      }
    },

    overlapping() {  /* DNA crystalline chime cluster */
      const t = _ctx.currentTime;
      [1200, 1500, 1800, 2100, 2400].forEach((f, i) => {
        const o = _ctx.createOscillator(), g = _ctx.createGain();
        o.type = 'sine'; o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 14;
        _env(g, t + i*0.026, 0.003, 0.052 * Math.pow(0.65, i), 0, 0.22);
        o.connect(g); g.connect(_sfx);
        o.start(t + i*0.026); o.stop(t + i*0.026 + 0.3);
      });
    },

    fear() {  /* Low-frequency heartbeat (lub-DUB) */
      const t = _ctx.currentTime;
      function beat(dt, vol) {
        const o = _ctx.createOscillator(), g = _ctx.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(88, t + dt);
        o.frequency.exponentialRampToValueAtTime(38, t + dt + 0.14);
        _env(g, t + dt, 0.005, vol, 0, 0.18);
        o.connect(g); g.connect(_sfx); o.start(t + dt); o.stop(t + dt + 0.25);
      }
      beat(0,    0.20);   /* lub */
      beat(0.22, 0.14);   /* dub */
    },

    lessons() {  /* Ascending harmonic tone — C E G C' */
      const t = _ctx.currentTime;
      [[262,0],[330,0.09],[392,0.18],[523,0.27]].forEach(([f, d]) => {
        const o = _ctx.createOscillator(), g = _ctx.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        _env(g, t + d, 0.020, 0.064, 0, 0.28);
        o.connect(g); g.connect(_sfx); o.start(t + d); o.stop(t + d + 0.4);
      });
    },

    community() {  /* Warm campfire chord + crackle */
      const t = _ctx.currentTime;
      [[196,0],[247,0.04],[294,0.08]].forEach(([f, d], i) => {
        const o = _ctx.createOscillator(), g = _ctx.createGain();
        o.type = 'triangle'; o.frequency.value = f;
        o.detune.value = (Math.random() - 0.5) * 7;
        _env(g, t + d, 0.032, 0.068 / (i*0.3+1), 0, 0.42);
        o.connect(g); g.connect(_sfx); o.start(t + d); o.stop(t + d + 0.6);
      });
      const ns = _mkNoise(false);
      if (ns) {
        const f = _ctx.createBiquadFilter(), gn = _ctx.createGain();
        f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.6;
        _env(gn, t, 0.002, 0.032, 0, 0.14);
        ns.connect(f); f.connect(gn); gn.connect(_sfx); ns.start(t); ns.stop(t + 0.18);
      }
    },

    evidence() {  /* Data-scan sound */
      const t = _ctx.currentTime;
      [440,660,880,1100].forEach((f, i) => _osc(f, 'square', t + i*0.055, 0.042, 0.036));
      const ns = _mkNoise(false);
      if (ns) {
        const f = _ctx.createBiquadFilter(), gn = _ctx.createGain();
        f.type = 'bandpass'; f.Q.value = 1.6;
        f.frequency.setValueAtTime(400, t);
        f.frequency.exponentialRampToValueAtTime(3200, t + 0.28);
        _env(gn, t, 0.010, 0.052, 0.44, 0.16);
        ns.connect(f); f.connect(gn); gn.connect(_sfx); ns.start(t); ns.stop(t + 0.38);
      }
    },

    neutralizing() {  /* Pulsed countermeasure energy */
      const t = _ctx.currentTime;
      for (let i = 0; i < 3; i++) {
        _osc(440, 'sine', t + i*0.10, 0.072, 0.058);
        _osc(550, 'sine', t + i*0.10 + 0.004, 0.072, 0.038);
      }
    },
  };

  /* ── Public play function (called by fx.js) ─────────────── */
  function play(name) {
    if (!_unlocked || !_ctx) return;
    if (_ctx.state === 'suspended') _ctx.resume();
    const fn = _sfxLib[name];
    if (fn) try { fn(); } catch (_) { /* silent fail */ }
  }

  /* ── Wire hover sounds on hotspots ─────────────────────── */
  function _wireHover() {
    document.querySelectorAll('.hotspot').forEach(el => {
      el.addEventListener('mouseenter', () => play('hover'));
    });
  }

  /* ════════════════════════════════════════════════════════
     VISUAL AUDIO REACTOR
     Runs only on homepage. Reads analyser data each ~40 ms
     and exposes levels for fx.js to read.
     ════════════════════════════════════════════════════════ */
  let _freqBuf = null;
  let _lastVT  = 0;
  let _bgEl    = null;

  function _startVisualReactor() {
    _freqBuf = new Uint8Array(_ana.frequencyBinCount);
    _bgEl = document.querySelector('.hero__bg');
    _reactLoop();
  }

  function _reactLoop(ts = 0) {
    requestAnimationFrame(_reactLoop);
    if (ts - _lastVT < 38) return;   /* ~26 fps — cpu friendly */
    _lastVT = ts;

    _ana.getByteFrequencyData(_freqBuf);

    function _avg(a, b) {
      let s = 0, n = b - a;
      for (let i = a; i < b && i < _freqBuf.length; i++) s += _freqBuf[i];
      return s / n / 255;
    }

    levels.bass = _avg(0,  8);
    levels.mid  = _avg(8, 32);
    levels.rms  = _avg(0, 64);

    /* Very subtle brightness reaction on the hero image */
    if (_bgEl) {
      const br = (1 + levels.bass * 0.14).toFixed(3);
      _bgEl.style.filter = `brightness(${br})`;
    }
  }

  /* ════════════════════════════════════════════════════════
     VOLUME / MUTE API
     ════════════════════════════════════════════════════════ */
  function setVolume(v) {
    _vol = Math.max(0, Math.min(1, +v));
    if (_master && _ctx && !_muted) {
      _master.gain.linearRampToValueAtTime(_vol, _ctx.currentTime + 0.06);
    }
    _savePrefs(); _syncUI();
  }

  function setMuted(m) {
    _muted = !!m;
    if (_master && _ctx) {
      _master.gain.linearRampToValueAtTime(_muted ? 0 : _vol, _ctx.currentTime + 0.12);
    }
    _savePrefs(); _syncUI();
  }

  function toggleMute() { setMuted(!_muted); return _muted; }

  /* ════════════════════════════════════════════════════════
     FLOATING AUDIO WIDGET (homepage bottom-right)
     ════════════════════════════════════════════════════════ */
  let _widget = null;

  function _mountWidget() {
    if (_widget) return;
    _widget = document.createElement('div');
    _widget.id = 'pt-audio-widget';
    _widget.setAttribute('aria-label', 'Audio controls');
    _widget.innerHTML = `
      <button id="ptaw-btn" aria-label="Toggle mute" title="Toggle audio">
        <svg id="ptaw-on"  viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <svg id="ptaw-off" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style="display:none">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM11 5.73L8.91 7.82 11 9.91V5.73z"/>
        </svg>
      </button>
      <input id="ptaw-slider" type="range" min="0" max="100" step="1"
             value="${Math.round(_vol*100)}" aria-label="Volume" />
    `;

    const s = _widget.style;
    s.position = 'fixed'; s.bottom = '16px'; s.right = '16px';
    s.zIndex = '9990'; s.display = 'flex'; s.alignItems = 'center'; s.gap = '8px';
    s.background = 'rgba(1,8,20,.88)'; s.border = '1px solid rgba(0,240,255,.22)';
    s.borderRadius = '22px'; s.padding = '5px 12px 5px 8px';
    s.backdropFilter = 'blur(8px)'; s.transition = 'border-color .2s, opacity .3s';
    s.fontFamily = "'Orbitron',monospace"; s.userSelect = 'none';
    /* hide on mobile — this widget is desktop only */
    s.opacity = '0'; /* fade in after interaction */

    const btn = _widget.querySelector('#ptaw-btn');
    btn.style.cssText = 'background:none;border:none;cursor:pointer;color:rgba(0,240,255,.65);padding:0;display:flex;align-items:center;transition:color .2s;';

    const slider = _widget.querySelector('#ptaw-slider');
    slider.style.cssText = 'width:68px;accent-color:#00f0ff;cursor:pointer;vertical-align:middle;';

    btn.addEventListener('click', () => { toggleMute(); });
    slider.addEventListener('input', () => {
      const v = +slider.value / 100;
      if (_muted && v > 0) setMuted(false);
      setVolume(v);
    });
    _widget.addEventListener('mouseenter', () => {
      _widget.style.borderColor = 'rgba(0,240,255,.55)';
    });
    _widget.addEventListener('mouseleave', () => {
      _widget.style.borderColor = 'rgba(0,240,255,.22)';
    });

    /* Fade widget in after unlock (called via _syncUI on unlock fade) */
    setTimeout(() => { _widget.style.opacity = '0.75'; }, 3000);

    document.body.appendChild(_widget);
    _syncUI();
  }

  /* ════════════════════════════════════════════════════════
     SETTINGS PAGE PANEL
     ════════════════════════════════════════════════════════ */
  function _mountSettingsPanel() {
    const panel = document.getElementById('audio-settings-panel');
    if (!panel) return;
    /* Read current prefs fresh from storage (may have been set on homepage) */
    const p = _loadPrefs();
    const v = p.volume !== undefined ? +p.volume : 0.20;
    const m = !!p.muted;

    panel.innerHTML = `
      <div class="settings-group__title">Audio &amp; Sound</div>
      <div class="settings-row">
        <div>
          <div class="settings-row__label">Ambient Soundscape</div>
          <div class="settings-row__desc">Atmospheric drones, wind, and forest ambience</div>
        </div>
        <div class="toggle${m ? '' : ' on'}" id="ptset-mute" role="switch"
             aria-checked="${!m}" aria-label="Toggle ambient audio"></div>
      </div>
      <div class="settings-row">
        <div>
          <div class="settings-row__label">Interface Sounds</div>
          <div class="settings-row__desc">Hover, click, and navigation sound effects</div>
        </div>
        <div class="toggle${m ? '' : ' on'}" id="ptset-sfx" role="switch"
             aria-checked="${!m}" aria-label="Toggle interface sounds"></div>
      </div>
      <div class="settings-row" style="flex-direction:column;align-items:stretch;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div class="settings-row__label">Volume</div>
          <div class="settings-row__desc" id="ptset-vol-display">${Math.round(v*100)}%</div>
        </div>
        <input type="range" id="ptset-vol" min="0" max="100" step="1"
               value="${Math.round(v*100)}"
               style="width:100%;accent-color:var(--accent,#00f0ff);cursor:pointer;" />
      </div>
    `;

    const muteToggle = panel.querySelector('#ptset-mute');
    const sfxToggle  = panel.querySelector('#ptset-sfx');
    const volSlider  = panel.querySelector('#ptset-vol');
    const volDisplay = panel.querySelector('#ptset-vol-display');

    function persist() {
      const isMuted = !muteToggle.classList.contains('on');
      const vol = +volSlider.value / 100;
      _vol = vol; _muted = isMuted;
      _savePrefs();
      if (volDisplay) volDisplay.textContent = Math.round(vol*100) + '%';
      /* If audio context exists (e.g. user visited homepage first), apply live */
      if (_master && _ctx) {
        _master.gain.linearRampToValueAtTime(isMuted ? 0 : vol, _ctx.currentTime + 0.1);
      }
    }

    muteToggle.addEventListener('click', () => {
      muteToggle.classList.toggle('on');
      sfxToggle.classList.toggle('on', muteToggle.classList.contains('on'));
      persist();
    });
    sfxToggle.addEventListener('click', () => {
      sfxToggle.classList.toggle('on');
      muteToggle.classList.toggle('on', sfxToggle.classList.contains('on'));
      persist();
    });
    volSlider.addEventListener('input', () => {
      if (+volSlider.value > 0 && !muteToggle.classList.contains('on')) {
        muteToggle.classList.add('on'); sfxToggle.classList.add('on');
      }
      persist();
    });
  }

  /* ── Sync all UI elements to current state ──────────────── */
  function _syncUI() {
    if (_widget) {
      _widget.querySelector('#ptaw-on').style.display  = _muted ? 'none' : '';
      _widget.querySelector('#ptaw-off').style.display = _muted ? '' : 'none';
      _widget.querySelector('#ptaw-btn').style.color   = _muted
        ? 'rgba(120,120,120,.5)' : 'rgba(0,240,255,.65)';
      _widget.querySelector('#ptaw-slider').value = Math.round(_vol*100);
    }
    const vs = document.querySelector('#ptset-vol');
    const vd = document.querySelector('#ptset-vol-display');
    const mt = document.querySelector('#ptset-mute');
    const st = document.querySelector('#ptset-sfx');
    if (vs) vs.value = Math.round(_vol*100);
    if (vd) vd.textContent = Math.round(_vol*100) + '%';
    if (mt) mt.classList.toggle('on', !_muted);
    if (st) st.classList.toggle('on', !_muted);
  }

  /* ── Public API ─────────────────────────────────────────── */
  return {
    play,
    setVolume,
    setMuted,
    toggleMute,
    getMuted:  () => _muted,
    getVolume: () => _vol,
    levels,
  };

})();
