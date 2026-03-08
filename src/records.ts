// Daily speed records via localStorage. Tracks best completion time per day.
import { dom } from "./dom";
import { state } from "./state";
import { formatElapsed } from "./utils";
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
  dom.recordBanner.textContent = "";
  if (record) {
    const nameSpan = document.createElement("span");
    nameSpan.className = "record-name";
    nameSpan.textContent = record.name;
    dom.recordBanner.appendChild(nameSpan);
    dom.recordBanner.appendChild(document.createElement("br"));
    dom.recordBanner.appendChild(
      document.createTextNode(`Today's Record: ${formatElapsed(record.time)}`),
    );
  } else {
    dom.recordBanner.textContent = "No record today yet!";
  }
}

function cleanupOldRecords(): void {
  const todayKey = getTodayKey();
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith("clockRecord_") && key !== todayKey) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Storage unavailable
  }
}

cleanupOldRecords();

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
