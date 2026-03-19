export class TTSPlayer {
  constructor() {
    this.enabled = "speechSynthesis" in window;
    this.voice = null;
    this.lang = "de-DE";
    this.voicesLoaded = false;
    this.lastText = "";
    this.lastAt = 0;

    if (this.enabled) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        this.voicesLoaded = true;
        this.voice = this.#pickVoice();
      });
    }
  }

  speak(text) {
    if (!this.enabled || !text) {
      return;
    }

    const now = performance.now();
    if (this.lastText === text && now - this.lastAt < 180) {
      return;
    }

    this.lastText = text;
    this.lastAt = now;

    if (!this.voicesLoaded) {
      this.voice = this.#pickVoice();
      this.voicesLoaded = true;
    }

    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = 1.05;
    utterance.pitch = 1.02;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  #pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((voice) => voice.lang.toLowerCase().startsWith("de") && voice.localService) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith("de")) ??
      voices.find((voice) => voice.default) ??
      null
    );
  }
}
