import { select } from "d3";

export function startApp() {
  import("./style-keyboard.css");

  const params = {
    width: 800,
    height: 300,
    fontSize: 40,
    lineSpace: 1.5,
  };

  const app = select("#app");
  const svg = app
    .append("svg")
    .attr("width", params.width)
    .attr("height", params.height);
  const textEl = svg.append("text");
  const textarea = app.append("textarea");

  // const fontList = ["serif", "sans-serif", "monospace", "cursive", "fantasy"];
  const fontList = [
    "IBM Plex Sans JP",
    "Kaisei HarunoUmi",
    "Kosugi Maru",
    "M PLUS 1 Code",
    "M PLUS Rounded 1c",
    "New Tegomin",
    "Noto Sans JP",
    "Noto Serif JP",
    "Sawarabi Mincho",
    "Shippori Mincho",
    "Yuji Boku",
    "Yuji Mai",
    "Zen Antique",
    "Zen Antique Soft",
    "Zen Maru Gothic",
  ];
  const textElInitBBox = textEl.node()!.getBBox();

  // 入力があるたびに、一文字ずつSVG textに包んでsvgに追加する
  let lineX = 0;
  let lineY = params.fontSize;
  let composing = false;
  textarea.on("input", onEdit);
  textarea.on("compositionend", onEdit);

  function updateTextArea() {
    const svgBBox = svg.node()!.getBoundingClientRect();
    textarea.style(
      "top",
      `${textElInitBBox.y + svgBBox.y + lineY - params.fontSize}px`
    );
    textarea.style("left", `${textElInitBBox.x + svgBBox.x + lineX}px`);
  }

  function update() {
    updateTextArea();
  }

  function onEdit(ev: InputEvent) {
    if ((composing = ev.isComposing)) {
      return;
    }
    const text = textarea.property("value");
    textarea.property("value", "");

    textEl
      .selectAll()
      .data<string>(text.split(""))
      .join("tspan")
      .each(function (d, i, nodes) {
        select(this)
          .data([d])
          .attr("y", () => {
            // word-wrap
            if (lineX + params.fontSize > params.width) {
              lineX = 0;
              lineY += params.fontSize * params.lineSpace;
            }
            return lineY;
          })
          .attr("x", lineX)
          .attr("font-family", () => {
            const randIndex = Math.floor(Math.random() * fontList.length);
            const randFont = fontList[randIndex];
            return randFont;
          })
          .text((d: string) => (d === " " ? "\u00A0" : d));

        lineX += nodes[i]!.getBBox().width;
      });

    update();
  }

  // deleteキーで一文字ずつ消す

  textarea.on("keydown", (e) => {
    if (e.key === "Backspace" && !composing) {
      const lastTspan = textEl.select<SVGTSpanElement>("tspan:last-child");
      const prevTspan = textEl.select<SVGTSpanElement>(
        "tspan:nth-last-child(2)"
      );
      // const lastTspanText = lastTspan.text();
      // lastTspan.text(lastTspanText.slice(0, -1));

      // word-wrap
      lineX -= lastTspan.node()!.getBBox().width;
      if (lineX < 0) {
        const bbox = prevTspan.node()!.getBBox();
        lineX = bbox.x + bbox.width;
        lineY -= params.fontSize * params.lineSpace;
      }

      // if (lastTspan.text() === "") {
      lastTspan.remove();
      // }
    }
    update();
  });

  update();
}
