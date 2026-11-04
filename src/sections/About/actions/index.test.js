import { describe, expect, it } from "vitest";
import { currentPosition, shortCertName } from ".";

describe("currentPosition", () => {
  const umbrella = { title: "Umbrella Corporation", roles: ["Field Agent", "Head of Security"] };
  const terrasave = { title: "TerraSave", roles: ["Volunteer"] };

  it("names the latest title Claire holds at her newest job", () => {
    expect(currentPosition([umbrella, terrasave], "Agent")).toBe("Head of Security at Umbrella Corporation");
  });

  it("uses the fallback role while Malenia's jobs are still loading", () => {
    expect(currentPosition([], "Blade of Miquella")).toBe("Blade of Miquella");
  });

  it("borrows the fallback role when Inde's newest job lists no titles", () => {
    expect(currentPosition([{ title: "Graceful Love" }], "QA Lead")).toBe("QA Lead at Graceful Love");
  });

  it("names just the company when there is no role anywhere", () => {
    expect(currentPosition([{ title: "R.P.D." }])).toBe("R.P.D.");
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
