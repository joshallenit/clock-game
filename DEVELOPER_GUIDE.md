# Developer Guide

## Running the app

```bash
npm install
npm run dev
```

Opens at http://localhost:3000. Vite handles TypeScript compilation and hot module reload.

### Other commands

```bash
npm run build     # Type-check + production build to dist/
npm run preview   # Serve the production build locally
npm run lint      # ESLint with TypeScript rules
npm run format    # Prettier formatting
```

## Project structure

```
index.html              Vite entry HTML (root level)
vite.config.ts          Vite config (dev server port, etc.)
tsconfig.json           TypeScript strict config
eslint.config.js        ESLint flat config with typescript-eslint
.prettierrc             Prettier formatting rules
src/
  main.ts               Entry point — imports CSS, binds modal events, calls initGame()
  types.ts              Shared interfaces (GameState, DomRefs, particles, etc.)
  config.ts             Grouped constants (CLOCK, RULES, ANIM, COLORS), DOM refs, mutable state
  game.ts               Core game loop — round transitions, answer handling, win/lose screens
  timer.ts              Elapsed timer and per-round countdown timer
  clock.ts              Canvas drawing for the analog clock face and hands
  dog.ts                Procedural dog sprite drawing and animation sequences
  effects.ts            Confetti and rain particle effects with screen shake
  options.ts            Multiple-choice answer generation (correct, swapped, nearby times)
  audio.ts              Web Audio API sound effects (correct, incorrect, whine, game over)
  records.ts            Daily record tracking via localStorage
  utils.ts              formatTime, formatElapsed, escapeHtml helpers
  styles.css            All styles (imported via main.ts, processed by Vite)
```

## Where to look for common changes

| Task | File(s) |
|------|---------|
| Change game rules (score to win, lives, timer durations) | `config.ts` — `RULES` object |
| Adjust difficulty progression | `config.ts` — `RULES` thresholds, `options.ts` for answer choices |
| Modify clock appearance | `config.ts` — `CLOCK` object, `clock.ts` for drawing |
| Change dog animations or add new ones | `dog.ts` — add a draw function and a `launch*` export |
| Edit visual effects | `config.ts` — `ANIM` object, `effects.ts` for rendering |
| Change sounds | `audio.ts` |
| Modify answer validation or round flow | `game.ts` |
| Update timer behavior | `timer.ts` |
| Change record/leaderboard logic | `records.ts` |
| Update layout or add UI elements | `index.html` + `src/styles.css` |
| Add a new shared type | `types.ts` |

## Architecture notes

- **Types**: All shared interfaces live in `types.ts`. Config objects use `as const` for literal types.
- **State**: All mutable game state lives in the `state` object exported from `config.ts` (typed as `GameState`). No other file maintains its own game state.
- **DOM refs**: All `getElementById` calls are centralized in `config.ts` as the `dom` object (typed as `DomRefs`). Other files import `dom` rather than querying the DOM directly.
- **Config grouping**: Constants are organized into `CLOCK` (canvas geometry), `RULES` (game rules/difficulty), `ANIM` (animation frames/counts), and `COLORS` (palette).
- **Animations**: Dog and effect animations use `requestAnimationFrame` loops. Dog animations share a common `runAnimation()` helper. Effects share a generic `runParticleLoop<P>()` helper.
- **Build**: Vite compiles TypeScript and bundles for production. No Express server needed.
