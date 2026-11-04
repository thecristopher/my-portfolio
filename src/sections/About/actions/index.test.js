import { describe, expect, it } from "vitest";
import { arcPoint, currentCompany, shortCertName, skyPosition } from ".";

describe("currentCompany", () => {
  it("names the company Claire works at now, the newest one listed", () => {
    expect(currentCompany([{ title: "TerraSave" }, { title: "Raccoon City Police" }])).toBe("TerraSave");
  });

  it("names nothing while Malenia's jobs are still loading", () => {
    expect(currentCompany([])).toBeNull();
  });
});

describe("shortCertName", () => {
  it("drops the words every AWS certification repeats", () => {
    expect(shortCertName("AWS Certified Developer – Associate")).toBe("AWS Developer – Associate");
  });

  it("leaves a certification from anyone else alone", () => {
    expect(shortCertName("Raccoon City First Aid")).toBe("Raccoon City First Aid");
  });
});

describe("skyPosition", () => {
  it("puts the sun at its peak around half past noon, when Inde takes lunch", () => {
    expect(skyPosition(12, 30)).toEqual({ isDay: true, progress: 0.5 });
  });

  it("starts the sun's arc at sunrise", () => {
    expect(skyPosition(6)).toEqual({ isDay: true, progress: 0 });
  });

  it("hands the sky to the moon at sunset, when Claire heads home", () => {
    expect(skyPosition(19)).toEqual({ isDay: false, progress: 0 });
  });

  it("carries the moon past midnight for Malenia's late watch", () => {
    const { isDay, progress } = skyPosition(1);
    expect(isDay).toBe(false);
    expect(progress).toBeCloseTo(6 / 11);
  });
});

describe("arcPoint", () => {
  const box = { width: 200, height: 100 };

  it("rises from the left horizon", () => {
    expect(arcPoint(0, box)).toEqual({ x: 0, y: 100 });
  });

  it("peaks in the middle of the sky", () => {
    expect(arcPoint(0.5, box)).toEqual({ x: 100, y: 0 });
  });

  it("sets on the right horizon and never overshoots it", () => {
    expect(arcPoint(1.4, box)).toEqual({ x: 200, y: 100 });
  });
});
