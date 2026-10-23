import { createStore } from "./store";

// the relics: one small object per franchise, spread across the whole page and its chrome, each hiding
// where its line on the page fits it. section null means it lives in the editor chrome, not in a section.
// touching one plays its moment, and the quest log keeps what you found and gives a riddle for the rest. the ids
// are the old secret ids, so anyone who found one before keeps the credit
export const RELICS = {
  scott: {
    franchise: "Scott Pilgrim",
    name: "Player 1",
    color: "#ff5ca8",
    section: "home",
    touch: "poke him",
    riddle: "Player 1 doesn't like being poked. Three times, quickly.",
    quip: "K.O.! The backlog never stood a chance.",
  },
  pokeball: {
    franchise: "Pokémon",
    name: "The Poké Ball",
    color: "#e3350d",
    section: "work",
    touch: "throw the ball",
    riddle: "Every commit in the career log is an evolution. A Poké Ball waits beside it.",
    quip: "Gotcha! An Engineering Manager joined your party. He knows Code Review.",
  },
  alchemy: {
    franchise: "Fullmetal Alchemist",
    name: "The Flamel cross",
    color: "#4fa8ff",
    section: "about",
    touch: "clap",
    riddle: "Ed's emblem is pinned where the reading line ends.",
    quip: "Equivalent exchange: one codebase in, three brands out.",
  },
  umbrella: {
    franchise: "Resident Evil",
    name: "The Umbrella logo",
    color: "#d62828",
    section: "work",
    touch: "save your progress",
    riddle: "One of my old employers shares a name with a certain corporation. Its logo is right there.",
    quip: "Game saved. And yes, I really did work at a company called Umbrella.",
  },
  magician: {
    franchise: "Yu-Gi-Oh!",
    name: "The Millennium Puzzle",
    color: "#ff91be",
    section: "skills",
    touch: "solve the puzzle",
    riddle: "Something golden waits before the deck is dealt, an eye on its face.",
    quip: "Every skill card just got +500 ATK. The heart of the cards approves.",
  },
  airbender: {
    franchise: "Avatar: The Last Airbender",
    name: "Aang's arrow",
    color: "#f5a524",
    section: "projects",
    touch: "master the elements",
    riddle: "Four kinds of work in the gallery, and an airbender's arrow pointing at them.",
    quip: "Frontend, backend, cloud and people. Still mastering the last one.",
  },
  triforce: {
    franchise: "The Legend of Zelda",
    name: "The Triforce",
    color: "#e8c35a",
    section: "github",
    touch: "claim the Triforce",
    riddle: "Past the last side quest, three golden triangles sit in the corner.",
    quip: "It's dangerous to ship alone. Take these side quests.",
  },
  hanafuda: {
    franchise: "Demon Slayer",
    name: "Nichirin blade",
    color: "#3fa9f5",
    section: "education",
    touch: "total concentration",
    riddle: "A black blade rests by the certifications.",
    quip: "Total concentration. That's how both AWS exams got passed.",
  },
  spider: {
    franchise: "Spider-Man",
    name: "The spider emblem",
    color: "#e23636",
    section: "education",
    touch: "tap the spider",
    riddle: "Something with eight legs clings to the corner of the diploma.",
    quip: "Peter had Midtown High. I had the Tecnológico de Tijuana.",
  },
  grace: {
    franchise: "Elden Ring",
    name: "Site of Grace",
    color: "#f5d77a",
    section: "contact",
    touch: "touch grace",
    riddle: "Log out of the terminal and a golden sigil stays behind.",
    quip: "Grace touched. Your respawn point is my inbox.",
  },
  bat: {
    franchise: "Batman: Arkham",
    name: "The bat symbol",
    color: "#ffd84a",
    section: null,
    touch: "light the signal",
    riddle: "Down in the statusline, Gotham keeps its symbol right before the sound switch.",
    quip: "Every bug leaves evidence. I'm the one who goes looking at 3 a.m.",
  },
  d20: {
    franchise: "Baldur's Gate 3",
    name: "The d20",
    color: "#d8b25a",
    section: "about",
    touch: "roll persuasion",
    riddle: "Picking a time to call is a persuasion check. The die waits by the clock.",
    quip: "Persuasion check passed. Now you just have to send the email.",
  },
  willow: {
    franchise: "Obsession",
    name: "One Wish Willow",
    color: "#9ed36a",
    section: null,
    touch: "make a wish",
    riddle: "Where the page signs off, a little twig waits. One wish, then snap it in half.",
    quip: "Wish granted. No fine print, just an inbox that always answers.",
  },
};

export const RELIC_IDS = Object.keys(RELICS);

export const COMPLETION_QUIP = "Every relic found. Fancy a co-op run? contact.sh is open.";

// the grace used to be a Dark Souls bonfire, anyone who lit it keeps the credit
const RENAMED = { bonfire: "grace" };

/**
 * Cleans a saved list of found relics: renamed ids follow their relic, unknown ones and duplicates drop out.
 * @param {string[]} found ids as saved
 * @returns {string[]} known relic ids, each once
 */
export const migrateFound = (found = []) =>
  [...new Set(found.map((id) => RENAMED[id] ?? id))].filter((id) => RELIC_IDS.includes(id));

/**
 * @param {string[]} found relic ids found so far
 * @returns {string} the score line, like "3/12 relics"
 */
export const relicCount = (found) => `${found.length}/${RELIC_IDS.length} relics`;

/**
 * @param {string[]} found relic ids found so far
 * @returns {boolean} whether every relic has been found
 */
export const isComplete = (found) => RELIC_IDS.every((id) => found.includes(id));

/**
 * The relics that live in a section, in page order.
 * @param {string} sectionId like "contact"
 * @returns {string[]} relic ids
 */
export const relicsIn = (sectionId) => RELIC_IDS.filter((id) => RELICS[id].section === sectionId);

// the key is the old one, so finds from before the redesign carry over
export const foundRelics = createStore([], {
  storageKey: "secrets-found",
  read: (saved) => migrateFound(Array.isArray(saved) ? saved : []),
});

/** @returns {string[]} the found relic ids, kept live for the statusline and the quest log */
export const useFoundRelics = () => foundRelics.use();

/**
 * Marks a relic found. Returns whether this was the first time, so the payout and banner only happen once.
 * @param {string} id relic id
 * @returns {boolean} true on the first find
 */
export const markFound = (id) => {
  const found = foundRelics.get();
  if (found.includes(id)) return false;
  foundRelics.set([...found, id]);
  return true;
};
