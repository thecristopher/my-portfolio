import { exportResume } from "./resume/exportResume";
import { scrollByAmount, scrollToSection } from "./smoothScroll";
import { toggleFileTree } from "./fileTree";
import { getMuted, setMuted } from "./sound";
import { echo } from "./echo";
import { startRest } from "./rest";
import { store } from "../app/store";
import { contactApi } from "../api/contactApi";

const yankEmail = async () => {
  const email = contactApi.endpoints.getContact.select()(store.getState()).data?.email;
  if (!email) return;
  await navigator.clipboard?.writeText(email);
  echo(`yanked "${email}" to the + register`, "success");
};

/**
 * What the space leader unlocks, the same idea as Eldentree's which-key groups, mapped to the page.
 * @param {{ openTelescope: () => void, openRegions: () => void, openQuests: () => void, openSearch: () => void, openHints: () => void }} handlers the dialogs
 * @returns {{ key: string, label: string, run: () => void }[]} one binding per key
 */
export const buildLeaderBindings = (handlers) => [
  { key: "r", label: "download résumé (pdf)", run: exportResume },
  { key: "y", label: "yank my email", run: yankEmail },
  { key: "f", label: "telescope: find anything", run: () => handlers.openTelescope() },
  { key: "e", label: "neo-tree", run: () => toggleFileTree({ focus: true }) },
  { key: "w", label: "jump to experience", run: () => scrollToSection("work") },
  { key: "p", label: "jump to projects", run: () => scrollToSection("projects") },
  { key: "c", label: "jump to contact", run: () => scrollToSection("contact") },
  { key: "u", label: "choose a region", run: handlers.openRegions },
  { key: "q", label: "quest log (relics)", run: handlers.openQuests },
  { key: "/", label: "search the page", run: handlers.openSearch },
  { key: "h", label: "hint mode: follow a link", run: handlers.openHints },
  { key: "m", label: "toggle sound", run: () => setMuted(!getMuted()) },
  { key: "z", label: "rest at grace", run: startRest },
  { key: "␣", label: "page down", run: () => scrollByAmount(window.innerHeight * 0.85) },
];
