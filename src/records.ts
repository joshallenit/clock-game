// Daily speed records via localStorage. Tracks best completion time per day.
import { dom } from "./dom";
import { state } from "./state";
import { formatElapsed } from "./utils";
import type { DailyRecord } from "./types";

const STORAGE_PREFIX = "clockRecord_";

function getTodayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${STORAGE_PREFIX}${d.getFullYear()}-${month}-${day}`;
}

function isValidRecord(data: unknown): data is DailyRecord {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as DailyRecord).time === "number" &&
    typeof (data as DailyRecord).name === "string"
  );
}

function loadRecord(): DailyRecord | null {
  const key = getTodayKey();
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    const parsed: unknown = JSON.parse(data);
    if (!isValidRecord(parsed)) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
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
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX) && key !== todayKey) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key);
    }
  } catch {
    // Storage unavailable
  }
}

/** Clean up old records. Call once at startup. */
export function initRecords(): void {
  cleanupOldRecords();
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
