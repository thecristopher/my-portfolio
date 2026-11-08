import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Sprite from "../../components/Sprite";
import { ECG, JILL } from "../../lib/sprites/jill";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import Jill from "./Jill";
import Enemy from "./Enemy";
import Continue from "./Continue";
import { useSurvival } from "./useSurvival";
import { Blast, Rocket, Tyrant } from "./Finale";
import {
  MAX_ENEMIES,
  MAX_HEALTH,
  TAKEDOWNS_TO_WIN,
  aliveCount,
  bodyWidth,
  conditionFor,
  enemyStop,
  finalePlan,
  firesRocket,
  hitFor,
  isAttacking,
  jillFront,
  jillStart,
  jillStep,
  missionLine,
  missionMarks,
  needsHandgun,
  nextEnemyWait,
  pickKind,
  pickTarget,
  takedownLine,
  tyrantStep,
} from "./actions";

// the first zombie shows up a moment after the fight starts, long enough for her radio call to land
const FIRST_ENEMY_MS = 1500;
// how far into her aim the rocket leaves, so the launcher is still on her shoulder when it fires
const AIM_TO_FIRE_MS = 300;

// how wide the corner is, so the enemies know where Jill's punch lands
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

// the enemies on screen and what happens to them: they come in, get rushed, take hits, go down or flee. zombies and
// Cerberus taking turns. the count of how many came lives in the same state as the list, so the updater stays pure
// and a new enemy's id and kind come out the same however many times React runs it
const useEnemies = () => {
  const [{ enemies }, setStage] = useState({ enemies: [], spawned: 0 });
  const update = (next) => setStage((stage) => ({ ...stage, enemies: next(stage.enemies) }));
  const change = (id, patch) => update((all) => all.map((enemy) => (enemy.id === id ? { ...enemy, ...patch(enemy) } : enemy)));

  return {
    enemies,
    spawn: () =>
      setStage((stage) => {
        if (aliveCount(stage.enemies) >= MAX_ENEMIES) return stage;
        const enemy = { id: stage.spawned + 1, kind: pickKind(stage.spawned), status: "coming", hits: 0 };
        return { enemies: [...stage.enemies, enemy], spawned: stage.spawned + 1 };
      }),
    arrive: (id) => change(id, (enemy) => ({ status: enemy.status === "down" ? enemy.status : "waiting" })),
    rush: (id) => change(id, (enemy) => ({ status: enemy.status === "coming" ? "rushing" : enemy.status })),
    hit: (id) => change(id, (enemy) => ({ hits: enemy.hits + 1 })),
    takeDown: (id) => change(id, () => ({ status: "down" })),
    scatter: () => update((all) => all.map((enemy) => (enemy.status === "down" ? enemy : { ...enemy, status: "fleeing" }))),
    clear: () => update(() => []),
    remove: (id) => update((all) => all.filter((enemy) => enemy.id !== id)),
  };
};

// a new enemy every few seconds once Jill is standing there, until the mission is over
const useSpawner = (isOn, spawn) => {
  const latest = useRef(spawn);
  latest.current = spawn;
  useEffect(() => {
    if (!isOn) return undefined;
    let timer = setTimeout(function comeIn() {
      latest.current();
      timer = setTimeout(comeIn, nextEnemyWait(Math.random()));
    }, FIRST_ENEMY_MS);
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

// how much room under the floor the mission readout takes and how much the bubble takes over her head, in px
const SCORE_ROOM = 52;
const BUBBLE_ROOM = { phone: 84, wide: 92 };

// the ground the buttons, the enemies and Jill all share: one thin line across the section, warming toward where she
// stands, so she lives on the page instead of in a box
const Ground = () => (
  <span
    className="pointer-events-none absolute inset-x-0 h-px"
    style={{ bottom: SCORE_ROOM, background: "linear-gradient(90deg, transparent, var(--color-line-strong) 12%, var(--color-line-strong) 55%, var(--color-sunset-1) 88%, transparent)" }}
    aria-hidden="true"
  />
);

// the bar under the takedown marks, her health in the color the ECG reads it
const HEALTH_COLOR = { fine: "#3ddc84", caution: "#f5c542", danger: "#e5484d" };

// the mission readout under the ground: the ECG from the first Resident Evil reading her health as Fine, Caution or
// Danger, a health bar, a mark for every takedown and what to do next, so anyone passing by knows there's a fight to
// start and a Tyrant to draw out
const MissionReadout = ({ count, health, line, hint, isStill }) => {
  const condition = conditionFor(health);
  return (
    <div className="font-pixel pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 text-[11px] tracking-[0.16em] text-muted uppercase sm:text-sm" style={{ height: SCORE_ROOM - 4 }}>
      <span className={`shrink-0 ${condition === "fine" || isStill ? "" : "animate-pulse"}`} aria-hidden="true">
        <Sprite key={condition} sheet={ECG} animation={condition} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex items-center gap-1.5" aria-hidden="true">
          {missionMarks(count, TAKEDOWNS_TO_WIN).map((isDone, index) => (
            <motion.span
              key={`${index}-${isDone}`}
              initial={isDone ? { scale: 1.8 } : false}
              animate={{ scale: 1 }}
              className={`block size-2.5 rotate-45 border ${isDone ? "border-sunset-1 bg-sunset-1" : "border-line-strong"}`}
            />
          ))}
          <span className="ml-2 block h-1.5 w-16 overflow-hidden rounded-full bg-line sm:w-24">
            <motion.span className="block h-full rounded-full" animate={{ width: `${(health / MAX_HEALTH) * 100}%`, backgroundColor: HEALTH_COLOR[condition] }} transition={{ duration: 0.3 }} />
          </span>
        </span>
        <motion.span key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="leading-snug font-semibold text-accent">
          {line}
        </motion.span>
      </span>
      {hint && <span className="hidden normal-case tracking-normal text-fg sm:inline">{hint}</span>}
      <span className="sr-only" aria-live="polite">
        {takedownLine(count)}, health {health} of {MAX_HEALTH}
      </span>
    </div>
  );
};

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

// the finale: the Tyrant out of the ground, her rocket in flight, and the blast once it lands
const useFinale = (hasEnded, isStill) => {
  const [tyrant, setTyrant] = useState(null);
  const [rocket, setRocket] = useState("waiting");

  useEffect(() => {
    if (hasEnded && !isStill) setTyrant((stage) => tyrantStep(stage, "start"));
  }, [hasEnded, isStill]);

  const fire = useCallback(() => setRocket((was) => (was === "waiting" ? "flying" : was)), []);

  return {
    tyrant,
    rocket,
    fire,
    risen: () => setTyrant((stage) => tyrantStep(stage, "risen")),
    hit: () => {
      setRocket("landed");
      setTyrant((stage) => tyrantStep(stage, "hit"));
    },
    clear: () => setRocket("done"),
  };
};

// the Tyrant, her rocket and its blast, laid out across the lane
const FinaleStage = ({ finale, width, scale }) => {
  if (!finale.tyrant || !width) return null;
  const plan = finalePlan(width, scale);
  return (
    <>
      <Tyrant x={plan.tyrant} stage={finale.tyrant} scale={scale} onRisen={finale.risen} />
      {finale.rocket === "flying" && <Rocket from={plan.muzzle} to={plan.target} scale={scale} onHit={finale.hit} />}
      {finale.rocket === "landed" && <Blast at={plan.target} scale={scale} onDone={finale.clear} />}
    </>
  );
};

// what the readout suggests under the line, only while there's something to do with it
const hintFor = (phase, takedowns, isStill) => {
  if (isStill || phase !== "fight" || takedowns > 0) return null;
  return "Click them, or Jill.";
};

/**
 * Jill on the contact section's own ground, drawn twice her size on anything wider than a phone: she stands at the far
 * right and answers every action the section sends her, in peace until the visitor clicks her to start the mission.
 * Then every few seconds a zombie or a Cerberus comes in along the ground. Whatever reaches her takes a punch, a kick
 * and a roundhouse, and anything still on its way, or any dog, gets the handgun. Whatever she leaves at her feet bites,
 * and when her health runs out she goes down and the fight can be tried again. Three takedowns draw out the Tyrant:
 * she takes it out with the rocket launcher, the rest run and she takes her beret off.
 * @param {{ cue: { name: string, detail?: string, key: number } | null, className?: string }} props
 *   cue is the latest action she should answer (see cueFor)
 */
const Showdown = ({ cue, className = "" }) => {
  const prefersReducedMotion = useReducedMotion();
  const [jill, send] = useReducer(jillStep, prefersReducedMotion, jillStart);
  const { enemies, spawn, arrive, rush, hit, takeDown, scatter, clear, remove } = useEnemies();
  const [cornerRef, width] = useWidth();
  const target = useRef(null);
  const isWide = useMediaQuery("(min-width: 640px)");
  const scale = isWide ? 2 : 1;
  const jillWidth = JILL.cell.width * scale;
  const stopFor = (kind) => enemyStop(width, jillFront(scale), bodyWidth(kind, scale), scale);
  const line = useLine(jill.said, jill.take);
  const { survival, start, takedown, retry } = useSurvival({
    enemies,
    onBite: () => send({ type: "hurt" }),
    onDeath: () => {
      send({ type: "die" });
      scatter();
    },
  });

  useEffect(() => {
    if (cue) send({ type: "cue", name: cue.name, detail: cue.detail });
  }, [cue]);

  const hasMissionEnded = useMissionEnd(survival.phase === "won", jill.hasArrived, () => {
    send({ type: "missionComplete" });
    scatter();
  });

  useSpawner(jill.hasArrived && survival.phase === "fight" && !prefersReducedMotion, spawn);
  const finale = useFinale(hasMissionEnded, prefersReducedMotion);
  const { fire } = finale;

  // she fires partway through her aim, while the launcher is still up
  useEffect(() => {
    if (!firesRocket(jill.pose)) return undefined;
    const timer = setTimeout(fire, AIM_TO_FIRE_MS);
    return () => clearTimeout(timer);
  }, [jill.pose, fire]);

  // the first click on her starts the mission, with her radio call, instead of a shot at nothing
  const startMission = () => {
    if (prefersReducedMotion || !jill.hasArrived) return;
    start();
    send({ type: "cue", name: "start" });
  };

  const fight = (clickedId = null) => {
    if (survival.phase === "calm") return startMission();
    if (survival.phase !== "fight" || !jill.hasArrived || isAttacking(jill.pose)) return undefined;
    target.current = pickTarget(enemies, clickedId);
    // anything still on its way gets the handgun from across the stage, and so does a dog. what's at her feet gets the combo
    const isFar = needsHandgun(enemies.find((enemy) => enemy.id === target.current));
    if (target.current !== null && !isFar) rush(target.current);
    send({ type: "combo", isFar });
    return undefined;
  };

  // a finished move lands on the enemy in front of her before the next one starts
  const finishMove = () => {
    const outcome = hitFor(jill.pose);
    if (outcome === "spark" && target.current !== null) hit(target.current);
    if (outcome === "down" && target.current !== null) {
      takeDown(target.current);
      takedown();
      target.current = null;
    }
    send({ type: "ended" });
  };

  const tryAgain = () => {
    clear();
    target.current = null;
    retry();
    send({ type: "revive" });
  };

  return (
    <div
      className={`pointer-events-none relative w-full ${className}`}
      style={{ height: JILL.cell.height * scale + SCORE_ROOM + (isWide ? BUBBLE_ROOM.wide : BUBBLE_ROOM.phone) }}
    >
      <Ground />
      <MissionReadout
        count={survival.takedowns}
        health={survival.health}
        line={missionLine({ phase: survival.phase, tyrant: finale.tyrant })}
        hint={hintFor(survival.phase, survival.takedowns, prefersReducedMotion)}
        isStill={prefersReducedMotion}
      />
      {/* the lane the fight happens in: her feet and every enemy rest right on the ground line */}
      <div ref={cornerRef} className="absolute inset-x-0 top-0" style={{ bottom: SCORE_ROOM }}>
        <Spotlight jillWidth={jillWidth} />
        <Transmission line={line} jillWidth={jillWidth} jillHeight={JILL.cell.height * scale} />
        <AnimatePresence>
          {enemies.map((enemy) => (
            <Enemy key={enemy.id} enemy={enemy} stopX={stopFor(enemy.kind)} scale={scale} onPick={fight} onArrive={arrive} onGone={remove} />
          ))}
        </AnimatePresence>
        <FinaleStage finale={finale} width={width} scale={scale} />
        <div className="pointer-events-auto absolute right-0 bottom-0">
          {/* every life gets her entrance again */}
          <Jill key={survival.life} state={jill} scale={scale} onArrive={() => send({ type: "arrive" })} onEnded={finishMove} onFight={() => fight()} />
        </div>
        {survival.phase === "down" && <Continue onRetry={tryAgain} />}
      </div>
    </div>
  );
};

export default Showdown;
