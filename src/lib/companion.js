import { useEffect, useState } from "react";

// whether the little me walks along the statusline. on unless the visitor sent him home with :set nocompanion
const STORAGE_KEY = "companion";
const listeners = new Set();

const readIsEnabled = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
};

export const setCompanionEnabled = (isEnabled) => {
  try {
    localStorage.setItem(STORAGE_KEY, isEnabled ? "on" : "off");
  } catch {
    // private windows can block storage, the choice still holds for this visit
  }
  listeners.forEach((listener) => listener(isEnabled));
};

export const useCompanionEnabled = () => {
  const [isEnabled, setIsEnabled] = useState(readIsEnabled);

  useEffect(() => {
    listeners.add(setIsEnabled);
    return () => listeners.delete(setIsEnabled);
  }, []);

  return isEnabled;
};
