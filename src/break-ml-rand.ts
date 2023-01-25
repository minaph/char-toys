import p5 from "p5";
import { loadP5, setEventListeners, startP5 } from "./utils";

import { randomImageStrokes, visualize } from "./break-ml";
import { breakChar } from "./break";

import { Engine } from "./RenderingEngine/CharRenderingEngine";
import { Char } from "./RenderingEngine/Char";

import { BBox } from "./RenderingEngine/bbox";

const scales = {
  x: 1000,
  y: 400,
  rotation: 0.05,
  diff: {
    x: 0.8,
    y: 0.8,
    rotation: 0.01,
  },
  scale: 1,
};

const { windowHeight, windowWidth } = loadP5();

let engine: Engine | null = null;

async function setup() {
  // debugger
  console.log("setup");
  const brokenStrokes = await randomImageStrokes(100);
  engine = new Engine(await windowWidth, await windowHeight, 20);
  for (const charResponse of brokenStrokes) {
    const { pred_boxes, image_size } = charResponse;
    const bboxes = [];
    for (const box of pred_boxes) {
      const [x, y, x1, y1] = box;
      bboxes.push(new BBox(x, y, x1 - x, y1 - y, 0));
    }
    const graphics = (await visualize(charResponse, "none", true)).slice(2);
    // const char = new Char("1", ...image_size, bboxes, graphics);
    const char = await engine.loadCharFromImages(
      Math.random().toFixed(3),
      graphics.map((x) => x.get()),
      bboxes,
      ...image_size
    );
    const newChar = engine.setRandomCharState(char, scales);
    // const newChar = char;
    engine.add(newChar);
    console.log(newChar);
  }

  function onClick(ev?: MouseEvent) {
    const { clientX, clientY } = ev!;
    const pointed = engine!.getPointed(clientX, clientY);
    console.log(pointed);
    for (const image of pointed) {
      // debugger;
      if (image instanceof Char) {
        breakChar(image, engine!, {
          rotation: 0.2,
          diff: { x: 1, y: 1, rotation: 0.05 },
        });
      }
    }
  }

  // @ts-ignore
  target.addEventListener("mousedown", onClick);
}

function draw() {
  engine?.draw();
}



const target = new EventTarget();

function mousePressed(ev?: MouseEvent) {
  console.log(ev);
  target.dispatchEvent(
    new MouseEvent("mousedown", { clientX: ev!.clientX, clientY: ev!.clientY })
  );
}

function startApp() {
  setEventListeners({ setup, draw, mousePressed });
  startP5();
}

export { startApp };
