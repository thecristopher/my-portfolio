import { describe, expect, it } from "vitest";
import { matchOffsets, searchCount, stepIndex } from "./search";

describe("matchOffsets", () => {
  it("finds every match, ignoring case", () => {
    expect(matchOffsets("AWS, Lambda and aws again", "aws")).toEqual([0, 16]);
  });

  it("doesn't count overlapping matches twice", () => {
    expect(matchOffsets("aaaa", "aa")).toEqual([0, 2]);
  });

  it("finds nothing for an empty query", () => {
    expect(matchOffsets("anything", "")).toEqual([]);
  });
});

describe("stepIndex", () => {
  it("steps forward", () => {
    expect(stepIndex(0, 3, 1)).toBe(1);
  });

  it("wraps past the last match back to the first", () => {
    expect(stepIndex(2, 3, 1)).toBe(0);
  });

  it("wraps before the first match back to the last", () => {
    expect(stepIndex(0, 3, -1)).toBe(2);
  });

  it("has nowhere to go without matches", () => {
    expect(stepIndex(0, 0, 1)).toBe(-1);
  });
});

describe("searchCount", () => {
  it("reads like vim", () => {
    expect(searchCount({ index: 1, total: 7 })).toBe("[2/7]");
  });
});
