import { loadP5 } from "../utils";
import { Char } from "./Char";

// import { CharPhysics } from "./CharPhysics";
import { CharPart } from "./Stroke";
import p5 from "p5";

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
  constructor(public world: World) {
    // WEBGL.then((gl) => {
    createCanvas(world.width, world.height);
    background(255);
    // });
  }
  // render() {}
  render(char: CharPart) {
    push();
    translate(char.x + char.width / 2, char.y + char.height / 2);
    rotate(char.rotation);
    scale(char.scaleFactor);
    image(this.getImage(char.imgId), -char.width / 2, -char.height / 2);
    pop();
  }

  protected getImage(imgId: string): p5.Image {
    return this.imageMap.get(imgId)!;
  }

  registerImage(imgId: string, img: p5.Image) {
    this.imageMap.set(imgId, img);
  }

  async makeGlyph(char: Char) {
    // console.log({ char });
    const glyph = await createGraphics(char.width, char.height);
    // glyph.background(255);
    for (const stroke of char.strokes) {
      const strokeImage = this.getImage(stroke.imgId);
      glyph.image(strokeImage, stroke.bbox.x, stroke.bbox.y);
    }
    return glyph;
  }
}

export { Renderer };
