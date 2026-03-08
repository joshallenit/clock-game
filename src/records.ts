// Shared leaderboard via server API. Shows today's top 3 fastest times.
import { dom } from "./dom";
import { state } from "./state";
import { formatElapsed } from "./utils";
import type { LeaderboardEntry } from "./types";

async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch("/api/scores");
  if (!res.ok) return [];
  const data = (await res.json()) as { scores: LeaderboardEntry[] };
  return data.scores;
}

async function submitScore(
  name: string,
  time: number,
): Promise<{ rank: number | null; scores: LeaderboardEntry[] }> {
  const res = await fetch("/api/scores", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, time }),
  });
  if (!res.ok) return { rank: null, scores: [] };
  return (await res.json()) as { rank: number | null; scores: LeaderboardEntry[] };
}

function renderBanner(scores: LeaderboardEntry[]): void {
  dom.recordBanner.textContent = "";

  if (scores.length === 0) {
    dom.recordBanner.textContent = "No records yet!";
    return;
  }

  const title = document.createElement("div");
  title.className = "leaderboard-title";
  title.textContent = "Today's Fastest";
  dom.recordBanner.appendChild(title);

  const list = document.createElement("ol");
  list.className = "leaderboard-list";
  for (const entry of scores) {
    const li = document.createElement("li");
    const nameSpan = document.createElement("span");
    nameSpan.className = "lb-name";
    nameSpan.textContent = entry.name;
    const timeSpan = document.createElement("span");
    timeSpan.className = "lb-time";
    timeSpan.textContent = formatElapsed(entry.time);
    li.appendChild(nameSpan);
    li.appendChild(timeSpan);
    list.appendChild(li);
  }
  dom.recordBanner.appendChild(list);
}

export async function updateRecordBanner(): Promise<void> {
  try {
    const scores = await fetchLeaderboard();
    renderBanner(scores);
  } catch {
    dom.recordBanner.textContent = "No records yet!";
  }
}

export function initRecords(): void {
  updateRecordBanner();
}

export function promptForName(finishMs: number): void {
  dom.newRecordTime.textContent = formatElapsed(finishMs);
  dom.nameInput.value = "";
  dom.nameModal.hidden = false;
  dom.nameInput.focus();
}

export async function submitName(): Promise<void> {
  const name = dom.nameInput.value.trim() || "Anonymous";
  dom.nameModal.hidden = true;
  try {
    const { rank, scores } = await submitScore(name, state.elapsedMs);
    renderBanner(scores);
    if (rank !== null && rank <= 3) {
      const title = dom.nameModal.querySelector("h2");
      if (title) title.textContent = "New Record!";
    }
  } catch {
    await updateRecordBanner();
  }
}
