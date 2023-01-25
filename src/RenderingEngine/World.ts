import p5 from "p5";
import { loadP5 } from "../utils";

import { Char } from "./Char";
import { CharPart } from "./Stroke";
import { CharPartsMemory } from "./StrokesMemory";
import type { DrawInfomation } from "./StrokesMemory";

const {
  push,
  pop,
  translate,
  rotate,
  image,
  scale,
  createCanvas,
  background,
  createGraphics,
  // WEBGL,
  // rect,
  // circle,
  // rect,
  // noFill,
  // fill,
  // text,
} = loadP5();

export class World {
  constructor(public width: number, public height: number) {}

  correctPosition(target: CharPart, tolerance: number) {
    let [[targetX, targetY], _] = target.data;

    targetX += target.width / 2;
    targetY += target.height / 2;

    targetX += this.width / 2 + tolerance;
    targetY += this.height / 2 + tolerance;

    targetX = targetX % (this.width + tolerance * 2);
    targetY = targetY % (this.height + tolerance * 2);

    targetX -= this.width / 2 + tolerance;
    targetY -= this.height / 2 + tolerance;

    if (targetX < 0) {
      targetX += this.width + tolerance * 2;
    }
    if (targetY < 0) {
      targetY += this.height + tolerance * 2;
    }

    targetX -= target.width / 2;
    targetY -= target.height / 2;
    target.data[0][0] = targetX;
    target.data[0][1] = targetY;

    // const tempW = this.width / 2 + tolerance;
    // const tempH = this.height / 2 + tolerance;

    // targetX -= tempW;
    // targetY -= tempH;

    // targetX = targetX % tempW;
    // targetY = targetY % tempH;

    // targetX += tempW;
    // targetY += tempH;

    // target.data[0][0] = targetX;
    // target.data[0][1] = targetY;
  }
}

class Renderer {
  imageMap = new Map<string, p5.Image>();
  memory = new CharPartsMemory();
  constructor(public world: World) {
    createCanvas(world.width, world.height);
    background(255);
  }

  async render(char: CharPart) {
    const drawInfo = this.asssembleDrawInfo(char);
    await this.renderByDrawInfo(drawInfo);
  }

  private async renderByDrawInfo({
    x,
    y,
    width,
    height,
    rotation,
    image: image_,
    scaleFactor,
  }: DrawInfomation) {
    // 副作用中心の処理なのにawaitをつけていなかったので痛い目を見た

    // const [w, h] = [width / 2 / scaleFactor, height / 2 / scaleFactor];
    const [w, h] = [width / 2, height / 2];
    await push();
    await translate(x / scaleFactor + w, y / scaleFactor + h);
    await rotate(rotation);
    await scale(scaleFactor);

    await image(image_, -w, -h, 2 * w, 2 * h);

    // await circle(0, 0, 5);
    await pop();
  }

  protected asssembleDrawInfo(char: CharPart): DrawInfomation {
    const drawInfo = this.memory.get(char.toString());
    if (!drawInfo) {
      throw new Error(`No draw info for ${char.toString()}`);
    }
    const image = this.getImage(char.imgId);
    if (!image) {
      throw new Error(`No image for ${char.imgId}`);
    }
    const { x, y, width, height, rotation, scaleFactor } = char;
    return {
      ...drawInfo,
      image,
      x,
      y,
      width,
      height,
      rotation,
      scaleFactor,
    };
  }

  getImage(imgId: string): p5.Image | undefined {
    return this.imageMap.get(imgId);
  }

  registerImage(imgId: string, img: p5.Image) {
    this.imageMap.set(imgId, img);
  }

  registerCharInfo(char: CharPart) {
    this.memory.add(char);
  }

  async makeGlyphForAChar(char: Char) {
    const glyph = await createGraphics(char.width, char.height);
    for (const stroke of char.strokes) {
      const strokeImage = this.getImage(stroke.imgId);
      glyph.image(
        strokeImage!,
        stroke.bbox.x,
        stroke.bbox.y,
        stroke.width,
        stroke.height
      );
    }
    return glyph;
  }
}

export { Renderer };
