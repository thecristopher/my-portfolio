import { echo } from "./echo";

// moves focus into the sidebar's file tree, onto the file you're reading, so j/k can walk it like nvim-tree
export const focusFileTree = () => {
  const tree = document.querySelector("[data-file-tree]");
  if (!tree || tree.getClientRects().length === 0) {
    echo("the file tree lives on wide screens. on a phone, the menu up top has the same folders");
    return false;
  }
  const current = tree.querySelector("button[aria-current='true']") ?? tree.querySelector("button");
  current?.focus();
  echo("NvimTree · j/k move · l open · h close · esc back to the page");
  return true;
};
