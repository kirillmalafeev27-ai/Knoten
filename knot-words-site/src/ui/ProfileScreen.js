const STORAGE_KEY = "knotWords.profile";

const AGE_OPTIONS = [
  { value: "bis 12", label: "bis 12" },
  { value: "13-17", label: "13-17" },
  { value: "18-30", label: "18-30" },
  { value: "30+", label: "30+" },
];

const LEVEL_OPTIONS = [
  { value: "A1", label: "A1" },
  { value: "A2", label: "A2" },
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
];

const DEFAULT_PROFILE = {
  name: "",
  age: "18-30",
  level: "A1",
  topic: "Alltag",
};

export class ProfileScreen {
  constructor({ screen, form, nameInput, topicInput, ageOptions, levelOptions, note, submitButton }) {
    this.screen = screen;
    this.form = form;
    this.nameInput = nameInput;
    this.topicInput = topicInput;
    this.ageOptions = ageOptions;
    this.levelOptions = levelOptions;
    this.note = note;
    this.submitButton = submitButton;
    this.onSubmit = null;
    this.state = this.#loadProfile();

    this.#renderOptionGroup(this.ageOptions, AGE_OPTIONS, "age");
    this.#renderOptionGroup(this.levelOptions, LEVEL_OPTIONS, "level");

    this.nameInput.value = this.state.name;
    this.topicInput.value = this.state.topic;
    this.topicInput.addEventListener("input", () => {
      this.state.topic = this.topicInput.value.trim() || "Alltag";
    });
    this.form.addEventListener("submit", (event) => this.#handleSubmit(event));
  }

  setSubmitHandler(handler) {
    this.onSubmit = handler;
  }

  setLoading(isLoading) {
    this.submitButton.disabled = isLoading;
    this.submitButton.textContent = isLoading ? "Level werden geladen..." : "Lernpfad starten";
  }

  show() {
    this.screen.classList.remove("is-hidden");
  }

  hide() {
    this.screen.classList.add("is-hidden");
  }

  #handleSubmit(event) {
    event.preventDefault();
    const profile = {
      name: this.nameInput.value.trim() || "Lerner",
      age: this.state.age,
      level: this.state.level,
      topic: this.topicInput.value.trim() || "Alltag",
    };

    this.state = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    this.onSubmit?.(profile);
  }

  #renderOptionGroup(container, options, key) {
    container.innerHTML = "";

    options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `choice-chip${this.state[key] === option.value ? " is-selected" : ""}`;
      button.textContent = option.label;
      button.dataset.value = option.value;
      button.addEventListener("click", () => {
        this.state[key] = option.value;
        [...container.children].forEach((child) => child.classList.remove("is-selected"));
        button.classList.add("is-selected");
      });
      container.appendChild(button);
    });
  }

  #loadProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_PROFILE };
      }

      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }
}
