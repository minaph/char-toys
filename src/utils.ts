import p5 from "p5";
import type { OverloadedParams, OverloadedReturnType } from "./overloads";

// let moduleP5: p5 | null = null;

const p5Switch = document.createElement("button");

type Listeners = {
  [key: string]: (() => void) | ((ev: Event) => void);
};
let listeners: Listeners | null = null;

let p5SwitchPromise = new Promise<p5>((resolve) => {
  p5Switch.addEventListener("click", () => {
    new p5(function (p: p5) {
      resolve(Object.assign(p, listeners));
    });
  });
});

type Promised<T extends (...args: any) => any> = (
  ...args: OverloadedParams<T>
) => Promise<OverloadedReturnType<T>>;

type DummyP5Property<Prop extends keyof p5> = p5[Prop] extends Function
  ? Promised<p5[Prop]>
  : Promise<p5[Prop]>;

type DummyP5 = {
  [key in keyof p5]: DummyP5Property<key>;
};

const dummyP5: DummyP5 = new Proxy<DummyP5>(
  new p5((p) => {
    p.setup = () => {
      p.noCanvas();
    };
  }) as unknown as DummyP5,
  {
    get: function (
      target,
      prop: keyof p5
    ): (() => Promise<any>) | Promise<any> {
      const dummy = Reflect.get(target, prop);
      if (typeof dummy === "function") {
        return async function () {
          const p = await p5SwitchPromise;
          const r = Reflect.get(p, prop);
          return r.apply(p, arguments as any);
        };
      }
      return p5SwitchPromise.then((p) => {
        return Reflect.get(p, prop);
      });
    },
  }
);

function loadP5() {
  return dummyP5;
}

function setEventListeners(l: Listeners) {
  listeners = l;
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

function startP5() {
  p5Switch.click();
}

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { loadP5, setEventListeners, getCanvas, createAppEntry, startP5, sleep };
