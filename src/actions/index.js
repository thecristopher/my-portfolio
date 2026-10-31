export const splitParagraphs = (text = "") =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

// the API has entries like "Docker (optional)" and we only want the tool name
export const cleanTechName = (name = "") =>
  name.replace(/\s*\(.*?\)\s*/g, "").trim();

export const sectionIdFromUrl = (url = "") => url.split("#")[1] ?? "";

export const formatIndex = (index) => String(index + 1).padStart(2, "0");

export const hostnameFromUrl = (url = "") => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

export const splitWords = (text = "") => text.split(/\s+/).filter(Boolean);

export const splitStatValue = (value) => {
  const match = String(value).match(/^(\d+)(.*)$/);
  return match ? { number: Number(match[1]), suffix: match[2] } : { number: null, suffix: String(value) };
};

export const slugify = (text = "") =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// people type ":about" or "about" in the cmdline, both should mean the same thing
const normalizeQuery = (query = "") => query.trim().toLowerCase().replace(/^:/, "");

export const findCommandByAlias = (commands, query) => {
  const needle = normalizeQuery(query);
  return commands.find((command) => command.alias === needle);
};

// secret commands stay hidden until someone types their exact alias
export const filterCommands = (commands, query = "") => {
  const needle = normalizeQuery(query);
  const secret = findCommandByAlias(commands, needle);
  if (secret?.hidden) return [secret];

  const visible = commands.filter((command) => !command.hidden);
  if (!needle) return visible;
  return visible.filter((command) =>
    `${command.label} ${command.group} ${command.alias ?? ""} ${command.keywords ?? ""}`.toLowerCase().includes(needle)
  );
};

const BUFFER_NAMES = {
  home: "index.tsx",
  about: "about.md",
  work: "experience.json",
  skills: "skills.lua",
  github: "side-quests.yml",
  contact: "contact.sh",
};

/** The sections the page renders, in the order they read. */
export const PAGE_SECTIONS = Object.keys(BUFFER_NAMES);

// the same api answer always maps to the same list, so components reading it only rerender when the nav changes
const pageLinksCache = new WeakMap();

/**
 * Keeps only the nav links whose section the page renders, so a link the API still serves never points at nothing.
 * @param {{ title: string, url: string }[]} links the nav as the API serves it
 * @returns {{ title: string, url: string }[]} the links with a section on the page, in the API's order
 */
export const pageLinks = (links = []) => {
  if (pageLinksCache.has(links)) return pageLinksCache.get(links);
  const kept = links.filter((link) => PAGE_SECTIONS.includes(sectionIdFromUrl(link.url)));
  pageLinksCache.set(links, kept);
  return kept;
};

export const bufferNameFor = (sectionId = "") => BUFFER_NAMES[sectionId] ?? `${sectionId}.md`;

// the same Top / Bot / percent readout nvim shows in its ruler
export const scrollPosition = (scrollY, maxScroll) => {
  if (maxScroll <= 0) return "All";
  if (scrollY <= 0) return "Top";
  if (scrollY >= maxScroll) return "Bot";
  return `${Math.round((scrollY / maxScroll) * 100)}%`;
};

const FILE_TYPES = { tsx: "typescriptreact", ts: "typescript", md: "markdown", json: "json", lua: "lua", sh: "sh", yml: "yaml", toml: "toml" };

// what nvim would print as the filetype in the statusline
export const fileTypeFor = (bufferName = "") => FILE_TYPES[bufferName.split(".").pop()] ?? "text";

export const isMaxLevel = (level, maxLevel) => level >= maxLevel;

// keeps the API's relevance order and flags which tools belong to the main stack
export const markMainStack = (skillLevels = [], mainStack = []) =>
  skillLevels.map((skill) => ({ ...skill, isMain: mainStack.includes(skill.name) }));

// turns text rows into colored pixels, swaps let a frame repaint some of them (like a blink)
export const spriteToPixels = (rows = [], palette = {}, swaps = {}) =>
  rows.flatMap((row, y) =>
    [...row].flatMap((char, x) => {
      const color = palette[swaps[char] ?? char];
      return color ? [{ x, y, color }] : [];
    })
  );

/**
 * Groups sprite pixels by color into one svg path each, a unit square per pixel.
 * @param {{ x: number, y: number, color: string }[]} pixels the pixels of one layer
 * @returns {{ color: string, d: string }[]} one path per color, in the order the colors first appear
 */
export const pixelsToPaths = (pixels = []) => {
  const byColor = new Map();
  for (const { x, y, color } of pixels) byColor.set(color, `${byColor.get(color) ?? ""}M${x} ${y}h1v1h-1z`);
  return [...byColor].map(([color, d]) => ({ color, d }));
};

/**
 * A ring of pixels on a square grid, the 16 bit way to draw a shockwave or a halo.
 * @param {number} size width and height of the grid
 * @param {number} thickness how many pixels deep the ring is
 * @param {string} fill the sprite character every ring pixel gets
 * @returns {string[]} sprite rows, "." where the ring isn't
 */
export const pixelRingRows = (size, thickness = 1, fill = "#") => {
  const center = (size - 1) / 2;
  const outer = size / 2;
  return Array.from({ length: size }, (_, y) =>
    Array.from({ length: size }, (_, x) => {
      const distance = Math.hypot(x - center, y - center);
      return distance <= outer && distance > outer - thickness ? fill : ".";
    }).join("")
  );
};

export const isInRegion = ({ x, y }, { minX = -Infinity, maxX = Infinity, minY = -Infinity, maxY = Infinity }) =>
  x >= minX && x <= maxX && y >= minY && y <= maxY;

// paints an overlay onto sprite rows after clearing a region, used to swap the fist for an open hand
export const overlaySprite = (rows = [], overlay = { left: 0, top: 0, rows: [] }, eraseRegion = null) =>
  rows.map((row, y) =>
    [...row]
      .map((char, x) => {
        const overlayChar = overlay.rows[y - overlay.top]?.[x - overlay.left];
        if (overlayChar && overlayChar !== ".") return overlayChar;
        if (eraseRegion && isInRegion({ x, y }, eraseRegion)) return ".";
        return char;
      })
      .join("")
  );

// bends the knees by one pixel: everything above the knee drops a row and the knee row folds away underneath
export const crouchLegs = (pixels = [], kneeRow) =>
  pixels.flatMap((pixel) => {
    if (pixel.y === kneeRow) return [];
    return pixel.y < kneeRow ? [{ ...pixel, y: pixel.y + 1 }] : [pixel];
  });

// walks up to the last index and back down without repeating the ends: 3 frames play as 0 1 2 1
export const pingPong = (count) => {
  const forward = [...Array(count).keys()];
  const back = forward.slice(1, -1).reverse();
  return [...forward, ...back];
};

// the avatar mostly glances around and sometimes waves, so he never looks like he's on a timer
export const pickIdleMove = (roll = Math.random()) => (roll < 0.6 ? "look" : "wave");

export const idleMoveDelay = (roll = Math.random(), minMs = 6000, maxMs = 11000) =>
  Math.round(minMs + roll * (maxMs - minMs));

// recent roles get a full card, older ones a single line. a project without the flag counts as featured
export const splitFeatured = (projects = []) => ({
  featured: projects.filter((project) => project.featured !== false),
  earlier: projects.filter((project) => project.featured === false),
});

// where the theme reveal circle starts, and how big it has to grow to cover the farthest corner from there
export const revealCircle = ({ x, y }, { width, height }) => ({
  x,
  y,
  radius: Math.hypot(Math.max(x, width - x), Math.max(y, height - y)),
});

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * Formats a "2021" or "2021-03" date the way resumes print it.
 * @param {string | null} value year or year and month
 * @returns {string | null} like "Mar 2021" or "2021", null when empty
 */
export const formatMonth = (value) => {
  if (!value) return null;
  const [year, month] = value.split("-");
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
};

/**
 * The dates a role ran, "Present" while it's still going.
 * @param {string | null} start when it started
 * @param {string | null} end when it ended, null while current
 * @returns {string | null} like "Mar 2021 – Present", null when the start isn't known
 */
export const formatRange = (start, end) => {
  const from = formatMonth(start);
  if (!from) return null;
  return `${from} – ${formatMonth(end) ?? "Present"}`;
};

// a stable fake sha per commit, so the career log reads like git without changing between visits
export const shortHash = (text = "") => {
  let hash = 0x811c9dc5;
  for (const char of text) hash = Math.imul(hash ^ char.codePointAt(0), 0x01000193) >>> 0;
  return hash.toString(16).padStart(8, "0").slice(-7);
};

// every title I held becomes a commit, newest on top like `git log`. the first title at a company is a join,
// the next ones are promotions, and the very first job is the root commit
export const careerCommits = (projects = []) => {
  const commits = projects.flatMap((project) => {
    const roles = project.roles?.length ? project.roles : [null];
    const years = formatRange(project.start, project.end);
    return roles
      .map((role, step) => ({
        hash: shortHash(`${project.title}:${role ?? step}`),
        type: step === 0 ? "join" : "promote",
        message: step === 0 ? [role, project.title].filter(Boolean).join(" @ ") : role,
        company: project.title,
        targetId: `work-${slugify(project.title)}`,
      }))
      .reverse()
      .map((commit, index) => ({ ...commit, years: index === 0 ? years : null, isNewestAtCompany: index === 0 }));
  });
  if (commits.length > 0) commits[commits.length - 1].type = "init";
  return commits.map((commit, index) => ({ ...commit, isHead: index === 0 }));
};

// whether a project shipped with a tool, used to light up the work cards for one skill
export const usesTech = (project, tech) => !tech || (project.technologies ?? []).some((name) => cleanTechName(name) === tech);

export const countUsing = (projects = [], tech) => projects.filter((project) => usesTech(project, tech)).length;

// the hour and weekday where I live, whatever timezone the visitor is in
export const localClock = (date, timeZone) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" })
      .formatToParts(date)
      .map((part) => [part.type, part.value])
  );
  return { hour: Number(parts.hour), time: `${parts.hour}:${parts.minute}`, isWeekend: ["Sat", "Sun"].includes(parts.weekday) };
};

export const WEEKDAY_STATUS = [
  [7, "asleep. the pipeline isn't"],
  [9, "coffee, then standup"],
  [13, "in 1:1s and code reviews"],
  [14, "lunch break"],
  [18, "shipping with the team"],
  [21, "working out, then family time"],
  [24, "reading manga or losing to a boss"],
];

const WEEKEND_STATUS = [
  [8, "asleep, it's the weekend"],
  [20, "off the clock with the family"],
  [24, "probably in a boss fight"],
];

// a guess at what I'm up to right now, for the statusline
export const nowStatus = ({ hour, isWeekend }) =>
  (isWeekend ? WEEKEND_STATUS : WEEKDAY_STATUS).find(([until]) => hour < until)[1];

const file = (name, targetId) => ({ name, targetId });

// what each section holds when the file tree opens it as a directory. a section left out stays a single file
const SECTION_FILES = {
  work: ({ projects }) => {
    const { featured, earlier } = splitFeatured(projects);
    return [
      file("career.log", "career-log"),
      ...featured.map((project, index) => file(`${formatIndex(index)}-${slugify(project.title)}.json`, `work-${slugify(project.title)}`)),
      ...(earlier.length > 0 ? [file("earlier.log", "work-earlier")] : []),
    ];
  },
  github: ({ repos }) => repos.map((repo) => file(`${repo.name}.git`, `repo-${slugify(repo.name)}`)),
};

const DIRECTORY_NAMES = { github: "side-quests", work: "experience" };

// the sidebar like neo-tree draws it: each section with something inside as a directory, the rest as plain
// files in nav order
export const buildFileTree = (sectionIds = [], { projects = [], repos = [] } = {}) =>
  sectionIds.map((sectionId) => {
    const children = SECTION_FILES[sectionId]?.({ projects, repos }) ?? [];
    if (children.length === 0) return { sectionId, name: bufferNameFor(sectionId), isDirectory: false, children };
    return { sectionId, name: `${DIRECTORY_NAMES[sectionId] ?? sectionId}/`, isDirectory: true, children };
  });

// how heavy a letter of the hero name gets with the cursor this many pixels away: full weight right on top of it,
// easing back to the resting weight by the edge of the reach
export const letterWeight = (distance, { rest = 500, peak = 820, reach = 240 } = {}) => {
  const closeness = Math.max(0, 1 - distance / reach);
  return rest + (peak - rest) * closeness * closeness * (3 - 2 * closeness);
};

// each tool in the color its own logo uses. the ones whose logo is plain black follow the text color instead
const TECH_COLORS = {
  React: "#61dafb",
  "Next.js": null,
  TypeScript: "#3178c6",
  JavaScript: "#f7df1e",
  "Node.js": "#5fa04e",
  AWS: "#ff9900",
  Lambda: "#ff9900",
  Bedrock: "#01a88d",
  DynamoDB: "#527fff",
  Aurora: "#527fff",
  Serverless: "#fd5750",
  Docker: "#2496ed",
  Kubernetes: "#326ce5",
  Terraform: "#844fba",
  "GitHub Actions": "#2088ff",
  OpenSearch: "#00a3e0",
  PostgreSQL: "#4169e1",
  MySQL: "#4479a1",
  "SQL Server": "#cc2927",
  SQL: "#e38c00",
  PHP: "#777bb4",
  Symfony: null,
  Python: "#4b8bbe",
  "C#": "#9b4f96",
  ".NET": "#512bd4",
  MVC: "#512bd4",
  Azure: "#0089d6",
  LLMs: "#d97757",
  Rust: "#dea584",
  Lua: "#51a0cf",
  Go: "#00add8",
  Swift: "#f05138",
  Shell: "#89e051",
};

export const brandColorFor = (tech = "") => TECH_COLORS[cleanTechName(tech)] ?? null;

/**
 * Every language a repo is built with, main one first. Falls back to GitHub's single language for older data.
 * @param {{ language?: string | null, languages?: string[] }} repo a repo as the service sends it
 * @returns {string[]} language names, empty when GitHub found none
 */
export const repoLanguages = ({ language, languages } = {}) => {
  if (languages?.length) return languages;
  return language ? [language] : [];
};

// a conic gradient of soft light beams. each beam fades in and out around its own angle instead of starting on a
// hard edge, and they sit at uneven angles with uneven widths and strengths, so it reads as light, not a sunburst
export const softBeams = (beams = [], color = "white") => {
  const stops = [...beams]
    .sort((a, b) => a.at - b.at)
    .flatMap(({ at, width, strength }) => [
      `transparent ${at - width}deg`,
      `color-mix(in oklab, ${color} ${Math.round(strength * 100)}%, transparent) ${at}deg`,
      `transparent ${at + width}deg`,
    ]);
  return stops.length === 0 ? "none" : `conic-gradient(from 0deg, transparent 0deg, ${stops.join(", ")}, transparent 360deg)`;
};

// the 16 bit take on god rays: every beam a hard edged wedge of flat color, the way an item get screen draws them
export const pixelBeams = (beams = [], color = "white") => {
  const stops = [...beams]
    .sort((a, b) => a.at - b.at)
    .flatMap(({ at, width, strength }) => {
      const tint = `color-mix(in oklab, ${color} ${Math.round(strength * 100)}%, transparent)`;
      return [`transparent ${at - width}deg`, `${tint} ${at - width}deg`, `${tint} ${at + width}deg`, `transparent ${at + width}deg`];
    });
  return stops.length === 0 ? "none" : `conic-gradient(from 0deg, transparent 0deg, ${stops.join(", ")}, transparent 360deg)`;
};

// how strong a glow is at a point between its center (0) and its edge (1). flat at both ends, so there's no hot
// spot in the middle and no ring where it runs out, the falloff a straight two stop gradient can't give
export const glowFalloff = (t) => (1 - t * t) ** 2;

// a radial glow built from that falloff, many stops deep so the eye can't find where it ends
export const easedGlow = (color, { strength = 1, reach = 100, shape = "closest-side", at = "center", steps = 24 } = {}) => {
  const stops = Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps;
    const amount = Math.round(strength * glowFalloff(t) * 1000) / 10;
    return `color-mix(in oklab, ${color} ${amount}%, transparent) ${Math.round(t * reach * 10) / 10}%`;
  });
  return `radial-gradient(${shape} at ${at}, ${stops.join(", ")})`;
};

// a ring of light with the same eased falloff on both sides, for a shockwave that reads as a pulse of light
// instead of a drawn circle. at and spread are percentages of the radius
export const softRing = (color, { strength = 0.7, at = 76, spread = 24, steps = 8 } = {}) => {
  const stops = Array.from({ length: steps * 2 + 1 }, (_, index) => {
    const offset = index / steps - 1;
    const amount = Math.round(strength * glowFalloff(Math.abs(offset)) * 1000) / 10;
    const position = Math.min(100, Math.max(0, at + offset * spread));
    return `color-mix(in oklab, ${color} ${amount}%, transparent) ${Math.round(position * 10) / 10}%`;
  });
  return `radial-gradient(closest-side, ${stops.join(", ")})`;
};

// a colorscheme color as the 0 to 1 channels a shader wants. reads the hex and rgb() forms the stylesheet uses
export const parseCssColor = (value = "") => {
  const text = value.trim();
  const hex = text.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const digits = hex[1].length === 3 ? [...hex[1]].map((digit) => digit + digit).join("") : hex[1];
    return [0, 2, 4].map((at) => parseInt(digits.slice(at, at + 2), 16) / 255);
  }
  const rgb = text.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i);
  if (rgb) return rgb.slice(1, 4).map((channel) => Number(channel) / 255);
  return null;
};

export const mixColors = (from, to, amount) => from.map((channel, index) => channel + (to[index] - channel) * amount);

// vimium's hint letters: home row first, the keys easiest to reach without looking
export const HINT_ALPHABET = "sadfjklewcmpgh";

// a label for every hint, all the same length so none is the start of another and typing one never stops early
export const hintLabels = (count, alphabet = HINT_ALPHABET) => {
  if (count <= 0) return [];
  let length = 1;
  while (alphabet.length ** length < count) length += 1;
  return Array.from({ length: count }, (_, index) => {
    let label = "";
    let rest = index;
    for (let at = 0; at < length; at += 1) {
      label = alphabet[rest % alphabet.length] + label;
      rest = Math.floor(rest / alphabet.length);
    }
    return label;
  });
};

// the section after or before the one you're reading, held at the ends like vim's ]] and [[ do at the last section
export const stepSection = (ids = [], currentId, direction) => {
  const at = ids.indexOf(currentId);
  if (at === -1) return ids[0] ?? null;
  return ids[Math.min(ids.length - 1, Math.max(0, at + direction))];
};