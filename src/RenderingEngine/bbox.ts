class BBox {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public rotation: number
  ) {}

  isInside(x: number, y: number): boolean {
    const [dx, dy] = [x - this.x, y - this.y];
    const [rx, ry] = [
      dx * Math.cos(this.rotation) + dy * Math.sin(this.rotation),
      -dx * Math.sin(this.rotation) + dy * Math.cos(this.rotation),
    ];
    return Math.abs(rx) < this.width && Math.abs(ry) < this.height;
  }

  // isIntersecting(bbox: BBox): boolean {
  //   const [dx, dy] = [bbox.x - this.x, bbox.y - this.y];
  //   const [rx, ry] = [
  //     dx * Math.cos(this.rotation) + dy * Math.sin(this.rotation),
  //     -dx * Math.sin(this.rotation) + dy * Math.cos(this.rotation),
  //   ];
  //   const [w, h] = [this.width + bbox.width, this.height + bbox.height];
  //   return Math.abs(rx) <w && Math.abs(ry) < h;
  // }

  scale(factor: number) {
    this.width *= factor;
    this.height *= factor;
    this.x *= factor;
    this.y *= factor;
  }
}

class RescalableBBox extends BBox {
  static fromBBox(bbox: BBox) {
    return new RescalableBBox(
      bbox.x,
      bbox.y,
      bbox.width,
      bbox.height,
      bbox.rotation
    );
  }

  protected original: BBox;
  public scaleFactor = 1;
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number,
    public rotation: number
  ) {
    super(x, y, width, height, rotation);
    this.original = new BBox(x, y, width, height, rotation);
  }

  rescale(factor: number) {
    this.width = factor * this.original.width;
    this.height = factor * this.original.height;
    this.x = factor * this.original.x;
    this.y = factor * this.original.y;
    this.scaleFactor = factor;
  }
}

export { BBox, RescalableBBox };
