export class TTSPlayer {
  constructor() {
    this.enabled = "speechSynthesis" in window;
    this.voice = null;
    this.lang = "de-DE";
    this.voicesLoaded = false;

    /* ── phrase-building state (smooth drag speech) ── */
    this._phraseWords = [];
    this._flushTimer = null;
    this._DEBOUNCE_MS = 200;

    if (this.enabled) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        this.voicesLoaded = true;
        this.voice = this.#pickVoice();
      });
    }
  }

  /* ─────────── public API: drag-path speech ─────────── */

  /** Call when a new drag begins — resets buffered words. */
  beginPhrase() {
    this._cancelAll();
    this._phraseWords = [];
  }

  /** Append a word while the player drags; speech is debounced so rapid
   *  moves produce one smooth utterance instead of choppy fragments.      */
  appendWord(word) {
    if (!this.enabled || !word) {
      return;
    }

    this.#ensureVoice();
    this._phraseWords.push(word);
    this._scheduleFlush();
  }

  /** Trim the buffer when the path is rewound (e.g. player backtracks). */
  trimPhrase(keepCount) {
    this._phraseWords = this._phraseWords.slice(0, keepCount);
    clearTimeout(this._flushTimer);
  }

  /** Flush remaining words immediately (call on pointerup). */
  endPhrase() {
    clearTimeout(this._flushTimer);
    this._flushNow();
  }

  /* ─────────── public API: standalone speech ─────────── */

  /** Speak arbitrary text (right-click, win modal, sentence review). */
  speak(text) {
    if (!this.enabled || !text) {
      return;
    }

    this.#ensureVoice();
    this._cancelAll();
    this._phraseWords = [];
    this._speakText(text);
  }

  /* ─────────── private helpers ─────────── */

  _scheduleFlush() {
    clearTimeout(this._flushTimer);
    this._flushTimer = setTimeout(() => this._flushNow(), this._DEBOUNCE_MS);
  }

  _flushNow() {
    if (!this._phraseWords.length) {
      return;
    }

    const text = this._phraseWords.join(" ");
    window.speechSynthesis.cancel();
    this._speakText(text);
  }

  _speakText(text) {
    window.speechSynthesis.resume();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    window.speechSynthesis.speak(utterance);
  }

  _cancelAll() {
    clearTimeout(this._flushTimer);
    window.speechSynthesis.cancel();
  }

  #ensureVoice() {
    if (!this.voicesLoaded) {
      this.voice = this.#pickVoice();
      this.voicesLoaded = true;
    }
  }

  #pickVoice() {
    const voices = window.speechSynthesis.getVoices();
    const deVoices = voices.filter((v) => v.lang.toLowerCase().startsWith("de"));

    /* Prefer cloud / network voices — they are higher quality and far less
       robotic than the built-in local TTS engines on most platforms.        */
    return (
      deVoices.find((v) => !v.localService) ??
      deVoices.find((v) => v.localService) ??
      voices.find((v) => v.default) ??
      null
    );
  }
}
