import { useEffect, useState } from "react";
import { localClock } from "../../actions";
import { HOME_TIMEZONE } from "../../lib/profile";
import { skyPosition } from "../About/actions";
import { AURORA_PALETTES, skyPhase } from "./actions";

// the light changes slowly, so checking every few minutes is plenty
const RECHECK_MS = 5 * 60 * 1000;

const readHomeLight = () => {
  const clock = localClock(new Date(), HOME_TIMEZONE);
  return skyPhase(skyPosition(clock.hour, Number(clock.time.split(":")[1])));
};

// the light over Rosarito right now, kept current while the page stays open
const useHomeLight = () => {
  const [phase, setPhase] = useState(readHomeLight);
  useEffect(() => {
    const timer = setInterval(() => setPhase(readHomeLight()), RECHECK_MS);
    return () => clearInterval(timer);
  }, []);
  return phase;
};

const SUNS = [
  "top-[8%] left-[18%] size-[36vmax] blur-[110px]",
  "top-[2%] right-[14%] size-[30vmax] blur-[110px] [animation-delay:-6s]",
  "top-[22%] left-[40%] size-[26vmax] blur-[120px] [animation-delay:-12s]",
];

/**
 * A slow aurora drifting behind the name, colored by the light in Rosarito right now: peach at sunrise, sky and sun
 * during the day, the page's own sunset in the evening and indigo at night.
 */
const Aurora = () => {
  const phase = useHomeLight();
  const palette = AURORA_PALETTES[phase];
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 h-[80svh] overflow-hidden opacity-60 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] dark:opacity-45"
      data-light={phase}
      aria-hidden="true"
    >
      {SUNS.map((placement, index) => (
        <span
          key={placement}
          className={`aurora absolute rounded-full transition-[background-color] duration-[3000ms] ${placement}`}
          style={{ backgroundColor: palette[index] }}
        />
      ))}
    </div>
  );
};

export default Aurora;
