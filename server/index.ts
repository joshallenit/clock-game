import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Redis } from "@upstash/redis";

const app = express();
app.use(express.json());

interface ScoreEntry {
  name: string;
  time: number;
}

// Redis client (null if env vars missing — local dev fallback)
function createRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

// In-memory fallback for local dev without Redis
const dailyScores = new Map<string, ScoreEntry[]>();

function todayKey(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

const TTL_SECONDS = 48 * 60 * 60; // 48 hours

async function getTopScores(dateKey: string): Promise<ScoreEntry[]> {
  if (redis) {
    const key = `scores:${dateKey}`;
    const results = await redis.zrange(key, 0, 2);
    return results.map((member) => {
      const entry =
        typeof member === "string" ? JSON.parse(member) : (member as object);
      return entry as ScoreEntry;
    });
  }
  return (dailyScores.get(dateKey) ?? []).slice(0, 3);
}

async function addScore(
  dateKey: string,
  entry: ScoreEntry,
): Promise<{ rank: number | null; scores: ScoreEntry[] }> {
  if (redis) {
    const key = `scores:${dateKey}`;
    const member = JSON.stringify(entry);
    await redis.zadd(key, { score: entry.time, member });
    await redis.expire(key, TTL_SECONDS);

    const top3 = await getTopScores(dateKey);
    const rank = top3.findIndex(
      (s) => s.name === entry.name && s.time === entry.time,
    );
    return { rank: rank !== -1 ? rank + 1 : null, scores: top3 };
  }

  const scores = dailyScores.get(dateKey) ?? [];
  scores.push(entry);
  scores.sort((a, b) => a.time - b.time);
  dailyScores.set(dateKey, scores);

  const top3 = scores.slice(0, 3);
  const rank = top3.findIndex(
    (s) => s.name === entry.name && s.time === entry.time,
  );
  return { rank: rank !== -1 ? rank + 1 : null, scores: top3 };
}

app.get("/api/scores", async (_req, res) => {
  try {
    res.json({ scores: await getTopScores(todayKey()) });
  } catch {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

app.post("/api/scores", async (req, res) => {
  const { name, time } = req.body as { name?: unknown; time?: unknown };

  if (typeof time !== "number" || time < 300) {
    res.status(400).json({ error: "Invalid time" });
    return;
  }

  const trimmedName =
    typeof name === "string" ? name.trim().slice(0, 20) : "";
  const safeName = trimmedName || "Anonymous";

  try {
    const result = await addScore(todayKey(), { name: safeName, time });
    res.json(result);
  } catch {
    res.status(500).json({ error: "Failed to save score" });
  }
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
  const mode = redis ? "Redis" : "in-memory (no Redis env vars)";
  console.log(`Server listening on http://localhost:${PORT} [${mode}]`);
});
