import { createStore } from "./store";

// the twelve relics: one object per franchise, out in the open where its line on the page fits it. touching one
// plays its moment, and the quest log keeps what you found. the ids are the old secret ids, so anyone who found
// one before keeps the credit
export const RELICS = {
  scott: {
    franchise: "Scott Pilgrim",
    name: "Player 1",
    color: "#ff5ca8",
    section: "home",
    touch: "poke him",
    quip: "K.O.! Cristopher earned the Power of Shipping. +1 life.",
  },
  pokeball: {
    franchise: "Pokémon",
    name: "Tall grass",
    color: "#e3350d",
    section: "home",
    touch: "walk through the grass",
    quip: "Gotcha! Cristopher was caught. Type: Leadership / Full Stack.",
  },
  alchemy: {
    franchise: "Fullmetal Alchemist",
    name: "Transmutation circle",
    color: "#4fa8ff",
    section: "about",
    touch: "clap",
    quip: "Equivalent exchange: hard problems in, readable code out.",
  },
  umbrella: {
    franchise: "Resident Evil",
    name: "The typewriter",
    color: "#d62828",
    section: "work",
    touch: "save your progress",
    quip: "Career progress saved. No ink ribbon required.",
  },
  magician: {
    franchise: "Yu-Gi-Oh!",
    name: "Dark Magician Girl",
    color: "#ff91be",
    section: "skills",
    touch: "flip the card",
    quip: "Every skill is a duel monster now. I believe in the heart of the cards.",
  },
  airbender: {
    franchise: "Avatar: The Last Airbender",
    name: "The four nations",
    color: "#f5a524",
    section: "skills",
    touch: "master the elements",
    quip: "Frontend, backend, cloud and people. Mastered all four.",
  },
  triforce: {
    franchise: "The Legend of Zelda",
    name: "The chest",
    color: "#e8c35a",
    section: "github",
    touch: "open the chest",
    quip: "It's dangerous to ship alone. Take these side quests.",
  },
  hanafuda: {
    franchise: "Demon Slayer",
    name: "Hanafuda earring",
    color: "#3fa9f5",
    section: "education",
    touch: "total concentration",
    quip: "Total Concentration Breathing. That's how every one of these exams got passed.",
  },
  spider: {
    franchise: "Marvel's Spider-Man 2",
    name: "The spider",
    color: "#e23636",
    section: "education",
    touch: "pull the thread",
    quip: "Be greater. Together. Peter was a student first, and he learned to share the load.",
  },
  grace: {
    franchise: "Elden Ring",
    name: "Site of Grace",
    color: "#f5d77a",
    section: "contact",
    touch: "touch grace",
    quip: "Grace touched. Respawn point set to my inbox.",
  },
  bat: {
    franchise: "Batman: Arkham",
    name: "The Bat-Signal",
    color: "#ffd84a",
    section: "contact",
    touch: "light the signal",
    quip: "Gotham pages at 3 a.m. and someone answers. Detective mode: every bug leaves evidence.",
  },
  d20: {
    franchise: "Baldur's Gate 3",
    name: "The d20",
    color: "#d8b25a",
    section: "contact",
    touch: "roll persuasion",
    quip: "Persuasion check passed. One message away from a party member who already rolled initiative.",
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
