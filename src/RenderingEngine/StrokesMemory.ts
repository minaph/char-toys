// Remember CharParts information to draw

import p5 from "p5";
import { CharPart } from "./Stroke";

interface StaticDrawInfo {
  width: number;
  height: number;
  scaleFactor: number;
}

interface DynamicDrawInfo {
  x: number;
  y: number;
  rotation: number;
}

interface DrawInfomation extends StaticDrawInfo, DynamicDrawInfo {
  image: p5.Image | p5.Graphics;
}

interface MemorableDrawInfo extends StaticDrawInfo {
  imgId: string;
}

class CharPartsMemory extends Map<string, MemorableDrawInfo> {
  constructor() {
    super();
  }
  // add(partId: string, imgId: string, scaleFactor: number) {
  add(part: CharPart, scaleFactor: number) {
    // destructuring assignment
    const { imgId, width, height } = part;

    this.set(part.toString(), {
      imgId,
      width,
      height,
      scaleFactor,
    });
  }
}

// type export

export type { DrawInfomation, MemorableDrawInfo };

export { CharPartsMemory, type DynamicDrawInfo };
