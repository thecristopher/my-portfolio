import { describe, expect, it } from "vitest";
import {
  arcPath,
  arcPoint,
  cardPlacement,
  centerOf,
  chapterFade,
  currentCompany,
  dayPart,
  dotsPath,
  greetingFor,
  lightUpAt,
  linePath,
  projectOnMap,
  pullBack,
  reachRadius,
  shortCertName,
  skyPosition,
  stopCard,
  typingFrames,
} from ".";

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

describe("projectOnMap", () => {
  it("puts the prime meridian and the top row at the middle top of the map", () => {
    expect(projectOnMap({ lat: 80, lon: 0 }, { step: 2.5, top: 80 })).toEqual({ x: 72, y: 0 });
  });

  it("puts Claire's date in Rosarito left of the middle and above the equator", () => {
    const spot = projectOnMap({ lat: 32.5, lon: -117.5 }, { step: 2.5, top: 80 });
    expect(spot).toEqual({ x: 25, y: 19 });
  });
});

describe("dotsPath", () => {
  it("draws one dot for every land cell, centered in it", () => {
    expect(dotsPath([".#", "#."])).toBe("M1.5 0.5h0M0.5 1.5h0");
  });

  it("draws nothing over an ocean, like Malenia's empty letters page", () => {
    expect(dotsPath(["...", "..."])).toBe("");
  });
});

describe("arcPath", () => {
  it("bows the line from Inde's place to Claire's up above both of them", () => {
    expect(arcPath({ x: 0, y: 10 }, { x: 10, y: 10 }, 0.5)).toBe("M0 10Q5 5 10 10");
  });
});

describe("reachRadius", () => {
  it("reaches the farthest corner from where the light starts", () => {
    expect(reachRadius({ x: 0, y: 0 }, { width: 3, height: 4 })).toBe(5);
  });
});

describe("lightUpAt", () => {
  it("lights the first square of Malenia's years the moment the count starts", () => {
    expect(lightUpAt(0, 108, 1.6)).toBe(0);
  });

  it("lights the later squares further apart, as the count slows down", () => {
    const early = lightUpAt(10, 100, 1.6) - lightUpAt(0, 100, 1.6);
    const late = lightUpAt(90, 100, 1.6) - lightUpAt(80, 100, 1.6);
    expect(late).toBeGreaterThan(early);
  });

  it("lights every square of Inde's anniversary grid within the count", () => {
    expect(lightUpAt(107, 108, 1.6)).toBeLessThan(1.6);
  });
});

describe("linePath", () => {
  it("traces Claire's walk along the beach as one line through every point", () => {
    expect(linePath([{ x: 0, y: 0 }, { x: 1.234, y: 2 }, { x: 3, y: 4 }])).toBe("M0 0L1.23 2L3 4");
  });

  it("draws nothing when Malenia gives it no points", () => {
    expect(linePath([])).toBe("");
  });
});

describe("centerOf", () => {
  it("finds the middle of the bay where Inde and Claire meet", () => {
    expect(centerOf([{ x: 0, y: 10 }, { x: 4, y: 2 }, { x: 2, y: 6 }])).toEqual({ x: 2, y: 6 });
  });
});

describe("pullBack", () => {
  const box = { width: 100, height: 40 };
  const rosarito = { x: 20, y: 10 };

  it("starts close on Rosarito, the place Claire and Inde had their first date", () => {
    expect(pullBack(0, rosarito, box, 8)).toEqual({ scale: 8, transform: "translate(50 20) scale(8) translate(-20 -10)" });
  });

  it("ends on the whole map with nothing moved, the way Malenia sees it from the Haligtree", () => {
    expect(pullBack(1, rosarito, box, 8)).toEqual({ scale: 1, transform: "translate(50 20) scale(1) translate(-50 -20)" });
  });

  it("keeps Rosarito on screen halfway back, gliding toward where it really is", () => {
    expect(pullBack(0.5, rosarito, box, 4)).toEqual({ scale: 2, transform: "translate(50 20) scale(2) translate(-27.5 -12.5)" });
  });

  it("never pulls past the whole map, even when the scroll overshoots", () => {
    expect(pullBack(1.4, rosarito, box, 8).scale).toBe(1);
  });
});

describe("cardPlacement", () => {
  it("opens Claire's card to the right when her light sits on the left of the map", () => {
    expect(cardPlacement({ x: 0.2, y: 0.5 })).toEqual({ side: "right", rise: "middle" });
  });

  it("opens Malenia's card to the left and downward near the top right corner", () => {
    expect(cardPlacement({ x: 0.8, y: 0.1 })).toEqual({ side: "left", rise: "down" });
  });

  it("lifts Inde's card upward when the light is near the bottom", () => {
    expect(cardPlacement({ x: 0.4, y: 0.9 }).rise).toBe("up");
  });
});

describe("stopCard", () => {
  const projects = [{ title: "TerraSave", description: "Where Claire saves the day.", highlights: ["Wrote Inde a love note in the release notes"], url: "https://terrasave.org" }];

  it("fills Claire's card from her own job, first highlight included", () => {
    expect(stopCard({ company: "TerraSave", place: "Raccoon City" }, projects)).toEqual({
      company: "TerraSave",
      place: "Raccoon City",
      description: "Where Claire saves the day.",
      highlight: "Wrote Inde a love note in the release notes",
      url: "https://terrasave.org",
    });
  });

  it("gives no card when Malenia's job isn't in the list, instead of making one up", () => {
    expect(stopCard({ company: "Haligtree", place: "Elphael" }, projects)).toBeNull();
  });
});

describe("dayPart", () => {
  it("calls it dawn when Inde wakes Claire for the sunrise", () => {
    expect(dayPart(6, 15)).toBe("dawn");
  });

  it("calls it day at lunch with Malenia", () => {
    expect(dayPart(13)).toBe("day");
  });

  it("calls it dusk while the sun sets on Claire and Inde's anniversary dinner", () => {
    expect(dayPart(18, 40)).toBe("dusk");
  });

  it("calls it night after midnight", () => {
    expect(dayPart(1)).toBe("night");
  });
});

describe("greetingFor", () => {
  it("says hola for Spanish, how Claire greets Inde", () => {
    expect(greetingFor("Spanish")).toBe("Hola");
  });

  it("greets with the language's own name when it doesn't know how Malenia says hi", () => {
    expect(greetingFor("Elphaelian")).toBe("Elphaelian");
  });
});

describe("typingFrames", () => {
  it("types, holds, erases and clears each word for Inde's love note", () => {
    expect(typingFrames(["Hi"], 2)).toEqual(["H", "Hi", "Hi", "Hi", "H", ""]);
  });

  it("types Claire's words one after the other", () => {
    expect(typingFrames(["A", "B"], 1)).toEqual(["A", "A", "", "B", "B", ""]);
  });
});

describe("chapterFade", () => {
  it("given the first chapter, expect it already lit when Claire's map pins", () => {
    const { input, output } = chapterFade([0, 0.37], { isFirst: true, isLast: false });
    expect(input[1]).toBe(0);
    expect(output[1]).toBe(1);
  });

  it("given a middle chapter, expect it to fade in after its beat starts and out before Inde reaches the next", () => {
    const { input, output } = chapterFade([0.37, 0.58], { isFirst: false, isLast: false });
    [0.37, 0.41, 0.54, 0.58].forEach((at, index) => expect(input[index]).toBeCloseTo(at));
    expect(output).toEqual([0, 1, 1, 0]);
  });

  it("given the last chapter, expect it to stay up once Malenia gets there", () => {
    expect(chapterFade([0.58, 1], { isFirst: false, isLast: true }).output.at(-1)).toBe(1);
  });
});
