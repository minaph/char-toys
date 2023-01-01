export type Vector2D = [number, number];

abstract class Physics<T> {
  data: T;
  protected _diff?: Physics<T>;

  set diff(diff: Physics<T>) {
    this._diff = diff;
  }

  get diff(): Physics<T> {
    return this._diff!;
  }

  constructor(data: T) {
    this.data = data;
  }
  next() {
    if (this._diff) {
      this._diff.next();
      this.calc();
    }
  }
  protected abstract calc(): void;
}

export class CharPhysics extends Physics<[Vector2D, number]> {
  static None = new CharPhysics([[0, 0], 0]);
  static random(
    xScale: number,
    yScale: number,
    rotateScale: number
  ): CharPhysics {
    const x = (Math.random() * 2 - 1) * xScale;
    const y = (Math.random() * 2 - 1) * yScale;
    const rotation = (Math.random() * 2 - 1) * rotateScale;
    return new CharPhysics([[x, y], rotation]);
  }

  protected calc(): void {
    this.data[0][0] += this._diff!.data[0][0];
    this.data[0][1] += this._diff!.data[0][1];
    this.data[1] += this._diff!.data[1];
  }

  get x() {
    return this.data[0][0];
  }
  get y() {
    return this.data[0][1];
  }
  get rotation() {
    return this.data[1];
  }
}
