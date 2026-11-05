import { describe, expect, it } from "vitest";
import {
  METER_SIZE,
  arcPath,
  cometPass,
  cometWait,
  coreRadiusIn,
  diveCamera,
  groupByCategory,
  jobsLine,
  jobsWith,
  levelArcs,
  levelDots,
  levelLine,
  orbitLayout,
  pointerTilt,
  starField,
  trailGeometry,
  trailSweep,
} from ".";

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

describe("arcPath", () => {
  it("given half a circle from the top, expect Claire's arc to end straight below the center", () => {
    expect(arcPath(10, { x: 10, y: 10 }, 0, 180)).toBe("M10 0A10 10 0 0 1 10 20");
  });

  it("given more than half a circle, expect the long way round so Malenia's gauge is not cut short", () => {
    expect(arcPath(5, { x: 0, y: 0 }, 225, 270)).toContain("0 1 1");
  });
});

describe("levelArcs", () => {
  it("given level three, expect Inde's meter to light the three innermost arcs", () => {
    expect(levelArcs(3).map((arc) => arc.isLit)).toEqual([true, true, true, false, false]);
  });

  it("given any level, expect every arc to sit further out than the one before", () => {
    const radii = levelArcs(5).map((arc) => Number(arc.d.split("A")[1].split(" ")[0]));
    expect(radii).toEqual([...radii].sort((a, b) => a - b));
  });

  it("given the meter's square, expect the outer arc to fit inside it", () => {
    const outer = Number(levelArcs(5).at(-1).d.split("A")[1].split(" ")[0]);
    expect(outer).toBeLessThan(METER_SIZE / 2);
  });
});

describe("coreRadiusIn", () => {
  it("given the outer ring the size of the orbit, expect the core's radius as a share of it", () => {
    expect(coreRadiusIn("100%", 0.36)).toBe(18);
  });

  it("given a smaller ring, expect the core to take a bigger share of Malenia's ring", () => {
    expect(coreRadiusIn("50%", 0.36)).toBe(36);
  });
});

describe("jobsLine", () => {
  it("given React in three of Claire's five jobs, expect the count", () => {
    expect(jobsLine(3, 5)).toBe("Shipped at 3 of 5 jobs");
  });

  it("given a tool Inde only uses on side projects, expect it said plainly", () => {
    expect(jobsLine(0, 5)).toBe("Not shipped at a job yet");
  });

  it("given no jobs loaded yet, expect nothing said at all", () => {
    expect(jobsLine(0, 0)).toBe("");
  });

  it("given a single job, expect job in singular", () => {
    expect(jobsLine(1, 1)).toBe("Shipped at 1 of 1 job");
  });
});

describe("cometPass", () => {
  it("given a low roll, expect the comet to cross left to right and head down", () => {
    const pass = cometPass(0.2);
    expect(pass.from.x).toBeLessThan(pass.to.x);
    expect(pass.angle).toBeGreaterThan(0);
    expect(pass.angle).toBeLessThan(90);
  });

  it("given a high roll, expect Malenia's comet to cross right to left", () => {
    const pass = cometPass(0.8);
    expect(pass.from.x).toBeGreaterThan(pass.to.x);
  });

  it("given any roll, expect it to start and end outside the orbit so it never pops in", () => {
    for (const roll of [0, 0.3, 0.6, 0.99]) {
      const { from, to } = cometPass(roll);
      expect(Math.min(from.x, to.x)).toBeLessThan(0);
      expect(Math.max(from.x, to.x)).toBeGreaterThan(100);
    }
  });
});

describe("cometWait", () => {
  it("given the lowest and highest rolls, expect waits between the limits for Inde's wish", () => {
    expect(cometWait(0)).toBe(9000);
    expect(cometWait(1)).toBe(20000);
  });
});

describe("pointerTilt", () => {
  const rect = { left: 0, top: 0, width: 200, height: 200 };

  it("given the cursor dead center, expect the orbit to sit flat for Claire's first look", () => {
    expect(pointerTilt(100, 100, rect, 12)).toEqual({ rotateX: -0, rotateY: 0 });
  });

  it("given the cursor at the top right corner, expect that corner to tip toward Malenia", () => {
    expect(pointerTilt(200, 0, rect, 12)).toEqual({ rotateX: 12, rotateY: 12 });
  });

  it("given the cursor far outside the box, expect the lean capped so Inde never sees it flip", () => {
    expect(pointerTilt(900, 100, rect, 12).rotateY).toBe(12);
  });
});

describe("starField", () => {
  it("given the same seed twice, expect the same sky, like the night Claire and Inde named their star", () => {
    expect(starField(5, 7)).toEqual(starField(5, 7));
  });

  it("given a different seed, expect a different sky for Malenia", () => {
    expect(starField(5, 7)).not.toEqual(starField(5, 8));
  });

  it("given a count, expect every star placed inside the box", () => {
    const stars = starField(40, 3);
    expect(stars).toHaveLength(40);
    expect(stars.every((star) => star.x >= 0 && star.x <= 100 && star.y >= 0 && star.y <= 100)).toBe(true);
  });
});

describe("trailSweep", () => {
  it("given a gentle clockwise turn, expect a short trail signed with it", () => {
    expect(trailSweep(10)).toBe(3.5);
  });

  it("given Malenia scrolling back up fast, expect the longest trail, turned the other way", () => {
    expect(trailSweep(-500)).toBe(-16);
  });
});

describe("trailGeometry", () => {
  it("given a ring at rest, expect no trail at all", () => {
    expect(trailGeometry(90, 0.4)).toBeNull();
  });

  it("given a clockwise turn, expect the tail counterclockwise of the satellite, behind it", () => {
    const trail = trailGeometry(90, 30);
    expect(trail.head).toEqual({ x: 100, y: 50 });
    expect(trail.tail.y).toBeLessThan(50);
    expect(trail.d).toBe(arcPath(50, { x: 50, y: 50 }, 60, 30));
  });

  it("given a counterclockwise turn, expect the tail clockwise of the satellite", () => {
    expect(trailGeometry(90, -30).tail.y).toBeGreaterThan(50);
  });
});

describe("jobsWith", () => {
  const projects = [
    { title: "S.T.A.R.S.", technologies: ["React"] },
    { title: "TerraSave", technologies: ["React", "Go"] },
    { title: "Haligtree", technologies: ["Go"] },
  ];
  const usesTool = (project, tool) => project.technologies.includes(tool);

  it("given React, expect the companies where Claire shipped it, in order", () => {
    expect(jobsWith(projects, usesTool, "React")).toEqual(["S.T.A.R.S.", "TerraSave"]);
  });

  it("given a tool nobody shipped, expect an empty list for Inde's wishlist", () => {
    expect(jobsWith(projects, usesTool, "Blood Magic")).toEqual([]);
  });
});

describe("diveCamera", () => {
  it("given a satellite up and to the right, expect the camera to fly so it lands in the middle", () => {
    expect(diveCamera({ x: 100, y: -50 }, 3)).toEqual({ x: -300, y: 150, scale: 3 });
  });
});

describe("levelLine", () => {
  it("given a main stack tool, expect Claire told it's part of the main stack", () => {
    expect(levelLine(5, true)).toBe("Level 5 of 5, main stack");
  });

  it("given a side tool, expect only the level for Malenia", () => {
    expect(levelLine(3, false)).toBe("Level 3 of 5");
  });
});
