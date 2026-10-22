import { describe, expect, it } from "vitest";
import {
  hintLabels,
  stepSection,
  auroraLayout,
  mixColors,
  parseCssColor,
  softRing,
  easedGlow,
  glowFalloff,
  softBeams,
  brandColorFor,
  letterWeight,
  buildFileTree,
  careerCommits,
  formatMonth,
  formatRange,
  countUsing,
  localClock,
  dayBlocks,
  hoursAhead,
  nowStatus,
  shortHash,
  usesTech,
  cleanTechName,
  revealCircle,
  formatIndex,
  hostnameFromUrl,
  sectionIdFromUrl,
  slugify,
  splitParagraphs,
  splitStatValue,
  splitWords,
  wordRevealRange,
  filterCommands,
  findCommandByAlias,
  bufferNameFor,
  scrollPosition,
  fileTypeFor,
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

// Claire, Malenia and Inde are putting this little editor together, one small piece at a time.

describe("splitParagraphs", () => {
  it("given a note with a blank line, expect one paragraph on each side of it", () => {
    const note = "Claire saved Inde a seat by the window.\n\nMalenia brought the cake.";
    expect(splitParagraphs(note)).toEqual([
      "Claire saved Inde a seat by the window.",
      "Malenia brought the cake.",
    ]);
  });

  it("given an empty note, expect no paragraphs", () => {
    expect(splitParagraphs("")).toEqual([]);
  });
});

describe("cleanTechName", () => {
  it("given a name with a note in parentheses, expect only the name", () => {
    expect(cleanTechName("Docker (optional)")).toBe("Docker");
  });

  it("given a plain name, expect it back untouched", () => {
    expect(cleanTechName("C#")).toBe("C#");
  });
});

describe("sectionIdFromUrl", () => {
  it("given a nav url, expect the part after the hash", () => {
    expect(sectionIdFromUrl("/#about")).toBe("about");
  });
});

describe("formatIndex", () => {
  it("given the zero based index 0, expect 01", () => {
    expect(formatIndex(0)).toBe("01");
  });
});

describe("hostnameFromUrl", () => {
  it("given Claire's TerraSave link, expect the bare hostname without protocol or www", () => {
    expect(hostnameFromUrl("https://www.terrasave.org/")).toBe("terrasave.org");
  });

  it("given text that is not a url, expect the same text back", () => {
    expect(hostnameFromUrl("a picnic under the Erdtree")).toBe("a picnic under the Erdtree");
  });
});

describe("splitWords", () => {
  it("given words spread across spaces and newlines, expect just the words", () => {
    expect(splitWords("  Claire   saved\nthe song ")).toEqual(["Claire", "saved", "the", "song"]);
  });
});

describe("wordRevealRange", () => {
  it("given the first of four words, expect the first quarter", () => {
    expect(wordRevealRange(0, 4)).toEqual([0, 0.25]);
  });

  it("given the last of four words, expect the final quarter", () => {
    expect(wordRevealRange(3, 4)).toEqual([0.75, 1]);
  });
});

describe("splitStatValue", () => {
  it("given 9+, expect the number 9 and the suffix +", () => {
    expect(splitStatValue("9+")).toEqual({ number: 9, suffix: "+" });
  });

  it("given a plain number, expect it with an empty suffix", () => {
    expect(splitStatValue(6)).toEqual({ number: 6, suffix: "" });
  });

  it("given a word like Always, expect no number and the word as text", () => {
    expect(splitStatValue("Always")).toEqual({ number: null, suffix: "Always" });
  });
});

describe("slugify", () => {
  it("given a title with accents and a slash, expect a clean lowercase path", () => {
    expect(slugify("Mesón de Torrent / Stables")).toBe("meson-de-torrent-stables");
  });
});

describe("filterCommands", () => {
  const commands = [
    { label: "Go to Work", group: "Navigate", alias: "work" },
    { label: "Copy email", group: "Contact", alias: "yank", keywords: "mail address" },
    { label: "Open Instagram", group: "Elsewhere", alias: "instagram" },
    { label: "Play our song", group: "Secrets", alias: "oursong", hidden: true },
  ];

  it("given a blank query, expect every visible command", () => {
    expect(filterCommands(commands, "  ")).toHaveLength(3);
  });

  it("given an uppercase keyword, expect the command it describes", () => {
    expect(filterCommands(commands, "MAIL").map((c) => c.label)).toEqual(["Copy email"]);
  });

  it("given a group name, expect the commands in that group", () => {
    expect(filterCommands(commands, "elsewhere").map((c) => c.label)).toEqual(["Open Instagram"]);
  });

  it("given a leading colon like the vim cmdline, expect it to be ignored", () => {
    expect(filterCommands(commands, ":work").map((c) => c.label)).toEqual(["Go to Work"]);
  });

  it("given only part of the secret alias, expect Inde's surprise to stay hidden", () => {
    expect(filterCommands(commands, "ours")).toEqual([]);
  });

  it("given the exact secret alias, expect Claire and Malenia's song to show up", () => {
    expect(filterCommands(commands, ":oursong").map((c) => c.label)).toEqual(["Play our song"]);
  });
});

describe("findCommandByAlias", () => {
  const commands = [{ label: "Write", alias: "w" }];

  it("given an alias typed with a colon, expect its command", () => {
    expect(findCommandByAlias(commands, ":w").label).toBe("Write");
  });

  it("given an alias nobody registered, expect undefined", () => {
    expect(findCommandByAlias(commands, ":wq")).toBeUndefined();
  });
});

describe("bufferNameFor", () => {
  it("given a known section, expect its file name", () => {
    expect(bufferNameFor("skills")).toBe("skills.lua");
  });

  it("given the github section, expect a yaml file", () => {
    expect(bufferNameFor("github")).toBe("side-quests.yml");
  });

  it("given education, expect a toml file the statusline recognizes", () => {
    expect(bufferNameFor("education")).toBe("education.toml");
    expect(fileTypeFor("education.toml")).toBe("toml");
  });

  it("given a section Melina just added, expect a markdown file", () => {
    expect(bufferNameFor("leyndell")).toBe("leyndell.md");
  });
});

describe("scrollPosition", () => {
  it("given the very start of the page, expect Top", () => {
    expect(scrollPosition(0, 4000)).toBe("Top");
  });

  it("given the very end of the page, expect Bot", () => {
    expect(scrollPosition(4000, 4000)).toBe("Bot");
  });

  it("given a quarter of the way down, expect 25%", () => {
    expect(scrollPosition(1000, 4000)).toBe("25%");
  });

  it("given a page that fits without scrolling, expect All", () => {
    expect(scrollPosition(0, 0)).toBe("All");
  });
});

describe("fileTypeFor", () => {
  it("given a tsx buffer, expect the name nvim gives it", () => {
    expect(fileTypeFor("index.tsx")).toBe("typescriptreact");
  });

  it("given an extension it has never seen, expect text", () => {
    expect(fileTypeFor("promise.ring")).toBe("text");
  });
});

describe("markMainStack", () => {
  const levels = [
    { name: "TypeScript", level: 4 },
    { name: "C#", level: 5 },
    { name: "Azure", level: 3 },
  ];

  it("given tools from the API, expect them in the same order", () => {
    expect(markMainStack(levels, []).map((tool) => tool.name)).toEqual(["TypeScript", "C#", "Azure"]);
  });

  it("given a main stack, expect only those tools flagged", () => {
    expect(markMainStack(levels, ["TypeScript"]).map((tool) => tool.isMain)).toEqual([true, false, false]);
  });

  it("given no levels at all, expect an empty list", () => {
    expect(markMainStack(undefined)).toEqual([]);
  });
});

describe("isMaxLevel", () => {
  it("given a tool rated 5 out of 5, expect it flagged", () => {
    expect(isMaxLevel(5, 5)).toBe(true);
  });

  it("given a tool rated 4 out of 5, expect it left alone", () => {
    expect(isMaxLevel(4, 5)).toBe(false);
  });
});

describe("spriteToPixels", () => {
  const palette = { K: "#000", S: "#fff" };

  it("given known characters, expect a pixel at each row and column", () => {
    expect(spriteToPixels(["K.", ".S"], palette)).toEqual([
      { x: 0, y: 0, color: "#000" },
      { x: 1, y: 1, color: "#fff" },
    ]);
  });

  it("given characters outside the palette, expect them skipped", () => {
    expect(spriteToPixels(["..?"], palette)).toEqual([]);
  });

  it("given a swap, expect the swapped color", () => {
    expect(spriteToPixels(["E"], palette, { E: "S" })).toEqual([{ x: 0, y: 0, color: "#fff" }]);
  });
});

describe("isInRegion", () => {
  const arm = { minX: 33, minY: 19, maxY: 37 };

  it("given a pixel inside the arm, expect true", () => {
    expect(isInRegion({ x: 40, y: 25 }, arm)).toBe(true);
  });

  it("given a pixel past any edge, expect false", () => {
    expect(isInRegion({ x: 20, y: 25 }, arm)).toBe(false);
    expect(isInRegion({ x: 40, y: 50 }, arm)).toBe(false);
  });
});

describe("pingPong", () => {
  it("given three frames, expect out and back without repeating the ends", () => {
    expect(pingPong(3)).toEqual([0, 1, 2, 1]);
  });

  it("given two frames, expect them to alternate", () => {
    expect(pingPong(2)).toEqual([0, 1]);
  });

  it("given one frame, expect it to hold still", () => {
    expect(pingPong(1)).toEqual([0]);
  });
});

describe("crouchLegs", () => {
  const leg = [
    { x: 0, y: 0, color: "thigh" },
    { x: 0, y: 1, color: "knee" },
    { x: 0, y: 2, color: "boot" },
  ];

  it("given a crouch, expect everything above the knee one pixel lower", () => {
    expect(crouchLegs(leg, 1)[0]).toEqual({ x: 0, y: 1, color: "thigh" });
  });

  it("given a crouch, expect the knee row folded away so nothing doubles up", () => {
    expect(crouchLegs(leg, 1).map((pixel) => pixel.color)).toEqual(["thigh", "boot"]);
  });

  it("given a crouch, expect the boots to stay planted", () => {
    expect(crouchLegs(leg, 1)[1]).toEqual({ x: 0, y: 2, color: "boot" });
  });
});

describe("overlaySprite", () => {
  const hand = { left: 1, top: 0, rows: ["S."] };

  it("given an overlay with a pixel, expect it painted on top", () => {
    expect(overlaySprite(["KKK"], hand)).toEqual(["KSK"]);
  });

  it("given a dot in the overlay, expect the pixel underneath to stay", () => {
    expect(overlaySprite(["KKK"], hand)[0][2]).toBe("K");
  });

  it("given an erase region, expect it cleared before painting", () => {
    expect(overlaySprite(["KKK"], hand, { minX: 2, maxX: 2, minY: 0, maxY: 0 })).toEqual(["KS."]);
  });
});

describe("pickIdleMove", () => {
  it("given a low roll, expect a look around", () => {
    expect(pickIdleMove(0.2)).toBe("look");
  });

  it("given a high roll, expect a wave hello to Inde", () => {
    expect(pickIdleMove(0.9)).toBe("wave");
  });
});

describe("idleMoveDelay", () => {
  it("given a roll of 0, expect the shortest wait", () => {
    expect(idleMoveDelay(0)).toBe(6000);
  });

  it("given a roll of 1, expect the longest wait", () => {
    expect(idleMoveDelay(1)).toBe(11000);
  });
});

describe("revealCircle", () => {
  it("given a start in either corner, expect a radius that reaches the opposite one", () => {
    expect(revealCircle({ x: 0, y: 0 }, { width: 300, height: 400 }).radius).toBe(500);
    expect(revealCircle({ x: 300, y: 400 }, { width: 300, height: 400 }).radius).toBe(500);
  });
});

describe("splitFeatured", () => {
  it("given roles with and without the flag, expect featured cards and an earlier list", () => {
    const projects = [{ title: "TerraSave" }, { title: "Roundtable Hold", featured: true }, { title: "Kijuju Relief", featured: false }];
    const { featured, earlier } = splitFeatured(projects);
    expect(featured.map((project) => project.title)).toEqual(["TerraSave", "Roundtable Hold"]);
    expect(earlier.map((project) => project.title)).toEqual(["Kijuju Relief"]);
  });

  it("given no list, expect both groups empty", () => {
    expect(splitFeatured()).toEqual({ featured: [], earlier: [] });
  });
});

describe("formatMonth", () => {
  it("given Claire and Inde's anniversary month, expect it written the way resumes do", () => {
    expect(formatMonth("2021-02")).toBe("Feb 2021");
  });

  it("given a bare year, expect it as is", () => {
    expect(formatMonth("2016")).toBe("2016");
  });
});

describe("formatRange", () => {
  it("given Claire's current job with no end, expect it to run to Present", () => {
    expect(formatRange("2021-03", null)).toBe("Mar 2021 – Present");
  });

  it("given a start and an end year, expect a closed range", () => {
    expect(formatRange("2017", "2019")).toBe("2017 – 2019");
  });

  it("given no start, expect null", () => {
    expect(formatRange(null, null)).toBeNull();
  });
});

describe("shortHash", () => {
  it("given a role, expect seven hex characters", () => {
    expect(shortHash("TerraSave:Rescue Lead")).toMatch(/^[0-9a-f]{7}$/);
  });

  it("given the same input twice, expect the same hash, and a different one for other input", () => {
    expect(shortHash("a")).toBe(shortHash("a"));
    expect(shortHash("a")).not.toBe(shortHash("b"));
  });
});

describe("careerCommits", () => {
  const projects = [
    { title: "TerraSave", roles: ["Field Agent", "Rescue Lead"], start: "2021", end: null },
    { title: "Mesón de Torrent", roles: [] },
    { title: "Roundtable Hold", roles: ["Intern"], start: "2015", end: "2016" },
  ];
  const commits = careerCommits(projects);

  it("given Claire's promotion, expect the newest title on top as HEAD", () => {
    expect(commits[0]).toMatchObject({ type: "promote", message: "Rescue Lead", isHead: true, years: "2021 – Present" });
  });

  it("given her first title at a company, expect a join commit with both names", () => {
    expect(commits[1]).toMatchObject({ type: "join", message: "Field Agent @ TerraSave", isHead: false, years: null });
  });

  it("given a company with no titles, expect a join commit named after the company", () => {
    expect(commits[2]).toMatchObject({ type: "join", message: "Mesón de Torrent", targetId: "work-meson-de-torrent" });
  });

  it("given the first job ever, expect the root commit", () => {
    expect(commits.at(-1)).toMatchObject({ type: "init", message: "Intern @ Roundtable Hold", years: "2015 – 2016" });
  });

  it("given no projects, expect no commits", () => {
    expect(careerCommits([])).toEqual([]);
  });
});

describe("usesTech", () => {
  const project = { technologies: ["AWS", "Docker (optional)"] };

  it("given a tool in the stack with a note in parentheses, expect a match", () => {
    expect(usesTech(project, "Docker")).toBe(true);
  });

  it("given a tool outside the stack, expect no match", () => {
    expect(usesTech(project, "PHP")).toBe(false);
  });

  it("given no tool picked, expect every project to match", () => {
    expect(usesTech(project, null)).toBe(true);
  });

  it("given two projects and one using PHP, expect a count of 1", () => {
    expect(countUsing([project, { technologies: ["PHP"] }], "PHP")).toBe(1);
  });
});

describe("localClock", () => {
  it("given a Wednesday evening in UTC, expect the afternoon in Tijuana", () => {
    // 21:30 UTC on a Wednesday is 14:30 in Tijuana during daylight time
    expect(localClock(new Date("2026-07-15T21:30:00Z"), "America/Tijuana")).toEqual({ hour: 14, time: "14:30", isWeekend: false });
  });

  it("given the Saturday of Malenia and Inde's picnic, expect a weekend", () => {
    expect(localClock(new Date("2026-07-18T18:00:00Z"), "America/Tijuana").isWeekend).toBe(true);
  });
});

describe("nowStatus", () => {
  it("given 3 AM on a weekday, expect asleep", () => {
    expect(nowStatus({ hour: 3, isWeekend: false })).toMatch(/asleep/);
  });

  it("given 10 AM on a weekday, expect code reviews", () => {
    expect(nowStatus({ hour: 10, isWeekend: false })).toMatch(/code reviews/);
  });

  it("given a weekend afternoon, expect family time", () => {
    expect(nowStatus({ hour: 15, isWeekend: true })).toMatch(/family/);
  });

  it("given the last hour of the day, expect a status anyway", () => {
    expect(nowStatus({ hour: 23, isWeekend: false })).toBeTruthy();
  });
});

describe("buildFileTree", () => {
  const sections = ["home", "about", "work", "projects", "github", "contact"];
  const tree = buildFileTree(sections, {
    projects: [{ title: "TerraSave" }, { title: "Mesón de Torrent", featured: false }],
    caseStudies: [{ slug: "love-notes" }],
    repos: [{ name: "shared-playlist" }],
  });

  it("given the home section, expect the hero as a single file", () => {
    expect(tree[0]).toMatchObject({ name: "index.tsx", isDirectory: false });
  });

  it("given the about section, expect the philosophy, the story and the day log inside", () => {
    expect(tree.find((node) => node.sectionId === "about").children.map((child) => child.name)).toEqual(["philosophy.md", "about.md", "day.log"]);
  });

  it("given featured and earlier jobs, expect the career log, each featured job and the earlier log under experience", () => {
    expect(tree.find((node) => node.sectionId === "work")).toMatchObject({
      name: "experience/",
      children: [
        { name: "career.log", targetId: "career-log" },
        { name: "01-terrasave.json", targetId: "work-terrasave" },
        { name: "earlier.log", targetId: "work-earlier" },
      ],
    });
  });

  it("given Inde's love notes case study, expect a file of its own", () => {
    expect(tree.find((node) => node.sectionId === "projects").children).toEqual([{ name: "love-notes.ts", targetId: "project-love-notes" }]);
  });

  it("given the shared playlist repo, expect it inside the side quests folder", () => {
    expect(tree.find((node) => node.sectionId === "github")).toMatchObject({
      name: "side-quests/",
      children: [{ name: "shared-playlist.git", targetId: "repo-shared-playlist" }],
    });
  });

  it("given the contact section, expect a single file", () => {
    expect(tree.at(-1)).toMatchObject({ name: "contact.sh", isDirectory: false, children: [] });
  });

  it("given a section whose data has not arrived yet, expect a single file for now", () => {
    expect(buildFileTree(["github"])[0]).toMatchObject({ name: "side-quests.yml", isDirectory: false });
  });
});

describe("letterWeight", () => {
  it("given the cursor right on a letter, expect full weight", () => {
    expect(letterWeight(0)).toBe(820);
  });

  it("given the cursor out of reach, expect the resting weight", () => {
    expect(letterWeight(240)).toBe(500);
    expect(letterWeight(900)).toBe(500);
  });

  it("given the cursor halfway, expect a weight in between", () => {
    expect(letterWeight(120)).toBeGreaterThan(500);
    expect(letterWeight(120)).toBeLessThan(820);
  });
});

describe("brandColorFor", () => {
  it("given React, expect its own cyan", () => {
    expect(brandColorFor("React")).toBe("#61dafb");
  });

  it("given a name with an API note after it, expect the note ignored", () => {
    expect(brandColorFor("Docker (optional)")).toBe("#2496ed");
  });

  it("given a black logo like Next.js, expect null so the text color takes over", () => {
    expect(brandColorFor("Next.js")).toBeNull();
  });

  it("given Torrent's saddle polish, expect no brand color", () => {
    expect(brandColorFor("Torrent Saddle Polish")).toBeNull();
  });
});

describe("softBeams", () => {
  it("given one beam, expect it to fade in and out around its angle", () => {
    expect(softBeams([{ at: 90, width: 4, strength: 0.5 }], "gold")).toBe(
      "conic-gradient(from 0deg, transparent 0deg, transparent 86deg, color-mix(in oklab, gold 50%, transparent) 90deg, transparent 94deg, transparent 360deg)"
    );
  });

  it("given beams out of order, expect them laid out by angle", () => {
    const gradient = softBeams([{ at: 200, width: 2, strength: 1 }, { at: 20, width: 2, strength: 1 }], "gold");
    expect(gradient.indexOf("20deg")).toBeLessThan(gradient.indexOf("200deg"));
  });

  it("given no beams, expect none", () => {
    expect(softBeams([], "gold")).toBe("none");
  });
});

describe("glowFalloff", () => {
  it("given the center, expect full strength", () => {
    expect(glowFalloff(0)).toBe(1);
  });

  it("given the edge, expect zero", () => {
    expect(glowFalloff(1)).toBe(0);
  });

  it("given steps outward from the center, expect each one softer than the last", () => {
    const samples = [0, 0.2, 0.4, 0.6, 0.8, 1].map(glowFalloff);
    samples.slice(1).forEach((value, index) => expect(value).toBeLessThan(samples[index]));
  });
});

describe("easedGlow", () => {
  it("given a strength and a reach, expect it to start at that strength and settle to transparent at the reach", () => {
    const glow = easedGlow("red", { strength: 0.4, reach: 80, steps: 4 });
    expect(glow.startsWith("radial-gradient(closest-side at center, color-mix(in oklab, red 40%, transparent) 0%")).toBe(true);
    expect(glow.endsWith("color-mix(in oklab, red 0%, transparent) 80%)")).toBe(true);
  });

  it("given a shape and a position, expect the gradient to use them", () => {
    expect(easedGlow("red", { shape: "ellipse", at: "50% 40%" })).toMatch(/^radial-gradient\(ellipse at 50% 40%/);
  });
});

describe("softRing", () => {
  it("given a ring at 70%, expect it to peak there and fade on both sides", () => {
    const ring = softRing("gold", { strength: 0.5, at: 70, spread: 20, steps: 2 });
    expect(ring).toBe(
      "radial-gradient(closest-side, color-mix(in oklab, gold 0%, transparent) 50%, color-mix(in oklab, gold 28.1%, transparent) 60%, color-mix(in oklab, gold 50%, transparent) 70%, color-mix(in oklab, gold 28.1%, transparent) 80%, color-mix(in oklab, gold 0%, transparent) 90%)"
    );
  });

  it("given a ring near the edge, expect it to stay inside its circle", () => {
    expect(softRing("gold", { at: 95, spread: 20 })).not.toMatch(/10[1-9]%|11\d%/);
  });
});

describe("parseCssColor", () => {
  it("given a six digit hex, expect its rgb channels", () => {
    expect(parseCssColor("#ff0000")).toEqual([1, 0, 0]);
  });

  it("given a three digit hex, expect its rgb channels", () => {
    expect(parseCssColor("#0f0")).toEqual([0, 1, 0]);
  });

  it("given rgb with spaces or commas, expect the same channels", () => {
    expect(parseCssColor("rgb(0 0 255)")).toEqual([0, 0, 1]);
    expect(parseCssColor("rgba(0, 0, 255, 0.5)")).toEqual([0, 0, 1]);
  });

  it("given a css variable, expect null", () => {
    expect(parseCssColor("var(--color-haligtree)")).toBeNull();
  });
});

describe("mixColors", () => {
  it("given two colors and 0.5, expect the color halfway between", () => {
    expect(mixColors([0, 0, 0], [1, 0.5, 0], 0.5)).toEqual([0.5, 0.25, 0]);
  });
});

describe("auroraLayout", () => {
  it("given a wide screen, expect each light to reach 40% of the longer side", () => {
    expect(auroraLayout({ width: 1000, height: 500 }).reach).toBe(400);
  });

  it("given a wide screen, expect the first light left of the second", () => {
    const { first, second } = auroraLayout({ width: 1000, height: 500 });
    expect(first.x).toBeLessThan(second.x);
  });

  it("given a tall phone, expect the first light above the second", () => {
    const { first, second } = auroraLayout({ width: 390, height: 844 });
    expect(first.y).toBeLessThan(second.y);
  });

  it("given a scroll from top to bottom, expect the lights to drift in opposite directions", () => {
    const top = auroraLayout({ width: 1000, height: 500, progress: 0 });
    const bottom = auroraLayout({ width: 1000, height: 500, progress: 1 });
    expect(bottom.first.x).toBeGreaterThan(top.first.x);
    expect(bottom.second.x).toBeLessThan(top.second.x);
  });
});

describe("hintLabels", () => {
  it("given enough letters, expect single letter labels", () => {
    expect(hintLabels(3, "abc")).toEqual(["a", "b", "c"]);
  });

  it("given more targets than short labels, expect every label to grow together", () => {
    expect(hintLabels(5, "ab")).toEqual(["aaa", "aab", "aba", "abb", "baa"]);
  });

  it("given many targets, expect no label to be the start of another", () => {
    const labels = hintLabels(40);
    labels.forEach((label) => expect(labels.filter((other) => other !== label && other.startsWith(label))).toEqual([]));
  });

  it("given zero targets, expect no labels", () => {
    expect(hintLabels(0)).toEqual([]);
  });
});

describe("stepSection", () => {
  const ids = ["home", "about", "work"];

  it("given a step forward from about, expect work", () => {
    expect(stepSection(ids, "about", 1)).toBe("work");
  });

  it("given a step back from about, expect home", () => {
    expect(stepSection(ids, "about", -1)).toBe("home");
  });

  it("given a step forward from the last section, expect to stay there", () => {
    expect(stepSection(ids, "work", 1)).toBe("work");
  });

  it("given a section it doesn't know, expect home", () => {
    expect(stepSection(ids, "the-haligtree", 1)).toBe("home");
  });
});

describe("dayBlocks", () => {
  it("given Claire's day, expect it to start and end at midnight", () => {
    const blocks = dayBlocks();
    expect(blocks[0].from).toBe(0);
    expect(blocks.at(-1).until).toBe(24);
  });

  it("given two blocks in a row, expect no gap between them", () => {
    const blocks = dayBlocks();
    blocks.slice(1).forEach((block, index) => expect(block.from).toBe(blocks[index].until));
  });
});

describe("hoursAhead", () => {
  it("given Inde visiting from the same timezone, expect zero hours apart", () => {
    const date = new Date();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    expect(hoursAhead(date, zone)).toBe(0);
  });

  it("given Malenia calling from Kiritimati, expect the gap within half a day", () => {
    const value = hoursAhead(new Date(), "Pacific/Kiritimati");
    expect(Math.abs(value)).toBeLessThanOrEqual(12);
  });
});
