// the regions of Eldentree, the nvim config this site is drawn from. the colors live in index.css, keyed by name,
// this is everything else the page says about them
export const REGIONS = [
  { name: "leyndell", title: "Leyndell", subtitle: "Royal Capital", character: "Marika", tagline: "gold on ash stone" },
  { name: "haligtree", title: "Haligtree", subtitle: "Miquella's Haligtree", character: "Malenia", tagline: "Malenia's scarlet rot and bronze" },
  { name: "raya-lucaria", title: "Raya Lucaria", subtitle: "Academy of Raya Lucaria", character: "Rennala", tagline: "glintstone and the full moon" },
  { name: "caelid", title: "Caelid", subtitle: "Redmane Castle", character: "Radahn", tagline: "crimson sky over Radahn's battlefield" },
  { name: "mohgwyn", title: "Mohgwyn", subtitle: "Mohgwyn Palace", character: "Mohg", tagline: "bloodflame and the dynasty's gold" },
  { name: "ordina", title: "Ordina", subtitle: "Consecrated Snowfield", character: "Latenna", tagline: "frost on the snowfield" },
];

export const REGION_NAMES = REGIONS.map((region) => region.name);
export const DEFAULT_REGION = "leyndell";

const PINNED_KEY = "region-pinned";
const LAST_KEY = "region-last";

/**
 * Finds a region by name, landing somewhere pretty instead of on an error for a stale or mistyped one.
 * @param {string | null} name region name, like "haligtree"
 * @returns {object} the region, leyndell when the name is unknown
 */
export const resolveRegion = (name) => REGIONS.find((region) => region.name === name) ?? REGIONS[0];

/**
 * The region a visit wakes up in: a pinned one always wins, a first visit gets leyndell, and every visit after
 * that rolls one you didn't see last time. index.html runs the same rules before paint.
 * @param {{ pinned?: string | null, last?: string | null, random?: () => number }} visit what the browser remembers
 * @returns {string} the region name
 */
export const startingRegion = ({ pinned = null, last = null, random = Math.random } = {}) => {
  if (REGION_NAMES.includes(pinned)) return pinned;
  if (!REGION_NAMES.includes(last)) return DEFAULT_REGION;
  const others = REGION_NAMES.filter((name) => name !== last);
  return others[Math.floor(random() * others.length)];
};

/**
 * The region after this one, wrapping around, the same as <leader>uT in nvim.
 * @param {string} name the current region
 * @returns {string} the next region's name
 */
export const nextRegion = (name) => REGION_NAMES[(REGION_NAMES.indexOf(name) + 1) % REGION_NAMES.length];

/** @returns {string} the region painted on the page right now */
export const currentRegionName = () => resolveRegion(document.documentElement.dataset.theme).name;

/**
 * Remembers a region as pinned, so every later visit wakes up there instead of rolling.
 * @param {string | null} name region to pin, null to go back to rolling
 */
export const pinRegion = (name) => {
  try {
    if (name) localStorage.setItem(PINNED_KEY, name);
    else localStorage.removeItem(PINNED_KEY);
    if (name) localStorage.setItem(LAST_KEY, name);
  } catch {
    // private windows can block storage, the region still applies for this visit
  }
};

/** @returns {string | null} the pinned region, if any */
export const readPinnedRegion = () => {
  try {
    return localStorage.getItem(PINNED_KEY);
  } catch {
    return null;
  }
};
