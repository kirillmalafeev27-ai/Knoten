export class HUD {
  constructor({ levelNode, progressFill, prevButton, nextButton, resetButton, topicTag }) {
    this.levelNode = levelNode;
    this.progressFill = progressFill;
    this.prevButton = prevButton;
    this.nextButton = nextButton;
    this.resetButton = resetButton;
    this.topicTag = topicTag;
  }

  render(ui) {
    const current = String(ui.levelIndex + 1).padStart(2, "0");
    const total = String(ui.totalLevels).padStart(2, "0");
    this.levelNode.innerHTML = `${current}<span>/${total}</span>`;
    this.progressFill.style.width = `${Math.round(ui.progressRatio * 100)}%`;
    this.prevButton.disabled = !ui.canGoPrev;
    this.nextButton.disabled = !ui.canGoNext;
    this.resetButton.disabled = !ui.isGameVisible;
    this.topicTag.textContent = ui.topicLabel ?? "Sentence Paths";
  }

  setIdle() {
    this.levelNode.innerHTML = `00<span>/00</span>`;
    this.progressFill.style.width = "0%";
    this.prevButton.disabled = true;
    this.nextButton.disabled = true;
    this.resetButton.disabled = true;
    this.topicTag.textContent = "Sentence Paths";
  }
}
