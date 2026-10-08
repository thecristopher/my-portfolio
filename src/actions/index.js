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

const FILE_TYPES = { tsx: "typescriptreact", md: "markdown", json: "json", lua: "lua", sh: "sh" };

// what nvim would print as the filetype in the statusline
export const fileTypeFor = (bufferName = "") => FILE_TYPES[bufferName.split(".").pop()] ?? "text";

export const THEMES = ["kanagawa", "catppuccin", "rose-pine", "ember"];
export const DEFAULT_THEME = "kanagawa";

export const resolveTheme = (saved) => (THEMES.includes(saved) ? saved : DEFAULT_THEME);

// keeps the API's relevance order and flags which tools belong to the main stack
export const markMainStack = (skillLevels = [], mainStack = []) =>
  skillLevels.map((skill) => ({ ...skill, isMain: mainStack.includes(skill.name) }));
