# Doggy and The Clocky

A clock-reading game where players identify the time shown on an analog clock face. Answer 10 questions correctly to win — but watch out for the timer and limited lives.

## How it works

Each round, the clock displays a random time. Players can either type the answer (e.g. `7:30`) or click a "Hint" button to reveal multiple-choice options (at the cost of 30 seconds added to their elapsed time).

### Difficulty progression

The game gets harder as you score more points:

| Score | Change |
|-------|--------|
| 0–3 | All 12 hour numbers shown, 5-minute intervals only |
| 4–5 | Only quarter numbers (3, 6, 9, 12) shown |
| 6 | All numbers removed from the clock face |
| 7+ | Non-5-minute intervals (e.g. 2:37) |
| 8+ | Round timer shortened to 20s, then 10s at score 9 |

### Lives and scoring

- 5 lives (hearts). Wrong answers and timeouts each cost one life.
- Losing all lives ends the game.
- Scoring 10 points wins and reveals a prize screen.

### Daily records

Completion times are tracked per day in localStorage. Beating the day's record prompts you to enter your name for the leaderboard banner.

### The dog

A procedurally drawn dog animates between rounds — running across the screen on correct answers, and sitting sadly on the clock face after mistakes.
