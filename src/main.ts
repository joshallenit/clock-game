import "./styles.css";
import { dom } from "./config";
import { submitName } from "./records";
import { initGame } from "./game";

dom.nameSubmitBtn.addEventListener("click", submitName);
dom.nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") submitName();
});

initGame();
