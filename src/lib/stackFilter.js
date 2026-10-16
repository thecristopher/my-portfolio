import { useSyncExternalStore } from "react";

// the one tool picked in skills.lua or a work card's stack. work.json dims every job that never shipped with it
let pickedTech = null;
const listeners = new Set();

export const getPickedTech = () => pickedTech;

export const pickTech = (tech) => {
  pickedTech = tech;
  listeners.forEach((listener) => listener());
};

export const clearTech = () => pickTech(null);

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePickedTech = () => useSyncExternalStore(subscribe, getPickedTech);
