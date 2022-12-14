import p5 from "p5";

let moduleP5: p5 | null = null;

function loadP5(): Promise<p5> {
  return new Promise((r) => {
    if (!moduleP5) {
      new p5(function (p: p5) {
        moduleP5 = p;
      });
    }
    const _p = new Proxy(moduleP5 as p5, {
      get: function (target, prop) {
        const r = Reflect.get(target, prop);
        if (typeof r === "function") {
          return r.bind(target);
        }
        return r;
      },
    });
    r(_p as p5);
  });
}

type Listeners = {
  [key: string]: (() => void) | ((ev: Event) => void);
};

function setEventListeners(listeners: Listeners) {
  if (!moduleP5) {
    throw new Error("p5 not loaded");
  }
  new p5(function (p: p5) {
    moduleP5 = Object.assign(p, listeners);
  });
}

function getCanvas(p5Image: unknown) {
  return (p5Image as { canvas: HTMLCanvasElement }).canvas;
}

function createAppEntry(text: string, callback: (ev: MouseEvent) => void) {
  const a = document.createElement("a");
  a.href = "#!";
  a.innerText = text;
  a.addEventListener("click", callback);
  const div = document.createElement("div");
  div.appendChild(a);
  document.body.appendChild(div);
}

export { loadP5, setEventListeners, getCanvas, createAppEntry };
