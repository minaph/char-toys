import { select } from "d3";

export function startApp() {
  function getUnicodeRanges() {
    const pattern = /U\+([0-9A-Z]+)(?:-([0-9A-Z]+))?/g;
    const targetRules = document.styleSheets[2].cssRules;

    const rangeMap = new Map<string, Set<number>>();
    for (const rule of [...targetRules]) {
      if (!(rule instanceof CSSFontFaceRule)) {
        continue;
      }
      const unicodeRangeText = (
        rule.style as CSSStyleDeclaration & { unicodeRange: string }
      ).unicodeRange;
      for (const match of unicodeRangeText.matchAll(pattern)) {
        const [_, start, end] = match;
        const startN = parseInt(start, 16);
        const endN = end ? parseInt(end, 16) : startN;
        const range = rangeMap.get(rule.style.fontFamily) || new Set();
        for (const i of Array(endN - startN + 1).keys()) {
          range.add(startN + i);
        }
        rangeMap.set(rule.style.fontFamily, range);
      }
    }
    return rangeMap;
  }

  type OneGlyph = { fontFamily: string; codePoint: number };

  const rangeMap = getUnicodeRanges();

  function randomSelectGlyph(): OneGlyph {
    const fontFamily = Array.from(rangeMap.keys())[
      Math.floor(Math.random() * rangeMap.size)
    ];
    const codePoint = Array.from<number>(rangeMap.get(fontFamily) || new Set())[
      Math.floor(Math.random() * rangeMap.get(fontFamily)!.size)
    ];
    return { fontFamily, codePoint };
  }

  console.log(getUnicodeRanges());

  const params = {
    width: window.innerWidth,
    height: window.innerHeight,
    fontSize: 20,
    latticeSize: 100,
  };

  const app = select("#app");
  const svg = app
    .append("svg")
    .attr("width", params.width)
    .attr("height", params.height);
  const textEl = svg.append("text");
  // .attr("font-size", params.fontSize);

  type Point = [number, number];

  // Lattice points generator

  function* latticePoints(): Generator<Point> {
    let y = 0;
    while (true) {
      y += params.latticeSize;
      for (let x = 0; x < params.width; x += params.latticeSize) {
        yield [x, y];
      }
    }
  }

  const lattice = latticePoints();

  // ([{fontFamily, codePoint}, [x, y]])

  textEl
    .selectAll()
    .data<[OneGlyph, Point]>(
      Array(6000)
        .fill(null)
        .map(() => [randomSelectGlyph(), lattice.next().value])
    )
    .join("tspan")
    .attr("font-family", ([{ fontFamily }]) => fontFamily)
    .attr("font-size", () => (1 / Math.random() - 1 + 1).toString() + "px")
    .text(([{ codePoint }, _]) => String.fromCodePoint(codePoint))
    .attr("x", ([_, [_x, __]]) => Math.random() * params.width)
    // .attr("x", ([_, [x, __]]) => x)
    // .attr("y", ([_, [__, y]]) => y);
    .attr("y", ([_, [__, _y]]) => Math.random() * params.height);
}
