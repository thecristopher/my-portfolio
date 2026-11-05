import { describe, expect, it } from "vitest";
import { MAIN_PROJECT, bufferLength, bufferText, cartridgeTurn, deckKeys, deckPolygon, editorBuffer, keysFor, onDeck, lastPushed, litKeys, luaKey, typeBuffer, whichKeys } from ".";

describe("lastPushed", () => {
  const now = new Date("2026-11-04T12:00:00Z").getTime();

  it("says today for the playlist Inde pushed this morning", () => {
    expect(lastPushed("2026-11-04T08:00:00Z", now)).toBe("today");
  });

  it("counts days for Claire's repo from last week", () => {
    expect(lastPushed("2026-10-28T12:00:00Z", now)).toBe("7d ago");
  });

  it("counts months for Malenia's anniversary project", () => {
    expect(lastPushed("2026-08-01T12:00:00Z", now)).toBe("3mo ago");
  });

  it("counts years for Leon's oldest repo", () => {
    expect(lastPushed("2024-10-01T12:00:00Z", now)).toBe("2y ago");
  });
});

describe("MAIN_PROJECT", () => {
  it("points at the nvim config and pitches it without em dashes", () => {
    expect(MAIN_PROJECT.url).toMatch(/nvim-config$/);
    expect(MAIN_PROJECT.pitch).not.toContain("\u2014");
  });

  it("goes by the repo's own name, not the world inside it", () => {
    expect(MAIN_PROJECT.title).toBe("nvim-config");
  });

  it("leads with back-to-basics, the drills it runs inside the editor", () => {
    expect(MAIN_PROJECT.practice.name).toBe("back-to-basics");
    expect(MAIN_PROJECT.features[0][0]).toBe("Back to basics");
  });

  it("gives every feature its own which-key letter, so Claire never presses one that opens two", () => {
    const keys = whichKeys(MAIN_PROJECT.features).map((entry) => entry.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("luaKey", () => {
  it("turns Claire's feature name into a snake case key", () => {
    expect(luaKey("Inventory HUD")).toBe("inventory_hud");
  });

  it("drops the punctuation around Malenia's name", () => {
    expect(luaKey("  Malenia's Bloom! ")).toBe("malenia_s_bloom");
  });
});

describe("editorBuffer", () => {
  const lines = editorBuffer([["Love notes", "one for Inde every morning"]]);

  it("writes each feature as a key and a quoted string", () => {
    expect(lines[2].map((token) => token.text).join("")).toBe('  love_notes = "one for Inde every morning",');
  });

  it("opens with a comment and closes the table", () => {
    expect(lines[0][0].tone).toBe("comment");
    expect(lines.at(-1)[0].text).toBe("}");
  });
});

describe("typeBuffer", () => {
  const lines = [[{ text: "abc" }], [{ text: "de" }, { text: "f" }]];

  it("given nothing typed, shows one empty line for the cursor to wait on", () => {
    expect(typeBuffer(lines, 0)).toEqual([[]]);
  });

  it("given the first line and the newline, starts Claire's next line empty", () => {
    expect(typeBuffer(lines, 4)).toEqual([[{ text: "abc" }], []]);
  });

  it("cuts the line being typed through its tokens", () => {
    expect(typeBuffer(lines, 7)).toEqual([[{ text: "abc" }], [{ text: "de" }, { text: "f" }]]);
    expect(typeBuffer(lines, 5)).toEqual([[{ text: "abc" }], [{ text: "d" }]]);
  });

  it("given every keystroke, shows the whole buffer", () => {
    expect(typeBuffer(lines, bufferLength(lines))).toEqual(lines);
  });
});

describe("whichKeys", () => {
  it("gives every feature its first letter as the key", () => {
    expect(whichKeys([["Banners", "for Malenia's victories"]])).toEqual([{ key: "b", label: "Banners" }]);
  });
});

describe("bufferText", () => {
  it("joins Claire's love note into plain text with a newline after every line", () => {
    const lines = [[{ text: "dear " }, { text: "Leon" }], [{ text: "}" }]];
    expect(bufferText(lines)).toBe("dear Leon\n}\n");
  });
});

describe("keysFor", () => {
  it("presses one key for a lowercase letter in Inde's playlist name", () => {
    expect(keysFor("k")).toEqual(["k"]);
  });

  it("adds shift for the capital M in Malenia", () => {
    expect(keysFor("M")).toEqual(["m", "shift"]);
  });

  it("types quotes and braces with shift held, like a Lua table for Claire", () => {
    expect(keysFor('"')).toEqual(["'", "shift"]);
    expect(keysFor("{")).toEqual(["[", "shift"]);
    expect(keysFor("_")).toEqual(["-", "shift"]);
  });

  it("finds the backslash and semicolon keys for the path in Claire's config", () => {
    expect(keysFor("\\")).toEqual(["\\"]);
    expect(keysFor(";")).toEqual([";"]);
  });

  it("uses space and return for the gaps between Inde's words and lines", () => {
    expect(keysFor(" ")).toEqual(["space"]);
    expect(keysFor("\n")).toEqual(["return"]);
  });

  it("presses nothing for a heart the keyboard can't type", () => {
    expect(keysFor("♥")).toEqual([]);
  });
});

describe("litKeys", () => {
  it("lights the last key Malenia typed brightest and fades the ones before it", () => {
    const lit = litKeys("love", 3, 3);
    expect(lit.v).toBe(1);
    expect(lit.o).toBeCloseTo(2 / 3);
    expect(lit.l).toBeCloseTo(1 / 3);
  });

  it("keeps shift lit while a capital is still glowing in Claire's note", () => {
    expect(litKeys("Hi Leon", 2, 2).shift).toBe(0.5);
  });

  it("goes dark before typing starts and once Inde's note is finished", () => {
    expect(litKeys("date", 0)).toEqual({});
    expect(litKeys("date", 4)).toEqual({});
  });
});

describe("cartridgeTurn", () => {
  it("faces Claire head on when her cartridge crosses the middle of the screen", () => {
    expect(cartridgeTurn(640, 1280)).toBe(0);
  });

  it("angles Inde's cartridge toward the middle while it sits at the left edge", () => {
    expect(cartridgeTurn(0, 1280, 30)).toBe(30);
  });

  it("keeps Malenia's far off cartridge at the edge angle instead of spinning past it", () => {
    expect(cartridgeTurn(5000, 1280, 30)).toBe(-30);
  });

  it("stays flat while the screen has no width yet", () => {
    expect(cartridgeTurn(100, 0)).toBe(0);
  });
});

const DECK = { top: 0, bottom: 100, topLeft: 20, topRight: 980, bottomLeft: 0, bottomRight: 1000 };

describe("onDeck", () => {
  it("puts the hinge corners where the deck is narrowest, for Claire's view from her chair", () => {
    expect(onDeck(0, 0, DECK)).toEqual([20, 0]);
    expect(onDeck(1, 0, DECK)).toEqual([980, 0]);
  });

  it("spreads the front edge wider, since it's closer to Inde", () => {
    expect(onDeck(0, 1, DECK)).toEqual([0, 100]);
    expect(onDeck(0.5, 1, DECK)).toEqual([500, 100]);
  });
});

describe("deckPolygon", () => {
  it("turns Malenia's square on the deck into four corners in perspective", () => {
    expect(deckPolygon({ u0: 0, u1: 1, v0: 0, v1: 1 }, DECK)).toBe("20.0,0.0 980.0,0.0 1000.0,100.0 0.0,100.0");
  });
});

describe("deckKeys", () => {
  const area = { u0: 0, u1: 1, v0: 0, v1: 1, gap: 0 };

  it("lays out every key of Inde's keyboard once", () => {
    const keys = deckKeys([["q", "w"], ["a", "s"]], area, DECK);
    expect(keys.map((key) => key.id)).toEqual(["q", "w", "a", "s"]);
  });

  it("makes the space bar wider than a letter on Claire's bottom row", () => {
    const [letter, space] = deckKeys([["a", "space"]], area, DECK);
    const width = (points) => {
      const [left, right] = points.split(" ").map((corner) => Number(corner.split(",")[0]));
      return right - left;
    };
    expect(width(space.points)).toBeGreaterThan(width(letter.points) * 5);
  });
});

