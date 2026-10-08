import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import {
  AVATAR_PALETTE,
  AVATAR_ROWS,
  BLINK_SWAPS,
  FIST,
  GUARD_ARM,
  HEAD_UNTIL_ROW,
  LEGS_FROM_ROW,
  PUNCH_ARM,
  SMILE,
  WAVE_FINGER_ROWS,
  WAVE_HAND,
} from "../../lib/avatarSprite";
import { idleMoveDelay, isInRegion, overlaySprite, pickIdleMove, spriteToPixels } from "../../actions";
import { playSound } from "../../lib/sound";

const WIDTH = AVATAR_ROWS[0].length;
const HEIGHT = AVATAR_ROWS.length;
const JAB_REACH = 4;
const GUARD_DROP = 2;
const TEE_COLORS = [AVATAR_PALETTE.T, AVATAR_PALETTE.t, AVATAR_PALETTE.u];
const WAVE_ROWS = overlaySprite(overlaySprite(AVATAR_ROWS, WAVE_HAND, FIST), SMILE);

const isArm = (pixel) => isInRegion(pixel, PUNCH_ARM) && !TEE_COLORS.includes(pixel.color);
const isGuard = (pixel) => isInRegion(pixel, GUARD_ARM);
const isHand = ({ x, y }) => WAVE_HAND.rows[y - WAVE_HAND.top]?.[x - WAVE_HAND.left] > ".";
const isFinger = (pixel) => isHand(pixel) && pixel.y < WAVE_HAND.top + WAVE_FINGER_ROWS;

// each moving part gets its own layer so it can move without dragging the rest of the sprite along
const buildLayers = (pixels, isWaving) => {
  const layers = { legs: [], head: [], chest: [], arm: [], guard: [], palm: [], fingers: [] };
  for (const pixel of pixels) {
    if (pixel.y >= LEGS_FROM_ROW) layers.legs.push(pixel);
    else if (isWaving && isFinger(pixel)) layers.fingers.push(pixel);
    else if (isWaving && isHand(pixel)) layers.palm.push(pixel);
    else if (!isWaving && isArm(pixel)) layers.arm.push(pixel);
    else if (isGuard(pixel)) layers.guard.push(pixel);
    else if (pixel.y <= HEAD_UNTIL_ROW) layers.head.push(pixel);
    else layers.chest.push(pixel);
  }
  // copies of the rows where layers meet, tucked behind, so a layer moving a pixel never opens a see through seam
  layers.neck = layers.head.filter((pixel) => pixel.y === HEAD_UNTIL_ROW);
  layers.waist = layers.chest.filter((pixel) => pixel.y === LEGS_FROM_ROW - 1);
  layers.shoulder = layers.guard.filter((pixel) => pixel.y <= GUARD_ARM.minY + GUARD_DROP - 1);
  return layers;
};

const FRAMES = {
  idle: buildLayers(spriteToPixels(AVATAR_ROWS, AVATAR_PALETTE), false),
  idleBlink: buildLayers(spriteToPixels(AVATAR_ROWS, AVATAR_PALETTE, BLINK_SWAPS), false),
  // happy squinting eyes are already closed, so the wave doesn't need its own blink frame
  wave: buildLayers(spriteToPixels(WAVE_ROWS, AVATAR_PALETTE), true),
};

// mid jab the arm's inner edge stretches across the gap, like smear frames in a fighting game
const ARM_SMEAR = Object.values(
  FRAMES.idle.arm.reduce((leftmost, pixel) => {
    if (!leftmost[pixel.y] || pixel.x < leftmost[pixel.y].x) leftmost[pixel.y] = pixel;
    return leftmost;
  }, {})
);

const BLINK_EVERY_MS = 3800;
const BLINK_FOR_MS = 140;
const FIRST_WAVE_MS = 1400;
const MOVE_LASTS_MS = { wave: 1900, look: 2200 };
const COIN_DRIFT = [-28, 0, 28];
const COINS_LAST_MS = 1100;

// steps instead of easing so every move snaps a whole pixel, like a real sprite
const snapToPixel = (progress) => Math.round(progress);
const breathe = { y: [0, 1, 0], transition: { duration: 1.4, repeat: Infinity, ease: snapToPixel } };
const WAVE_SWING = { x: [0, -1, 0, 1, 0, -1, 0, 1, 0], transition: { duration: 1.5, ease: "linear" } };
const POSE_SHIFT = { duration: 0.15, ease: snapToPixel };

const useBlink = (isEnabled) => {
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    let reopenTimer;
    const blinkTimer = setInterval(() => {
      setIsBlinking(true);
      reopenTimer = setTimeout(() => setIsBlinking(false), BLINK_FOR_MS);
    }, BLINK_EVERY_MS);
    return () => {
      clearInterval(blinkTimer);
      clearTimeout(reopenTimer);
    };
  }, [isEnabled]);

  return isBlinking;
};

// waves hello right after showing up, then keeps himself busy glancing around and waving at random
const useIdleRoutine = (isEnabled, firstWaveAfterMs) => {
  const [move, setMove] = useState(null);
  const moveTimer = useRef(null);
  const nextTimer = useRef(null);

  const perform = useCallback((nextMove) => {
    setMove(nextMove);
    clearTimeout(moveTimer.current);
    moveTimer.current = setTimeout(() => setMove(null), MOVE_LASTS_MS[nextMove]);
  }, []);

  const stop = useCallback(() => {
    clearTimeout(moveTimer.current);
    setMove(null);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    const scheduleNext = () => {
      nextTimer.current = setTimeout(() => {
        perform(pickIdleMove());
        scheduleNext();
      }, idleMoveDelay());
    };
    const firstWave = setTimeout(() => {
      perform("wave");
      scheduleNext();
    }, firstWaveAfterMs);
    return () => {
      clearTimeout(firstWave);
      clearTimeout(nextTimer.current);
      clearTimeout(moveTimer.current);
    };
  }, [isEnabled, firstWaveAfterMs, perform]);

  return [move, perform, stop];
};

const PixelLayer = ({ pixels }) =>
  pixels.map(({ x, y, color }) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />);

// a chunky pixel coin, the classic reward for landing a combo
const Coin = ({ drift, delay }) => (
  <motion.svg
    viewBox="0 0 5 5"
    shapeRendering="crispEdges"
    className="pointer-events-none absolute top-6 right-2 size-3"
    initial={{ x: 0, y: 0, opacity: 1 }}
    animate={{ x: drift, y: [0, -44, -24], opacity: [1, 1, 0] }}
    transition={{ duration: 0.9, delay, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M1 0h3v1h1v3h-1v1h-3v-1h-1v-3h1z" fill="#e8b830" />
    <path d="M2 1h1v3h-1z" fill="#fff3b0" />
  </motion.svg>
);

const SpeechBubble = () => (
  <motion.span
    initial={{ opacity: 0, y: 6, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.25 }}
    className="pointer-events-none absolute -top-7 left-[70%] rounded-md border-2 border-ink bg-fg px-2 py-0.5 font-mono text-[11px] font-bold text-ink"
    aria-hidden="true"
  >
    hola!
    <span className="absolute -bottom-[5px] left-2 size-2 rotate-45 border-r-2 border-b-2 border-ink bg-fg" />
  </motion.span>
);

// a tiny fighting stance me: breathes, blinks, looks around, waves hello with a grin, and jabs when poked
const PixelAvatar = ({ className = "", firstWaveAfterMs = FIRST_WAVE_MS }) => {
  const prefersReducedMotion = useReducedMotion();
  const isBlinking = useBlink(!prefersReducedMotion);
  const [move, perform, stopMove] = useIdleRoutine(!prefersReducedMotion, firstWaveAfterMs);
  const armControls = useAnimationControls();
  const chestControls = useAnimationControls();
  const [coinBurst, setCoinBurst] = useState(0);
  const [isPunching, setIsPunching] = useState(false);
  const coinTimer = useRef(null);

  const isWaving = move === "wave";
  const isLooking = move === "look";
  const frame = isWaving ? FRAMES.wave : isBlinking ? FRAMES.idleBlink : FRAMES.idle;
  const animateIf = (animation) => (prefersReducedMotion ? undefined : animation);

  useEffect(() => () => clearTimeout(coinTimer.current), []);

  const throwCombo = async () => {
    stopMove();
    playSound("punch");
    if (prefersReducedMotion) return;
    const snap = { duration: 0.32, ease: (progress) => Math.round(progress * 4) / 4 };
    setIsPunching(true);
    chestControls.start({ x: [0, 1, 0, 1, 0], transition: snap });
    await armControls.start({ x: [0, JAB_REACH, 0, JAB_REACH, 0], transition: snap });
    setIsPunching(false);
    setCoinBurst((burst) => burst + 1);
    clearTimeout(coinTimer.current);
    coinTimer.current = setTimeout(() => setCoinBurst(0), COINS_LAST_MS);
  };

  const sayHi = () => {
    if (!isWaving && !isPunching) perform("wave");
  };

  return (
    <button
      type="button"
      onClick={throwCombo}
      onPointerEnter={sayHi}
      aria-label="Pixel art version of Cristopher. Poke him."
      className={`relative shrink-0 cursor-pointer ${className}`}
    >
      {/* turning around is a quick mirror flip, the same trick every 2D fighter uses */}
      <motion.svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        shapeRendering="crispEdges"
        className="h-full w-auto overflow-visible"
        aria-hidden="true"
        animate={{ scaleX: isLooking ? -1 : 1 }}
        transition={{ duration: 0.18, ease: "linear" }}
      >
        <PixelLayer pixels={frame.waist} />
        <PixelLayer pixels={frame.legs} />
        {/* standing up straight to say hi lifts everything above the belt a pixel */}
        <motion.g animate={{ y: isWaving ? -1 : 0 }} transition={POSE_SHIFT}>
          <motion.g animate={animateIf(breathe)}>
            <motion.g animate={chestControls}>
              {isPunching &&
                ARM_SMEAR.map(({ x, y, color }) => (
                  <rect key={`smear-${y}`} x={x} y={y} width={JAB_REACH} height="1" fill={color} />
                ))}
              <PixelLayer pixels={frame.neck} />
              <PixelLayer pixels={frame.shoulder} />
              <PixelLayer pixels={frame.chest} />
            </motion.g>
            {/* the guard hand relaxes and drops while he waves */}
            <motion.g animate={{ y: isWaving ? GUARD_DROP : 0 }} transition={POSE_SHIFT}>
              <PixelLayer pixels={frame.guard} />
            </motion.g>
            <motion.g animate={armControls}>
              <PixelLayer pixels={frame.arm} />
            </motion.g>
          </motion.g>
          {/* the head trails the chest by a beat, that little lag is what makes the breathing feel real */}
          <motion.g animate={animateIf({ ...breathe, transition: { ...breathe.transition, delay: 0.12 } })}>
            <PixelLayer pixels={frame.head} />
          </motion.g>
          <motion.g animate={animateIf(breathe)}>
            <motion.g key={`palm-${isWaving}`} animate={isWaving ? animateIf(WAVE_SWING) : undefined}>
              <PixelLayer pixels={frame.palm} />
              <motion.g key={`fingers-${isWaving}`} animate={isWaving ? animateIf(WAVE_SWING) : undefined}>
                <PixelLayer pixels={frame.fingers} />
              </motion.g>
            </motion.g>
          </motion.g>
        </motion.g>
      </motion.svg>
      <AnimatePresence>{isWaving && <SpeechBubble />}</AnimatePresence>
      <AnimatePresence>
        {coinBurst > 0 &&
          COIN_DRIFT.map((drift, index) => <Coin key={`${coinBurst}-${drift}`} drift={drift} delay={index * 0.06} />)}
      </AnimatePresence>
    </button>
  );
};

export default PixelAvatar;
