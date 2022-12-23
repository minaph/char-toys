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
  //   return Math.abs(rx) < w && Math.abs(ry) < h;
  // }
}

export { BBox };
