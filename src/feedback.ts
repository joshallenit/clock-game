// Feedback display helpers: status text and mistakes hearts.
import { RULES } from "./constants";
import { dom } from "./dom";
import { state } from "./state";
import type { FeedbackClass } from "./types";

const HEART = "\u2764\uFE0F";
const BLACK_HEART = "\uD83D\uDDA4";
export function setFeedback(text: string, className: FeedbackClass): void {
  dom.feedback.textContent = text;
  dom.feedback.className = className;
}

export function updateMistakesDisplay(): void {
  const remaining = RULES.maxMistakes - state.mistakes;
  dom.mistakes.textContent = HEART.repeat(remaining) + BLACK_HEART.repeat(state.mistakes);
}
