import { GITHUB_USER } from "../../../api/githubApi";

// the config I write everything in, featured above the rest. what it does comes from its own README
export const MAIN_PROJECT = {
  name: "nvim-config",
  title: "Eldentree",
  url: `https://github.com/${GITHUB_USER}/nvim-config`,
  pitch:
    "My Neovim config, built like a game world. Themes that change with the day, a dashboard drawn in its own buffer, banners for commits and passing tests, and Claude Code wired in for reviews and commit messages.",
  features: [
    ["Living themes", "a palette per region, picked fresh every day"],
    ["Inventory HUD", "recent files, branches and projects as items"],
    ["Banners", "for commits, merged PRs and green test runs"],
    ["Claude Code", "PR reviews and commit drafts from the editor"],
  ],
};

const DAY_MS = 86_400_000;

/**
 * How long ago a repo was last pushed, in the words a person would use.
 * @param {string} isoDate when it was pushed
 * @param {number} now the current time in ms
 * @returns {string} like "today", "3d ago", "2mo ago" or "1y ago"
 */
export const lastPushed = (isoDate, now = Date.now()) => {
  const days = Math.floor((now - new Date(isoDate).getTime()) / DAY_MS);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};

/**
 * A feature's name as a Lua table key, the way it would be written in the config.
 * @param {string} name like "Inventory HUD"
 * @returns {string} like "inventory_hud"
 */
export const luaKey = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

/**
 * The buffer the laptop types out: the features written as a Lua table, each line a list of colored tokens.
 * @param {[string, string][]} features name and what it does
 * @returns {{ text: string, tone: "plain" | "comment" | "keyword" | "key" | "string" }[][]} lines of tokens
 */
export const editorBuffer = (features) => [
  [{ text: "-- the world I write everything in", tone: "comment" }],
  [
    { text: "return", tone: "keyword" },
    { text: " {", tone: "plain" },
  ],
  ...features.map(([name, what]) => [
    { text: "  ", tone: "plain" },
    { text: luaKey(name), tone: "key" },
    { text: " = ", tone: "plain" },
    { text: `"${what}"`, tone: "string" },
    { text: ",", tone: "plain" },
  ]),
  [{ text: "}", tone: "plain" }],
];

const lineLength = (line) => line.reduce((length, token) => length + token.text.length, 0);

/**
 * How many keystrokes the whole buffer takes, a newline counting as one.
 * @param {{ text: string }[][]} lines
 * @returns {number}
 */
export const bufferLength = (lines) => lines.reduce((total, line) => total + lineLength(line) + 1, 0);

const cutLine = (line, count) => {
  const shown = [];
  let left = count;
  for (const token of line) {
    if (left <= 0) break;
    shown.push({ ...token, text: token.text.slice(0, left) });
    left -= token.text.length;
  }
  return shown;
};

/**
 * The buffer as it looks after a number of keystrokes: whole lines first, then the one being typed.
 * @param {{ text: string }[][]} lines the full buffer
 * @param {number} typed keystrokes so far
 * @returns {{ text: string }[][]} the lines on screen, the last one possibly half written
 */
export const typeBuffer = (lines, typed) => {
  const shown = [];
  let left = typed;
  for (const line of lines) {
    if (left < 0) break;
    shown.push(cutLine(line, left));
    left -= lineLength(line) + 1;
  }
  return shown;
};

/**
 * The leader menu which-key pops up: one key per feature, its first letter.
 * @param {[string, string][]} features name and what it does
 * @returns {{ key: string, label: string }[]}
 */
export const whichKeys = (features) => features.map(([name]) => ({ key: name[0].toLowerCase(), label: name }));

/**
 * The whole buffer as the plain text the keyboard types, one newline after every line.
 * @param {{ text: string }[][]} lines
 * @returns {string}
 */
export const bufferText = (lines) => lines.map((line) => `${line.map((token) => token.text).join("")}\n`).join("");

/** The laptop's keys, row by row. Single characters are their own key, the wide ones go by name. */
export const KEYBOARD_ROWS = [
  ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "delete"],
  ["tab", "q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]", "\\"],
  ["caps", "a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "return"],
  ["shift", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/", "rshift"],
  ["fn", "ctrl", "opt", "cmd", "space", "cmd2", "opt2", "left", "right"],
];

// what each shifted character is typed with, on a US layout
const SHIFTED = {
  "~": "`", "!": "1", "@": "2", "#": "3", "$": "4", "%": "5", "^": "6", "&": "7", "*": "8", "(": "9", ")": "0",
  _: "-", "+": "=", "{": "[", "}": "]", "|": "\\", ":": ";", '"': "'", "<": ",", ">": ".", "?": "/",
};

/**
 * The keys a character takes to type: the key itself, plus shift for capitals and symbols.
 * @param {string} char one character, "\n" for a new line
 * @returns {string[]} key ids from KEYBOARD_ROWS, empty when the keyboard can't type it
 */
export const keysFor = (char) => {
  if (char === " ") return ["space"];
  if (char === "\n") return ["return"];
  if (SHIFTED[char]) return [SHIFTED[char], "shift"];
  if (/[A-Z]/.test(char)) return [char.toLowerCase(), "shift"];
  if (/[a-z0-9`\-=[\]\\;',./]/.test(char)) return [char];
  return [];
};

/**
 * Which keys glow after a number of keystrokes: the last few characters typed, the newest brightest, so the light
 * runs across the keyboard behind the cursor.
 * @param {string} text everything that gets typed
 * @param {number} typed keystrokes so far
 * @param {number} trail how many recent keystrokes still glow
 * @returns {Record<string, number>} key id to glow, from just above 0 to 1
 */
export const litKeys = (text, typed, trail = 5) => {
  const lit = {};
  if (typed <= 0 || typed >= text.length) return lit;
  for (let back = 0; back < trail; back += 1) {
    const at = typed - 1 - back;
    if (at < 0) break;
    const glow = 1 - back / trail;
    for (const key of keysFor(text[at])) lit[key] = Math.max(lit[key] ?? 0, glow);
  }
  return lit;
};

/**
 * How far a cartridge turns on the shelf from where it is on screen: angled toward the middle while it's off to a
 * side, facing you head on as it crosses the middle, like flipping through a row of games.
 * @param {number} centerX the cartridge's center on screen, in px
 * @param {number} viewportWidth the screen's width, in px
 * @param {number} maxTurn the angle at the screen's edges and past them, in degrees
 * @returns {number} rotateY in degrees, positive while it's left of the middle
 */
export const cartridgeTurn = (centerX, viewportWidth, maxTurn = 38) => {
  if (viewportWidth <= 0) return 0;
  const half = viewportWidth / 2;
  const offset = Math.min(1, Math.max(-1, (centerX - half) / half));
  return offset === 0 ? 0 : -offset * maxTurn;
};

// how much wider than a letter each named key is, the way a real laptop lays them out
export const KEY_WIDTH = { delete: 1.6, tab: 1.5, caps: 1.8, return: 1.9, shift: 2.3, rshift: 2.6, space: 5.6, cmd: 1.3, cmd2: 1.3 };

/**
 * A point on the keyboard deck seen from slightly above: the deck is a trapezoid, narrower at the hinge and wider at
 * the front edge, so anything laid out flat on it gets the same foreshortening.
 * @param {number} u across the deck, 0 at the left edge and 1 at the right
 * @param {number} v down the deck, 0 at the hinge and 1 at the front edge
 * @param {{ top: number, bottom: number, topLeft: number, topRight: number, bottomLeft: number, bottomRight: number }} deck
 * @returns {[number, number]} x and y in the drawing
 */
export const onDeck = (u, v, deck) => {
  const left = deck.topLeft + (deck.bottomLeft - deck.topLeft) * v;
  const right = deck.topRight + (deck.bottomRight - deck.topRight) * v;
  return [left + (right - left) * u, deck.top + (deck.bottom - deck.top) * v];
};

/**
 * A flat rectangle on the deck as the four corners it ends up with in perspective.
 * @param {{ u0: number, u1: number, v0: number, v1: number }} box the rectangle in deck coordinates
 * @param {object} deck see onDeck
 * @returns {string} svg polygon points
 */
export const deckPolygon = ({ u0, u1, v0, v1 }, deck) =>
  [onDeck(u0, v0, deck), onDeck(u1, v0, deck), onDeck(u1, v1, deck), onDeck(u0, v1, deck)].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/**
 * Every key of the keyboard laid out on the deck: each row shares the width by how wide its keys are, and the rows
 * get a little taller toward the front edge, the way a surface closer to you looks bigger.
 * @param {string[][]} rows key ids, row by row
 * @param {{ u0: number, u1: number, v0: number, v1: number, gap: number }} area where the keys sit, in deck coordinates
 * @param {object} deck see onDeck
 * @returns {{ id: string, points: string }[]}
 */
export const deckKeys = (rows, area, deck) => {
  const growth = 1.08;
  const weights = rows.map((_, index) => growth ** index);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let v = area.v0;
  return rows.flatMap((row, index) => {
    const height = ((area.v1 - area.v0) * weights[index]) / total;
    const units = row.reduce((sum, id) => sum + (KEY_WIDTH[id] ?? 1), 0);
    const span = area.u1 - area.u0 - area.gap * (row.length - 1);
    let u = area.u0;
    const keys = row.map((id) => {
      const width = (span * (KEY_WIDTH[id] ?? 1)) / units;
      const key = { id, points: deckPolygon({ u0: u, u1: u + width, v0: v + height * 0.12, v1: v + height * 0.88 }, deck) };
      u += width + area.gap;
      return key;
    });
    v += height;
    return keys;
  });
};
