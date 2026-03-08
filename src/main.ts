import "./styles.css";
import { dom } from "./dom";
import { submitName } from "./records";
import { initGame } from "./game";

// --- Modal focus management ---

const FOCUSABLE_IN_MODAL = "#name-input, #name-submit-btn";

function trapFocusInModal(e: KeyboardEvent): void {
  if (dom.nameModal.hidden) return;

  if (e.key === "Escape") {
    submitName();
    return;
  }

  if (e.key !== "Tab") return;

  const focusable = dom.nameModal.querySelectorAll<HTMLElement>(FOCUSABLE_IN_MODAL);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

document.addEventListener("keydown", trapFocusInModal);

dom.nameSubmitBtn.addEventListener("click", submitName);
dom.nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitName();
});

initGame();
