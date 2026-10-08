import { useEffect, useRef, useState } from "react";
import { playSound } from "./sound";

// the little icons hidden around the page. finding one remembers it, so a lit bonfire stays lit
const STORAGE_KEY = "secrets-found";
export const SECRET_IDS = ["triforce", "umbrella", "bonfire"];

const readFound = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
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

const CAPTION_MS = 4500;

// returns whether this secret was ever found, a function to find it, and the caption to show right now
export const useSecret = (id) => {
  const [isFound, setIsFound] = useState(() => readFound().includes(id));
  const [caption, setCaption] = useState(null);
  const captionTimer = useRef(null);

  useEffect(() => () => clearTimeout(captionTimer.current), []);

  const find = (message) => {
    const found = [...new Set([...readFound(), id])];
    saveFound(found);
    setIsFound(true);
    playSound(id);
    setCaption(`${message} ${found.length}/${SECRET_IDS.length} secrets found.`);
    clearTimeout(captionTimer.current);
    captionTimer.current = setTimeout(() => setCaption(null), CAPTION_MS);
  };

  return [isFound, find, caption];
};
