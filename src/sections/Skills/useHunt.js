import { useEffect, useState } from "react";
import { echo } from "../../lib/echo";
import { endingStart, huntLine, huntStart, huntStep } from "./actions";

/**
 * The hunt for the Metroid larva: which tool it hides behind, how many hits it has taken and whether it's defeated.
 * @param {string[]} names the tools it can hide behind
 * @returns {{ hunt: ReturnType<typeof huntStart>, land: (name: string) => void }} land is called with the tool each
 *   of her shots lands on
 */
export const useHunt = (names) => {
  const [hunt, setHunt] = useState(() => huntStart(names));

  const land = (name) => {
    const next = huntStep(hunt, name, names);
    if (next === hunt) return;
    setHunt(next);
    const line = huntLine(next);
    if (line && !next.isDefeated) echo(line, "success");
  };

  // the statusline sits at the bottom of the screen, right over her, so the win is announced once the ship takes off
  // and her victory is never hidden behind it
  useEffect(() => {
    if (!hunt.isDefeated) return undefined;
    const timer = setTimeout(() => echo(huntLine(hunt), "success"), endingStart("departing"));
    return () => clearTimeout(timer);
  }, [hunt]);

  return { hunt, land };
};
