import { ArrowRight, AtSign, Copy, Download, FileText, HelpCircle, Keyboard, MapPin, Pin, PinOff, Printer, Search, SearchX, Sparkles, Volume2 } from "lucide-react";
import { bufferNameFor, sectionIdFromUrl } from "../../actions";
import { REGIONS } from "../../lib/regions";
import { scrollToSection } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";
import { getMuted, setMuted } from "../../lib/sound";
import { clearSearch } from "../../lib/search";
import { exportResume } from "../../lib/resume/exportResume";
import { showBanner } from "../../lib/banner";
import { startRest } from "../../lib/rest";
import { HELP_TEXT } from "../../hooks/useVimKeys";
import { travelTo, unpinRegion } from "../../hooks/useRegion";

// the player messages from Eldentree's hub, left on the ground for the next tarnished
export const PLAYER_MESSAGES = [
  "Try refactoring, but hole",
  "Praise the green test!",
  "Be wary of null",
  "Liar ahead: TODO",
  "Could this be a race condition?",
  "Merge conflict ahead, therefore try retreat",
  "Visions of production...",
  "Be wary of Friday deploys",
  "Hidden path ahead: the README",
  "Fear not the stack trace, Tarnished",
  "Seek the lands between your functions",
  "Rise, and let grace light your path",
];

// only typed exactly, never listed. nods to raccoon city and the lands between
const SECRET_COMMANDS = [
  { alias: "w", label: "Write", run: () => echo("Progress saved at the typewriter.", "success") },
  { alias: "q", label: "Quit", run: () => echo("E37: You can't quit. Stay a while and read, stranger.", "error") },
  { alias: "q!", label: "Force quit", run: () => showBanner("died", { subtitle: "There is no escape from this buffer" }) },
  { alias: "wq", label: "Write and quit", run: () => echo("Progress saved. Quitting is still not an option, stranger.", "error") },
  { alias: "jill", label: "Jill", run: () => echo("You were almost a Jill sandwich!", "success") },
  { alias: "herb", label: "Herb", run: () => echo("Mixed a green and a red herb. Condition: Fine.", "success") },
  { alias: "merchant", label: "Merchant", run: () => echo("What're ya buyin'? Scroll down, stranger, the good stuff is in contact.sh", "success") },
  { alias: "rest", label: "Rest", run: () => startRest() },
  { alias: "felled", label: "Felled", run: () => showBanner("felled") },
  { alias: "died", label: "Died", run: () => showBanner("died") },
  { alias: "message", label: "Message", run: () => echo(PLAYER_MESSAGES[Math.floor(Math.random() * PLAYER_MESSAGES.length)], "success") },
  { alias: "malenia", label: "Malenia", run: () => echo("I am Malenia, Blade of Miquella. And I have never known defeat.", "success") },
].map((command) => ({ ...command, id: `secret-${command.alias}`, group: "Secrets", icon: HelpCircle, hidden: true }));

const bufferCommands = (links) =>
  links.map((link) => {
    const sectionId = sectionIdFromUrl(link.url);
    return {
      id: `buffer-${sectionId}`,
      group: "Buffers",
      label: `:e ${bufferNameFor(sectionId)}`,
      alias: sectionId,
      keywords: link.title,
      icon: FileText,
      preview: { kind: "text", title: link.title, body: `Jump to ${link.title.toLowerCase()}.` },
      run: () => scrollToSection(sectionId),
    };
  });

const projectCommands = (caseStudies) =>
  caseStudies.map((study) => ({
    id: `project-${study.slug}`,
    group: "Case studies",
    label: study.title,
    alias: study.slug,
    keywords: `${study.company} ${study.kind} ${study.technologies.join(" ")}`,
    icon: ArrowRight,
    preview: { kind: "text", title: study.title, eyebrow: `${study.company} · ${study.role}`, body: study.summary },
    run: () => scrollToSection(`project-${study.slug}`),
  }));

const contactCommands = (contact) => {
  if (!contact) return [];
  return [
    {
      id: "yank-email",
      group: "Contact",
      label: "Yank email to clipboard",
      alias: "yank",
      keywords: "copy mail",
      icon: Copy,
      preview: { kind: "text", title: contact.email, body: "Copies my email to your clipboard." },
      run: async () => {
        await navigator.clipboard?.writeText(contact.email);
        echo(`yanked "${contact.email}" to the + register`, "success");
      },
    },
    {
      id: "send-email",
      group: "Contact",
      label: "Send an email",
      alias: "mail",
      keywords: "write hire",
      icon: AtSign,
      preview: { kind: "text", title: contact.email, body: "Opens your mail app with my address filled in." },
      run: () => window.location.assign(contact.mailto),
    },
    ...contact.socials.map((social) => ({
      id: `social-${social.id}`,
      group: "Contact",
      label: `Open ${social.name}`,
      alias: social.name.toLowerCase(),
      icon: ArrowRight,
      preview: { kind: "text", title: social.name, body: social.url },
      run: () => window.open(social.url, "_blank", "noopener"),
    })),
  ];
};

const regionCommands = (currentName, isPinned) => [
  ...REGIONS.map((region) => ({
    id: `region-${region.name}`,
    group: "Regions",
    label: region.title,
    alias: `region ${region.name}`,
    keywords: `${region.character} ${region.tagline} colorscheme theme colo`,
    icon: MapPin,
    isCurrent: region.name === currentName,
    region: region.name,
    preview: { kind: "region", region },
    run: () => travelTo(region.name),
  })),
  ...(isPinned
    ? [{ id: "region-roll", group: "Regions", label: "Roll a new region every visit", alias: "region roll", keywords: "unpin random", icon: PinOff, run: unpinRegion }]
    : [{ id: "region-pin", group: "Regions", label: "Keep this region", alias: "region pin", keywords: "pin", icon: Pin, run: () => travelTo(currentName) }]),
];

/**
 * Every command telescope can run, grouped the way the picker lists them.
 * @param {{ links: object[], caseStudies: object[], contact: object, region: string, isRegionPinned: boolean, onOpenQuestLog: () => void, onOpenSearch: () => void, onOpenWhichKey: () => void }} context
 * @returns {object[]} commands, the hidden ones last
 */
export const buildCommands = ({ links, caseStudies, contact, region, isRegionPinned, onOpenQuestLog, onOpenSearch, onOpenWhichKey }) => {
  const resume = [
    {
      id: "resume",
      group: "Résumé",
      label: "Download résumé as PDF",
      alias: "resume",
      keywords: "cv pdf download export write",
      icon: Download,
      preview: { kind: "text", title: "Résumé.pdf", body: "A one column, ATS friendly PDF built from the same data as this page, so it's never out of date." },
      run: exportResume,
    },
    { id: "print", group: "Résumé", label: "Print résumé", alias: "print", keywords: "cv paper", icon: Printer, run: () => setTimeout(() => window.print(), 350) },
  ];

  const finding = [
    { id: "search", group: "Find", label: "Search the page", alias: "search", keywords: "find grep /", icon: Search, run: onOpenSearch },
    { id: "noh", group: "Find", label: "Clear search highlights", alias: "noh", keywords: "nohlsearch clear", icon: SearchX, run: clearSearch },
  ];

  const extras = [
    { id: "keys", group: "Extras", label: "Show keymaps (which-key)", alias: "keys", keywords: "help keybindings which", icon: Keyboard, run: onOpenWhichKey },
    { id: "help", group: "Extras", label: "Echo the keybindings", alias: "help", icon: HelpCircle, run: () => echo(HELP_TEXT) },
    { id: "quests", group: "Extras", label: "Open the quest log", alias: "quests", keywords: "relics secrets easter eggs", icon: Sparkles, run: onOpenQuestLog },
    {
      id: "sound",
      group: "Extras",
      label: "Toggle sound",
      alias: "sound",
      keywords: "mute audio",
      icon: Volume2,
      run: () => {
        setMuted(!getMuted());
        echo(getMuted() ? "set nosound. the relics stay quiet" : "set sound. the relics sing again", "success");
      },
    },
  ];

  return [
    ...resume,
    ...bufferCommands(links),
    ...projectCommands(caseStudies),
    ...finding,
    ...contactCommands(contact),
    ...regionCommands(region, isRegionPinned),
    ...extras,
    ...SECRET_COMMANDS,
  ];
};
