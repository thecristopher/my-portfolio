import { useEffect, useRef, useState } from "react";
import { playSound } from "./sound";

// the little icons hidden around the page. finding one remembers it, so a discovered grace stays lit
const STORAGE_KEY = "secrets-found";
export const SECRET_IDS = ["triforce", "umbrella", "grace", "magician", "pokeball", "alchemy", "airbender", "hanafuda"];

// the grace used to be a Dark Souls bonfire, anyone who lit it keeps the credit
const RENAMED = { bonfire: "grace" };

export const secretCount = (found) => `${found.length}/${SECRET_IDS.length} secrets found`;

export const migrateFound = (found) => [...new Set(found.map((id) => RENAMED[id] ?? id))];

const readFound = () => {
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

// returns whether this secret was ever found, a function to find it, and the running count to show right now
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
      setCaption(secretCount(found));
      captionTimer.current = setTimeout(() => setCaption(null), CAPTION_MS);
    }, countAfterMs);
  };

  return [isFound, find, caption];
};
