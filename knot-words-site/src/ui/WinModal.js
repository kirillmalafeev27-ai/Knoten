export class WinModal {
  constructor({ root, titleNode, subtitleNode, reviewNode, actionButton }) {
    this.root = root;
    this.titleNode = titleNode;
    this.subtitleNode = subtitleNode;
    this.reviewNode = reviewNode;
    this.actionButton = actionButton;
    this.onAdvance = null;
    this.onListen = null;

    this.actionButton.addEventListener("click", () => this.onAdvance?.());
    this.reviewNode.addEventListener("click", (event) => {
      const button = event.target.closest("[data-sentence-text]");
      if (!button) {
        return;
      }

      this.onListen?.(button.dataset.sentenceText);
    });
  }

  setHandlers({ onAdvance, onListen }) {
    this.onAdvance = onAdvance;
    this.onListen = onListen;
  }

  show({ review, isLastLevel }) {
    this.titleNode.textContent = isLastLevel ? "Alle Level geschafft!" : "Level geschafft";
    this.subtitleNode.innerHTML = isLastLevel
      ? "Du hast alle Satzpfade gelöst.<br>Sehr stark."
      : "Alle Wörter sind verbunden.<br>Das Raster ist komplett.";
    this.actionButton.textContent = isLastLevel ? "Nochmal spielen" : "Weiter";
    this.reviewNode.innerHTML = "";

    review.forEach((sentence) => {
      const card = document.createElement("article");
      card.className = "sentence-card";
      card.innerHTML = `
        <div class="sentence-line">
          <span class="sentence-dot" style="background:${sentence.color}; box-shadow:0 0 14px ${sentence.color};"></span>
          <div>
            <p class="sentence-text">${sentence.text}</p>
            <p class="sentence-translation">${sentence.translation}</p>
            <button class="sentence-audio" type="button" data-sentence-text="${sentence.text.replaceAll('"', "&quot;")}">Anhören</button>
          </div>
        </div>
      `;
      this.reviewNode.appendChild(card);
    });

    this.root.classList.add("show");
    this.root.setAttribute("aria-hidden", "false");
  }

  hide() {
    this.root.classList.remove("show");
    this.root.setAttribute("aria-hidden", "true");
  }
}
