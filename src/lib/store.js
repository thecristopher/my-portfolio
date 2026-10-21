import { useSyncExternalStore } from "react";

/**
 * A tiny external store any component can read live, optionally saved to localStorage between visits.
 * @param {*} initial the value before anything is saved
 * @param {{ storageKey?: string, read?: (raw: *) => * }} options where to save it, and how to clean what was saved
 * @returns {{ get: () => *, set: (next: *) => void, subscribe: (listener: () => void) => () => void, use: () => * }}
 */
export const createStore = (initial, { storageKey = null, read = (raw) => raw } = {}) => {
  const listeners = new Set();
  let value = initial;
  let isLoaded = !storageKey;

  const load = () => {
    if (isLoaded) return;
    isLoaded = true;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) value = read(JSON.parse(saved));
    } catch {
      // private windows can block storage, start from the initial value
    }
  };

  const get = () => {
    load();
    return value;
  };

  const set = (next) => {
    load();
    value = typeof next === "function" ? next(value) : next;
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // the value still holds for this visit
      }
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  // the hook is named use so the store reads like a component's own state
  const use = () => useSyncExternalStore(subscribe, get, get);

  return { get, set, subscribe, use };
};
