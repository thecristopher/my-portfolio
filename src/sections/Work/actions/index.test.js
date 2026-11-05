import { describe, expect, it } from "vitest";
import { careerSteps, clusterDots, filterSummary, metricRing, scatterDots, stackedScale } from ".";

describe("careerSteps", () => {
  const projects = [
    { title: "TerraSave", roles: ["Field Agent", "Rescue Lead"] },
    { title: "Raccoon City Police", roles: ["Rookie"] },
    { title: "Kendo Gun Shop", roles: [] },
  ];
  const steps = careerSteps(projects);

  it("starts Claire's timeline at her very first job", () => {
    expect(steps[0]).toMatchObject({ label: "First job", title: "Kendo Gun Shop", isCurrent: false });
  });

  it("points at the chapter instead of naming the gun shop twice when it lists no titles", () => {
    expect(steps[0].subtitle).toBe("Read the chapter");
  });

  it("names the company under the title Claire held there", () => {
    expect(steps[1]).toMatchObject({ label: "Joined", title: "Rookie", subtitle: "Raccoon City Police" });
  });

  it("marks the first title at a new company as joined, without repeating the company", () => {
    expect(steps[2]).toMatchObject({ label: "Joined", title: "Field Agent", subtitle: "TerraSave" });
  });

  it("ends on the promotion Claire holds right now", () => {
    expect(steps.at(-1)).toMatchObject({ label: "Promoted", title: "Rescue Lead", isCurrent: true, targetId: "work-terrasave" });
  });

  it("gives Malenia an empty timeline before the jobs arrive", () => {
    expect(careerSteps([])).toEqual([]);
  });
});

describe("filterSummary", () => {
  it("counts the jobs where Inde shipped with React", () => {
    expect(filterSummary("React", 3, 5)).toBe("3 of 5 jobs shipped with React");
  });

  it("speaks in singular when there is only one job", () => {
    expect(filterSummary("Lua", 1, 1)).toBe("1 of 1 job shipped with Lua");
  });
});

describe("stackedScale", () => {
  it("leaves the last card Claire reads at full size", () => {
    expect(stackedScale(2, 3)).toBe(1);
  });

  it("shrinks the first card the most, since every other card ends up on top of it", () => {
    expect(stackedScale(0, 3)).toBeCloseTo(0.9);
    expect(stackedScale(0, 3)).toBeLessThan(stackedScale(1, 3));
  });
});

describe("metricRing", () => {
  it("given Claire's 40% faster rescues, expect the ring filled to 40%", () => {
    expect(metricRing("40%")).toEqual({ fill: 0.4, segments: 1 });
  });

  it("given a percentage over 100, expect the ring full and never past it", () => {
    expect(metricRing("150%").fill).toBe(1);
  });

  it("given Inde's love notes written 3× faster, expect one full lap in three equal parts", () => {
    expect(metricRing("3×")).toEqual({ fill: 1, segments: 3 });
  });

  it("given a plain x for the multiplier, expect it read the same as ×", () => {
    expect(metricRing("2x")).toEqual({ fill: 1, segments: 2 });
  });

  it("given a plain count like Malenia's 12 duels, expect a single full lap", () => {
    expect(metricRing("12")).toEqual({ fill: 1, segments: 1 });
  });
});

describe("clusterDots", () => {
  it("given a team of seven, expect seven people all inside the circle", () => {
    const dots = clusterDots(7);
    expect(dots).toHaveLength(7);
    expect(dots.every(({ x, y }) => Math.hypot(x, y) <= 1.0001)).toBe(true);
  });

  it("given Inde working alone, expect her right in the middle", () => {
    expect(clusterDots(1)).toEqual([{ x: 0, y: 0 }]);
  });
});

describe("scatterDots", () => {
  it("given Claire and Malenia far apart before the date, expect them at both ends of the line", () => {
    const [claire, malenia] = scatterDots(2);
    expect(claire.x).toBe(-3);
    expect(malenia.x).toBe(3);
  });

  it("given the same team twice, expect the same starting spots every visit", () => {
    expect(scatterDots(5)).toEqual(scatterDots(5));
  });
});
