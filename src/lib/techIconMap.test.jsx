import { describe, expect, it } from "vitest";
import { techIconMap } from "./techIconMap";

describe("techIconMap", () => {
  it("draws a logo for Claire's Kotlin TV launcher on the shelf", () => {
    expect(techIconMap.Kotlin).toBeTypeOf("function");
  });

  it("draws a logo for the HTML mockup that ships beside it", () => {
    expect(techIconMap.HTML).toBeTypeOf("function");
  });
});
