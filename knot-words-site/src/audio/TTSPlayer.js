export class TTSPlayer {
  constructor() {
    this.enabled = "speechSynthesis" in window;
    this.voice = null;
    this.lang = "de-DE";
    this.voicesLoaded = false;

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

    if (!this.voicesLoaded) {
      this.voice = this.#pickVoice();
      this.voicesLoaded = true;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = 0.95;
    utterance.pitch = 1.02;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  #pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((voice) => voice.lang.toLowerCase().startsWith("de")) ??
      voices.find((voice) => voice.default) ??
      null
    );
  }
}
