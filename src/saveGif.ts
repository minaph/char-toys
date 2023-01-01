// import p5 from "p5";
import { loadP5, setEventListeners } from "./utils";

const {
  // @ts-ignore
  saveGif,
  // keyPressed: p5KeyPressed,
  // saveFrames,
} = loadP5();

const durationInput = document.createElement("input");
durationInput.type = "number";
durationInput.id = "duration";
durationInput.value = "1";
const saveGifButton = document.createElement("button");

saveGifButton.innerText = "Save Gif";
saveGifButton.addEventListener("click", () =>
  // @ts-ignore
  saveGif.bind(null)("char-toys", Number.parseInt(durationInput.value))
);

function addSaveGifInput() {
  document.body.appendChild(durationInput);
  document.body.appendChild(saveGifButton);
  setEventListeners({ keyPressed });
}

function keyPressed(ev?: KeyboardEvent) {
  // this will download the first 5 seconds of the animation!
  if (ev?.key === "s") {
    // @ts-ignore
    saveGif("char-toys", Number.parseInt(durationInput.value));
  }
}

export { addSaveGifInput };
