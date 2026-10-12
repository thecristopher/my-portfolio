import { useEffect, useRef, useState } from "react";
import { playSound } from "./sound";

// the little icons hidden around the page. finding one remembers it, so a discovered grace stays lit
const STORAGE_KEY = "secrets-found";

// each secret's color for the progress pips, and the line its tooltip says once found: half the franchise, half me
export const SECRETS = {
  triforce: { color: "#e8c35a", quip: "It's dangerous to ship alone. Take these side quests." },
  umbrella: { color: "#d62828", quip: "Career progress saved. No ink ribbon required." },
  grace: { color: "#f5d77a", quip: "Grace touched. Respawn point set to my inbox." },
  magician: { color: "#ff91be", quip: "Every skill is a duel monster now, +500 ATK. I believe in the heart of the cards." },
  pokeball: { color: "#e3350d", quip: "Gotcha! Cristopher joined your party. Type: Full Stack." },
  alchemy: { color: "#6ec3ff", quip: "Equivalent exchange: hard problems in, readable code out." },
  airbender: { color: "#f5a524", quip: "Mastered all four stacks: frontend, backend, cloud and people." },
  hanafuda: { color: "#3fa9f5", quip: "Total Concentration. Deep Work Breathing, First Form." },
};
export const SECRET_IDS = Object.keys(SECRETS);

const COMPLETION_QUIP = "100% completion. Fancy a co-op run? contact.sh is open.";

// the grace used to be a Dark Souls bonfire, anyone who lit it keeps the credit
const RENAMED = { bonfire: "grace" };

export const secretCount = (found) => `${found.length}/${SECRET_IDS.length} secrets found`;

export const isComplete = (found) => SECRET_IDS.every((id) => found.includes(id));

// what the pill next to a secret says: its quip (or the victory line once every one is found) and the score
export const secretTooltip = (id, found) => ({
  quip: isComplete(found) ? COMPLETION_QUIP : SECRETS[id]?.quip,
  count: secretCount(found),
  found,
});

export const migrateFound = (found) => [...new Set(found.map((id) => RENAMED[id] ?? id))];

export const readFound = () => {
  try {
    return migrateFound(JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []);
  } catch {
    return [];
  }
};

const saveFound = (found) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // private windows can block storage, the secret still works for this visit
  }
};

const CAPTION_MS = 2800;

// returns whether this secret was ever found, a function to find it, and the tooltip to pop up right now
export const useSecret = (id) => {
  const [isFound, setIsFound] = useState(() => readFound().includes(id));
  const [caption, setCaption] = useState(null);
  const captionTimer = useRef(null);

  useEffect(() => () => clearTimeout(captionTimer.current), []);

  // the count waits for the full screen effect to clear, otherwise it would pop up hidden underneath it
  const find = ({ withSound = true, countAfterMs = 0 } = {}) => {
    const found = [...new Set([...readFound(), id])];
    saveFound(found);
    setIsFound(true);
    if (withSound) playSound(id);
    clearTimeout(captionTimer.current);
    captionTimer.current = setTimeout(() => {
      setCaption(secretTooltip(id, found));
      captionTimer.current = setTimeout(() => setCaption(null), CAPTION_MS);
    }, countAfterMs);
  };

  return [isFound, find, caption];
};
