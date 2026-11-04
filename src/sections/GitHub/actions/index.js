import { GITHUB_USER } from "../../../api/githubApi";

// the config I write everything in, featured above the rest. what it does comes from its own README
export const MAIN_PROJECT = {
  name: "nvim-config",
  title: "Eldentree",
  url: `https://github.com/${GITHUB_USER}/nvim-config`,
  pitch:
    "My Neovim config, built like a game world. Themes that change with the day, a dashboard drawn in its own buffer, banners for commits and passing tests, and Claude Code wired in for reviews and commit messages.",
  features: [
    ["Living themes", "a palette per region, picked fresh every day"],
    ["Inventory HUD", "recent files, branches and projects as items"],
    ["Banners", "for commits, merged PRs and green test runs"],
    ["Claude Code", "PR reviews and commit drafts from the editor"],
  ],
};

const DAY_MS = 86_400_000;

/**
 * How long ago a repo was last pushed, in the words a person would use.
 * @param {string} isoDate when it was pushed
 * @param {number} now the current time in ms
 * @returns {string} like "today", "3d ago", "2mo ago" or "1y ago"
 */
export const lastPushed = (isoDate, now = Date.now()) => {
  const days = Math.floor((now - new Date(isoDate).getTime()) / DAY_MS);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
};
