import { describe, expect, it } from "vitest";
import { THEME_COLORS, THEMES, otherTheme, resolveTheme } from "./theme";

describe("resolveTheme", () => {
  it("keeps the light theme Malenia picked even when her system runs dark", () => {
    expect(resolveTheme({ saved: "light", prefersDark: true })).toBe("light");
  });

  it("lets Claire's dark system decide when she never touched the toggle", () => {
    expect(resolveTheme({ saved: null, prefersDark: true })).toBe("dark");
  });

  it("opens in light for Inde when nothing is saved and the system is light", () => {
    expect(resolveTheme({ saved: null, prefersDark: false })).toBe("light");
  });

  it("ignores a leftover Elden Ring region saved from the old site", () => {
    expect(resolveTheme({ saved: "haligtree", prefersDark: false })).toBe("light");
  });

  it("starts in light when the browser tells it nothing", () => {
    expect(resolveTheme()).toBe("light");
  });
});

describe("otherTheme", () => {
  it("flips Leon's dark page to light", () => {
    expect(otherTheme("dark")).toBe("light");
  });

  it("flips Jill's light page to dark", () => {
    expect(otherTheme("light")).toBe("dark");
  });
});

describe("THEME_COLORS", () => {
  it("gives the browser bar a color for every theme", () => {
    THEMES.forEach((theme) => expect(THEME_COLORS[theme]).toMatch(/^#[0-9a-f]{6}$/i));
  });
});
