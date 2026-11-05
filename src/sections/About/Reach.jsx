import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { easeOutExpo } from "../../lib/motion";
import { careerJourney, chapterFade, journeyTimes, stopCard } from "./actions";
import { BEATS, LIGHTS, STOPS } from "./mapStory";
import Itinerary from "./Itinerary";
import Loupe from "./Loupe";
import ReachMap from "./ReachMap";
import { CardBody, Lights } from "./StopCards";

// the chapter of the story on screen right now, written big over the map while its part of the route plays
const Chapter = ({ stop, progress, isFirst, isLast }) => {
  const { input, output } = chapterFade(stop.beat, { isFirst, isLast });
  const opacity = useScrollRange(progress, input, output);
  const y = useScrollRange(progress, input.slice(0, 2), [16, 0]);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0 flex flex-col gap-1">
      <p className="text-[clamp(1.5rem,3.4vw,2.6rem)] leading-tight font-semibold tracking-[-0.03em] text-balance">{stop.place}</p>
      <p className="text-sm text-muted">{stop.company}</p>
    </motion.div>
  );
};

// one card open at a time, closed with Escape like any popover
const useOpenStop = () => {
  const [openKey, setOpenKey] = useState(null);
  useEffect(() => {
    if (!openKey) return undefined;
    const closeOnEscape = (event) => event.key === "Escape" && setOpenKey(null);
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openKey]);
  return { openKey, open: setOpenKey, close: () => setOpenKey(null) };
};

// the map, its chapters written over it, and the lights you can open, at any size
const Scene = ({ progress, isStill }) => {
  const { data: projects = [] } = useGetProjectsQuery();
  const { openKey, open, close } = useOpenStop();
  const cardFor = (light) => stopCard(STOPS.find((stop) => stop.id === light.stop), projects);
  const openLight = LIGHTS.find((light) => light.key === openKey);
  const openCard = openLight ? cardFor(openLight) : null;
  // the tap hint waits for the first light, there's nothing to tap before it
  const firstLight = Math.min(...LIGHTS.map((light) => light.appearsAt));
  const hintOpacity = useScrollRange(progress, [firstLight - 0.03, firstLight], [0, 1]);
  const journey = careerJourney(projects);
  const times = journeyTimes(journey.length, BEATS.closeUp);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-end justify-between gap-6">
        <p className="text-sm font-semibold text-muted">Where I worked, and where the work reached</p>
        <p className="hidden text-xs text-faint sm:block">Hover a light to see the work behind it</p>
      </div>
      <div className="relative h-24 sm:h-20">
        {STOPS.map((stop, index) => (
          <Chapter key={stop.id} stop={stop} progress={progress} isFirst={index === 0} isLast={index === STOPS.length - 1} />
        ))}
      </div>
      <div className="relative">
        <ReachMap progress={progress} isStill={isStill} />
        <Loupe journey={journey} times={times} progress={progress} isStill={isStill} />
        <Lights lights={LIGHTS} progress={progress} openKey={openKey} cardFor={cardFor} onOpen={open} onClose={close} />
      </div>
      <Itinerary journey={journey} times={times} progress={progress} />
      {/* phones read the open card under the map, there's no room to float it over */}
      <div className="min-h-40 md:hidden">
        <AnimatePresence mode="wait">
          {openCard ? (
            <motion.div key={openKey} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: easeOutExpo }} className="card rounded-2xl p-5">
              <CardBody card={openCard} />
            </motion.div>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-faint">
              <motion.span style={{ opacity: hintOpacity }}>Tap a light on the map to see the work behind it.</motion.span>
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * From the border to the world, as a scene that holds the screen while it plays: close on Baja while its coast is
 * traced, then the camera pulls back, the routes fly to the countries the payroll ran in, and the light spreads over
 * every coast where the news is read. Every light opens the work behind it.
 */
const Reach = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const finished = useMotionValue(1);

  if (prefersReducedMotion) return <Scene progress={finished} isStill />;

  return (
    <div ref={ref} className="relative h-[420svh]">
      <div className="sticky top-0 flex h-svh items-center">
        <Scene progress={scrollYProgress} isStill={false} />
      </div>
    </div>
  );
};

export default Reach;
