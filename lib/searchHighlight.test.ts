import { describe, expect, it } from "vitest";
import { splitByQuery } from "./searchHighlight";

describe("splitByQuery", () => {
  it("marks the matched part and keeps the original text", () => {
    expect(splitByQuery("Mleko Imlek 1l", "imle")).toEqual([
      { text: "Mleko ", match: false },
      { text: "Imle", match: true },
      { text: "k 1l", match: false },
    ]);
  });

  it("matches without accents, with đ typed as d", () => {
    expect(splitByQuery("Đurđevak šećer", "durdevak sece")).toEqual([
      { text: "Đurđevak", match: true },
      { text: " ", match: false },
      { text: "šeće", match: true },
      { text: "r", match: false },
    ]);
  });

  it("marks every query word, in any order", () => {
    const marked = splitByQuery("Jaffa keks kakao", "kakao jaffa").filter((part) => part.match).map((part) => part.text);
    expect(marked).toEqual(["Jaffa", "kakao"]);
  });

  it("leaves a blank query unmarked", () => {
    expect(splitByQuery("Mleko", "  ")).toEqual([{ text: "Mleko", match: false }]);
  });
});
