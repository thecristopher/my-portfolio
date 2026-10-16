import { describe, expect, it } from "vitest";
import { faviconHref, faviconSvg } from "./browserChrome";

describe("faviconSvg", () => {
  it("draws the prompt in the colorscheme's colors", () => {
    const svg = faviconSvg({ ink: "#0e1219", accent: "#ff8f5e", fg: "#efe7d8" });
    expect(svg).toContain('fill="#0e1219"');
    expect(svg).toContain('stroke="#ff8f5e"');
    expect(svg).toContain('fill="#efe7d8"');
  });
});

describe("faviconHref", () => {
  it("is an encoded svg data url", () => {
    expect(faviconHref({ ink: "#000", accent: "#f00", fg: "#fff" })).toMatch(/^data:image\/svg\+xml,%3Csvg/);
  });
});
