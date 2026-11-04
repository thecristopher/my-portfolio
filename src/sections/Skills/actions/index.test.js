import { describe, expect, it } from "vitest";
import { groupByCategory, levelDots, splitMarqueeRows } from ".";

describe("groupByCategory", () => {
  const tools = [
    { name: "React", category: "Frontend" },
    { name: "TypeScript", category: "Languages" },
    { name: "Blood Magic" },
  ];

  it("puts Claire's languages before her frontend tools, the way the résumé reads", () => {
    expect(groupByCategory(tools).map((group) => group.category)).toEqual(["Languages", "Frontend", "Other"]);
  });

  it("files a tool without a category under Other instead of losing it", () => {
    expect(groupByCategory(tools).at(-1).tools).toEqual([{ name: "Blood Magic" }]);
  });

  it("leaves out the categories Malenia has no tools in", () => {
    expect(groupByCategory([{ name: "Lua", category: "Languages" }])).toHaveLength(1);
  });
});

describe("levelDots", () => {
  it("lights four of five dots for Inde's level four", () => {
    expect(levelDots(4)).toEqual([true, true, true, true, false]);
  });

  it("keeps every dot dark at level zero", () => {
    expect(levelDots(0).every((isLit) => !isLit)).toBe(true);
  });
});

describe("splitMarqueeRows", () => {
  it("alternates Leon's tools between the two rows", () => {
    expect(splitMarqueeRows(["React", "Node.js", "AWS", "Lua"])).toEqual([
      ["React", "AWS"],
      ["Node.js", "Lua"],
    ]);
  });
});
