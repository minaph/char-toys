import { World, Renderer } from "./World";
import { CharPart, Stroke } from "./Stroke";
import { Char } from "./Char";

// import p5 from "p5";
import { loadP5 } from "../utils";
import { CharPhysics } from "./CharPhysics";
import { BBox } from "./bbox";
import p5 from "p5";

const { loadImage, background } = loadP5();

type StrokeInit = {
  scaleFactor: number | "random";
  physics: CharPhysics | "random";
  randomScales?: {
    x?: number;
    y?: number;
    rotation?: number;
    scale?: number;
  };
};
interface EngineConfig {
  worldWidth: number;
  worldHeight: number;
  strokeInit: StrokeInit;
}

class Engine {
  world: World;
  renderer: Renderer;
  images: CharPart[];
  strokeInit: StrokeInit;

  constructor(config: EngineConfig) {
    console.log("Engine created");
    this.world = new World(config.worldWidth, config.worldHeight);
    this.renderer = new Renderer(this.world);
    this.images = [];
    this.strokeInit = config.strokeInit;
  }

  protected stroke(...args: ConstructorParameters<typeof Stroke>) {
    return new Stroke(...args);
  }

  protected char(...args: ConstructorParameters<typeof Char>) {
    return new Char(...args);
  }

  protected randomPhysics() {
    const { randomScales } = this.strokeInit;
    const x = randomScales?.x || 0;
    const y = randomScales?.y || 0;
    const rotation = randomScales?.rotation || 0;
    // const scale = randomScales?.scale || 0;
    return CharPhysics.random(x, y, rotation);
  }

  protected randomScale() {
    return Math.random() * 0.5 + 0.5;
  }

  get initPhysics() {
    let initPhysics = this.strokeInit.physics;
    if (initPhysics === "random") {
      initPhysics = this.randomPhysics();
    }
    return initPhysics;
  }

  get initScale() {
    let initScale = this.strokeInit.scaleFactor;
    if (initScale === "random") {
      initScale = this.randomScale();
    }
    return initScale;
  }

  private loadImagePromise(url: string) {
    return new Promise<p5.Image>((resolve, reject) =>
      loadImage(url, resolve, reject)
    );
  }

  async load(id: string, strokeUrl: string, bbox: BBox) {
    const img = await this.loadImagePromise(strokeUrl);
    this.renderer.registerImage(id, img);

    // TODO initScale基準でbboxの更新
    const stroke = this.stroke(id, this.initScale, this.initPhysics, bbox);
    return stroke;
  }

  async loadChar(
    charId: string,
    strokeUrls: string[],
    bboxList: BBox[],
    width: number,
    height: number
  ) {
    const promises: Promise<Stroke>[] = [];
    let loaded: string[] = []
    for (const [i, url] of strokeUrls.entries()) {
      // 謎スタックの回避ロジック
      // TODO 別メソッドに切り出す
      let promise = this.load(`${charId}_${i}`, url, bboxList[i]);
      promises.push(promise.then((stroke) => {
        loaded.push(url);
        if (loaded.length === strokeUrls.length - 2) {
          const reloadNeededUrl = strokeUrls.find((url) => !loaded.includes(url));
          if (reloadNeededUrl) {
            console.log("reload needed", reloadNeededUrl);
            this.loadImagePromise(reloadNeededUrl);
          }
        }
        return stroke
      }));
    }
    const strokes: Stroke[] = await Promise.all(promises);
    // TODO strokeのscaleFactor変更
    const char = this.char(
      charId,
      this.initScale,
      width,
      height,
      this.initPhysics,
      strokes
    );
    const glyph = await this.renderer.makeGlyph(char);
    this.renderer.registerImage(charId, glyph.get());
    return char;
  }

  add(image: CharPart) {
    this.images.push(image);
  }

  draw() {
    background(255);
    for (const image of this.images) {
      image.next();
      this.world.correctPosition(image, 10);
      this.renderer.render(image);
    }
  }
}

export { Engine };
