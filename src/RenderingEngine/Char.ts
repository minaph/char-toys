// import p5 from "p5";
// import { Vector2D } from "./CharPhysics"
import { CharPhysics } from "./CharPhysics";
import { CharPart, Stroke } from "./Stroke";

export class Char extends CharPart {
  constructor(
    public imgId: string,
    // public scaleFactor: number,
    protected _width: number,
    protected _height: number,
    _physics: CharPhysics,
    public strokes: Stroke[]
  ) {
    super(imgId, _width, _height, _physics);
  }

  toString(): string {
    return `Char: ${this.imgId}_${this.width}_${this.height}`;
  }
}
