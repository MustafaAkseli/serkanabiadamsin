/* Original procedural 120 BPM house groove. No samples or third-party music. */
(() => {
  "use strict";
  class BirthdayAudio {
    constructor(options = {}) {
      this.options = options;
      this.volume = Math.max(0, Math.min(0.65, Number(options.volume) || 0.35));
      this.context = null;
      this.media = null;
      this.master = null;
      this.timer = null;
      this.fadeFrame = null;
      this.suspendTimer = null;
      this.version = 0;
      this.playing = false;
      this.fallbackUsed = false;
      this.onInterrupted = () => {};
    }

    prepareContext() {
      if (this.context) return this.context;
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      try {
        const context = new AudioContext();
        const master = context.createGain();
        master.gain.value = 0;
        const compressor = context.createDynamicsCompressor();
        compressor.threshold.value = -16;
        compressor.knee.value = 20;
        compressor.ratio.value = 4;
        master.connect(compressor);
        compressor.connect(context.destination);
        const noise = context.createBuffer(1, context.sampleRate * 0.25, context.sampleRate);
        const data = noise.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        this.noise = noise;
        this.master = master;
        this.context = context;
        context.onstatechange = () => {
          if (this.playing && !this.media && context.state !== "running") this.onInterrupted();
        };
        return context;
      } catch (_) { return null; }
    }

    // Invoked directly by a click/keydown handler, before any await.
    async play() {
      const version = ++this.version;
      clearTimeout(this.suspendTimer);
      const context = this.prepareContext();
      const resumed = context ? context.resume().then(() => true, () => false) : Promise.resolve(false);
      if (this.options.src && !this.fallbackUsed) {
        if (!this.media) {
          this.media = new Audio(this.options.src);
          this.media.loop = true;
          this.media.preload = "none";
          this.media.volume = 0;
          this.media.addEventListener("error", () => {
            if (this.playing) this.onInterrupted();
          });
        }
        try {
          await this.withTimeout(this.media.play(), 6000);
          if (version !== this.version) return false;
          this.playing = true;
          this.fadeMedia(this.volume, version);
          if (context) context.suspend().catch(() => {});
          return true;
        } catch (_) {
          if (version !== this.version) return false;
          this.media.pause();
          this.media.removeAttribute("src");
          this.media.load();
          this.media = null;
          this.fallbackUsed = true;
        }
      }
      const ready = await resumed;
      if (!ready || !context || version !== this.version) return false;
      this.playing = true;
      this.step = 0;
      this.nextNote = context.currentTime + 0.045;
      this.master.gain.cancelScheduledValues(context.currentTime);
      this.master.gain.setValueAtTime(0, context.currentTime);
      this.master.gain.linearRampToValueAtTime(this.volume, context.currentTime + 0.6);
      this.schedule();
      clearInterval(this.timer);
      this.timer = setInterval(() => this.schedule(), 25);
      return true;
    }

    stop() {
      const version = ++this.version;
      this.playing = false;
      clearInterval(this.timer);
      this.timer = null;
      if (this.media) this.fadeMedia(0, version);
      const context = this.context;
      if (context && this.master) {
        this.master.gain.cancelScheduledValues(context.currentTime);
        this.master.gain.setTargetAtTime(0, context.currentTime, 0.035);
        clearTimeout(this.suspendTimer);
        this.suspendTimer = setTimeout(() => {
          if (version === this.version) context.suspend().catch(() => {});
        }, 220);
      }
    }

    fadeMedia(target, version) {
      cancelAnimationFrame(this.fadeFrame);
      const media = this.media;
      if (!media) return;
      const initial = media.volume;
      const started = performance.now();
      const tick = (now) => {
        if (version !== this.version) return;
        const fraction = Math.min(1, (now - started) / 260);
        media.volume = initial + (target - initial) * fraction;
        if (fraction < 1) this.fadeFrame = requestAnimationFrame(tick);
        else if (target === 0) media.pause();
      };
      this.fadeFrame = requestAnimationFrame(tick);
    }

    withTimeout(promise, duration) {
      let timeout;
      return Promise.race([
        promise,
        new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Audio timeout")), duration); })
      ]).finally(() => clearTimeout(timeout));
    }

    schedule() {
      const context = this.context;
      if (!this.playing || !context || context.state !== "running") return;
      // Recover from a throttled tab without scheduling a backlog.
      if (this.nextNote < context.currentTime - 0.2) this.nextNote = context.currentTime + 0.04;
      while (this.nextNote < context.currentTime + 0.13) {
        const step = this.step % 16;
        const bar = Math.floor(this.step / 16) % 4;
        const time = this.nextNote;
        if (step % 4 === 0) this.kick(time);
        if (step % 2 === 0) this.percussion(time, 7500, step % 4 === 2 ? 0.075 : 0.035, 0.09);
        if (step === 4 || step === 12) this.percussion(time, 1500, 0.12, 0.15);
        const roots = [55, 43.6535, 65.4064, 48.9994]; // A1, F1, C2, G1
        if ([2, 6, 10, 14].includes(step)) this.tone(time, roots[bar], 0.16, 0.29, "sine");
        if ([2, 8, 14].includes(step)) {
          const intervals = bar === 0 ? [12, 15, 19, 22] : [12, 16, 19, 23];
          intervals.forEach(n => this.tone(time, roots[bar] * Math.pow(2, n / 12), 0.29, 0.022, "triangle"));
        }
        this.step = (this.step + 1) % 64;
        this.nextNote += 60 / 120 / 4;
      }
    }

    kick(time) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.frequency.setValueAtTime(132, time);
      oscillator.frequency.exponentialRampToValueAtTime(45, time + 0.16);
      gain.gain.setValueAtTime(0.65, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
      oscillator.connect(gain); gain.connect(this.master);
      oscillator.start(time); oscillator.stop(time + 0.32);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }

    tone(time, frequency, duration, volume, type) {
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(volume, time + 0.014);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      oscillator.connect(gain); gain.connect(this.master);
      oscillator.start(time); oscillator.stop(time + duration + 0.02);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }

    percussion(time, frequency, duration, volume) {
      const source = this.context.createBufferSource();
      const filter = this.context.createBiquadFilter();
      const gain = this.context.createGain();
      source.buffer = this.noise;
      filter.type = "highpass"; filter.frequency.value = frequency;
      gain.gain.setValueAtTime(volume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
      source.connect(filter); filter.connect(gain); gain.connect(this.master);
      source.start(time); source.stop(time + duration);
      source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
    }
  }
  window.BirthdayAudio = BirthdayAudio;
})();
