// Daily speed records via localStorage. Tracks best completion time per day.
import { dom } from "./dom";
import { state } from "./state";
import { formatElapsed, escapeHtml } from "./utils";
import type { DailyRecord } from "./types";

function getTodayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `clockRecord_${d.getFullYear()}-${month}-${day}`;
}

function loadRecord(): DailyRecord | null {
  const key = getTodayKey();
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as DailyRecord;
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage unavailable
    }
    return null;
  }
}

function saveRecord(ms: number, name: string): void {
  try {
    localStorage.setItem(getTodayKey(), JSON.stringify({ time: ms, name }));
  } catch {
    // Storage full or unavailable (e.g. private browsing) -- silently ignore
  }
}

export function isNewRecord(finishMs: number): boolean {
  const record = loadRecord();
  return !record || finishMs < record.time;
}

export function updateRecordBanner(): void {
  const record = loadRecord();
  if (record) {
    dom.recordBanner.innerHTML =
      `<span class="record-name">${escapeHtml(record.name)}</span>` +
      `<br>Today's Record: ${formatElapsed(record.time)}`;
  } else {
    dom.recordBanner.textContent = "No record today yet!";
  }
}

export function promptForName(finishMs: number): void {
  dom.newRecordTime.textContent = formatElapsed(finishMs);
  dom.nameInput.value = "";
  dom.nameModal.hidden = false;
  dom.nameInput.focus();
}

export function submitName(): void {
  const name = dom.nameInput.value.trim() || "Anonymous";
  saveRecord(state.elapsedMs, name);
  dom.nameModal.hidden = true;
  updateRecordBanner();
}
