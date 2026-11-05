import { describe, expect, it } from "vitest";
import {
  isNewChest,
  cloudsAlong,
  dialogLine,
  dwellProgress,
  layerWidth,
  openedChests,
  rectPath,
  ridgeHeights,
  roadside,
  seededRandom,
  skyline,
  stopAt,
  typedText,
  windowsOf,
  zoneAt,
} from ".";

describe("seededRandom", () => {
  it("given the same seed twice, expect Claire and Inde to see the same landscape", () => {
    const claire = seededRandom(7);
    const inde = seededRandom(7);
    expect([claire(), claire()]).toEqual([inde(), inde()]);
  });

  it("given any seed, expect numbers between 0 and 1", () => {
    const random = seededRandom(1987);
    const rolls = Array.from({ length: 50 }, random);
    expect(rolls.every((roll) => roll >= 0 && roll < 1)).toBe(true);
  });
});

describe("zoneAt", () => {
  it("given the start of the trip, expect the coast where Claire's first date was", () => {
    expect(zoneAt(0.1)).toBe("coast");
  });

  it("given the middle, expect the city", () => {
    expect(zoneAt(0.5)).toBe("city");
  });

  it("given the end, expect the offices where Malenia waits", () => {
    expect(zoneAt(0.9)).toBe("offices");
  });
});

describe("layerWidth", () => {
  it("given a layer that moves with the track, expect it as wide as the whole track", () => {
    expect(layerWidth(1000, 3000, 1)).toBeGreaterThanOrEqual(3000);
  });

  it("given a still layer, expect it just wider than the screen", () => {
    expect(layerWidth(1000, 3000, 0)).toBeLessThan(1010);
  });
});

describe("stopAt", () => {
  it("given the scroll halfway across five titles, expect Inde standing at the third", () => {
    expect(stopAt(0.5, 5)).toEqual({ index: 2, isAt: true });
  });

  it("given the scroll between two titles, expect Claire walking, not standing at one", () => {
    expect(stopAt(0.36, 5).isAt).toBe(false);
  });

  it("given a single title, expect Malenia always at it", () => {
    expect(stopAt(0.7, 1)).toEqual({ index: 0, isAt: true });
  });
});

describe("openedChests", () => {
  it("given the very start, expect the first chest already open", () => {
    expect(openedChests(0, 4)).toBe(1);
  });

  it("given the end, expect every chest open for Inde's anniversary", () => {
    expect(openedChests(1, 4)).toBe(4);
  });

  it("given the walk just short of the third chest, expect only two open", () => {
    expect(openedChests(0.5, 4)).toBe(2);
  });
});

describe("typedText", () => {
  it("given a love note half typed, expect only the first letters", () => {
    expect(typedText("Claire", 64, 32)).toBe("Cl");
  });

  it("given time before the first letter, expect nothing yet", () => {
    expect(typedText("Malenia", -10)).toBe("");
  });
});

describe("dialogLine", () => {
  it("given a title from the past, expect the classic line", () => {
    expect(dialogLine({ title: "Tech Lead", isCurrent: false })).toEqual({ lead: "You got ", item: "Tech Lead", tail: "!" });
  });

  it("given the title held now, expect the line to say it's still in hand", () => {
    expect(dialogLine({ title: "Engineering Manager", isCurrent: true }).tail).toBe("! Still holding this one.");
  });
});

describe("ridgeHeights", () => {
  it("given a width, expect one height per column, all above the horizon", () => {
    const heights = ridgeHeights(120, 3);
    expect(heights).toHaveLength(120);
    expect(heights.every((height) => height > 0)).toBe(true);
  });
});

describe("skyline", () => {
  it("given a long shore, expect buildings to grow taller from the coast to the offices", () => {
    const buildings = skyline(900, 11);
    const tallest = (zone) => Math.max(...buildings.filter((building) => building.zone === zone).map((building) => building.height));
    expect(tallest("coast")).toBeLessThan(tallest("city"));
    expect(tallest("city")).toBeLessThan(tallest("offices"));
  });

  it("given any shore, expect no two buildings to overlap", () => {
    const buildings = skyline(600, 5);
    const overlaps = buildings.slice(1).some((building, index) => building.x < buildings[index].x + buildings[index].width);
    expect(overlaps).toBe(false);
  });
});

describe("windowsOf", () => {
  it("given a building, expect every window inside its walls", () => {
    const tower = { x: 10, width: 8, height: 20 };
    const windows = windowsOf(tower, 66);
    expect(windows.length).toBeGreaterThan(0);
    expect(windows.every(({ x, y }) => x > 10 && x < 18 && y > 46 && y < 66)).toBe(true);
  });
});

describe("roadside", () => {
  it("given a long path, expect palms where it starts and lamps where it ends", () => {
    const props = roadside(1200, 9);
    expect(props[0].kind).toBe("palm");
    expect(props.at(-1).kind).toBe("lamp");
  });
});

describe("cloudsAlong", () => {
  it("given a sky, expect clouds spread across it, high above the horizon", () => {
    const clouds = cloudsAlong(500, 2);
    expect(clouds.length).toBeGreaterThan(2);
    expect(clouds.every((cloud) => cloud.y < 30)).toBe(true);
  });
});

describe("rectPath", () => {
  it("given a box, expect a closed svg path around it", () => {
    expect(rectPath(1, 2, 3, 4)).toBe("M1 2h3v4h-3z");
  });
});

describe("dwellProgress", () => {
  it("given the very start, expect Claire standing at the first chest", () => {
    expect(dwellProgress(0, 5)).toBe(0);
  });

  it("given the scroll still inside the first stop, expect the row to hold still so Inde can read the text box", () => {
    const stopEnds = 1.2 / (5 * 1.2 + 4);
    expect(dwellProgress(stopEnds * 0.9, 5)).toBe(0);
  });

  it("given the scroll halfway through a walk, expect Malenia halfway between two chests", () => {
    const halfWalk = (1.2 + 0.5) / (5 * 1.2 + 4);
    expect(dwellProgress(halfWalk, 5)).toBeCloseTo(0.5 / 4);
  });

  it("given the very end, expect Link standing at the last chest", () => {
    expect(dwellProgress(1, 5)).toBe(1);
  });

  it("given a single title, expect the raw scroll back, kept between 0 and 1", () => {
    expect(dwellProgress(1.4, 1)).toBe(1);
  });
});

describe("isNewChest", () => {
  it("given Link opens the chest where Claire hid her love note, expect the fanfare", () => {
    expect(isNewChest(1, 2)).toBe(true);
  });

  it("given Inde scrolls back past a chest already opened, expect silence", () => {
    expect(isNewChest(3, 2)).toBe(false);
  });

  it("given Malenia's chest was already open, expect it not to play twice", () => {
    expect(isNewChest(2, 2)).toBe(false);
  });
});
