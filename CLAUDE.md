# Clock Game - AI Context

## What this is
"Doggy and The Clocky" — a browser-based clock-reading game for kids. Players read an analog clock and pick the correct time from multiple-choice options or type it in. A dog character animates between rounds. Score 10 to win; 5 mistakes = game over.

## Tech stack
- TypeScript, Vite, vanilla DOM (no framework)
- Canvas 2D for clock rendering, dog sprites, confetti/rain effects
- Web Audio API for sound effects
- CSS custom properties for dark/light theme
- Vitest + jsdom for tests

## Architecture (module dependency graph)

```
main.ts          Entry point: focus trap, modal listeners, calls initGame()
  |
game.ts          Round orchestration: pick time, lock/unlock controls, handle answers
  |
  +-- clock.ts       Clock canvas: draw face/hands, animateToTime() spin transition
  +-- screens.ts     Win/lose screen display and celebration/rain loops
  +-- options.ts     Generate 6 multiple-choice answers (correct, swapped, nearby)
  +-- timer.ts       Elapsed timer (total game) + round countdown timer
  +-- records.ts     Daily high score via localStorage
  +-- effects.ts     Confetti burst + rain particles on shared overlay canvas
  +-- dog.ts         Dog sprite drawing + run/approach/sad animations
  +-- audio.ts       Web Audio tone synthesis (correct, incorrect, whine, game over)

Shared by many:
  state.ts         Single mutable GameState object (all round/session data)
  dom.ts           Typed references to every DOM element (getElementById wrappers)
  types.ts         All TypeScript interfaces
  constants.ts     Immutable config: clock geometry, game rules, animation settings
  colors.ts        Dark/light palette, runtime theme switching
  utils.ts         Pure helpers: formatTime, formatElapsed, etc.
```

## Key patterns

- **All mutable state lives in `state.ts`** — one object, no hidden module-level `let` vars. This includes timer internals (`roundTimeoutId`, `activeTimeoutCallback`).
- **Rendering-only local state is the documented exception** — `effects.ts` (`fxState`) and `dog.ts` (`dogAnim`/`sadDogAnim`) keep animation refs locally because they don't affect game logic. Each is commented inline.
- **`dom.ts` caches all DOM lookups** — every getElementById happens once at load time.
- **Canvas drawing is immediate-mode** — clock.ts redraws the full face on every frame.
- **Effects overlay** — confetti and rain share a single full-screen canvas (`#confetti-canvas`), also used by dog animations.
- **Color scheme** — CSS vars handle DOM styling; `colors.ts` COLORS object handles canvas. Both must stay in sync.
- **Named constants over magic numbers** — timing values, frame counts, and game rules live in `constants.ts`. Inline numbers are reserved for particle physics and sprite geometry where the visual meaning is self-evident from context.
- **Difficulty progression** — clock numbers hide at score 4/6, minute precision changes at score 7, timer shortens at score 8/9.

## Commands
- `npm run dev` — start dev server
- `npm run build` — typecheck + production build
- `npm test` — run vitest
- `npm run lint` — eslint
