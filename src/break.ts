import { loadP5, setEventListeners, startP5 } from "./utils";
// import p5 from "p5";
import { Engine, RandomScale } from "./RenderingEngine/CharRenderingEngine";
import { BBox } from "./RenderingEngine/bbox";
import { CharPhysics } from "./RenderingEngine/CharPhysics";
import { Char } from "./RenderingEngine/Char";

const { windowHeight, windowWidth } = loadP5();

const params = {
  worldWidth: windowWidth,
  worldHeight: windowHeight,
};

let engine: Engine | null = null;

async function setup() {
  const worldWidth = await params.worldWidth;
  const worldHeight = await params.worldHeight;
  engine = new Engine(worldWidth, worldHeight, 20);

  loadMoritaSingle(engine);
  // loadMorita(engine);
  // loadMoritaStrokes(engine);
}

function breakChar(char: Char, engine: Engine, scales: RandomScale) {
  for (const stroke of char.strokes) {
    const newStroke = engine.setRandomStrokeState(stroke, scales);
    newStroke.data[0][0] = char.data[0][0];
    newStroke.data[0][1] = char.data[0][1];
    newStroke.scale(char.scaleFactor);
    engine.add(newStroke);
  }
  engine.delete(char);
}


async function loadMoritaStrokes(engine: Engine) {
  const scales = {
    x: 1000,
    y: 1,
    rotation: 3.14,
    diff: {
      x: 5,
      y: 5,
      rotation: 0.05,
    },
    scale: 1,
  };
  const aStrokes = [
    "assets/hiragana/hiragana_a_2.png",
    "assets/hiragana/hiragana_a_3.png",
    "assets/hiragana/hiragana_a_4.png",
  ];

  const bboxes = [
    new BBox(0, 0, 298, 100, 0),
    new BBox(50, 0, 200, 298, 0),
    new BBox(0, 100, 298, 190, 0),
  ];
  let char_a = await engine.loadCharFromUrls("a", aStrokes, bboxes, 298, 298);
  let dx = 0;

  for (let stroke of char_a.strokes) {
    stroke = engine.setRandomStrokeState(stroke, scales);
    stroke.data[0][0] += dx;
    engine.add(stroke);
    dx += 300;
  }
  char_a = engine.setRandomCharState(char_a, scales);
  char_a.data[0][0] += dx;
  engine.add(char_a);
}

async function loadMorita(engine: Engine) {
  const scales = {
    x: 10,
    y: 10,
    rotation: 3.14,
    diff: {
      x: 5,
      y: 5,
      rotation: 0.05,
    },
    scale: 1,
  };
  const aCount = 100;
  const oCount = 100;

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

  for (let i = 0; i < aCount; i++) {
    let char_a = await engine.loadCharFromUrls(
      "a",
      aStrokes,
      Array(3)
        .fill(null)
        .map(() => new BBox(0, 0, 298, 298, 0)),
      298,
      298
    );
    char_a = engine.setRandomCharState(char_a, scales);
    engine!.add(char_a);
  }

  for (let i = 0; i < oCount; i++) {
    let char_o = await engine!.loadCharFromUrls(
      "o",
      oStrokes,
      Array(3)
        .fill(null)
        .map(() => new BBox(0, 0, 298, 298, 0)),
      298,
      298
    );
    char_o = engine.setRandomCharState(char_o, scales);
    engine.add(char_o);
    char_o.data[0][0] += 400;
  }

  function onClick(ev?: MouseEvent) {
    const { clientX, clientY } = ev!;
    const pointed = engine!.getPointed(clientX, clientY);
    console.log(pointed);
    for (const image of pointed) {
      if (image instanceof Char) {
        breakChar(image, engine!, scales);
      }
    }
  }

  // @ts-ignore
  target.addEventListener("mousedown", onClick);
}

const target = new EventTarget();

function mousePressed(ev?: MouseEvent) {
  console.log(ev);
  target.dispatchEvent(
    new MouseEvent("mousedown", { clientX: ev!.clientX, clientY: ev!.clientY })
  );
}

async function loadMoritaSingle(engine: Engine) {
  const scales = {
    x: 1000,
    y: 1,
    rotation: 0.05,
    diff: {
      x: 0.5,
      y: 0.5,
      rotation: 0.05,
    },
    scale: 1,
  };

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

  let char_a = await engine.loadCharFromUrls(
    "a",
    aStrokes,
    Array(3)
      .fill(null)
      .map(() => new BBox(0, 0, 298, 298, 0)),
    298,
    298
  );
  char_a = engine.setRandomCharState(char_a, scales);
  engine!.add(char_a);
  let char_o = await engine!.loadCharFromUrls(
    "o",
    oStrokes,
    Array(3)
      .fill(null)
      .map(() => new BBox(0, 0, 298, 298, 0)),
    298,
    298
  );
  char_o = engine.setRandomCharState(char_o, scales);
  char_o.data[0][0] += 400;
  engine.add(char_o);

  console.table({ char_a, char_o });

  function onClick(ev?: MouseEvent) {
    const { clientX, clientY } = ev!;
    const pointed = engine!.getPointed(clientX, clientY);
    console.log(pointed);
    for (const image of pointed) {
      // debugger;
      if (image instanceof Char) {
        breakChar(image, engine!, { rotation: 0.2, diff: { x: 3, y: 3, rotation: 0.05 } });
      }
    }
  }

  // @ts-ignore
  target.addEventListener("mousedown", onClick);
}

function draw() {
  engine!.draw();
}

function startApp() {
  // startP5({ setup, draw });
  setEventListeners({ setup, draw, mousePressed });
  startP5();
}


export {startApp, breakChar}