import { FileClock, FileCode, FileCog, FileJson, FileTerminal, FileText, GitBranch } from "lucide-react";

// every filetype in the color it's known by, the way nvim-web-devicons paints them
const FILE_ICONS = {
  tsx: [FileCode, "text-ft-react"],
  ts: [FileCode, "text-ft-markdown"],
  md: [FileText, "text-ft-markdown"],
  json: [FileJson, "text-ft-json"],
  toml: [FileCog, "text-ft-toml"],
  yml: [FileCog, "text-ft-yaml"],
  lua: [FileCode, "text-ft-lua"],
  sh: [FileTerminal, "text-ft-shell"],
  log: [FileClock, "text-ft-log"],
  git: [GitBranch, "text-ft-git"],
};

/**
 * @param {string} name a file name like "skills.lua"
 * @returns {[import("react").ComponentType, string]} the icon and its color class
 */
const iconFor = (name = "") => FILE_ICONS[name.split(".").pop()] ?? [FileText, "text-faint"];

/** A devicon for a file name, colored by its type. */
const FileIcon = ({ name, size = 13, className = "" }) => {
  const [Icon, tone] = iconFor(name);
  return <Icon size={size} className={`shrink-0 ${tone} ${className}`} aria-hidden="true" />;
};

export default FileIcon;
