import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

interface ScoreEntry {
  name: string;
  time: number;
}

const dailyScores = new Map<string, ScoreEntry[]>();

function todayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function getTopScores(key: string): ScoreEntry[] {
  return (dailyScores.get(key) ?? []).slice(0, 3);
}

app.get("/api/scores", (_req, res) => {
  res.json({ scores: getTopScores(todayKey()) });
});

app.post("/api/scores", (req, res) => {
  const { name, time } = req.body as { name?: unknown; time?: unknown };

  if (typeof time !== "number" || time < 300) {
    res.status(400).json({ error: "Invalid time" });
    return;
  }

  const trimmedName =
    typeof name === "string" ? name.trim().slice(0, 20) : "";
  const safeName = trimmedName || "Anonymous";

  const key = todayKey();
  const scores = dailyScores.get(key) ?? [];
  scores.push({ name: safeName, time });
  scores.sort((a, b) => a.time - b.time);
  dailyScores.set(key, scores);

  const top3 = scores.slice(0, 3);
  const rank = top3.findIndex(
    (s) => s.name === safeName && s.time === time,
  );

  res.json({
    rank: rank !== -1 ? rank + 1 : null,
    scores: top3,
  });
});

// In production, serve the built static files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, "..", "dist");

app.use(express.static(distPath));
app.get("/{*splat}", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT ?? 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
