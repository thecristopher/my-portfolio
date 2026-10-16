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
  manifesto: "philosophy.md",
  about: "about.md",
  work: "work.json",
  education: "education.toml",
  github: "repos.yml",
  skills: "skills.lua",
  contact: "contact.sh",
};

export const bufferNameFor = (sectionId = "") => BUFFER_NAMES[sectionId] ?? `${sectionId}.md`;

// the other way around, so a secret's hint can jump to the buffer it hides in
export const sectionIdForBuffer = (bufferName) =>
  Object.keys(BUFFER_NAMES).find((sectionId) => BUFFER_NAMES[sectionId] === bufferName) ?? null;

// the same Top / Bot / percent readout nvim shows in its ruler
export const scrollPosition = (scrollY, maxScroll) => {
  if (maxScroll <= 0) return "All";
  if (scrollY <= 0) return "Top";
  if (scrollY >= maxScroll) return "Bot";
  return `${Math.round((scrollY / maxScroll) * 100)}%`;
};

const FILE_TYPES = { tsx: "typescriptreact", md: "markdown", json: "json", lua: "lua", sh: "sh", yml: "yaml", toml: "toml" };

// what nvim would print as the filetype in the statusline
export const fileTypeFor = (bufferName = "") => FILE_TYPES[bufferName.split(".").pop()] ?? "text";

export const THEMES = ["kanagawa", "catppuccin", "rose-pine", "ember", "lotus"];
export const DEFAULT_THEME = "kanagawa";
// the one light colorscheme, picked for anyone whose system is set to light until they choose another
export const LIGHT_THEME = "lotus";

export const resolveTheme = (saved, prefersLight = false) => {
  if (THEMES.includes(saved)) return saved;
  return prefersLight ? LIGHT_THEME : DEFAULT_THEME;
};

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


// the hero stat reads "2x" so it counts up like the others but still says certifications, not companies
export const timesCertified = (certifications = []) => (certifications.length > 0 ? `${certifications.length}x` : null);

export const formatYears = (start, end) => {
  if (start && end) return start === end ? `${start}` : `${start} – ${end}`;
  return start ? `${start} – present` : null;
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
    const years = formatYears(project.start_year, project.end_year);
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

const WEEKDAY_STATUS = [
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

// the nav from the api skips the philosophy, but it is a buffer too, right after the hero
export const withManifesto = (sectionIds = []) =>
  sectionIds.includes("home") ? ["home", "manifesto", ...sectionIds.filter((id) => id !== "home")] : sectionIds;

const file = (name, targetId) => ({ name, targetId });

// what each section holds when the file tree opens it as a directory. a section left out stays a single file
const SECTION_FILES = {
  about: () => [file("about.md", "bio"), file("profile.json", "profile")],
  work: ({ projects }) => {
    const { featured, earlier } = splitFeatured(projects);
    return [
      file("career.log", "career-log"),
      ...featured.map((project, index) => file(`${formatIndex(index)}-${slugify(project.title)}.json`, `work-${slugify(project.title)}`)),
      ...(earlier.length > 0 ? [file("earlier.log", "work-earlier")] : []),
    ];
  },
  education: ({ hasCertifications }) => [file("degree.toml", "degree"), ...(hasCertifications ? [file("aws-certs.toml", "certifications")] : [])],
  github: ({ repos }) => repos.map((repo) => file(`${repo.name}.git`, `repo-${slugify(repo.name)}`)),
  skills: () => [file("cards.lua", "skill-cards"), file("checkhealth", "checkhealth")],
};

const DIRECTORY_NAMES = { github: "side-quests" };

// the sidebar like nvim-tree draws it: the hero and the philosophy as files up top, each section with
// something inside as a directory, and the rest as plain files in nav order
export const buildFileTree = (sectionIds = [], { projects = [], repos = [], hasCertifications = false } = {}) =>
  withManifesto(sectionIds).map((sectionId) => {
    const children = SECTION_FILES[sectionId]?.({ projects, repos, hasCertifications }) ?? [];
    if (children.length === 0) return { sectionId, name: bufferNameFor(sectionId), isDirectory: false, children };
    return { sectionId, name: `${DIRECTORY_NAMES[sectionId] ?? sectionId}/`, isDirectory: true, children };
  });
