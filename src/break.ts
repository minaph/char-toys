import { loadP5, setEventListeners, startP5 } from "./utils";
// import p5 from "p5";
import { Engine } from "./RenderingEngine/CharRenderingEngine";
import { BBox } from "./RenderingEngine/bbox";
import { CharPhysics } from "./RenderingEngine/CharPhysics";

const { windowHeight, windowWidth } = loadP5();

const params = {
  worldWidth: windowWidth,
  worldHeight: windowHeight,
};

let engine: Engine | null = null;

async function setup() {
  const worldWidth = await params.worldWidth;
  const worldHeight = await params.worldHeight;
  engine = new Engine({
    worldWidth,
    worldHeight,
    strokeInit: {
      scaleFactor: "random",
      physics: "random",
      randomScales: {
        x: 1,
        y: 1,
        scale: 1,
        rotation: 1,
      },
    },
  });

  loadMorita(engine);
}

async function loadMorita(engine: Engine) {
  const scales: [number, number, number] = [0.5, 0.5, 0.05];
  const aCount = 10;
  const oCount = 10;

  const aStrokes = [
    "assets/hiragana/hiragana_a_2.png",
    "assets/hiragana/hiragana_a_3.png",
    "assets/hiragana/hiragana_a_4.png",
  ];
  const oStrokes = [
    "assets/hiragana/hiragana_o_2.png",
    "assets/hiragana/hiragana_o_3.png",
    "assets/hiragana/hiragana_o_4.png",
  ];
  const bbox = new BBox(0, 0, 298, 298, 0);

  for (let i = 0; i < aCount; i++) {
    const char_a = await engine.loadChar(
      "a",
      aStrokes,
      Array(3).fill(bbox),
      298,
      298
    );
    engine!.add(char_a);
    char_a.diff = CharPhysics.random(...scales);
  }

  for (let i = 0; i < oCount; i++) {
    const char_o = await engine!.loadChar(
      "o",
      oStrokes,
      Array(3).fill(bbox),
      298,
      298
    );
    engine.add(char_o);
    char_o.diff = CharPhysics.random(...scales);
  }
}

function draw() {
  engine!.draw();
}

export function startApp() {
  // startP5({ setup, draw });
  setEventListeners({ setup, draw });
  startP5();
}

