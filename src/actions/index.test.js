import { describe, expect, it } from "vitest";
import {
  wrapRange,
  scrambleFrame,
  letterWeight,
  buildFileTree,
  sectionIdForBuffer,
  careerCommits,
  countUsing,
  formatYears,
  localClock,
  nowStatus,
  shortHash,
  usesTech,
  cleanTechName,
  revealCircle,
  extractYearsOfExperience,
  formatIndex,
  hostnameFromUrl,
  sectionIdFromUrl,
  slugify,
  splitParagraphs,
  splitStatValue,
  splitWords,
  timesCertified,
  stackScale,
  wordRevealRange,
  filterCommands,
  findCommandByAlias,
  bufferNameFor,
  scrollPosition,
  fileTypeFor,
  resolveTheme,
  isMaxLevel,
  spriteToPixels,
  isInRegion,
  overlaySprite,
  crouchLegs,
  pingPong,
  pickIdleMove,
  idleMoveDelay,
  markMainStack,
  splitFeatured,
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

  it("opens the github section as yaml", () => {
    expect(bufferNameFor("github")).toBe("repos.yml");
  });

  it("opens education as toml, and the statusline knows the filetype", () => {
    expect(bufferNameFor("education")).toBe("education.toml");
    expect(fileTypeFor("education.toml")).toBe("toml");
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

  it("falls back to rosarito for anything else", () => {
    expect(resolveTheme("lordran")).toBe("rosarito");
  });

  it("picks the light colorscheme for a light system when nothing is saved", () => {
    expect(resolveTheme(null, true)).toBe("lotus");
  });

  it("keeps a saved dark colorscheme even on a light system", () => {
    expect(resolveTheme("ember", true)).toBe("ember");
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

describe("pingPong", () => {
  it("goes out and back without doubling the ends", () => {
    expect(pingPong(3)).toEqual([0, 1, 2, 1]);
  });

  it("just alternates when there are two frames", () => {
    expect(pingPong(2)).toEqual([0, 1]);
  });

  it("holds still with a single frame", () => {
    expect(pingPong(1)).toEqual([0]);
  });
});

describe("crouchLegs", () => {
  const leg = [
    { x: 0, y: 0, color: "thigh" },
    { x: 0, y: 1, color: "knee" },
    { x: 0, y: 2, color: "boot" },
  ];

  it("drops everything above the knee by one pixel", () => {
    expect(crouchLegs(leg, 1)[0]).toEqual({ x: 0, y: 1, color: "thigh" });
  });

  it("folds the knee row away so nothing doubles up", () => {
    expect(crouchLegs(leg, 1).map((pixel) => pixel.color)).toEqual(["thigh", "boot"]);
  });

  it("keeps the boots planted", () => {
    expect(crouchLegs(leg, 1)[1]).toEqual({ x: 0, y: 2, color: "boot" });
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

describe("revealCircle", () => {
  it("grows far enough to reach the farthest corner", () => {
    expect(revealCircle({ x: 0, y: 0 }, { width: 300, height: 400 }).radius).toBe(500);
    expect(revealCircle({ x: 300, y: 400 }, { width: 300, height: 400 }).radius).toBe(500);
  });
});

describe("splitFeatured", () => {
  it("keeps featured roles as cards and moves the rest to the earlier list", () => {
    const projects = [{ title: "S.T.A.R.S." }, { title: "R.P.D.", featured: true }, { title: "Umbrella", featured: false }];
    const { featured, earlier } = splitFeatured(projects);
    expect(featured.map((project) => project.title)).toEqual(["S.T.A.R.S.", "R.P.D."]);
    expect(earlier.map((project) => project.title)).toEqual(["Umbrella"]);
  });

  it("handles a missing list", () => {
    expect(splitFeatured()).toEqual({ featured: [], earlier: [] });
  });
});

describe("timesCertified", () => {
  it("counts Leon's two certifications as 2x", () => {
    const leonsCerts = [{ name: "R.P.D. Rookie" }, { name: "D.S.O. Agent" }];
    expect(timesCertified(leonsCerts)).toBe("2x");
  });

  it("shows nothing for a Tarnished with no certifications yet", () => {
    expect(timesCertified([])).toBeNull();
  });
});

describe("formatYears", () => {
  it("prints a closed range", () => {
    expect(formatYears(2017, 2019)).toBe("2017 – 2019");
  });

  it("leaves a current job open", () => {
    expect(formatYears(2021, null)).toBe("2021 – present");
  });

  it("prints one year once", () => {
    expect(formatYears(2016, 2016)).toBe("2016");
  });

  it("is empty without a start", () => {
    expect(formatYears(null, null)).toBeNull();
  });
});

describe("shortHash", () => {
  it("is seven hex characters", () => {
    expect(shortHash("PSL Group:Tech Lead")).toMatch(/^[0-9a-f]{7}$/);
  });

  it("is stable and tells inputs apart", () => {
    expect(shortHash("a")).toBe(shortHash("a"));
    expect(shortHash("a")).not.toBe(shortHash("b"));
  });
});

describe("careerCommits", () => {
  const projects = [
    { title: "PSL Group", roles: ["Tech Lead", "Engineering Manager"], start_year: 2021, end_year: null },
    { title: "Hisense México", roles: [] },
    { title: "Systems Communications", roles: ["Intern"], start_year: 2015, end_year: 2016 },
  ];
  const commits = careerCommits(projects);

  it("puts the newest title on top as HEAD", () => {
    expect(commits[0]).toMatchObject({ type: "promote", message: "Engineering Manager", isHead: true, years: "2021 – present" });
  });

  it("joins a company with its first title", () => {
    expect(commits[1]).toMatchObject({ type: "join", message: "Tech Lead @ PSL Group", isHead: false, years: null });
  });

  it("names the company alone when the title is unknown", () => {
    expect(commits[2]).toMatchObject({ type: "join", message: "Hisense México", targetId: "work-hisense-mexico" });
  });

  it("makes the first job the root commit", () => {
    expect(commits.at(-1)).toMatchObject({ type: "init", message: "Intern @ Systems Communications", years: "2015 – 2016" });
  });

  it("is empty without projects", () => {
    expect(careerCommits([])).toEqual([]);
  });
});

describe("usesTech", () => {
  const project = { technologies: ["AWS", "Docker (optional)"] };

  it("matches a tool in the stack, ignoring notes in parentheses", () => {
    expect(usesTech(project, "Docker")).toBe(true);
  });

  it("misses a tool that isn't there", () => {
    expect(usesTech(project, "PHP")).toBe(false);
  });

  it("matches everything when no tool is picked", () => {
    expect(usesTech(project, null)).toBe(true);
  });

  it("counts the projects that used a tool", () => {
    expect(countUsing([project, { technologies: ["PHP"] }], "PHP")).toBe(1);
  });
});

describe("localClock", () => {
  it("reads the time where I live", () => {
    // 21:30 UTC on a Wednesday is 14:30 in Tijuana during daylight time
    expect(localClock(new Date("2026-07-15T21:30:00Z"), "America/Tijuana")).toEqual({ hour: 14, time: "14:30", isWeekend: false });
  });

  it("knows a Saturday", () => {
    expect(localClock(new Date("2026-07-18T18:00:00Z"), "America/Tijuana").isWeekend).toBe(true);
  });
});

describe("nowStatus", () => {
  it("is asleep in the small hours", () => {
    expect(nowStatus({ hour: 3, isWeekend: false })).toMatch(/asleep/);
  });

  it("is in reviews on a weekday morning", () => {
    expect(nowStatus({ hour: 10, isWeekend: false })).toMatch(/code reviews/);
  });

  it("is off the clock on a weekend afternoon", () => {
    expect(nowStatus({ hour: 15, isWeekend: true })).toMatch(/family/);
  });

  it("has an answer for the last hour of the day", () => {
    expect(nowStatus({ hour: 23, isWeekend: false })).toBeTruthy();
  });
});

describe("sectionIdForBuffer", () => {
  it("finds the section behind a buffer", () => {
    expect(sectionIdForBuffer("repos.yml")).toBe("github");
  });

  it("knows the philosophy", () => {
    expect(sectionIdForBuffer("philosophy.md")).toBe("manifesto");
  });

  it("is null for a buffer that doesn't exist", () => {
    expect(sectionIdForBuffer("lordran.txt")).toBeNull();
  });
});

describe("buildFileTree", () => {
  const sections = ["home", "about", "work", "github", "contact"];
  const tree = buildFileTree(sections, {
    projects: [{ title: "PSL Group" }, { title: "Hisense México", featured: false }],
    repos: [{ name: "dotfiles" }],
  });

  it("slips the philosophy in right after the hero", () => {
    expect(tree.map((node) => node.name).slice(0, 2)).toEqual(["index.tsx", "philosophy.md"]);
  });

  it("opens sections with something inside as directories", () => {
    expect(tree.find((node) => node.sectionId === "about")).toMatchObject({ name: "about/", isDirectory: true });
  });

  it("lists the career log, each featured job and the earlier ones under work", () => {
    expect(tree.find((node) => node.sectionId === "work").children).toEqual([
      { name: "career.log", targetId: "career-log" },
      { name: "01-psl-group.json", targetId: "work-psl-group" },
      { name: "earlier.log", targetId: "work-earlier" },
    ]);
  });

  it("names the repos folder side-quests", () => {
    expect(tree.find((node) => node.sectionId === "github")).toMatchObject({
      name: "side-quests/",
      children: [{ name: "dotfiles.git", targetId: "repo-dotfiles" }],
    });
  });

  it("leaves contact as a single file", () => {
    expect(tree.at(-1)).toMatchObject({ name: "contact.sh", isDirectory: false, children: [] });
  });

  it("keeps a section without data as a file until its data arrives", () => {
    expect(buildFileTree(["github"])[0]).toMatchObject({ name: "repos.yml", isDirectory: false });
  });
});

describe("letterWeight", () => {
  it("is at full weight right under the cursor", () => {
    expect(letterWeight(0)).toBe(820);
  });

  it("rests once the cursor is out of reach", () => {
    expect(letterWeight(240)).toBe(500);
    expect(letterWeight(900)).toBe(500);
  });

  it("eases in between", () => {
    expect(letterWeight(120)).toBeGreaterThan(500);
    expect(letterWeight(120)).toBeLessThan(820);
  });
});

describe("scrambleFrame", () => {
  it("is the real text once it's done", () => {
    expect(scrambleFrame("work.json", 1)).toBe("work.json");
  });

  it("keeps the dots where they are while the letters are noise", () => {
    expect(scrambleFrame("work.json", 0, () => 0)).toBe("aaaa.aaaa");
  });

  it("settles from the left", () => {
    expect(scrambleFrame("abcd", 0.5, () => 0.99)).toBe("ab$$");
  });
});

describe("wrapRange", () => {
  it("leaves a value inside the range alone", () => {
    expect(wrapRange(-50, 0, -20)).toBe(-20);
  });

  it("loops past either end", () => {
    expect(wrapRange(-50, 0, -60)).toBe(-10);
    expect(wrapRange(-50, 0, 10)).toBe(-40);
  });
});
