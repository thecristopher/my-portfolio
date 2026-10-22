import { describe, expect, it } from "vitest";
import { DEFAULT_REGION, REGION_NAMES, nextRegion, resolveRegion, startingRegion } from "./regions";

describe("startingRegion", () => {
  it("welcomes Claire to leyndell on her first visit", () => {
    expect(startingRegion({})).toBe(DEFAULT_REGION);
  });

  it("brings Malenia home to the haligtree once she pins it", () => {
    expect(startingRegion({ pinned: "haligtree", last: "caelid" })).toBe("haligtree");
  });

  it("shows Inde somewhere new instead of the region they saw last time", () => {
    const rolls = [0, 0.2, 0.4, 0.6, 0.99].map((roll) => startingRegion({ last: "ordina", random: () => roll }));
    expect(rolls).not.toContain("ordina");
    rolls.forEach((region) => expect(REGION_NAMES).toContain(region));
  });

  it("guides a pin to an unknown region back to leyndell", () => {
    expect(startingRegion({ pinned: "raccoon-city" })).toBe(DEFAULT_REGION);
  });
});

describe("resolveRegion", () => {
  it("finds Rennala's academy by name", () => {
    expect(resolveRegion("raya-lucaria").character).toBe("Rennala");
  });

  it("lands an old colorscheme name safely in leyndell", () => {
    expect(resolveRegion("rosarito").name).toBe("leyndell");
  });
});

describe("nextRegion", () => {
  it("walks from leyndell to the haligtree, where Malenia is waiting", () => {
    expect(nextRegion("leyndell")).toBe("haligtree");
  });

  it("rides Torrent from the snowfield back to the capital", () => {
    expect(nextRegion("ordina")).toBe("leyndell");
  });
});
