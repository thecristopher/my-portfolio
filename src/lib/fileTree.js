import { useSyncExternalStore } from "react";
import { echo } from "./echo";

// whether neo-tree is open, shared by \e, :tree, the statusline and the phone menu. it starts closed, like nvim
let isOpen = false;
const listeners = new Set();

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getFileTreeOpen = () => isOpen;

export const useFileTreeOpen = () => useSyncExternalStore(subscribe, getFileTreeOpen);

// focus lands on the file you're reading, so j/k can walk the tree right away
const focusCurrentRow = () => {
  const tree = document.querySelector("[data-file-tree]");
  const current = tree?.querySelector("button[aria-current='true']") ?? tree?.querySelector("button");
  current?.focus({ preventScroll: true });
};

export const setFileTreeOpen = (open, { focus = false } = {}) => {
  if (open === isOpen) {
    if (open && focus) focusCurrentRow();
    return;
  }
  isOpen = open;
  document.documentElement.dataset.tree = open ? "open" : "closed";
  notify();
  if (open && focus) requestAnimationFrame(focusCurrentRow);
  if (!open) {
    // focus never stays behind inside a closed tree
    if (document.activeElement?.closest?.("[data-file-tree]")) document.activeElement.blur();
  }
};

export const toggleFileTree = ({ focus = false } = {}) => {
  setFileTreeOpen(!isOpen, { focus });
  // the keys only mean something with a keyboard, so a phone skips the hint
  const hasKeyboard = globalThis.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  if (isOpen && hasKeyboard) echo("Neo-tree · j/k move · l open · h close · q or \\e to hide");
};

export const closeFileTree = () => setFileTreeOpen(false);
