import { dom } from "./config.js";
import { submitName } from "./records.js";
import { initGame } from "./game.js";

// Name modal event bindings
dom.nameSubmitBtn.addEventListener("click", submitName);
dom.nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitName();
});

// Start the game
initGame();
