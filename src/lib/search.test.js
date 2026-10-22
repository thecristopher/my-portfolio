import { describe, expect, it } from "vitest";
import { matchOffsets, searchCount, stepIndex } from "./search";

describe("matchOffsets", () => {
  it("finds every Claire in Inde's love note, ignoring case", () => {
    expect(matchOffsets("Claire, Malenia and claire again", "claire")).toEqual([0, 20]);
  });

  it("counts each la in the shared playlist once, without overlaps", () => {
    expect(matchOffsets("lalalala", "lala")).toEqual([0, 4]);
  });

  it("finds nothing until Malenia types a query", () => {
    expect(matchOffsets("anything", "")).toEqual([]);
  });
});

describe("stepIndex", () => {
  it("steps forward to the next match", () => {
    expect(stepIndex(0, 3, 1)).toBe(1);
  });

  it("wraps from the last match back to the first", () => {
    expect(stepIndex(2, 3, 1)).toBe(0);
  });

  it("wraps from the first match back to the last", () => {
    expect(stepIndex(0, 3, -1)).toBe(2);
  });

  it("stays put with -1 when there are no matches yet", () => {
    expect(stepIndex(0, 0, 1)).toBe(-1);
  });
});

describe("searchCount", () => {
  it("shows the second of seven matches the way vim does", () => {
    expect(searchCount({ index: 1, total: 7 })).toBe("[2/7]");
  });
});
