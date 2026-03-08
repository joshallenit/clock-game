# Developer Guide

## Running the app

```bash
npm install
npm start
```

Opens at http://localhost:3000. The server (`server.js`) is a minimal Express static file server — all game logic runs client-side.

## Project structure

```
server.js              Express static server
public/
  index.html           Game markup (clock canvas, option panels, win/lose screens, name modal)
  styles.css           All styles
  js/
    main.js            Entry point — binds modal events and calls initGame()
    config.js          Constants, colors, DOM refs, and mutable game state
    game.js            Core game loop — round transitions, answer handling, win/lose screens
    timer.js           Elapsed timer and per-round countdown timer
    clock.js           Canvas drawing for the analog clock face and hands
    dog.js             Procedural dog sprite drawing and animation sequences
    effects.js         Confetti and rain particle effects with screen shake
    options.js         Multiple-choice answer generation (correct, swapped, nearby times)
    audio.js           Web Audio API sound effects (correct, incorrect, whine, game over)
    records.js         Daily record tracking via localStorage
    utils.js           formatTime, formatElapsed, escapeHtml helpers
```

## Where to look for common changes

| Task | File(s) |
|------|---------|
| Change game rules (score to win, lives, timer durations) | `config.js` |
| Adjust difficulty progression | `config.js` thresholds, `options.js` for answer choices |
| Modify clock appearance | `clock.js` |
| Change dog animations or add new ones | `dog.js` — add a draw function and a `launch*` export |
| Edit visual effects | `effects.js` |
| Change sounds | `audio.js` |
| Modify answer validation or round flow | `game.js` |
| Update timer behavior | `timer.js` |
| Change record/leaderboard logic | `records.js` |
| Update layout or add UI elements | `index.html` + `styles.css` |

## Architecture notes

- **State**: All mutable game state lives in the `state` object exported from `config.js`. No other file maintains its own game state.
- **DOM refs**: All `document.getElementById` calls are centralized in `config.js` as the `dom` object. Other files import `dom` rather than querying the DOM directly.
- **Animations**: Dog and effect animations use `requestAnimationFrame` loops. Dog animations share a common `runAnimation()` helper to reduce duplication.
- **No build step**: The app uses native ES modules (`type="module"` in the script tag). No bundler or transpiler needed.
