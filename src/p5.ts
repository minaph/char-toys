import "./style.css";
import { loadP5, setEventListeners } from "./utils";

const {
  background,
  createCanvas,
  windowWidth,
  windowHeight,
  circle,
} = await loadP5();

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(255);
}

function draw() {
  circle(windowWidth / 2, windowHeight / 2, 50);
}

setEventListeners({
  setup,
  draw,
});
