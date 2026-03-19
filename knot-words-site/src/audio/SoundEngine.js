export class SoundEngine {
  constructor() {
    this.context = null;
  }

  init() {
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (this.context.state === "suspended") {
      this.context.resume();
    }
  }

  play(type) {
    if (!this.context) {
      return;
    }

    const now = this.context.currentTime;

    if (type === "connect") {
      this.#singleTone({
        type: "sine",
        from: 480,
        to: 660,
        gainFrom: 0.04,
        gainTo: 0.001,
        duration: 0.1,
        ramp: "exponential",
        now,
      });
      return;
    }

    if (type === "break") {
      this.#singleTone({
        type: "square",
        from: 160,
        to: 50,
        gainFrom: 0.04,
        gainTo: 0.001,
        duration: 0.12,
        ramp: "exponential",
        now,
      });
      return;
    }

    if (type === "complete") {
      this.#singleTone({
        type: "triangle",
        from: 360,
        to: 560,
        gainFrom: 0.09,
        gainTo: 0.001,
        duration: 0.22,
        ramp: "linear",
        now,
      });
      return;
    }

    if (type === "win") {
      [330, 440, 550, 730].forEach((frequency, index) => {
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.connect(gain);
        gain.connect(this.context.destination);

        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.04 + index * 0.05);
        gain.gain.linearRampToValueAtTime(0, now + 0.5 + index * 0.1);
        oscillator.start(now);
        oscillator.stop(now + 0.65 + index * 0.1);
      });
    }
  }

  #singleTone({ type, from, to, gainFrom, gainTo, duration, ramp, now }) {
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.connect(gain);
    gain.connect(this.context.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, now);
    gain.gain.setValueAtTime(gainFrom, now);

    if (ramp === "exponential") {
      oscillator.frequency.exponentialRampToValueAtTime(to, now + duration * 0.8);
      gain.gain.exponentialRampToValueAtTime(gainTo, now + duration);
    } else {
      oscillator.frequency.linearRampToValueAtTime(to, now + duration * 0.82);
      gain.gain.linearRampToValueAtTime(gainTo, now + duration);
    }

    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}
