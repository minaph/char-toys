// import "./p5"
import "./style.css";
import "./gfont.css";

import { startApp as startKB } from "./keyboard";
import { startApp as startChaos } from "./chaos";
import { createAppEntry } from "./utils";
import { startApp as startBreakChars } from "./break";

createAppEntry("Keyboard", (ev) => {
  ev.preventDefault();
  startKB();
});
createAppEntry("Chaos", (ev) => {
  ev.preventDefault();
  startChaos();
});
createAppEntry("Break", (ev) => {
  ev.preventDefault();
  startBreakChars();
});
