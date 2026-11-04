import { describe, expect, it } from "vitest";
import { careerSteps, filterSummary, stackedScale } from ".";

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
