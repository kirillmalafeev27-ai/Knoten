export class HintTooltip {
  constructor(node) {
    this.node = node;
    this.timeoutId = null;
  }

  show(message, duration = 1800) {
    this.node.textContent = message;
    this.node.classList.add("is-visible");
    window.clearTimeout(this.timeoutId);
    this.timeoutId = window.setTimeout(() => this.hide(), duration);
  }

  hide() {
    this.node.classList.remove("is-visible");
  }
}
