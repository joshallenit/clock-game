// Entry point: explicit initialization order, modal focus trap, and game boot.
import "./styles.css";
import { initDom, dom } from "./dom";
import { initColors } from "./colors";
import { initRecords, submitName as submitNameAsync } from "./records";
import { initClock } from "./clock";
import { initEffects } from "./effects";
import { initDog } from "./dog";
import { initGame } from "./game";

// --- Global error handler ---

window.addEventListener("error", (e) => {
  console.error("Unhandled error:", e.error ?? e.message);
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
});

// --- Explicit module initialization (order matters) ---

initDom();       // 1. Populate DOM refs (everything depends on this)
initColors();    // 2. Apply color scheme (canvas modules need colors)
initRecords();   // 3. Clean up old localStorage records
initClock();     // 4. Set up clock canvas context
initEffects();   // 5. Set up effects overlay canvas
initDog();       // 6. Set up dog sprite canvas contexts

function submitName(): void {
  submitNameAsync().catch((err) =>
    console.error("Failed to submit name:", err),
  );
}

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

// 7. Boot the game (sets up listeners and starts first round)
initGame();
