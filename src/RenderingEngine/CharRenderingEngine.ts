import { World, Renderer } from "./World";
import { CharPart, Stroke } from "./Stroke";
import { Char } from "./Char";

// import p5 from "p5";
import { loadP5 } from "../utils";
import { CharPhysics } from "./CharPhysics";
import { BBox } from "./bbox";
import p5 from "p5";

const { loadImage, background } = loadP5();

type RandomScalesOfPhysicalState = {
  x?: number;
  y?: number;
  rotation?: number;
  diff?: RandomScalesOfPhysicalState;
};

type RandomScaleOfSize = {
  scale?: number;
};

type RandomScale = RandomScalesOfPhysicalState & RandomScaleOfSize;

class Engine {
  world: World;
  renderer: Renderer;
  images: CharPart[];
  // strokeInit: StrokeInit;

  constructor(
    worldWidth: number,
    worldHeight: number,
    public worldTolerance: number
  ) {
    console.log("Engine created");
    this.world = new World(worldWidth, worldHeight);
    this.renderer = new Renderer(this.world);
    this.images = [];
  }

  protected stroke(...args: ConstructorParameters<typeof Stroke>) {
    return new Stroke(...args);
  }

  protected char(...args: ConstructorParameters<typeof Char>) {
    return new Char(...args);
  }

  protected randomPhysics(scales: RandomScalesOfPhysicalState) {
    const x = scales.x || 0;
    const y = scales.y || 0;
    const rotation = scales.rotation || 0;
    const physicalState = CharPhysics.random(x, y, rotation);
    if (scales.diff) {
      const diff = this.randomPhysics(scales.diff);
      physicalState.diff = diff;
    }
    return physicalState;
  }

  protected randomSizeScale(scale_: RandomScaleOfSize | number) {
    let scale = scale_;
    if (scale instanceof Object) {
      scale = scale.scale || 1;
    }
    return Math.random() * scale;
  }

  setRandomCharState(char: Char, scales: RandomScale): Char {
    const physics = this.randomPhysics(scales);
    physics.data[0][0] += char.physics.data[0][0];
    physics.data[0][1] += char.physics.data[0][1];
    physics.data[1] += char.physics.data[1];

    const scale = this.randomSizeScale(scales);
    const newChar = this.char(
      char.imgId,
      scale * char.width,
      scale * char.height,
      physics,
      char.strokes
    );

    if (scales.diff) {
      newChar.diff = physics.diff;
    }

    // strokes update
    for (const stroke of newChar.strokes) {
      stroke.bbox.scale(scale);
      this.renderer.registerCharInfo(stroke, scale);
    }
    this.renderer.registerCharInfo(newChar, scale);
    return newChar;
  }

  setRandomStrokeState(stroke: Stroke, scales: RandomScale): Stroke {
    const physics = this.randomPhysics(scales);
    physics.data[0][0] += stroke.physics.data[0][0];
    physics.data[0][1] += stroke.physics.data[0][1];
    physics.data[1] += stroke.physics.data[1];

    const scale = this.randomSizeScale(scales);

    const newStroke = this.stroke(stroke.imgId, physics, stroke.bbox);
    if (scales.diff) {
      newStroke.diff = physics.diff;
    }

    this.renderer.registerCharInfo(stroke, scale);
    return newStroke;
  }

  private loadImagePromise(url: string) {
    return new Promise<p5.Image>((resolve, reject) =>
      loadImage(url, resolve, reject)
    );
  }

  protected async makeAStrokeFromUrl(
    id: string,
    strokeUrl: string,
    bbox: BBox
  ) {
    // cacheをコールし、なければリクエスト、
    let img = this.renderer.getImage(id);
    if (!img) {
      img = await this.loadImagePromise(strokeUrl);
      const isSameWidth = img.width === bbox.width;
      const isSameHeight = img.height === bbox.height;
      const hasEnoughWidth = img.width >= bbox.x + bbox.width;
      const hasEnoughHeight = img.height >= bbox.y + bbox.height;
      // cropの必要性を判定
      if (
        !hasEnoughWidth ||
        !hasEnoughHeight
      ) {
        console.error({
          bbox,
          strokeUrl,
          img,
          isSameWidth,
          isSameHeight,
          hasEnoughWidth,
          hasEnoughHeight,
        });
        throw new Error(`invalid bbox`);
      } else if (!isSameWidth || !isSameHeight) {
        console.log(
          "crop image",
          id,
          img.width,
          img.height,
          bbox.width,
          bbox.height
        );
        img = img.get(bbox.x, bbox.y, bbox.width, bbox.height);
      }
      this.renderer.registerImage(id, img);
    }

    const stroke = this.stroke(id, CharPhysics.None, bbox);
    this.renderer.registerCharInfo(stroke, 1);
    return stroke;
  }

  async loadCharFromUrls(
    charId: string,
    strokeUrls: string[],
    bboxList: BBox[],
    width: number,
    height: number
  ) {
    const promiseList: Promise<Stroke>[] = [];
    let loaded: string[] = [];

    // Engineとロード関数はそうとうに密結合なので、分離するのが大変
    const makeLoadCallback = (url: string) => {
      return (stroke: Stroke) => {
        loaded.push(url as string);

        if (loaded.length < strokeUrls.length - 2) {
          return stroke;
        }
        const reloadNeededCharUrl = strokeUrls.find(
          (url) => !loaded.includes(url)
        );
        if (reloadNeededCharUrl) {
          console.log("reload needed", reloadNeededCharUrl);
          this.loadImagePromise(reloadNeededCharUrl);
        }
        return stroke;
      };
    };

    for (const [i, url] of strokeUrls.entries()) {
      let promise = this.makeAStrokeFromUrl(`${charId}_${i}`, url, bboxList[i]);
      promiseList.push(promise);
      // 謎スタックの回避ロジック
      // 謎スタック: 最後のリクエストは解決されない。
      // Async / awaitにしたことで思わぬ副作用が発生しているのかも。
      promise.then(makeLoadCallback(url));
    }
    const strokes: Stroke[] = await Promise.all(promiseList);

    const char = this.char(charId, width, height, CharPhysics.None, strokes);
    const glyph = await this.renderer.makeGlyphForAChar(char);
    this.renderer.registerImage(charId, glyph.get());
    this.renderer.registerCharInfo(char, 1);
    return char;
  }

  add(image: CharPart) {
    this.images.push(image);
  }

  async draw() {
    background(255);
    console.time("draw");
    for (const image of this.images) {
      image.next();
      this.world.correctPosition(image, this.worldTolerance);
      await this.renderer.render(image);
    }
    console.timeEnd("draw");
  }
}

export { Engine };
