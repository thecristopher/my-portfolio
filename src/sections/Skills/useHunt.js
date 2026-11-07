import { useEffect, useState } from "react";
import { echo } from "../../lib/echo";
import { endingStart, huntLine, huntStart, huntStep } from "./actions";

/**
 * The hunt for the Metroid larva: which tool it hides behind, how many hits it has taken and whether it's defeated.
 * @param {string[]} names the tools it can hide behind
 * @returns {{ hunt: ReturnType<typeof huntStart>, strike: (name: string) => { hits: number, isDefeated: boolean } | null }}
 *   strike is called with every tool that's opened, and says how the larva fared when it was hiding there
 */
export const useHunt = (names) => {
  const [hunt, setHunt] = useState(() => huntStart(names));

  const strike = (name) => {
    const next = huntStep(hunt, name, names);
    if (next === hunt) return null;
    setHunt(next);
    return { hits: next.hits, isDefeated: next.isDefeated };
  };

  return { hunt, strike };
};

/**
 * Announces the win on the statusline. It sits at the bottom of the screen, right over Samus, so the line waits for
 * her ship to take off and her victory is never hidden behind it.
 * @param {ReturnType<typeof huntStart>} hunt the hunt
 * @param {boolean} isEnding whether her ending has started
 */
export const useWinLine = (hunt, isEnding) => {
  useEffect(() => {
    if (!isEnding) return undefined;
    const timer = setTimeout(() => echo(huntLine(hunt), "success"), endingStart("departing"));
    return () => clearTimeout(timer);
  }, [isEnding, hunt]);
};
