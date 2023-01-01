import p5 from "p5";
import { loadP5 } from "../utils";

import { Char } from "./Char";
import { CharPart, Stroke } from "./Stroke";
import { CharPartsMemory } from "./StrokesMemory";
import type { DrawInfomation, DynamicDrawInfo } from "./StrokesMemory";

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
  circle,
  rect,
  noFill,
  fill,
  text,
} = loadP5();

export class World {
  constructor(public width: number, public height: number) {}

  correctPosition(target: CharPart, tolerance: number) {
    let [[targetX, targetY], _] = target.data;
    targetX += target.width / 2 + tolerance;
    targetY += target.height / 2 + tolerance;

    targetX = targetX % (this.width + tolerance * 2);
    targetY = targetY % (this.height + tolerance * 2);

    if (targetX < 0) {
      targetX = this.width + targetX;
    }
    if (targetY < 0) {
      targetY = this.height + targetY;
    }
    targetX -= target.width / 2 + tolerance;
    targetY -= target.height / 2 + tolerance;
    target.data[0][0] = targetX;
    target.data[0][1] = targetY;
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

    // let [w, h] = [width / 2, height / 2];
    const [w, h] = [width / 2 / scaleFactor, height / 2 / scaleFactor];
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
    const { x, y, rotation } = char;
    return {
      ...drawInfo,
      image,
      x,
      y,
      rotation,
    };
  }

  getImage(imgId: string): p5.Image | undefined {
    return this.imageMap.get(imgId);
  }

  registerImage(imgId: string, img: p5.Image) {
    this.imageMap.set(imgId, img);
  }

  registerCharInfo(char: CharPart, scaleFactor: number) {
    this.memory.add(char, scaleFactor);
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

  // async cropStrokeLayerByABBox(stroke: Stroke) {
  //   const glyph = await createGraphics(stroke.width, stroke.height);
  //   const img = this.getImage(stroke.imgId);
  //   if (!img) {
  //     throw new Error(`Image not found: ${stroke.imgId}`);
  //     // return glyph;
  //   }
  //   const { x, y, width, height } = stroke.bbox;
  //   glyph.image(img, 0, 0, width, height, x, y, width, height);
  //   return glyph;
  // }
}

export { Renderer };
