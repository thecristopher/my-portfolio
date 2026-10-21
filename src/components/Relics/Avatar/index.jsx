import { motion, useReducedMotion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { NationEmblem } from "./Emblems";
import { NATIONS } from "./nations";

const UNLIT = "#d9d1c1";
const ORBIT_S = 48;
// top, right, bottom, left of a 7rem diamond
const SPOTS = ["left-1/2 top-0 -translate-x-1/2", "right-0 top-1/2 -translate-y-1/2", "left-1/2 bottom-0 -translate-x-1/2", "left-0 top-1/2 -translate-y-1/2"];

/**
 * The four nations in a slow orbit around a small center, waiting for someone to master them all.
 * Mastered, every emblem lights up in its own color and stays that way.
 */
export const Trigger = ({ className = "", zoom = 1 }) => {
  const { isFound, touch } = useRelic("airbender");
  const isCalm = useReducedMotion();
  // the ring turns one way and each emblem turns back, so they circle without ever going upside down
  const orbit = (direction) =>
    isCalm ? {} : { animate: { rotate: direction * 360 }, transition: { duration: ORBIT_S, repeat: Infinity, ease: "linear" } };

  return (
    <RelicButton id="airbender" isFound={isFound} onTouch={() => touch()} className={className} zoom={zoom}>
      <motion.span {...orbit(1)} className="relative block size-28" aria-hidden="true">
        <span
          className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: isFound ? "#f5a524" : UNLIT, boxShadow: isFound ? "0 0 10px #f5a524" : "none", opacity: isFound ? 1 : 0.7 }}
        />
        {NATIONS.map((nation, index) => (
          <span key={nation.id} className={`absolute ${SPOTS[index]}`}>
            <motion.span {...orbit(-1)} className="block">
              <NationEmblem
                nation={nation}
                color={isFound ? nation.color : UNLIT}
                className="block size-10 transition-[filter,opacity] duration-700"
                style={{ opacity: isFound ? 1 : 0.75, filter: isFound ? `drop-shadow(0 0 5px ${nation.color})` : "none" }}
              />
            </motion.span>
          </span>
        ))}
      </motion.span>
    </RelicButton>
  );
};
