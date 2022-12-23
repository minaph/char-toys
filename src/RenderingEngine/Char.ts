// import p5 from "p5";
// import { Vector2D } from "./CharPhysics"
import { CharPhysics } from "./CharPhysics";
import { CharPart, Stroke } from "./Stroke";

export class Char extends CharPart {
  constructor(
    public imgId: string,
    public scaleFactor: number,
    public width: number,
    public height: number, // TODO: なぜwidth, heightとscaleFactorが両方必要なのか？初期化時はどう設定すべきか？
    public physics: CharPhysics,
    public strokes: Stroke[]
  ) {
    super(imgId, scaleFactor, width, height, physics);
  }

  toString(): string {
    return `Char: ${this.imgId}_${this.scaleFactor}_${this.width}_${this.height}`;
  }
  // get glyph() {
  //   return this._glyph?.get();
  // }

  // next() {
  //   // [this.x, this.y] = world.getNextPosition(this.x, this.y, this.move);
  //   // this.rotation += this.move.rotation;
  //   this.physics.next();
  //   world.correctPosition(this.physics, this.size[0]);
  // }

  // isInView(x: number, y: number) {
  //   return (
  //     Math.abs(this.physics.data[0] - x) < this.size &&
  //     Math.abs(this.y - y) < this.size
  //   );
  // }

  // async scale(s: number) {
  //   this.size *= s;
  //   this._glyph = await createGraphics(this.size, this.size);
  //   this._glyph.scale(s);
  //   for (const stroke of this.strokes) {
  //     this._glyph.image(stroke.glyph!, 0, 0);
  //   }
  // }
}
