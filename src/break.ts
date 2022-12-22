import { loadP5, setEventListeners, startP5 } from "./utils";
import p5 from "p5";

export async function startApp() {
  const {
    createCanvas,
    createGraphics,
    background,
    push,
    pop,
    translate,
    rotate,
    image,
    windowHeight,
    windowWidth,
    loadImage,
  } = loadP5();

  const params = {
    worldWidth:  windowWidth,
    worldHeight: windowHeight,
  };

  async function setup() {
    createCanvas(await params.worldWidth, await params.worldHeight);
    background(255);
  }

  class World {
    constructor() {
      this.width = 0;
      this.height = 0;
      this.setup()
    }
    width: number;
    height: number;

    async setup() {
      this.width = await params.worldWidth;
      this.height = await params.worldHeight;
    }

    getNextPosition(x: number, y: number, move: Move) {
      const temp = [x + move.vector[0], y + move.vector[1]];
      if (temp[0] < 0) {
        temp[0] = this.width + temp[0];
      }
      if (temp[0] > this.width) {
        temp[0] = temp[0] - this.width;
      }
      if (temp[1] < 0) {
        temp[1] = this.height + temp[1];
      }
      if (temp[1] > this.height) {
        temp[1] = temp[1] - this.height;
      }
      return temp;
    }
  }

  const world = new World();

  class Char {
    protected _glyph: p5.Graphics | null = null;
    constructor(
      public x: number,
      public y: number,
      public size: number,
      public rotation: number,
      public move: Move,
      public strokes: Stroke[]
    ) {
      createGraphics(size, size).then((graphic) => {
        this._glyph = graphic;
        for (const stroke of strokes) {
          this._glyph.scale(size / stroke.size);
          this._glyph.image(stroke.glyph!, 0, 0);
        }
      });
    }

    get glyph() {
      return this._glyph?.get();
    }

    next() {
      [this.x, this.y] = world.getNextPosition(this.x, this.y, this.move);
      this.rotation += this.move.rotation;
    }

    isInView(x: number, y: number) {
      return (
        Math.abs(this.x - x) < this.size && Math.abs(this.y - y) < this.size
      );
    }

    async scale(s: number) {
      this.size *= s;
      this._glyph = await createGraphics(this.size, this.size);
      this._glyph.scale(s);
      for (const stroke of this.strokes) {
        this._glyph.image(stroke.glyph!, 0, 0);
      }
    }
  }

  class Stroke {
    private _glyph: p5.Graphics | null = null;
    // todo: あとでsizeをwidthとheightに分ける
    public size: number;
    constructor(public img: p5.Graphics | p5.Image) {
      this.size = Math.min(img.width, img.height);
      createGraphics(this.size, this.size).then((graphic) => {
        this._glyph = graphic;
        this._glyph.image(img, 0, 0);
      });
    }

    static load(href: string): Promise<Stroke> {
      return new Promise((resolve) => {
        loadImage(href, (img) => {
          resolve(new Stroke(img));
        });
      });
    }
    get glyph() {
      return this._glyph?.get();
    }
  }

  function drawChar(char: Char) {
    push();
    translate(char.x + char.size / 2, char.y + char.size / 2);
    rotate(char.rotation);
    image(char.glyph as p5.Image, -char.size / 2, -char.size / 2);
    pop();
  }

  type Vector = [number, number];

  class Move {
    static None = new Move([0, 0], 0);
    static random(speedScale: number, rotateScale: number): Move {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const rotation = Math.random() * 2 - 1;
      return new Move([x * speedScale, y * speedScale], rotation * rotateScale);
    }
    constructor(public vector: Vector, public rotation: number) {}
  }

  function getRandomPosition() {
    return [Math.random() * world.width, Math.random() * world.height];
  }

  function testChar() {
    let chars: Char[] = [];

    setEventListeners({
      setup: async () => {
        setup();

        const rotation = 0;
        const aStrokes: Stroke[] = [
          await Stroke.load("assets/hiragana/hiragana_a_2.png"),
          await Stroke.load("assets/hiragana/hiragana_a_3.png"),
          await Stroke.load("assets/hiragana/hiragana_a_4.png"),
        ];
        const oStrokes = [
          await Stroke.load("assets/hiragana/hiragana_o_2.png"),
          await Stroke.load("assets/hiragana/hiragana_o_3.png"),
          await Stroke.load("assets/hiragana/hiragana_o_4.png"),
        ];
        const size = aStrokes[0].size;
        const aCount = 20;
        const oCount = 20;

        for (let i = 0; i < aCount; i++) {
          const move = Move.random(0.2, 0.01);
          const aPos = getRandomPosition();
          const char = new Char(
            aPos[0],
            aPos[1],
            size,
            rotation,
            move,
            aStrokes
          );
          char.scale(Math.random() ** 2 + 0.01);
          chars.push(char);
        }
        for (let i = 0; i < oCount; i++) {
          const move = Move.random(0.2, 0.01);
          const oPos = getRandomPosition();
          const char = new Char(
            oPos[0],
            oPos[1],
            size,
            rotation,
            move,
            oStrokes
          );
          char.scale(Math.random() ** 2 + 0.01);
          chars.push(char);
        }
      },
      draw: () => {
        background(255);
        // console.log({ char });
        for (const char of chars) {
          drawChar(char);
          char.next();
        }
      },
      // @ts-ignore
      mouseClicked: (ev: MouseEvent) => {
        let charsBroken: [number, Char][] = [];
        for (const [i, char] of chars.entries()) {
          if (char.isInView(ev.offsetX, ev.offsetY)) {
            console.log("hit");
            charsBroken.push([i, char]);
            break;
          }
        }

        for (const [i, char] of charsBroken) {
          chars.splice(i, 1);
          const { x, y, size, rotation, move: _, strokes } = char;
          for (const stroke of strokes) {
            const rot = (Math.random() - 0.5) * 0.03;
            const mov = new Move(
              [Math.random() - 0.5, Math.random() - 0.5],
              rot
            );
            chars.push(new Char(x, y, size, rotation, mov, [stroke]));
          }
        }
      },
    });
  }
  testChar();
  startP5();

}
