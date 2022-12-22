import { loadP5, setEventListeners, sleep, startP5 } from "./utils";
import p5 from "p5";

function preload() {
  // loadFont()
}

const fontList = [
  "IBM Plex Sans JP",
  "Kaisei HarunoUmi",
  "Kosugi Maru",
  "M PLUS 1 Code",
  "M PLUS Rounded 1c",
  "New Tegomin",
  "Noto Sans JP",
  "Noto Serif JP",
  "Sawarabi Mincho",
  "Shippori Mincho",
  "Yuji Boku",
  "Yuji Mai",
  "Zen Antique",
  "Zen Antique Soft",
  "Zen Maru Gothic",
];

const textInput = document.createElement("input");
textInput.type = "text";
textInput.id = "text";
const drawButton = document.createElement("button");
drawButton.innerText = "Draw";
drawButton.addEventListener("click", capture);

function addTextInput() {
  document.body.appendChild(textInput);
  document.body.appendChild(drawButton);
}

const numberInput = document.createElement("input");
numberInput.type = "number";
numberInput.id = "number";
numberInput.value = "1";
const numberButton = document.createElement("button");
numberButton.innerText = "Draw & Break";
numberButton.addEventListener("click", randomBreakDown);

function addNumberInput() {
  document.body.appendChild(numberInput);
  document.body.appendChild(numberButton);
}


const {
  noCanvas,
  background,
  createGraphics,
  select,
  CENTER,
  selectAll,
  pixelDensity,
  // loadFont,
} = loadP5();

function setup() {
  // createCanvas(120, 120);
  pixelDensity(1);
  background(255);
  addTextInput();
  addFontSelector();
  noCanvas();
  addBreakButton();
  addNumberInput();
}

// フォントの選択を行うセレクトボックスを定義する
const fontSelector = document.createElement("select");
fontSelector.id = "font-selector";

// フォントの選択肢をセレクトボックスに追加する
for (const font of fontList) {
  const option = document.createElement("option");
  option.value = font;
  option.textContent = font;
  fontSelector.appendChild(option);
}

let selectedFont = fontSelector.value;

fontSelector.addEventListener("input", async () => {
  selectedFont = fontSelector.value;
  console.log({ selectedFont });
  const canvas = await createGraphics(1, 1);
  canvas.textFont(`"${selectedFont}"`);
  canvas.text("test", 0, 0);
  canvas.remove();
});

function addFontSelector() {
  // セレクトボックスをHTMLのページに追加する
  document.body.appendChild(fontSelector);
}

function capture() {
  const text = textInput.value[0];
  textInput.value = textInput.value.slice(1);
  drawText(text);
}

const br = document.createElement("button");
br.innerText = "Break!";
br.addEventListener("click", breakDown);

function addBreakButton() {
  document.body.appendChild(br);
}

async function breakDown() {
  const main = await select("main");
  const lines: (p5.Element | p5.Graphics)[][] = [];
  for (const child of await selectAll("canvas", main!)) {
    // const canvas = getCanvas(child);
    const canvas = child.elt;
    const data = canvas.toDataURL("image/png");
    const res = fetchStrokes(encodeURIComponent(data));
    const boxes = await visualize(res);
    lines.push([child, ...boxes]);
    child.remove();
  }
  for (const line of lines) {
    showStrokes(line);
  }
}

async function randomBreakDown() {
  const lines: (p5.Element | p5.Graphics)[][] = [];
  const count = Number.parseInt(numberInput.value)
  const responses = await randomImageStrokes(count) as MLBreakDown[];

  for (const res of responses) {
    const boxes = await visualize(Promise.resolve(res));
    lines.push(boxes);
  }
  for (const line of lines) {
    showStrokes(line);
  }
}

// async function showStrokes(line: [p5.Element, Promise<p5.Graphics[]>]) {
async function showStrokes(line: (p5.Element | p5.Graphics)[]) {
  const div = document.createElement("div");
  div.style.display = "flex";
  div.style.flexDirection = "row";
  div.style.justifyContent = "left";
  div.style.width = "100%";

  for (const child of line){
    child.parent(div);
  }
  document.body.appendChild(div);
}

type MLBreakDown = {
  source?: number[][];
  image_size: [number, number];
  pred_boxes: [number, number, number, number][];
  pred_classes: number[];
  pred_masks: number[][][];
  scores: number[];
};

async function visualize(response: Promise<MLBreakDown>) {
  const res = await response;
  console.log({ res });
  const { pred_masks, image_size } = res;
  const result = [];

  if ("source" in res){
    const source = await createGraphics(image_size[0], image_size[1]);
    source.loadPixels();
    for (let i = 0; i < source.width; i++) {
      for (let j = 0; j < source.height; j++) {
        const value = 255 - res.source![j][i] * 255;
        if (value < 255) {
          source.set(i, j, [...Array(3).fill(value), 255]);
        }
      }
    }
    source.updatePixels();
    source.show();
    result.push(source);
    source.style("display", "inline");
  }
  const allLayers = await createGraphics(image_size[0], image_size[1]);
  allLayers.style("display", "inline");
  result.push(allLayers);
  allLayers.loadPixels();

  for (const mask of pred_masks) {
    const g = await createGraphics(image_size[0], image_size[1]);
    g.loadPixels();
    for (let i = 0; i < g.width; i++) {
      for (let j = 0; j < g.height; j++) {
        const value = 255 - mask[j][i] * 255;
        g.set(i, j, [...Array(3).fill(value), 255]);
        if (value < 255) {
          allLayers.set(i, j, [...Array(3).fill(value), 255]);
        }
      }
    }
    result.push(g);
    g.updatePixels();
    g.style("display", "inline");
  }
  allLayers.updatePixels();
  return result;
}

async function randomImageStrokes(count: number){
  const data = new FormData();
  data.append("count", count.toString());
  // data.append("field2", "value2");
  const endpoint = "http://127.0.0.1:5000/random";

  const request = new XMLHttpRequest();
  request.open("POST", endpoint);
  const response = new Promise((resolve, reject) => {
    request.onload = function () {
      resolve(this.response);
    };
    request.onerror = function () {
      reject(this.statusText);
    };
  });
  request.send(data);

  const result = (await response) as string;
  const res = JSON.parse(result);
  return res;
}

async function fetchStrokes(img64: string) {
  const data = new FormData();
  data.append("picture", img64);
  // data.append("field2", "value2");
  const endpoint = "http://127.0.0.1:5000/upload";

  const request = new XMLHttpRequest();
  request.open("POST", endpoint);
  const response = new Promise((resolve, reject) => {
    request.onload = function () {
      resolve(this.response);
    };
    request.onerror = function () {
      reject(this.statusText);
    };
  });
  request.send(data);
  const result = (await response) as string;
  const res = JSON.parse(result);
  return res;
}

async function drawText(text: string) {
  // HTMLのキャンバス要素を取得します
  // var canvas = document.getElementById("canvas");
  const main = await select("main");

  const canvas = await createGraphics(120, 120);
  canvas.background(255);

  const fontSize = 110;

  // const ctx = (canvas.elt as HTMLCanvasElement).getContext("2d");

  // ctx!.font = `${fontSize}px ${selectedFont}`;
  // ctx!.textAlign = "center";
  // ctx!.textBaseline = "middle";
  // ctx!.fillStyle = "black";
  // ctx!.fillText(text, canvas.width / 2, canvas.height / 2);

  canvas.fill(0);
  canvas.textFont(`"${selectedFont}"`);
  // await sleep(100);
  await document.fonts.ready;
  canvas.textSize(fontSize);
  canvas.textAlign(await CENTER, await CENTER);
  canvas.text(text, canvas.width / 2, canvas.height / 2);
  // canvas.show();
  canvas.style("display", "inline");
  canvas.parent(main!);
}

export function startApp() {
  setEventListeners({ setup, preload });
  startP5();
}
