// Web Audio API Synthesizer for Arcade Sci-Fi Sound Effects

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  private musicEnabled: boolean = true;

  private volume: number = 1;
  private sfxVolume: number = 1;
  private musicVolume: number = 1;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private musicGain: GainNode | null = null;

  constructor() {
    // Lazy initialize on first interaction
    try {
      this.soundEnabled = localStorage.getItem('galaxy_sound_enabled') !== 'false';
      this.musicEnabled = localStorage.getItem('galaxy_music_enabled') !== 'false';
      const storedVolume = Number(localStorage.getItem('galaxy_volume'));
      const storedSfx = Number(localStorage.getItem('galaxy_sfx_volume'));
      const storedMusic = Number(localStorage.getItem('galaxy_music_volume'));
      if (Number.isFinite(storedVolume)) this.volume = Math.min(1, Math.max(0, storedVolume));
      if (Number.isFinite(storedSfx)) this.sfxVolume = Math.min(1, Math.max(0, storedSfx));
      if (Number.isFinite(storedMusic)) this.musicVolume = Math.min(1, Math.max(0, storedMusic));
    } catch {
      // Browser storage may be unavailable; use safe defaults.
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.volume * this.sfxVolume;
      this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public startMusic() {
    if (!this.musicEnabled || typeof window === 'undefined') return;
    this.initCtx();
    if (!this.ctx || this.musicTimer !== null) return;

    const ctx = this.ctx;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.045 * this.volume * this.musicVolume;
    this.musicGain.connect(ctx.destination);

    const scale = [110, 130.81, 146.83, 164.81, 196, 164.81, 146.83, 130.81];
    const tick = () => {
      if (!this.ctx || !this.musicGain || !this.musicEnabled) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(scale[this.musicStep % scale.length], now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.55, now + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(this.musicGain);
      osc.start(now);
      osc.stop(now + 0.45);
      this.musicStep += 1;
    };

    tick();
    this.musicTimer = window.setInterval(tick, 480);
  }

  public stopMusic() {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
    }
    this.musicTimer = null;
    if (this.musicGain) {
      try {
        const now = this.ctx?.currentTime ?? 0;
        this.musicGain.gain.cancelScheduledValues(now);
        this.musicGain.gain.setTargetAtTime(0.0001, now, 0.05);
        window.setTimeout(() => {
          try { this.musicGain?.disconnect(); } catch {}
          this.musicGain = null;
        }, 180);
      } catch {
        try { this.musicGain.disconnect(); } catch {}
        this.musicGain = null;
      }
    }
  }

  public toggleSound(enabled?: boolean) {
    if (enabled !== undefined) {
      this.soundEnabled = enabled;
      try { localStorage.setItem('galaxy_sound_enabled', String(this.soundEnabled)); } catch {}
    } else {
      this.soundEnabled = !this.soundEnabled;
      try { localStorage.setItem('galaxy_sound_enabled', String(this.soundEnabled)); } catch {}
    }
    return this.soundEnabled;
  }

  public toggleMusic(enabled?: boolean) {
    this.musicEnabled = enabled === undefined ? !this.musicEnabled : enabled;
    try { localStorage.setItem('galaxy_music_enabled', String(this.musicEnabled)); } catch {}
    if (this.musicEnabled) this.startMusic();
    else this.stopMusic();
    return this.musicEnabled;
  }

  public isMusicEnabled() { return this.musicEnabled; }

  public setVolume(value: number) {
    this.volume = Math.min(1, Math.max(0, value));
    if (this.musicGain) this.musicGain.gain.value = 0.045 * this.volume * this.musicVolume;
    try { localStorage.setItem('galaxy_volume', String(this.volume)); } catch {}
  }

  public getVolume() { return this.volume; }
  public setSfxVolume(value: number) { this.sfxVolume = Math.min(1, Math.max(0, value)); if (this.sfxGain) this.sfxGain.gain.value = this.volume * this.sfxVolume; try { localStorage.setItem('galaxy_sfx_volume', String(this.sfxVolume)); } catch {} }
  public getSfxVolume() { return this.sfxVolume; }
  public setMusicVolume(value: number) { this.musicVolume = Math.min(1, Math.max(0, value)); if (this.musicGain) this.musicGain.gain.value = 0.045 * this.volume * this.musicVolume; try { localStorage.setItem('galaxy_music_volume', String(this.musicVolume)); } catch {} }
  public getMusicVolume() { return this.musicVolume; }

  public isEnabled() {
    return this.soundEnabled;
  }

  // 5 Distinct Copyright-Free Synthesized Fire Sound Effects
  
  // Sound 1: Single Laser Pulse
  public playSingleFire() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Sound 2: Double Fire (Twin-Cannon Rapid Burst)
  public playDoubleFire() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // First pulse
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(180, now + 0.07);
    gain1.gain.setValueAtTime(0.14, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain || this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.07);

    // Second staggered pulse
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(1040, now + 0.035);
    osc2.frequency.exponentialRampToValueAtTime(220, now + 0.035 + 0.07);
    gain2.gain.setValueAtTime(0.14, now + 0.035);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035 + 0.07);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain || this.ctx.destination);
    osc2.start(now + 0.035);
    osc2.stop(now + 0.035 + 0.07);
  }

  // Sound 3: Triple Fire (3-Pitch Chord Burst)
  public playTripleFire() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [1046.5, 783.99, 659.25]; // Triad chord (C6, G5, E5)

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const startTime = now + idx * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(f, startTime);
      osc.frequency.exponentialRampToValueAtTime(150, startTime + 0.1);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  // Sound 4: Mega High-Voltage Laser Beam
  public playMegaLaser() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Main High-Freq Sawtooth Beam Zap
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    // Vibrato LFO modulation
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(60, now); // 60Hz energy buzz
    lfoGain.gain.setValueAtTime(120, now);
    lfo.connect(osc.frequency);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    lfo.start(now);
    osc.start(now);
    lfo.stop(now + 0.14);
    osc.stop(now + 0.14);

    // Energy Sizzle Noise burst
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3000, now);
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain || this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.08);
  }

  // Sound 5: Heavy Plasma Spread Blast
  public playSpreadPlasma() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Black Hole Gravitational Vortex & Implosion Sound SFX (100% Synthesized & Copyright-Free)
  public playBlackHole() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 1.6;

    // 1. Deep Sub-Bass Pitch Sweep & Vacuum Drop
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(320, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + duration * 0.7);
    subOsc.frequency.exponentialRampToValueAtTime(120, now + duration);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.35, now + 0.3);
    subGain.gain.setValueAtTime(0.35, now + duration * 0.75);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain || this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + duration);

    // 2. Gravitational Vortex Swirl (LFO-modulated Sawtooth + High-Q Filter)
    const swirlOsc = this.ctx.createOscillator();
    const swirlGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    swirlOsc.type = 'sawtooth';
    swirlOsc.frequency.setValueAtTime(180, now);
    swirlOsc.frequency.exponentialRampToValueAtTime(600, now + duration * 0.6);
    swirlOsc.frequency.exponentialRampToValueAtTime(80, now + duration);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + duration * 0.6);
    filter.frequency.exponentialRampToValueAtTime(200, now + duration);
    filter.Q.setValueAtTime(8.0, now);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(14, now);
    lfo.frequency.exponentialRampToValueAtTime(28, now + duration * 0.7);
    lfoGain.gain.setValueAtTime(300, now);

    lfo.connect(filter.frequency);

    swirlGain.gain.setValueAtTime(0.01, now);
    swirlGain.gain.linearRampToValueAtTime(0.22, now + 0.2);
    swirlGain.gain.setValueAtTime(0.22, now + duration * 0.7);
    swirlGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    swirlOsc.connect(filter);
    filter.connect(swirlGain);
    swirlGain.connect(this.sfxGain || this.ctx.destination);

    lfo.start(now);
    swirlOsc.start(now);
    lfo.stop(now + duration);
    swirlOsc.stop(now + duration);

    // 3. Cosmic Energy Suction Noise Burst
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(3500, now + duration * 0.65);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + duration);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.linearRampToValueAtTime(0.18, now + duration * 0.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain || this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Main Router SFX
  public playLaser(weaponType: string = 'SINGLE') {
    if (!this.soundEnabled) return;

    switch (weaponType) {
      case 'SINGLE':
        this.playSingleFire();
        break;
      case 'DOUBLE':
        this.playDoubleFire();
        break;
      case 'TRIPLE':
        this.playTripleFire();
        break;
      case 'LASER':
        this.playMegaLaser();
        break;
      case 'SPREAD':
        this.playSpreadPlasma();
        break;
      default:
        this.playSingleFire();
        break;
    }
  }

  // Enemy shoot SFX
  public playEnemyShoot() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Explosion SFX
  public playExplosion(isBig: boolean = false) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = isBig ? 0.6 : 0.3;

    // Noise buffer
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBig ? 400 : 800, now);
    filter.frequency.exponentialRampToValueAtTime(30, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isBig ? 0.35 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + duration);
  }

  // Hit impact
  public playHit() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Power Up Chime
  public playPowerUp() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.15, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.1);
    });
  }

  // Boss Warning Siren
  public playBossWarning() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.linearRampToValueAtTime(350, now + 0.3);
    osc.frequency.linearRampToValueAtTime(150, now + 0.6);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  public startBossMusic() {
    if (!this.musicEnabled || typeof window === 'undefined') return;
    this.stopMusic();
    this.initCtx();
    if (!this.ctx) return;
    const ctx = this.ctx;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.055 * this.volume;
    this.musicGain.connect(ctx.destination);
    const scale = [73.42, 82.41, 98, 110, 123.47, 98, 82.41, 73.42];
    const tick = () => {
      if (!this.ctx || !this.musicGain || !this.musicEnabled) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(scale[this.musicStep % scale.length], now);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain); gain.connect(this.musicGain); osc.start(now); osc.stop(now + 0.28);
      this.musicStep += 1;
    };
    tick();
    this.musicTimer = window.setInterval(tick, 280);
  }

  public playVictoryFanfare() {
    if (!this.soundEnabled) return;
    this.initCtx(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.type = 'triangle'; osc.frequency.setValueAtTime(f, now + i * 0.12);
      gain.gain.setValueAtTime(0.001, now + i * 0.12); gain.gain.linearRampToValueAtTime(0.16, now + i * 0.12 + 0.02); gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.32);
      osc.connect(gain); gain.connect(this.sfxGain || this.ctx.destination); osc.start(now + i * 0.12); osc.stop(now + i * 0.12 + 0.34);
    });
  }

  public playDefeatSting() {
    if (!this.soundEnabled) return;
    this.initCtx(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, now); osc.frequency.exponentialRampToValueAtTime(70, now + 0.55);
    gain.gain.setValueAtTime(0.18, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain); gain.connect(this.sfxGain || this.ctx.destination); osc.start(now); osc.stop(now + 0.62);
  }

  public playCriticalHit() {
    if (!this.soundEnabled) return;
    this.initCtx(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [880, 1320, 1760].forEach((f, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      const t = now + i * 0.035;
      osc.type = 'triangle'; osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.001, t); gain.gain.linearRampToValueAtTime(0.11, t + 0.01); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(gain); gain.connect(this.sfxGain || this.ctx.destination); osc.start(t); osc.stop(t + 0.14);
    });
  }

  public playShieldBreak() {
    if (!this.soundEnabled) return;
    this.initCtx(); if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(520, now); osc.frequency.exponentialRampToValueAtTime(95, now + 0.28);
    gain.gain.setValueAtTime(0.16, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain); gain.connect(this.sfxGain || this.ctx.destination); osc.start(now); osc.stop(now + 0.31);
  }

  // Coin collect sound
  public playCoin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.06); // E6

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Softer navigation tone for non-primary menu actions.
  public playNavigate() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.07);
    gain.gain.setValueAtTime(0.055, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Button Click SFX
  public playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain || this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Premium Cinematic Startup Whoosh & Space Swell SFX
  public playStartupWhoosh() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const duration = 2.2;

    // Deep Sub Bass Resonance
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(40, now);
    subOsc.frequency.exponentialRampToValueAtTime(90, now + 0.6);
    subOsc.frequency.exponentialRampToValueAtTime(30, now + duration);

    subGain.gain.setValueAtTime(0.001, now);
    subGain.gain.linearRampToValueAtTime(0.3, now + 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain || this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + duration);

    // High Sci-Fi Whoosh Sweeping Filter Noise
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.8);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);
    filter.Q.setValueAtTime(4.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, now);
    noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain || this.ctx.destination);

    noise.start(now);
    noise.stop(now + duration);

    // Harmonious Synth Energy Chime
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const startTime = now + 0.2 + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.08, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain || this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 1.2);
    });
  }
}

export const soundFx = new SoundManager();
