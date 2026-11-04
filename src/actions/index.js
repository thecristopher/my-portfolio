export const splitParagraphs = (text = "") =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

// the API has entries like "Docker (optional)" and we only want the tool name
export const cleanTechName = (name = "") =>
  name.replace(/\s*\(.*?\)\s*/g, "").trim();

export const sectionIdFromUrl = (url = "") => url.split("#")[1] ?? "";

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

/** The sections the page renders, in the order they read. */
export const PAGE_SECTIONS = ["home", "about", "work", "skills", "github", "contact"];

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
