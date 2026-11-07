/**
 * Web Audio synthesis engine for Diwali Digital Diya.
 * All sounds are synthesised in-browser — no copyrighted audio.
 * Exposes a singleton with ambient melody, bell, whoosh, boom, confetti pop,
 * a volume control and a mute toggle.
 */

type EngineState = {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  ambientGain: GainNode | null;
  ambientTimer: number | null;
  volume: number;
  muted: boolean;
  started: boolean;
};

const state: EngineState = {
  ctx: null,
  masterGain: null,
  ambientGain: null,
  ambientTimer: null,
  volume: 0.6,
  muted: false,
  started: false,
};

// Raga-inspired pentatonic-ish scale (C minorish, warm) for a festive Indian feel
const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

function ensureContext(): AudioContext | null {
  if (state.ctx) return state.ctx;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const masterGain = ctx.createGain();
  masterGain.gain.value = state.muted ? 0 : state.volume;
  masterGain.connect(ctx.destination);
  state.ctx = ctx;
  state.masterGain = masterGain;
  const ambientGain = ctx.createGain();
  ambientGain.gain.value = 0;
  ambientGain.connect(masterGain);
  state.ambientGain = ambientGain;
  return ctx;
}

function now(): number {
  return state.ctx ? state.ctx.currentTime : 0;
}

export const audio = {
  get isStarted() {
    return state.started;
  },
  get muted() {
    return state.muted;
  },
  get volume() {
    return state.volume;
  },

  /** Must be called from a user gesture to satisfy autoplay rules. */
  start() {
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();
    if (state.started) return;
    state.started = true;
    this.setAmbient(true);
  },

  setMuted(muted: boolean) {
    state.muted = muted;
    if (state.masterGain && state.ctx) {
      const target = muted ? 0 : state.volume;
      state.masterGain.gain.cancelScheduledValues(now());
      state.masterGain.gain.linearRampToValueAtTime(target, now() + 0.15);
    }
  },

  setVolume(v: number) {
    state.volume = Math.max(0, Math.min(1, v));
    if (state.masterGain && state.ctx && !state.muted) {
      state.masterGain.gain.linearRampToValueAtTime(state.volume, now() + 0.1);
    }
  },

  setAmbient(on: boolean) {
    const ctx = ensureContext();
    if (!ctx || !state.ambientGain) return;
    state.ambientGain.gain.cancelScheduledValues(now());
    state.ambientGain.gain.linearRampToValueAtTime(on ? 0.22 : 0.0, now() + 1.2);
    if (on && state.ambientTimer === null) {
      this.scheduleAmbientNote();
    } else if (!on && state.ambientTimer !== null) {
      window.clearTimeout(state.ambientTimer);
      state.ambientTimer = null;
    }
  },

  scheduleAmbientNote() {
    if (!state.ctx) return;
    const ctx = state.ctx;
    const freq = SCALE[Math.floor(Math.random() * SCALE.length)];
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const duration = 2.5 + Math.random() * 2;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(state.ambientGain!);
    osc.start(t);
    osc.stop(t + duration + 0.1);

    // subtle harmonic shimmer
    const sh = ctx.createOscillator();
    const shg = ctx.createGain();
    sh.type = 'triangle';
    sh.frequency.value = freq * 2;
    shg.gain.setValueAtTime(0, t);
    shg.gain.linearRampToValueAtTime(0.05, t + 0.6);
    shg.gain.exponentialRampToValueAtTime(0.001, t + duration);
    sh.connect(shg);
    shg.connect(state.ambientGain!);
    sh.start(t + 0.1);
    sh.stop(t + duration + 0.1);

    const next = 1800 + Math.random() * 2600;
    state.ambientTimer = window.setTimeout(() => {
      state.ambientTimer = null;
      this.scheduleAmbientNote();
    }, next);
  },

  bell(freq = 880) {
    const ctx = ensureContext();
    if (!ctx || !state.masterGain) return;
    const t = ctx.currentTime;
    const partials = [1, 2.76, 5.4];
    const gains = [0.3, 0.18, 0.08];
    partials.forEach((p, i) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq * p;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(gains[i], t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      osc.connect(g);
      g.connect(state.masterGain!);
      osc.start(t);
      osc.stop(t + 2.3);
    });
  },

  whoosh() {
    const ctx = ensureContext();
    if (!ctx || !state.masterGain) return;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(1800, t + 0.35);
    filter.Q.value = 1.2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0, t);
    g.gain.linearRampToValueAtTime(0.4, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    src.connect(filter);
    filter.connect(g);
    g.connect(state.masterGain!);
    src.start(t);
  },

  boom() {
    const ctx = ensureContext();
    if (!ctx || !state.masterGain) return;
    const t = ctx.currentTime;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.9, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.4);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, t);
    filter.frequency.exponentialRampToValueAtTime(120, t + 0.7);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.6, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    src.connect(filter);
    filter.connect(g);
    g.connect(state.masterGain!);
    src.start(t);
    // sub thump
    const sub = ctx.createOscillator();
    const subg = ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(120, t);
    sub.frequency.exponentialRampToValueAtTime(40, t + 0.5);
    subg.gain.setValueAtTime(0.5, t);
    subg.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    sub.connect(subg);
    subg.connect(state.masterGain!);
    sub.start(t);
    sub.stop(t + 0.65);
  },

  pop() {
    const ctx = ensureContext();
    if (!ctx || !state.masterGain) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(g);
    g.connect(state.masterGain!);
    osc.start(t);
    osc.stop(t + 0.14);
  },

  crumble() {
    const ctx = ensureContext();
    if (!ctx || !state.masterGain) return;
    const t = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 500 + Math.random() * 900;
      const start = t + i * 0.04;
      g.gain.setValueAtTime(0, start);
      g.gain.linearRampToValueAtTime(0.05, start + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, start + 0.06);
      osc.connect(g);
      g.connect(state.masterGain!);
      osc.start(start);
      osc.stop(start + 0.08);
    }
  },

  pause() {
    if (state.ctx && state.ctx.state === 'running') void state.ctx.suspend();
  },
  resume() {
    if (state.ctx && state.ctx.state === 'suspended') void state.ctx.resume();
  },
};
