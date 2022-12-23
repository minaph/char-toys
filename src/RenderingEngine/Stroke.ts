import p5 from "p5";
// import { loadP5 } from "../utils";

import { CharPhysics } from "./CharPhysics";
import { BBox } from "./bbox";

// const { loadImage, createGraphics } = loadP5();

export class CharPart extends CharPhysics {
  private _glyph: p5.Image | null = null;

  // constructor(public img: p5.Graphics | p5.Image) {
  constructor(
    public imgId: string,
    public scaleFactor: number,
    public width: number,
    public height: number,
    public physics: CharPhysics
  ) {
    super([[physics.x, physics.y], physics.rotation]);
  }

  // static load(href: string): Promise<Stroke> {
  //   return new Promise((resolve) => {
  //     loadImage(href, (img) => {
  //       resolve(new Stroke(img));
  //     });
  //   });
  // }
  get glyph() {
    return this._glyph!;
  }

  set glyph(glyph: p5.Image) {
    this._glyph = glyph;
  }

  toString(): string {
    return `Stroke: ${this.imgId}_${this.scaleFactor}_${this.width}_${this.height}`;
  }
}

export class Stroke extends CharPart {
  constructor(
    public imgId: string,
    public scaleFactor: number,
    // public width: number,
    // public height: number,
    public physics: CharPhysics,
    public bbox: BBox
  ) {
    super(imgId, scaleFactor, bbox.width, bbox.height, physics);
  }
}
