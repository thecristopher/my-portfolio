import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { JILL } from "../../lib/sprites/jill";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Jill from "./Jill";
import { Bug, BugIcon } from "./Bugs";
import { BUG_SIZE, MAX_BUGS, aliveCount, bugStop, hitFor, isAttacking, jillStart, jillStep, missionDelay, nextBugWait, pickTarget, squashLine } from "./actions";

const FIRST_BUG_MS = 2500;

// how wide the corner is, so the bugs know where Jill's punch lands
const useWidth = () => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
};

// the bugs on screen and what happens to them: they crawl in, get rushed, take hits, get squashed or flee
const useBugs = () => {
  const [bugs, setBugs] = useState([]);
  const nextId = useRef(1);
  const change = (id, update) => setBugs((all) => all.map((bug) => (bug.id === id ? { ...bug, ...update(bug) } : bug)));

  return {
    bugs,
    spawn: () => setBugs((all) => (aliveCount(all) >= MAX_BUGS ? all : [...all, { id: nextId.current++, status: "crawling", hits: 0 }])),
    arrive: (id) => change(id, (bug) => ({ status: bug.status === "squashed" ? bug.status : "waiting" })),
    rush: (id) => change(id, (bug) => ({ status: bug.status === "crawling" ? "rushing" : bug.status })),
    hit: (id) => change(id, (bug) => ({ hits: bug.hits + 1 })),
    squash: (id) => change(id, () => ({ status: "squashed" })),
    scatter: () => setBugs((all) => all.map((bug) => (bug.status === "squashed" ? bug : { ...bug, status: "fleeing" }))),
    remove: (id) => setBugs((all) => all.filter((bug) => bug.id !== id)),
  };
};

// a new bug every so often once Jill is standing there, until the mission is over
const useSpawner = (isOn, spawn) => {
  const latest = useRef(spawn);
  latest.current = spawn;
  useEffect(() => {
    if (!isOn) return undefined;
    let timer = setTimeout(function crawlIn() {
      latest.current();
      timer = setTimeout(crawlIn, nextBugWait(Math.random()));
    }, FIRST_BUG_MS);
    return () => clearTimeout(timer);
  }, [isOn]);
};

// the mission only ends once she has had her time on stage, then calls onEnd once
const useMissionEnd = (isReached, hasArrived, onEnd) => {
  const arrivedAt = useRef(null);
  const latest = useRef(onEnd);
  latest.current = onEnd;
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (hasArrived && arrivedAt.current === null) arrivedAt.current = Date.now();
  }, [hasArrived]);

  useEffect(() => {
    if (!isReached || !hasArrived || hasEnded) return undefined;
    const timer = setTimeout(() => {
      setHasEnded(true);
      latest.current();
    }, missionDelay(arrivedAt.current ?? Date.now(), Date.now()));
    return () => clearTimeout(timer);
  }, [isReached, hasArrived, hasEnded]);

  return hasEnded;
};

// how tall the floor strip is and how much room the plates take above her head, in px
const FLOOR = 30;
const HUD_ROOM = { phone: 76, wide: 84 };

// the fighter's plate on the left the way a fighting game names who's on screen, with her full health bar and, until
// the first bug goes down, how to play
const PlayerPlate = ({ showsHint }) => (
  <div className="flex flex-col gap-1.5">
    <p className="flex items-center gap-2 text-xs tracking-[0.2em] text-white sm:text-sm">
      <span className="bg-sunset size-2 rotate-45" aria-hidden="true" />
      JILL VALENTINE
    </p>
    <span className="bg-sunset block h-2 w-32 -skew-x-12 rounded-sm ring-1 ring-white/30 sm:h-2.5 sm:w-56" aria-hidden="true" />
    {showsHint && <p className="text-[11px] text-white/60">Click her, or a bug.</p>}
  </div>
);

// the other side of the screen keeps the score, the way the opponent's plate would
const ScorePlate = ({ count }) => (
  <div className="flex flex-col items-end gap-1">
    <p className="flex items-center gap-1.5 text-xs tracking-[0.2em] text-white/70 sm:text-sm">
      <BugIcon />
      BUGS
    </p>
    <motion.p key={count} initial={{ scale: 1.5 }} animate={{ scale: 1 }} className="origin-right text-2xl leading-none text-[#ffd84a] tabular-nums sm:text-3xl" aria-hidden="true">
      ×{String(count).padStart(2, "0")}
    </motion.p>
    <span className="sr-only" aria-live="polite">
      {squashLine(count)}
    </span>
  </div>
);

// no bugs ever crawl in for anyone who asked for less movement, so the hint only shows when there's a fight to have
const Hud = ({ count, isStill }) => (
  <div className="font-pixel pointer-events-none absolute inset-x-4 top-4 z-10 flex items-start justify-between sm:inset-x-6 sm:top-5">
    <PlayerPlate showsHint={!isStill && count === 0} />
    <ScorePlate count={count} />
  </div>
);

// the arena itself, always at night whatever the theme so the fight reads the same: a dusk sky, a few stars, the
// glow of the sunset low on the horizon and a tiled floor
const Arena = () => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#070a1c_0%,#121433_55%,#2a1838_88%)]" />
    <div className="absolute inset-0 bg-[radial-gradient(1px_1px_at_12%_22%,#fff8,transparent),radial-gradient(1px_1px_at_34%_12%,#fff6,transparent),radial-gradient(1.5px_1.5px_at_58%_28%,#fff9,transparent),radial-gradient(1px_1px_at_76%_16%,#fff6,transparent),radial-gradient(1px_1px_at_90%_34%,#fff7,transparent)]" />
    <div className="absolute inset-x-0 opacity-50" style={{ bottom: FLOOR, height: "45%", background: "radial-gradient(ellipse at 50% 100%, var(--color-sunset-2), transparent 70%)" }} />
    <div
      className="absolute inset-x-0 bottom-0 border-t-2 border-[#ffb36b]/50 bg-[#1a1026] bg-[repeating-linear-gradient(90deg,transparent_0_46px,#ffffff10_46px_48px)]"
      style={{ height: FLOOR }}
    />
  </div>
);

// the light she stands in: a warm pool centered on her that fades out before its own edges, and her shadow under her feet
const Spotlight = ({ jillWidth }) => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <span
      className="absolute bottom-0 h-full opacity-45"
      style={{ width: jillWidth * 2, right: -jillWidth / 2, background: "radial-gradient(ellipse 50% 100% at 50% 100%, var(--color-sunset-1), transparent)" }}
    />
    <span className="absolute right-0 -bottom-1 h-3 rounded-[50%] bg-black/60 blur-sm" style={{ width: jillWidth * 0.6, marginRight: jillWidth * 0.2 }} />
  </div>
);

/**
 * Jill's arena under the email buttons, drawn twice her size on anything wider than a phone: she stands at the far
 * end, reacts to the cue the buttons send, and bugs crawl in now and then for her to take out with a punch, a kick and
 * a roundhouse. Once the page is read to the end she takes her beret off and the bugs that are left run.
 * @param {{ cue: { name: string, key: number } | null, isMissionComplete: boolean }} props cue is the latest reaction
 *   asked for by the buttons
 */
const BugHunt = ({ cue, isMissionComplete }) => {
  const prefersReducedMotion = useReducedMotion();
  const [jill, send] = useReducer(jillStep, prefersReducedMotion, jillStart);
  const { bugs, spawn, arrive, rush, hit, squash, scatter, remove } = useBugs();
  const [cornerRef, width] = useWidth();
  const [squashed, setSquashed] = useState(0);
  const target = useRef(null);
  const isWide = useMediaQuery("(min-width: 640px)");
  const scale = isWide ? 2 : 1;
  const jillWidth = JILL.cell.width * scale;
  const stopX = bugStop(width, jillWidth, BUG_SIZE.width * scale, scale);

  const hasMissionEnded = useMissionEnd(isMissionComplete, jill.hasArrived, () => {
    send({ type: "missionComplete" });
    scatter();
  });

  useSpawner(jill.hasArrived && !hasMissionEnded && !prefersReducedMotion, spawn);

  useEffect(() => {
    if (cue) send({ type: "cue", name: cue.name });
  }, [cue]);

  const fight = (clickedId = null) => {
    if (!jill.hasArrived || isAttacking(jill.pose)) return;
    target.current = pickTarget(bugs, clickedId);
    if (target.current !== null) rush(target.current);
    send({ type: "combo" });
  };

  // a finished move lands on the bug in front of her before the next one starts
  const finishMove = () => {
    const outcome = hitFor(jill.pose);
    if (outcome === "spark" && target.current !== null) hit(target.current);
    if (outcome === "squash" && target.current !== null) {
      squash(target.current);
      setSquashed((count) => count + 1);
      target.current = null;
    }
    send({ type: "ended" });
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl ring-1 ring-white/10"
      style={{ height: JILL.cell.height * scale + FLOOR + (isWide ? HUD_ROOM.wide : HUD_ROOM.phone) }}
    >
      <Arena />
      <Hud count={squashed} isStill={prefersReducedMotion} />
      {/* the lane the fight happens in: her feet and the bugs rest just inside the top edge of the floor */}
      <div ref={cornerRef} className="absolute inset-x-3 top-0 sm:inset-x-8" style={{ bottom: FLOOR - 6 }}>
        <Spotlight jillWidth={jillWidth} />
        <AnimatePresence>
          {bugs.map((bug) => (
            <Bug key={bug.id} bug={bug} stopX={stopX} scale={scale} onPick={fight} onArrive={arrive} onGone={remove} />
          ))}
        </AnimatePresence>
        <div className="absolute right-0 bottom-0">
          <Jill state={jill} scale={scale} onArrive={() => send({ type: "arrive" })} onEnded={finishMove} onFight={() => fight()} />
        </div>
      </div>
    </div>
  );
};

export default BugHunt;
