import { useState, useSyncExternalStore } from "react";
import { playSound } from "./sound";

// the little icons hidden around the page. finding one remembers it, so a discovered grace stays lit
const STORAGE_KEY = "secrets-found";

// each secret's color, the line the quest log says once it's found (half the franchise, half me), its name there,
// the buffer it hides in and a riddle the quest log gives away after a while
export const SECRETS = {
  triforce: {
    color: "#e8c35a",
    name: "Triforce",
    quip: "It's dangerous to ship alone. Take these side quests.",
    where: "repos.yml",
    riddle: "Three golden triangles wait where the side quests get counted.",
  },
  umbrella: {
    color: "#d62828",
    name: "Umbrella",
    quip: "Career progress saved. No ink ribbon required.",
    where: "work.json",
    riddle: "A red and white canopy shelters the newest jobs.",
  },
  grace: {
    color: "#f5d77a",
    name: "Site of Grace",
    quip: "Grace touched. Respawn point set to my inbox.",
    where: "contact.sh",
    riddle: "Log out, and a golden light stays behind.",
  },
  magician: {
    color: "#ff91be",
    name: "Dark Magician Girl",
    quip: "Every skill is a duel monster now, +500 ATK. I believe in the heart of the cards.",
    where: "skills.lua",
    riddle: "A pointed hat sits right where the skills file gets opened.",
  },
  pokeball: {
    color: "#e3350d",
    name: "Poké Ball",
    quip: "Gotcha! Cristopher joined your party. Type: Full Stack.",
    where: "index.tsx",
    riddle: "Player 1 carries something round, red and white.",
  },
  alchemy: {
    color: "#6ec3ff",
    name: "Transmutation Circle",
    quip: "Equivalent exchange: hard problems in, readable code out.",
    where: "philosophy.md",
    riddle: "A circle is drawn beside the philosophy.",
  },
  airbender: {
    color: "#f5a524",
    name: "Air Nomad Swirl",
    quip: "Mastered all four stacks: frontend, backend, cloud and people.",
    where: "about.md",
    riddle: "Something drifts right under profile.json.",
  },
  hanafuda: {
    color: "#3fa9f5",
    name: "Hanafuda Earring",
    quip: "Total Concentration Breathing. That's how every one of these exams got passed.",
    where: "education.toml",
    riddle: "A little card hangs beside the certifications.",
  },
  spider: {
    color: "#e23636",
    name: "Spider-Man 2",
    quip: "Be greater. Together. Two Spider-Men share one city, and I'd rather share the load with my team too.",
    where: "education.toml",
    riddle: "Something got tangled in the graduation line.",
  },
  bat: {
    color: "#4fb6ff",
    name: "Arkham Bat",
    quip: "Detective mode on. Every bug leaves evidence, and I'm the one perched on the inbox when Gotham pages at 3 a.m.",
    where: "contact.sh",
    riddle: "Someone is perched on the email, watching it from the rooftops.",
  },
  d20: {
    color: "#d8b25a",
    name: "The d20",
    quip: "Persuasion check passed. You're one message away from a party member who's already rolled initiative.",
    where: "contact.sh",
    riddle: "Past the logout, at the very end of the buffer, the dice wait to be thrown.",
  },
};
export const SECRET_IDS = Object.keys(SECRETS);

export const COMPLETION_QUIP = "100% completion. Fancy a co-op run? contact.sh is open.";

// the grace used to be a Dark Souls bonfire, anyone who lit it keeps the credit
const RENAMED = { bonfire: "grace" };

export const secretCount = (found) => `${found.length}/${SECRET_IDS.length} secrets found`;

export const isComplete = (found) => SECRET_IDS.every((id) => found.includes(id));

export const migrateFound = (found) => [...new Set(found.map((id) => RENAMED[id] ?? id))];

export const readFound = () => {
  try {
    return migrateFound(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);
  } catch {
    return [];
  }
};

const foundListeners = new Set();
let foundSnapshot = null;

const saveFound = (found) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // private windows can block storage, the secret still works for this visit
  }
  foundSnapshot = found;
  foundListeners.forEach((listener) => listener());
};

const subscribeToFound = (listener) => {
  foundListeners.add(listener);
  return () => foundListeners.delete(listener);
};

// the same array until something new is found, so react only re-renders when the score changes
const getFoundSnapshot = () => (foundSnapshot ??= readFound());

// the found secrets, kept live for the statusline score and the quest log
export const useFoundSecrets = () => useSyncExternalStore(subscribeToFound, getFoundSnapshot);

// the quest log keeps its riddles locked for a while, so the hunt stays a hunt
export const HINT_UNLOCK_MS = 90_000;

export const hintFor = (id, elapsedMs) => {
  const secret = SECRETS[id];
  if (!secret) return null;
  if (elapsedMs < HINT_UNLOCK_MS) return { isLocked: true, secondsLeft: Math.ceil((HINT_UNLOCK_MS - elapsedMs) / 1000) };
  return { isLocked: false, where: secret.where, riddle: secret.riddle };
};

// returns whether this secret was ever found and a function to find it
export const useSecret = (id) => {
  const [isFound, setIsFound] = useState(() => readFound().includes(id));

  const find = ({ withSound = true } = {}) => {
    saveFound([...new Set([...readFound(), id])]);
    setIsFound(true);
    if (withSound) playSound(id);
  };

  return [isFound, find];
};
