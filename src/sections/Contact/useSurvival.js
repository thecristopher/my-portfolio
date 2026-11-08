import { useEffect, useReducer, useRef } from "react";
import { BITE_EVERY_MS, biteDamage, survivalStart, survivalStep } from "./actions";

// calls the latest version of a callback from a timer or an effect, without restarting either when it changes
const useLatest = (callback) => {
  const latest = useRef(callback);
  latest.current = callback;
  return latest;
};

// while the fight is on, whatever waits at her feet gets a bite in every so often
const useBites = (isOn, enemies, onBite) => {
  const current = useLatest({ enemies, onBite });
  useEffect(() => {
    if (!isOn) return undefined;
    const timer = setInterval(() => {
      const damage = biteDamage(current.current.enemies);
      if (damage > 0) current.current.onBite(damage);
    }, BITE_EVERY_MS);
    return () => clearInterval(timer);
  }, [isOn, current]);
};

// runs once each time a condition turns true
const useOnTrue = (condition, callback) => {
  const latest = useLatest(callback);
  useEffect(() => {
    if (condition) latest.current();
  }, [condition, latest]);
};

/**
 * Jill's fight for her life: calm until the visitor starts it, then every enemy at her feet bites into her health. It
 * tells her to flinch on every bite and to fall when her health runs out, and starts her over on a retry.
 * @param {{ enemies: object[], onBite: () => void, onDeath: () => void }} hooks onBite fires with every bite that
 *   lands, onDeath once her health runs out
 * @returns {{ survival: ReturnType<typeof survivalStart>, start: () => void, takedown: () => void, retry: () => void }}
 */
export const useSurvival = ({ enemies, onBite, onDeath }) => {
  const [survival, act] = useReducer(survivalStep, undefined, survivalStart);

  useBites(survival.phase === "fight", enemies, (damage) => {
    act({ type: "bite", damage });
    onBite();
  });
  useOnTrue(survival.phase === "down", onDeath);

  return {
    survival,
    start: () => act({ type: "start" }),
    takedown: () => act({ type: "takedown" }),
    retry: () => act({ type: "retry" }),
  };
};
