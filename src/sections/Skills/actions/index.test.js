import { describe, expect, it } from "vitest";
import { groupByCategory, levelDots, orbitLayout } from ".";

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

describe("orbitLayout", () => {
  const tools = [
    { name: "TypeScript", level: 5 },
    { name: "React", level: 5 },
    { name: "Docker", level: 4 },
    { name: "Azure", level: 3 },
    { name: "Lua", level: 2 },
  ];
  const rings = orbitLayout(tools);

  it("keeps Claire's deepest tools on the inner ring", () => {
    expect(rings[0].tools.map((tool) => tool.name)).toEqual(["TypeScript", "React"]);
  });

  it("sends everything below level four to the outer ring", () => {
    expect(rings[2].tools.map((tool) => tool.name)).toEqual(["Azure", "Lua"]);
  });

  it("spreads each ring evenly around the circle", () => {
    expect(rings[0].tools.map((tool) => tool.angle)).toEqual([0, 180]);
  });

  it("leaves out a ring Inde has no tools for", () => {
    expect(orbitLayout([{ name: "Lua", level: 5 }]).map((ring) => ring.ring)).toEqual([0]);
  });
});
