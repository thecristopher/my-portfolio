import { describe, expect, it } from "vitest";
import {
  cleanTechName,
  extractYearsOfExperience,
  formatIndex,
  hostnameFromUrl,
  sectionIdFromUrl,
  slugify,
  splitParagraphs,
  splitStatValue,
  splitWords,
  stackScale,
  wordRevealRange,
  filterCommands,
  findCommandByAlias,
  bufferNameFor,
  scrollPosition,
  gutterLines,
  fileTypeFor,
  resolveTheme,
  isMaxLevel,
  spriteToPixels,
  isInRegion,
  overlaySprite,
  pickIdleMove,
  idleMoveDelay,
  markMainStack,
} from "./index";

describe("splitParagraphs", () => {
  it("splits text on blank lines", () => {
    const bio = "Leon survived Raccoon City.\n\nThen he survived Spain.";
    expect(splitParagraphs(bio)).toEqual([
      "Leon survived Raccoon City.",
      "Then he survived Spain.",
    ]);
  });

  it("returns nothing for empty text", () => {
    expect(splitParagraphs("")).toEqual([]);
  });
});

describe("extractYearsOfExperience", () => {
  it("finds the years with a plus sign", () => {
    expect(extractYearsOfExperience("Jill has 9+ years of experience")).toBe("9+");
  });

  it("returns null when no years are mentioned", () => {
    expect(extractYearsOfExperience("Melina just shows up")).toBeNull();
  });
});

describe("cleanTechName", () => {
  it("drops parenthetical notes", () => {
    expect(cleanTechName("Docker (optional)")).toBe("Docker");
  });

  it("keeps plain names untouched", () => {
    expect(cleanTechName("C#")).toBe("C#");
  });
});

describe("sectionIdFromUrl", () => {
  it("returns the hash part of a nav url", () => {
    expect(sectionIdFromUrl("/#about")).toBe("about");
  });
});

describe("formatIndex", () => {
  it("pads a zero based index to two digits", () => {
    expect(formatIndex(0)).toBe("01");
  });
});

describe("hostnameFromUrl", () => {
  it("strips the protocol and www", () => {
    expect(hostnameFromUrl("https://www.umbrella-seguros.com/")).toBe("umbrella-seguros.com");
  });

  it("returns the input when it is not a url", () => {
    expect(hostnameFromUrl("the lands between")).toBe("the lands between");
  });
});

describe("splitWords", () => {
  it("splits on any whitespace and drops blanks", () => {
    expect(splitWords("  Ada   Wong\nwas here ")).toEqual(["Ada", "Wong", "was", "here"]);
  });
});

describe("wordRevealRange", () => {
  it("gives the first of four words the first quarter", () => {
    expect(wordRevealRange(0, 4)).toEqual([0, 0.25]);
  });

  it("gives the last word the final slice", () => {
    expect(wordRevealRange(3, 4)).toEqual([0.75, 1]);
  });
});

describe("stackScale", () => {
  it("keeps the top card at full size", () => {
    expect(stackScale(2, 3)).toBe(1);
  });

  it("shrinks the bottom card the most", () => {
    expect(stackScale(0, 3)).toBeCloseTo(0.92);
  });
});

describe("splitStatValue", () => {
  it("separates the number from its suffix", () => {
    expect(splitStatValue("9+")).toEqual({ number: 9, suffix: "+" });
  });

  it("accepts plain numbers", () => {
    expect(splitStatValue(6)).toEqual({ number: 6, suffix: "" });
  });

  it("keeps non numeric values as text", () => {
    expect(splitStatValue("Tarnished")).toEqual({ number: null, suffix: "Tarnished" });
  });
});

describe("slugify", () => {
  it("turns a title with accents and slashes into a path", () => {
    expect(slugify("Hisense México / Factory")).toBe("hisense-mexico-factory");
  });
});

describe("filterCommands", () => {
  const commands = [
    { label: "Go to Work", group: "Navigate", alias: "work" },
    { label: "Copy email", group: "Contact", alias: "yank", keywords: "mail address" },
    { label: "Open Instagram", group: "Elsewhere", alias: "instagram" },
    { label: "Jill sandwich", group: "Secrets", alias: "jill", hidden: true },
  ];

  it("returns every visible command for an empty query", () => {
    expect(filterCommands(commands, "  ")).toHaveLength(3);
  });

  it("matches on keywords, ignoring case", () => {
    expect(filterCommands(commands, "MAIL").map((c) => c.label)).toEqual(["Copy email"]);
  });

  it("matches on the group name", () => {
    expect(filterCommands(commands, "elsewhere").map((c) => c.label)).toEqual(["Open Instagram"]);
  });

  it("ignores a leading colon like the vim cmdline", () => {
    expect(filterCommands(commands, ":work").map((c) => c.label)).toEqual(["Go to Work"]);
  });

  it("keeps secret commands out of partial matches", () => {
    expect(filterCommands(commands, "jil")).toEqual([]);
  });

  it("reveals a secret command on its exact alias", () => {
    expect(filterCommands(commands, ":jill").map((c) => c.label)).toEqual(["Jill sandwich"]);
  });
});

describe("findCommandByAlias", () => {
  const commands = [{ label: "Write", alias: "w" }];

  it("finds a command typed with a colon", () => {
    expect(findCommandByAlias(commands, ":w").label).toBe("Write");
  });

  it("returns undefined for unknown aliases", () => {
    expect(findCommandByAlias(commands, ":wq")).toBeUndefined();
  });
});

describe("bufferNameFor", () => {
  it("maps known sections to their file names", () => {
    expect(bufferNameFor("skills")).toBe("skills.lua");
  });

  it("falls back to markdown for anything new", () => {
    expect(bufferNameFor("leyndell")).toBe("leyndell.md");
  });
});

describe("scrollPosition", () => {
  it("says Top at the very start", () => {
    expect(scrollPosition(0, 4000)).toBe("Top");
  });

  it("says Bot at the very end", () => {
    expect(scrollPosition(4000, 4000)).toBe("Bot");
  });

  it("shows a rounded percent in between", () => {
    expect(scrollPosition(1000, 4000)).toBe("25%");
  });

  it("says All when the page does not scroll", () => {
    expect(scrollPosition(0, 0)).toBe("All");
  });
});

describe("gutterLines", () => {
  it("shows the real line number in the middle row", () => {
    expect(gutterLines(42, 5)[2]).toEqual({ row: 2, label: 42, isCurrent: true });
  });

  it("shows distances from the middle everywhere else", () => {
    expect(gutterLines(42, 5).map((line) => line.label)).toEqual([2, 1, 42, 1, 2]);
  });
});

describe("fileTypeFor", () => {
  it("names tsx buffers like nvim does", () => {
    expect(fileTypeFor("index.tsx")).toBe("typescriptreact");
  });

  it("falls back to text for unknown extensions", () => {
    expect(fileTypeFor("tarnished.ring")).toBe("text");
  });
});

describe("resolveTheme", () => {
  it("keeps a known theme", () => {
    expect(resolveTheme("rose-pine")).toBe("rose-pine");
  });

  it("falls back to kanagawa for anything else", () => {
    expect(resolveTheme("lordran")).toBe("kanagawa");
  });
});

describe("markMainStack", () => {
  const levels = [
    { name: "TypeScript", level: 4 },
    { name: "C#", level: 5 },
    { name: "Azure", level: 3 },
  ];

  it("keeps the order the API sends", () => {
    expect(markMainStack(levels, []).map((tool) => tool.name)).toEqual(["TypeScript", "C#", "Azure"]);
  });

  it("flags the main stack tools", () => {
    expect(markMainStack(levels, ["TypeScript"]).map((tool) => tool.isMain)).toEqual([true, false, false]);
  });

  it("handles missing levels", () => {
    expect(markMainStack(undefined)).toEqual([]);
  });
});

describe("isMaxLevel", () => {
  it("flags a tool rated at the top of the scale", () => {
    expect(isMaxLevel(5, 5)).toBe(true);
  });

  it("leaves everything below the top alone", () => {
    expect(isMaxLevel(4, 5)).toBe(false);
  });
});

describe("spriteToPixels", () => {
  const palette = { K: "#000", S: "#fff" };

  it("places each known character at its row and column", () => {
    expect(spriteToPixels(["K.", ".S"], palette)).toEqual([
      { x: 0, y: 0, color: "#000" },
      { x: 1, y: 1, color: "#fff" },
    ]);
  });

  it("skips characters that are not in the palette", () => {
    expect(spriteToPixels(["..?"], palette)).toEqual([]);
  });

  it("repaints swapped characters", () => {
    expect(spriteToPixels(["E"], palette, { E: "S" })).toEqual([{ x: 0, y: 0, color: "#fff" }]);
  });
});

describe("isInRegion", () => {
  const arm = { minX: 33, minY: 19, maxY: 37 };

  it("includes a pixel inside the bounds", () => {
    expect(isInRegion({ x: 40, y: 25 }, arm)).toBe(true);
  });

  it("leaves out a pixel past any edge", () => {
    expect(isInRegion({ x: 20, y: 25 }, arm)).toBe(false);
    expect(isInRegion({ x: 40, y: 50 }, arm)).toBe(false);
  });
});

describe("overlaySprite", () => {
  const hand = { left: 1, top: 0, rows: ["S."] };

  it("paints the overlay where it has pixels", () => {
    expect(overlaySprite(["KKK"], hand)).toEqual(["KSK"]);
  });

  it("keeps what is underneath where the overlay is a dot", () => {
    expect(overlaySprite(["KKK"], hand)[0][2]).toBe("K");
  });

  it("clears the erase region before painting", () => {
    expect(overlaySprite(["KKK"], hand, { minX: 2, maxX: 2, minY: 0, maxY: 0 })).toEqual(["KS."]);
  });
});

describe("pickIdleMove", () => {
  it("glances around on a low roll", () => {
    expect(pickIdleMove(0.2)).toBe("look");
  });

  it("waves on a high roll", () => {
    expect(pickIdleMove(0.9)).toBe("wave");
  });
});

describe("idleMoveDelay", () => {
  it("waits the minimum on a zero roll", () => {
    expect(idleMoveDelay(0)).toBe(6000);
  });

  it("waits the maximum on a full roll", () => {
    expect(idleMoveDelay(1)).toBe(11000);
  });
});
