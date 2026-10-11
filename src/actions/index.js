export const splitParagraphs = (text = "") =>
  text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

export const extractYearsOfExperience = (text = "") => {
  const match = text.match(/(\d+\+?)\s+years/i);
  return match ? match[1] : null;
};

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

// each word gets its own slice of the scroll progress so they light up in order
export const wordRevealRange = (index, total) => {
  const start = index / total;
  return [start, start + 1 / total];
};

// cards further back in the stack shrink a little more, so the pile reads as depth
export const stackScale = (index, total) => 1 - (total - index - 1) * 0.04;

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
  work: "work.json",
  github: "repos.yml",
  skills: "skills.lua",
  contact: "contact.sh",
};

export const bufferNameFor = (sectionId = "") => BUFFER_NAMES[sectionId] ?? `${sectionId}.md`;

// the same Top / Bot / percent readout nvim shows in its ruler
export const scrollPosition = (scrollY, maxScroll) => {
  if (maxScroll <= 0) return "All";
  if (scrollY <= 0) return "Top";
  if (scrollY >= maxScroll) return "Bot";
  return `${Math.round((scrollY / maxScroll) * 100)}%`;
};

// relativenumber style: the middle row shows the real line, every other row its distance from it
export const gutterLines = (currentLine, count) => {
  const middle = Math.floor(count / 2);
  return Array.from({ length: count }, (_, row) => {
    const distance = Math.abs(row - middle);
    const isCurrent = distance === 0;
    return { row, label: isCurrent ? currentLine : distance, isCurrent };
  });
};

const FILE_TYPES = { tsx: "typescriptreact", md: "markdown", json: "json", lua: "lua", sh: "sh", yml: "yaml" };

// what nvim would print as the filetype in the statusline
export const fileTypeFor = (bufferName = "") => FILE_TYPES[bufferName.split(".").pop()] ?? "text";

export const THEMES = ["kanagawa", "catppuccin", "rose-pine", "ember"];
export const DEFAULT_THEME = "kanagawa";

export const resolveTheme = (saved) => (THEMES.includes(saved) ? saved : DEFAULT_THEME);

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

// forks and archived repos aren't really mine anymore, the rest go by stars, then by what I touched last
export const pickPersonalRepos = (repos = []) =>
  repos
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || b.pushed_at.localeCompare(a.pushed_at));

const PITCH_MAX_CHARS = 220;
// headings, badges, html, tables, lists and quotes aren't a pitch, so a paragraph has to start with plain text
const isProse = (line) => /^[A-Za-z0-9*_`"'(]/.test(line) && !/^\[!\[/.test(line);

const stripMarkdown = (text) =>
  text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// the first real paragraph of a README, for repos that never got a GitHub description
export const readmePitch = (markdown = "") => {
  let isInCode = false;
  const paragraph = [];
  for (const rawLine of markdown.split("\n")) {
    const line = rawLine.trim();
    if (line.startsWith("```")) isInCode = !isInCode;
    else if (isInCode) continue;
    else if (paragraph.length > 0 && !line) break;
    else if (paragraph.length > 0 || isProse(line)) paragraph.push(line);
  }
  const pitch = stripMarkdown(paragraph.join(" "));
  if (pitch.length <= PITCH_MAX_CHARS) return pitch;
  return `${pitch.slice(0, pitch.lastIndexOf(" ", PITCH_MAX_CHARS))}…`;
};

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
