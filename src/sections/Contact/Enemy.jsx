import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import AnchoredSprite from "../../components/Sprite/Anchored";
import { CERBERUS, ZOMBIE } from "../../lib/sprites/creatures";
import { bodyWidth, enemyMotion } from "./actions";

const CREATURES = { zombie: { sheet: ZOMBIE, move: "walk", label: "zombie" }, cerberus: { sheet: CERBERUS, move: "run", label: "Cerberus" } };

// the burst a hit leaves on the enemy, gone in a blink, as big as the stage is drawn
const Spark = ({ scale }) => (
  <motion.svg
    viewBox="-10 -10 20 20"
    className="pointer-events-none absolute left-1/2 -translate-x-1/2"
    style={{ width: 40 * scale, height: 40 * scale, top: 10 * scale }}
    initial={{ scale: 0.3, opacity: 1, rotate: 0 }}
    animate={{ scale: 1.4, opacity: 0, rotate: 30 }}
    transition={{ duration: 0.32, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M0 -10L2 -2L10 0L2 2L0 10L-2 2L-10 0L-2 -2Z" fill="#fff6c2" />
    <path d="M-6 -6L-1 -1M6 -6L1 -1M-6 6L-1 1M6 6L1 1" stroke="#ffb347" strokeWidth="1.6" strokeLinecap="round" />
  </motion.svg>
);

// the creature from its sheet, standing on the middle of its body: coming at her, going down, or turning tail. neither
// has a standing frame, so one waiting at her feet holds its first frame instead of running in place
const CreatureArt = ({ kind, status, scale }) => {
  const { sheet, move } = CREATURES[kind];
  const animation = status === "down" ? "fall" : move;
  return (
    <span className="relative block" style={{ width: bodyWidth(kind, scale), height: sheet.cell.height * scale }}>
      <span className="absolute" style={{ left: bodyWidth(kind, scale) / 2, top: sheet.anchor.y * scale }}>
        <AnchoredSprite sheet={sheet} animation={animation} scale={scale} facing={status === "fleeing" ? "left" : "right"} isPaused={status === "waiting"} />
      </span>
    </span>
  );
};

// every change of status starts its move fresh, since a rush aims at the same spot as the walk it cuts short and
// would otherwise keep the walk's slow pace
const useEnemyMoves = (enemy, stopX, scale, onArrive, onGone) => {
  const controls = useAnimationControls();
  const done = useRef({ onArrive, onGone });
  done.current = { onArrive, onGone };

  useEffect(() => {
    let isCurrent = true;
    controls.start(enemyMotion(enemy.status, stopX, scale, enemy.kind)).then(() => {
      if (!isCurrent) return;
      if (enemy.status === "coming" || enemy.status === "rushing") done.current.onArrive(enemy.id);
      if (enemy.status === "down" || enemy.status === "fleeing") done.current.onGone(enemy.id);
    });
    return () => {
      isCurrent = false;
    };
  }, [enemy.status, enemy.id, enemy.kind, stopX, scale, controls]);

  return controls;
};

/**
 * One enemy coming at Jill, a zombie or a Cerberus, waiting in front of her until it gets what's coming. It's a
 * button, so a click, a tap or a keyboard press sends her after it.
 * @param {{ enemy: { id: number, kind: "zombie" | "cerberus", status: string, hits: number }, stopX: number, scale?: number, onPick: (id: number) => void, onArrive: (id: number) => void, onGone: (id: number) => void }} props
 *   stopX is where it stops in front of her, scale matches how big Jill is drawn, onArrive fires once it gets there,
 *   onGone once it's gone down or fled
 */
const Enemy = ({ enemy, stopX, scale = 1, onPick, onArrive, onGone }) => {
  const isGone = enemy.status === "down" || enemy.status === "fleeing";
  const controls = useEnemyMoves(enemy, stopX, scale, onArrive, onGone);
  return (
    <motion.button
      type="button"
      onClick={() => onPick(enemy.id)}
      disabled={isGone}
      aria-label={`Take down this ${CREATURES[enemy.kind].label}`}
      initial={{ x: -bodyWidth(enemy.kind, scale), y: 0 }}
      animate={controls}
      className="pointer-events-auto absolute bottom-0 left-0 cursor-crosshair rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <CreatureArt kind={enemy.kind} status={enemy.status} scale={scale} />
      <AnimatePresence>{enemy.hits > 0 && <Spark key={enemy.hits} scale={scale} />}</AnimatePresence>
    </motion.button>
  );
};

export default Enemy;
