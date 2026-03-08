import { dom, state } from "./config";
import { formatElapsed, escapeHtml } from "./utils";
import type { DailyRecord } from "./types";

function getTodayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `clockRecord_${d.getFullYear()}-${month}-${day}`;
}

function loadRecord(): DailyRecord | null {
  const data = localStorage.getItem(getTodayKey());
  return data ? (JSON.parse(data) as DailyRecord) : null;
}

function saveRecord(ms: number, name: string): void {
  localStorage.setItem(getTodayKey(), JSON.stringify({ time: ms, name }));
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
  dom.nameModal.style.display = "flex";
  dom.nameInput.focus();
}

export function submitName(): void {
  const name = dom.nameInput.value.trim() || "Anonymous";
  saveRecord(state.elapsedMs, name);
  dom.nameModal.style.display = "none";
  updateRecordBanner();
}
