import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { pixelsToPaths, spriteToPixels } from "../../actions";
import { BUG_SIZE, bugMotion } from "./actions";

// a little beetle facing right, toward Jill, one character per pixel
const BUG_PALETTE = { K: "#1b1022", R: "#e5485f", r: "#a8283f", W: "#ffd9de", E: "#f6f1ff" };
const SHELL = ["..........K.", "...KKKKK.K..", "..KRRWRRKKK.", ".KRRRRRrKEEK", ".KrRRRRrKEEK", "..KrrrrrKKK.", "............", "............"];
const LEGS_UP = ["............", "............", "............", "............", "............", "............", ".K..K..K....", "K..K..K....."];
const LEGS_DOWN = ["............", "............", "............", "............", "............", "............", "..K..K..K...", "...K..K..K.."];
const SQUASHED = ["............", "............", "............", "............", "...KKKKKK...", ".KRRRRRRRK..", "KrrrrrrrrrK.", ".KKKKKKKKKK."];

const paths = (rows) => pixelsToPaths(spriteToPixels(rows, BUG_PALETTE));
const ART = { shell: paths(SHELL), legsUp: paths(LEGS_UP), legsDown: paths(LEGS_DOWN), squashed: paths(SQUASHED) };

const Layer = ({ layer }) => layer.map(({ color, d }) => <path key={color} d={d} fill={color} />);

// the legs swap between two frames while it crawls, the same trick the old games used
const Legs = ({ isMoving }) => (
  <>
    <motion.g animate={isMoving ? { opacity: [1, 1, 0, 0] } : { opacity: 1 }} transition={{ duration: 0.24, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}>
      <Layer layer={ART.legsUp} />
    </motion.g>
    <motion.g animate={isMoving ? { opacity: [0, 0, 1, 1] } : { opacity: 0 }} transition={{ duration: 0.24, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}>
      <Layer layer={ART.legsDown} />
    </motion.g>
  </>
);

const BugArt = ({ isSquashed, isMoving, scale }) => (
  <svg viewBox="0 0 12 8" width={BUG_SIZE.width * scale} height={BUG_SIZE.height * scale} shapeRendering="crispEdges" className="drop-shadow-sm">
    {isSquashed ? (
      <Layer layer={ART.squashed} />
    ) : (
      <>
        <Layer layer={ART.shell} />
        <Legs isMoving={isMoving} />
      </>
    )}
  </svg>
);

// the burst a hit leaves on the bug, gone in a blink, as big as the stage is drawn
const Spark = ({ scale }) => (
  <motion.svg
    viewBox="-10 -10 20 20"
    className="pointer-events-none absolute left-1/2 -translate-x-1/2"
    style={{ width: 40 * scale, height: 40 * scale, top: -16 * scale }}
    initial={{ scale: 0.3, opacity: 1, rotate: 0 }}
    animate={{ scale: 1.4, opacity: 0, rotate: 30 }}
    transition={{ duration: 0.32, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M0 -10L2 -2L10 0L2 2L0 10L-2 2L-10 0L-2 -2Z" fill="#fff6c2" />
    <path d="M-6 -6L-1 -1M6 -6L1 -1M-6 6L-1 1M6 6L1 1" stroke="#ffb347" strokeWidth="1.6" strokeLinecap="round" />
  </motion.svg>
);

// every change of status starts its move fresh, since a rush aims at the same spot as the crawl it cuts short and
// would otherwise keep the crawl's slow pace
const useBugMoves = (bug, stopX, scale, onArrive, onGone) => {
  const controls = useAnimationControls();
  const done = useRef({ onArrive, onGone });
  done.current = { onArrive, onGone };

  useEffect(() => {
    let isCurrent = true;
    controls.start(bugMotion(bug.status, stopX, scale)).then(() => {
      if (!isCurrent) return;
      if (bug.status === "crawling" || bug.status === "rushing") done.current.onArrive(bug.id);
      if (bug.status === "squashed" || bug.status === "fleeing") done.current.onGone(bug.id);
    });
    return () => {
      isCurrent = false;
    };
  }, [bug.status, bug.id, stopX, scale, controls]);

  return controls;
};

/**
 * One bug crawling in toward Jill and waiting in front of her until it gets what's coming. It's a button, so a click,
 * a tap or a keyboard press sends her after it.
 * @param {{ bug: { id: number, status: string, hits: number }, stopX: number, scale?: number, onPick: (id: number) => void, onArrive: (id: number) => void, onGone: (id: number) => void }} props
 *   stopX is where it stops in front of her, scale matches how big Jill is drawn, onArrive fires once it gets there,
 *   onGone once it has flown off or fled
 */
export const Bug = ({ bug, stopX, scale = 1, onPick, onArrive, onGone }) => {
  const isGone = bug.status === "squashed" || bug.status === "fleeing";
  const controls = useBugMoves(bug, stopX, scale, onArrive, onGone);
  return (
    <motion.button
      type="button"
      onClick={() => onPick(bug.id)}
      disabled={isGone}
      aria-label="Squash this bug"
      initial={{ x: -BUG_SIZE.width * scale, y: 0 }}
      animate={controls}
      className="pointer-events-auto absolute bottom-0 left-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <BugArt isSquashed={bug.status === "squashed"} isMoving={bug.status === "crawling" || bug.status === "rushing"} scale={scale} />
      <AnimatePresence>{bug.hits > 0 && <Spark key={bug.hits} scale={scale} />}</AnimatePresence>
    </motion.button>
  );
};

/** A tiny bug for the squash counter, standing still. */
export const BugIcon = () => (
  <svg viewBox="0 0 12 8" width={15} height={10} shapeRendering="crispEdges" aria-hidden="true">
    <Layer layer={ART.shell} />
    <Layer layer={ART.legsUp} />
  </svg>
);
