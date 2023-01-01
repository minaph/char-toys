import p5 from "p5";
// import { loadP5 } from "../utils";

import { CharPhysics } from "./CharPhysics";
import { BBox } from "./bbox";

// const { loadImage, createGraphics } = loadP5();

export class CharPart extends CharPhysics {
  private _glyph: p5.Image | null = null;

  // [x]: なぜwidth, heightとscaleFactorが両方必要なのか？初期化時はどう設定すべきか？
  // 描画の際はscaleFactorを使うが、物理演算の際はwidth, heightを使う。
  // scaleFactorはCharPartではなく、CharPartの生成を担当するクラスが持つべき

  constructor(
    public imgId: string,
    protected _width: number,
    protected _height: number,
    private _physics: CharPhysics
  ) {
    super([[_physics.x, _physics.y], _physics.rotation]);
  }

  get width() {
    return this._width;
  }

  set width(width: number) {
    this._width = width;
  }

  get height() {
    return this._height;
  }

  set height(height: number) {
    this._height = height;
  }

  get glyph() {
    return this._glyph!;
  }

  set glyph(glyph: p5.Image) {
    this._glyph = glyph;
  }

  get physics() {
    return this._physics;
  }

  set physics(physics: CharPhysics) {
    this._physics = physics;
    this.data = physics.data;
    if (physics.diff) {
      this._diff = physics.diff;
    }
  }

  toString(): string {
    return `Stroke: ${this.imgId}_${this.width}_${this.height}`;
  }
}

export class Stroke extends CharPart {
  constructor(public imgId: string, physics: CharPhysics, private _bbox: BBox) {
    super(imgId, _bbox.width, _bbox.height, physics);
  }

  get x(): number {
    return super.x + this.bbox.x;
  }

  get y(): number {
    return super.y + this.bbox.y;
  }

  get width(): number {
    return this._bbox.width;
  }

  get height(): number {
    return this._bbox.height;
  }

  get bbox(): BBox {
    return this._bbox;
  }

  set bbox(bbox: BBox) {
    this._bbox = bbox;
  }
}
