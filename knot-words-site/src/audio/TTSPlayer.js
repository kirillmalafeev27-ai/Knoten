const TTS_URL_STORAGE_KEY = "knotWords.ttsUrl";
const CACHE_LIMIT = 120;
const FETCH_TIMEOUT_MS = 8000;
const REMOTE_RETRY_DELAY_MS = 30_000;

export class TTSPlayer {
  constructor() {
    this.enabled = "speechSynthesis" in window;
    this.endpoint = this.#resolveEndpoint();
    this.remoteAvailable = true;
    this.remoteFailedAt = 0;
    this.voice = null;
    this.voicesLoaded = false;
    this.queue = [];
    this.processing = false;
    this.cache = new Map();
    this.activeAudio = null;
    this.activeAudioUrl = "";
    this.activePlaybackReject = null;
    this.activeFetch = null;
    this.lastSignature = "";
    this.lastAt = 0;
    this.idleCallback = null;

    if (this.enabled) {
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        this.voicesLoaded = true;
        this.voice = this.#pickVoice();
      });
    }
  }

  unlock() {
    if (!this.voicesLoaded && this.enabled) {
      this.voice = this.#pickVoice();
      this.voicesLoaded = true;
    }
  }

  /** Play immediately, cutting any current audio. */
  playImmediate(text, options = {}) {
    const normalized = this.#normalizeText(text);
    if (!normalized) {
      return;
    }

    this.clearQueue({ stopPlayback: true });
    this.#enqueue({
      text: normalized,
      previousText: this.#normalizeText(options.previousText),
      nextText: this.#normalizeText(options.nextText),
    });
  }

  /** Append to queue — does NOT cut current audio. Plays after current finishes. */
  append(text, options = {}) {
    const normalized = this.#normalizeText(text);
    if (!normalized) {
      return;
    }

    this.#enqueue({
      text: normalized,
      previousText: this.#normalizeText(options.previousText),
      nextText: this.#normalizeText(options.nextText),
    });
  }

  /** Pre-fetch audio into cache without playing. */
  prefetch(text, options = {}) {
    const normalized = this.#normalizeText(text);
    if (!normalized || !this.endpoint || !this.#isRemoteAvailable()) {
      return;
    }

    const item = {
      text: normalized,
      previousText: this.#normalizeText(options.previousText),
      nextText: this.#normalizeText(options.nextText),
    };

    const cacheKey = JSON.stringify(item);
    if (this.cache.has(cacheKey)) {
      return;
    }

    this.#fetchRemoteAudio(item).catch(() => {});
  }

  /** Whether audio is currently playing or queued. */
  isPlaying() {
    return this.processing || this.queue.length > 0;
  }

  /** Set callback fired when queue drains and playback ends. */
  onIdle(callback) {
    this.idleCallback = callback;
  }

  /** Cancel queued items but let current playback finish. */
  cancelPending() {
    this.queue = [];
  }

  reset() {
    this.clearQueue({ stopPlayback: true });
  }

  clearQueue({ stopPlayback = false } = {}) {
    this.queue = [];

    if (this.activeFetch) {
      this.activeFetch.abort();
      this.activeFetch = null;
    }

    if (stopPlayback) {
      this.#stopBrowserSpeech();
      this.#stopActiveAudio();
    }
  }

  #enqueue(item) {
    const signature = JSON.stringify(item);
    const now = performance.now();
    if (signature === this.lastSignature && now - this.lastAt < 120) {
      return;
    }

    this.lastSignature = signature;
    this.lastAt = now;
    this.queue.push(item);
    this.#drainQueue();
  }

  async #drainQueue() {
    if (this.processing) {
      return;
    }

    this.processing = true;

    while (this.queue.length) {
      const item = this.queue.shift();
      try {
        await this.#playItem(item);
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.warn("TTS playback failed:", error.message);
        }
      }
    }

    this.processing = false;
    this.idleCallback?.();
  }

  async #playItem(item) {
    if (this.endpoint && this.#isRemoteAvailable()) {
      try {
        const blob = await this.#fetchRemoteAudio(item);
        await this.#playBlob(blob);
        return;
      } catch (error) {
        if (error?.name === "AbortError") {
          throw error;
        }
        console.warn("Remote TTS failed, falling back to browser:", error.message);
        this.#markRemoteUnavailable();
      }
    }

    await this.#playBrowserSpeech(item.text);
  }

  #isRemoteAvailable() {
    if (this.remoteAvailable) {
      return true;
    }
    if (performance.now() - this.remoteFailedAt > REMOTE_RETRY_DELAY_MS) {
      this.remoteAvailable = true;
      return true;
    }
    return false;
  }

  #markRemoteUnavailable() {
    this.remoteAvailable = false;
    this.remoteFailedAt = performance.now();
  }

  async #fetchRemoteAudio(item) {
    const cacheKey = JSON.stringify(item);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const controller = new AbortController();
    this.activeFetch = controller;
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: item.text,
          previousText: item.previousText,
          nextText: item.nextText,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let message = `TTS proxy returned ${response.status}`;
        try {
          const payload = await response.clone().json();
          if (payload?.error) {
            message = payload.error;
          }
        } catch {
          // ignore parse error
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      this.#rememberCache(cacheKey, blob);
      return blob;
    } finally {
      clearTimeout(timeoutId);
      this.activeFetch = null;
    }
  }

  async #playBlob(blob) {
    this.#stopBrowserSpeech();
    this.#stopActiveAudio();

    const audio = new Audio();
    const objectUrl = URL.createObjectURL(blob);
    this.activeAudio = audio;
    this.activeAudioUrl = objectUrl;
    audio.src = objectUrl;
    audio.preload = "auto";

    await new Promise((resolve, reject) => {
      const cleanup = () => {
        this.activePlaybackReject = null;
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
      };

      const handleEnded = () => {
        cleanup();
        this.#stopActiveAudio();
        resolve();
      };

      const handleError = () => {
        cleanup();
        this.#stopActiveAudio();
        reject(new Error("Audio playback failed"));
      };

      this.activePlaybackReject = reject;
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);
      audio.play().catch((error) => {
        cleanup();
        this.#stopActiveAudio();
        reject(error);
      });
    });
  }

  async #playBrowserSpeech(text) {
    if (!this.enabled || !text) {
      return;
    }

    if (!this.voicesLoaded) {
      this.voice = this.#pickVoice();
      this.voicesLoaded = true;
    }

    this.#stopActiveAudio();
    this.#stopBrowserSpeech();
    window.speechSynthesis.resume();

    await new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 1;
      utterance.pitch = 1;

      if (this.voice) {
        utterance.voice = this.voice;
      }

      utterance.addEventListener("end", resolve, { once: true });
      utterance.addEventListener("error", () => resolve(), { once: true });
      window.speechSynthesis.speak(utterance);
    });
  }

  #stopBrowserSpeech() {
    if (this.enabled) {
      window.speechSynthesis.cancel();
    }
  }

  #stopActiveAudio() {
    const pendingReject = this.activePlaybackReject;
    this.activePlaybackReject = null;

    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.src = "";
      this.activeAudio = null;
    }

    if (this.activeAudioUrl) {
      URL.revokeObjectURL(this.activeAudioUrl);
      this.activeAudioUrl = "";
    }

    if (pendingReject) {
      const error = new Error("Playback interrupted");
      error.name = "AbortError";
      pendingReject(error);
    }
  }

  #rememberCache(cacheKey, blob) {
    this.cache.set(cacheKey, blob);

    if (this.cache.size <= CACHE_LIMIT) {
      return;
    }

    const oldestKey = this.cache.keys().next().value;
    this.cache.delete(oldestKey);
  }

  #normalizeText(text) {
    return typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  }

  #resolveEndpoint() {
    const explicitUrl = window.KNOT_WORDS_TTS_URL || localStorage.getItem(TTS_URL_STORAGE_KEY);
    if (explicitUrl) {
      return explicitUrl;
    }

    if (window.location.protocol === "http:" || window.location.protocol === "https:") {
      return new URL("/api/tts", window.location.origin).toString();
    }

    return "";
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
