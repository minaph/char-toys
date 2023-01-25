import p5 from "p5";
// import { loadP5 } from "../utils";

import { CharPhysics } from "./CharPhysics";
import { RescalableBBox, BBox } from "./bbox";

// const { loadImage, createGraphics } = loadP5();

export class CharPart extends CharPhysics {
  private _glyph: p5.Image | null = null;
  public scaleFactor = 1;
  protected originalWidth: number;
  protected originalHeight: number;
  private id: number;

  // 描画の際はscaleFactorを使うが、物理演算の際はwidth, heightを使う。
  // scaleFactorはCharPartではなく、CharPartの生成を担当するクラスが持つべき

  constructor(
    public imgId: string,
    protected _width: number,
    protected _height: number,
    private _physics: CharPhysics
  ) {
    super([[_physics.x, _physics.y], _physics.rotation]);
    this.originalWidth = _width;
    this.originalHeight = _height;
    this.id = Math.random();
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
    return `${this.constructor.name}: ${this.imgId}_${this.id}`;
  }

  scale(factor: number): void {
    this.scaleFactor = factor;
    this._width *= factor;
    this._height *= factor;
  }

  isInside(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class Stroke extends CharPart {
  private _bbox: RescalableBBox;
  constructor(public imgId: string, physics: CharPhysics, _bbox: BBox) {
    super(imgId, _bbox.width, _bbox.height, physics);
    this._bbox = RescalableBBox.fromBBox(_bbox);
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

  get bbox(): RescalableBBox {
    return this._bbox;
  }

  set bbox(bbox: BBox) {
    this._bbox = RescalableBBox.fromBBox(bbox);
  }

  // toString(): string {
  //   return `Stroke: ${this.imgId}`;
  // }

  scale(factor: number): void {
    super.scale(factor);
    this._bbox.scale(factor);
  }

  isInside(x: number, y: number): boolean {
    return this.bbox.isInside(x, y);
  }
}
