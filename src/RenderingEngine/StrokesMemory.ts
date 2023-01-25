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

interface DrawInfomation extends DynamicDrawInfo {
  image: p5.Image | p5.Graphics;
  width: number;
  height: number;
  scaleFactor: number;
}

interface MemorableDrawInfo {
  imgId: string;
}

class CharPartsMemory extends Map<string, MemorableDrawInfo> {
  constructor() {
    super();
  }
  // add(partId: string, imgId: string, scaleFactor: number) {
  add(part: CharPart) {
    // destructuring assignment
    const { imgId } = part;

    this.set(part.toString(), {
      imgId,
    });
  }
}

// type export

export type { DrawInfomation, MemorableDrawInfo };

export { CharPartsMemory, type DynamicDrawInfo };
