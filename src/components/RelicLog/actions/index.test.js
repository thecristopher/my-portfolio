import { describe, expect, it } from "vitest";
import { relicLogOrder, sectionTitleFor } from ".";

describe("relicLogOrder", () => {
  it("lists the willow Inde found before the relics Claire is still hunting", () => {
    expect(relicLogOrder(["scott", "pokeball", "willow"], ["willow"])).toEqual(["willow", "scott", "pokeball"]);
  });

  it("keeps page order inside each group", () => {
    expect(relicLogOrder(["scott", "pokeball", "grace", "willow"], ["willow", "scott"])).toEqual(["scott", "willow", "pokeball", "grace"]);
  });
});

describe("sectionTitleFor", () => {
  const sections = [
    { id: "work", title: "Experience" },
    { id: "contact", title: "Contact" },
  ];

  it("names the section Malenia has to visit the way the nav does", () => {
    expect(sectionTitleFor(sections, "work")).toBe("Experience");
  });

  it("falls back to the id while the nav is still on its way", () => {
    expect(sectionTitleFor([], "contact")).toBe("contact");
  });
});
