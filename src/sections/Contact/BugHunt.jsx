import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { JILL } from "../../lib/sprites/jill";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Jill from "./Jill";
import { Bug, BugIcon } from "./Bugs";
import { BUG_SIZE, MAX_BUGS, aliveCount, bugStop, hitFor, isAttacking, isMissionComplete, jillStart, jillStep, nextBugWait, pickTarget, squashLine } from "./actions";

const FIRST_BUG_MS = 2500;
// the empty rows under her boots in each sprite cell, so her feet land on the ground line instead of above it
const FEET_BELOW_CELL = 2;

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

// the mission ends the first time it counts as complete once she's on stage, and calls onEnd that one time
const useMissionEnd = (isComplete, hasArrived, onEnd) => {
  const latest = useRef(onEnd);
  latest.current = onEnd;
  const [hasEnded, setHasEnded] = useState(false);

  useEffect(() => {
    if (!isComplete || !hasArrived || hasEnded) return;
    setHasEnded(true);
    latest.current();
  }, [isComplete, hasArrived, hasEnded]);

  return hasEnded;
};

// how long a line stays up after she says it
const LINE_MS = 5200;

// the last thing she said, until it's time to clear it. a new line replaces it on the spot, and a silent move (her
// idle, a punch) leaves the current one up until its own time runs out
const useLine = (said, take) => {
  const [line, setLine] = useState(null);
  const timer = useRef(null);
  useEffect(() => {
    if (!said) return;
    setLine({ text: said, key: take });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLine(null), LINE_MS);
  }, [said, take]);
  useEffect(() => () => clearTimeout(timer.current), []);
  return line;
};

// her radio call as a codec bubble over her head, letters typing in, its tail pointing down at her
const Transmission = ({ line, jillWidth, jillHeight }) => (
  <div className="pointer-events-none absolute right-0 z-10 flex justify-end" style={{ bottom: jillHeight * 0.94, width: Math.max(jillWidth * 1.6, 260) }} aria-live="polite">
    <AnimatePresence mode="wait">
      {line && (
        <motion.div
          key={line.key}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="font-pixel relative origin-bottom-right rounded-lg border border-[#7fd8ff]/40 bg-[#06122a]/90 px-3 py-2 text-[11px] leading-relaxed text-[#cfefff] shadow-[0_0_24px_-6px_#7fd8ff] backdrop-blur sm:text-xs"
        >
          <span className="mb-0.5 block text-[10px] tracking-[0.25em] text-[#7fd8ff]">◆ JILL · S.T.A.R.S.</span>
          <motion.span initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ duration: 0.9, ease: "linear" }} className="block">
            {line.text}
          </motion.span>
          <span className="absolute -bottom-[7px] size-3 rotate-45 border-r border-b border-[#7fd8ff]/40 bg-[#06122a]" style={{ right: jillWidth * 0.4 }} aria-hidden="true" />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// how much room under the floor the score takes and how much the bubble takes over her head, in px
const SCORE_ROOM = 28;
const BUBBLE_ROOM = { phone: 84, wide: 92 };

// the ground the buttons, the bugs and Jill all share: one thin line across the section, warming toward where she
// stands, so she lives on the page instead of in a box
const Ground = () => (
  <span
    className="pointer-events-none absolute inset-x-0 h-px"
    style={{ bottom: SCORE_ROOM, background: "linear-gradient(90deg, transparent, var(--color-line-strong) 12%, var(--color-line-strong) 55%, var(--color-sunset-1) 88%, transparent)" }}
    aria-hidden="true"
  />
);

// the score, quiet under the ground line, with how to play until the first bug goes down
const Score = ({ count, isStill }) => (
  <div className="font-pixel pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 text-[10px] tracking-[0.18em] text-faint uppercase sm:text-[11px]" style={{ height: SCORE_ROOM - 6 }}>
    <BugIcon />
    <motion.span key={count} initial={{ scale: 1.4 }} animate={{ scale: 1 }} className="origin-left text-sunset-1 tabular-nums" aria-hidden="true">
      ×{String(count).padStart(2, "0")}
    </motion.span>
    {!isStill && count === 0 && <span className="normal-case tracking-normal">Click Jill, or a bug.</span>}
    <span className="sr-only" aria-live="polite">
      {squashLine(count)}
    </span>
  </div>
);

// the warm light she stands in, fading out well before its edges, and her shadow on the ground
const Spotlight = ({ jillWidth }) => (
  <div className="pointer-events-none absolute inset-0" aria-hidden="true">
    <span
      className="absolute bottom-0 h-[80%] opacity-25 dark:opacity-35"
      style={{ width: jillWidth * 2, right: -jillWidth / 2, background: "radial-gradient(ellipse 50% 100% at 50% 100%, var(--color-sunset-1), transparent)" }}
    />
    <span className="absolute right-0 -bottom-1 h-3 rounded-[50%] bg-black/25 blur-sm dark:bg-black/60" style={{ width: jillWidth * 0.6, marginRight: jillWidth * 0.2 }} />
  </div>
);

/**
 * Jill on the contact section's own ground, drawn twice her size on anything wider than a phone: she stands at the far
 * right, answers every action the section sends her, and bugs crawl in along the ground now and then for her to take
 * out with a punch, a kick and a roundhouse. Once the email is on its way, or enough bugs are down, she takes her beret
 * off, the bugs that are left run and she stands down.
 * @param {{ cue: { name: string, detail?: string, key: number } | null, hasSent: boolean, className?: string }} props
 *   cue is the latest action she should answer (see cueFor), hasSent whether the email is on its way, which completes
 *   her mission the same as squashing enough bugs
 */
const BugHunt = ({ cue, hasSent, className = "" }) => {
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
  const line = useLine(jill.said, jill.take);

  // the cue goes first, so the copy that completes the mission still gets its happy before the beret comes off
  useEffect(() => {
    if (cue) send({ type: "cue", name: cue.name, detail: cue.detail });
  }, [cue]);

  const hasMissionEnded = useMissionEnd(isMissionComplete(hasSent, squashed), jill.hasArrived, () => {
    send({ type: "missionComplete" });
    scatter();
  });

  useSpawner(jill.hasArrived && !hasMissionEnded && !prefersReducedMotion, spawn);

  const fight = (clickedId = null) => {
    if (!jill.hasArrived || isAttacking(jill.pose)) return;
    target.current = pickTarget(bugs, clickedId);
    // a bug still crawling in gets the handgun from across the stage, one already at her feet gets the combo
    const isFar = bugs.find((bug) => bug.id === target.current)?.status === "crawling";
    if (target.current !== null && !isFar) rush(target.current);
    send({ type: "combo", isFar });
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
      className={`pointer-events-none relative w-full ${className}`}
      style={{ height: JILL.cell.height * scale + SCORE_ROOM + (isWide ? BUBBLE_ROOM.wide : BUBBLE_ROOM.phone) }}
    >
      <Ground />
      <Score count={squashed} isStill={prefersReducedMotion} />
      {/* the lane the fight happens in: her feet and the bugs rest right on the ground line */}
      <div ref={cornerRef} className="absolute inset-x-0 top-0" style={{ bottom: SCORE_ROOM - FEET_BELOW_CELL * scale }}>
        <Spotlight jillWidth={jillWidth} />
        <Transmission line={line} jillWidth={jillWidth} jillHeight={JILL.cell.height * scale} />
        <AnimatePresence>
          {bugs.map((bug) => (
            <Bug key={bug.id} bug={bug} stopX={stopX} scale={scale} onPick={fight} onArrive={arrive} onGone={remove} />
          ))}
        </AnimatePresence>
        <div className="pointer-events-auto absolute right-0 bottom-0">
          <Jill state={jill} scale={scale} onArrive={() => send({ type: "arrive" })} onEnded={finishMove} onFight={() => fight()} />
        </div>
      </div>
    </div>
  );
};

export default BugHunt;
