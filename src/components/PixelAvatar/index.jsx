import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView, useReducedMotion } from "framer-motion";
import {
  AVATAR_PALETTE,
  AVATAR_ROWS,
  BLINK_SWAPS,
  COMBO_POSES,
  GUARD_ARM,
  HEAD_UNTIL_ROW,
  KICK_CHAMBER,
  KICK_EXTEND,
  KNEE_ROW,
  LEG_ERASE,
  LEGS_FROM_ROW,
  PUNCH_ARM,
  SMILE,
  UPPERCUT_ARM,
  WAVE_ERASE,
  WAVE_FRAMES,
} from "../../lib/avatarSprite";
import { crouchLegs, idleMoveDelay, isInRegion, overlaySprite, pickIdleMove, pingPong, pixelsToPaths, spriteToPixels } from "../../actions";
import { playSound } from "../../lib/sound";
import { COMBO_WINDOW_MS, isFinisher, landHit } from "../../lib/avatarCombo";
import { IMPACT_MS, JAB_REACH, SHORYUKEN_LANDS_MS, shiftTransform, throwKick, throwPunch, throwShoryuken } from "./actions";

const WIDTH = AVATAR_ROWS[0].length;
const HEIGHT = AVATAR_ROWS.length;
const GUARD_DROP = 2;
const TEE_COLORS = [AVATAR_PALETTE.T, AVATAR_PALETTE.t, AVATAR_PALETTE.u];
const NOTHING = { left: 0, top: 0, rows: [] };
const eraseGuard = (rows) => WAVE_ERASE.reduce((erased, region) => overlaySprite(erased, NOTHING, region), rows);
const GUARDLESS_ROWS = eraseGuard(overlaySprite(AVATAR_ROWS, SMILE));
const waveRows = (armRows) => overlaySprite(GUARDLESS_ROWS, { left: WAVE_FRAMES.left, top: WAVE_FRAMES.top, rows: armRows });
const paint = (rows, ...overlays) => overlays.reduce((painted, overlay) => overlaySprite(painted, overlay), rows);
const LEGLESS_ROWS = overlaySprite(AVATAR_ROWS, NOTHING, LEG_ERASE);

const isArm = (pixel) => isInRegion(pixel, PUNCH_ARM) && !TEE_COLORS.includes(pixel.color);
const isGuard = (pixel) => isInRegion(pixel, GUARD_ARM);

// each moving part gets its own layer so it can move without dragging the rest of the sprite along
const buildLayers = (pixels, isWaving) => {
  const layers = { legs: [], head: [], chest: [], arm: [], guard: [] };
  for (const pixel of pixels) {
    if (pixel.y >= LEGS_FROM_ROW) layers.legs.push(pixel);
    else if (!isWaving && isArm(pixel)) layers.arm.push(pixel);
    else if (isGuard(pixel)) layers.guard.push(pixel);
    else if (pixel.y <= HEAD_UNTIL_ROW) layers.head.push(pixel);
    else layers.chest.push(pixel);
  }
  // copies of the rows where layers meet, tucked behind, so a layer moving a pixel never opens a see through seam
  layers.neck = layers.head.filter((pixel) => pixel.y === HEAD_UNTIL_ROW);
  layers.waist = layers.chest.filter((pixel) => pixel.y === LEGS_FROM_ROW - 1);
  layers.shoulder = layers.guard.filter((pixel) => pixel.y <= GUARD_ARM.minY + GUARD_DROP - 1);
  layers.crouchedLegs = crouchLegs(layers.legs, KNEE_ROW);
  return layers;
};

const FRAMES = {
  idle: buildLayers(spriteToPixels(AVATAR_ROWS, AVATAR_PALETTE), false),
  idleBlink: buildLayers(spriteToPixels(AVATAR_ROWS, AVATAR_PALETTE, BLINK_SWAPS), false),
  // happy squinting eyes are already closed, so the wave doesn't need its own blink frames
  wave: WAVE_FRAMES.frames.map((armRows) => buildLayers(spriteToPixels(waveRows(armRows), AVATAR_PALETTE), true)),
  // the combo poses, each one its own drawn frame. no grin for any of them, he means it
  kickChamber: buildLayers(spriteToPixels(paint(LEGLESS_ROWS, KICK_CHAMBER), AVATAR_PALETTE), false),
  kickExtend: buildLayers(spriteToPixels(paint(LEGLESS_ROWS, KICK_EXTEND), AVATAR_PALETTE), false),
  shoryuken: buildLayers(spriteToPixels(paint(eraseGuard(LEGLESS_ROWS), KICK_CHAMBER, UPPERCUT_ARM), AVATAR_PALETTE), true),
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
// a whole combo can wait in line while a move plays, more clicks than that are just mashing
const MAX_QUEUED_HITS = 3;
// where each hit connects on the sprite: the fist, the foot at full extension, and the fist at the top of the rise
const SPARK_SPOTS = { punch: "top-[28%] left-[81%]", kick: "top-[54%] left-[86%]", shoryuken: "-top-[4%] left-[80%]" };
const STREAKS = [
  { left: 8, delay: 0, height: 70 },
  { left: 30, delay: 0.06, height: 95 },
  { left: 55, delay: 0.02, height: 80 },
  { left: 80, delay: 0.08, height: 60 },
];
const COINS_LAST_MS = 1100;
const DUST_LASTS_MS = 600;
// a scroll only counts as a fresh one after the page sat still this long, and he needs a breather between hops
const SCROLL_REST_MS = 500;
const HOP_COOLDOWN_MS = 1400;

// steps instead of easing so every move snaps a whole pixel, like a real sprite
const snapToPixel = (progress) => Math.round(progress);
// Scott Pilgrim never stands still, he bounces on his toes in a fighting stance a couple times a second
const BOUNCE_STEP_MS = 300;

// a jump with squash on takeoff, stretch in the air and a squash on landing, the cartoon way
const HOP = {
  y: [0, 2, -16, -20, -16, 0, 2, 0],
  scaleY: [1, 0.88, 1.08, 1, 1, 1.04, 0.86, 1],
  scaleX: [1, 1.1, 0.94, 1, 1, 0.98, 1.12, 1],
  transition: { duration: 0.6, times: [0, 0.1, 0.28, 0.4, 0.52, 0.72, 0.82, 1], ease: "easeOut" },
};
const HOP_LANDS_AT_MS = 430;

// drops in from above the frame, lands in a crouch and springs back into his stance
const DROP_IN = {
  opacity: [0, 1, 1, 1, 1],
  y: [-110, -60, 0, 3, 0],
  scaleY: [1.1, 1.1, 0.82, 0.9, 1],
  scaleX: [0.92, 0.92, 1.16, 1.06, 1],
  transition: { duration: 0.75, times: [0, 0.3, 0.58, 0.75, 1], ease: ["easeIn", "easeIn", "easeOut", "easeOut"] },
};
const DROP_LANDS_AT_MS = 430;
// out to the side and back, over and over, the hand never jumps from one end straight to the other
const WAVE_SEQUENCE = pingPong(WAVE_FRAMES.frames.length);
const WAVE_FRAME_MS = 110;
const POSE_SHIFT = { duration: 0.15, ease: snapToPixel };

const NO_SHIFT = {};

const pickFrame = ({ pose, isWaving, waveFrame, isBlinking }) => {
  if (pose) return FRAMES[COMBO_POSES[pose].frame];
  if (isWaving) return FRAMES.wave[waveFrame];
  return isBlinking ? FRAMES.idleBlink : FRAMES.idle;
};

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

// one clock drives the whole bounce so the knees, torso, head and hands always land on the same frame
const useBounce = (isEnabled) => {
  const [isCrouched, setIsCrouched] = useState(false);

  useEffect(() => {
    if (!isEnabled) return;
    const bounceTimer = setInterval(() => setIsCrouched((crouched) => !crouched), BOUNCE_STEP_MS);
    return () => {
      clearInterval(bounceTimer);
      setIsCrouched(false);
    };
  }, [isEnabled]);

  return isCrouched;
};

const useWaveFrame = (isWaving, isEnabled) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!isWaving || !isEnabled) return;
    const waveTimer = setInterval(() => setStep((current) => current + 1), WAVE_FRAME_MS);
    return () => {
      clearInterval(waveTimer);
      setStep(0);
    };
  }, [isWaving, isEnabled]);

  return WAVE_SEQUENCE[step % WAVE_SEQUENCE.length];
};

// waves hello right after showing up, then keeps himself busy glancing around and waving at random. isFighting
// holds the fidgeting back while a combo is going, so he never stops mid fight to say hi
const useIdleRoutine = (isEnabled, firstWaveAfterMs, isFighting) => {
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
        if (!isFighting()) perform(pickIdleMove());
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
  }, [isEnabled, firstWaveAfterMs, perform, isFighting]);

  return [move, perform, stop];
};

// hops whenever someone starts scrolling while he's on screen, so the page feels like it nudged him
const useScrollHop = (isEnabled, hop) => {
  useEffect(() => {
    if (!isEnabled) return;
    let lastScrollAt = 0;
    let lastHopAt = 0;
    const onScroll = () => {
      const now = performance.now();
      const isFreshScroll = now - lastScrollAt > SCROLL_REST_MS;
      lastScrollAt = now;
      if (!isFreshScroll || now - lastHopAt < HOP_COOLDOWN_MS) return;
      lastHopAt = now;
      hop();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isEnabled, hop]);
};

// one path per color instead of a rect per pixel: same colored neighbors fill as one shape, so no hairline seams
// open between them when the sprite moves or scales, and the browser draws a few dozen paths instead of thousands
const layerPaths = new WeakMap();
const PixelLayer = ({ pixels }) => {
  if (!layerPaths.has(pixels)) layerPaths.set(pixels, pixelsToPaths(pixels));
  return layerPaths.get(pixels).map(({ color, d }) => <path key={color} d={d} fill={color} />);
};

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

// little pixel clouds that puff out from under his sneakers when he lands
const Dust = ({ side }) => (
  <motion.svg
    viewBox="0 0 6 4"
    shapeRendering="crispEdges"
    className="pointer-events-none absolute -bottom-0.5 left-[33%] h-2 w-3"
    initial={{ x: 0, opacity: 0.9, scale: 0.6 }}
    animate={{ x: side * 26, y: -4, opacity: 0, scale: 1.3 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M1 1h2v-1h2v1h1v2h-1v1h-4v-1h-1v-1h1z" fill="#d8d3c4" />
  </motion.svg>
);

// the white flash where a hit connects, the comic book way of saying "that one landed"
const HitSpark = ({ at }) => (
  <motion.svg
    viewBox="0 0 9 9"
    shapeRendering="crispEdges"
    className={`pointer-events-none absolute size-7 ${SPARK_SPOTS[at]}`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.3, 0.6], opacity: [1, 1, 0], rotate: [0, 20] }}
    transition={{ duration: 0.2, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M4 0h1v3h1v-1h1v1h-1v1h3v1h-3v1h1v1h-1v-1h-1v3h-1v-3h-1v1h-1v-1h1v-1h-3v-1h3v-1h-1v-1h1v1h1z" fill="#ffe066" />
    <path d="M4 3h1v3h-1zM3 4h3v1h-3z" fill="#ffffff" />
  </motion.svg>
);

// the arc the foot draws through the air, a smear frame for the kick
const KickArc = () => (
  <motion.svg
    viewBox="0 0 20 20"
    className="pointer-events-none absolute top-[46%] left-[60%] size-12"
    initial={{ opacity: 0, rotate: 30 }}
    animate={{ opacity: [0, 0.9, 0], rotate: [30, -10] }}
    transition={{ duration: 0.3, delay: 0.1, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M2 18 Q4 4 18 2" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
    <path d="M5 18 Q7 8 18 5" fill="none" stroke="#ffe066" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
  </motion.svg>
);

// the speed lines that trail under him on the way up, like the old arcade art of the move
const RisingStreaks = () => (
  <span className="pointer-events-none absolute inset-x-[20%] bottom-0 h-full" aria-hidden="true">
    {STREAKS.map(({ left, delay, height }) => (
      <motion.span
        key={left}
        className="absolute bottom-0 w-px rounded-full bg-fg/70"
        style={{ left: `${left}%`, height: `${height}%`, originY: 1 }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: [0, 1, 1], opacity: [0, 0.9, 0], y: [0, -10, -24] }}
        transition={{ duration: 0.55, delay: 0.14 + delay, ease: "easeOut" }}
      />
    ))}
  </span>
);

// the name of the move, shouted the way the game does it
const ShoryukenShout = () => (
  <motion.span
    initial={{ opacity: 0, scale: 0.4, y: 10, rotate: -10 }}
    animate={{ opacity: 1, scale: [0.4, 1.15, 1], y: 0, rotate: -6 }}
    exit={{ opacity: 0, y: -12, transition: { duration: 0.3 } }}
    transition={{ duration: 0.35, delay: 0.12, ease: "easeOut" }}
    className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 font-pixel text-base font-bold tracking-wider whitespace-nowrap text-[#ffe066] sm:text-lg"
    style={{ textShadow: "2px 2px 0 #ff5ca8, -1px -1px 0 #140812, 1px -1px 0 #140812, -1px 1px 0 #140812, 1px 1px 0 #140812" }}
    aria-hidden="true"
  >
    SHORYUKEN!!!
  </motion.span>
);

const SpeechBubble = () => (
  <motion.span
    initial={{ opacity: 0, y: 6, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.08 } }}
    transition={{ duration: 0.25 }}
    className="pointer-events-none absolute -top-7 left-[60%] rounded-md border-2 border-ink bg-fg px-2 py-0.5 font-mono text-[11px] font-bold text-ink"
    aria-hidden="true"
  >
    hola!
    <span className="absolute -bottom-[5px] left-2 size-2 rotate-45 border-r-2 border-b-2 border-ink bg-fg" />
  </motion.span>
);

// every click lands the next hit of the combo: jab, kick, shoryuken. clicks that come in mid move wait their turn,
// up to a full combo, so mashing still plays every hit in order instead of eating them
const useCombo = ({ isGentle, onHit, play }) => {
  const clicks = useRef([]);
  const queue = useRef(Promise.resolve());
  const waiting = useRef(0);

  const strike = useCallback(() => {
    if (waiting.current >= MAX_QUEUED_HITS) return;
    const { clicks: combo, hit, move } = landHit(clicks.current, performance.now());
    clicks.current = combo;
    if (isGentle) {
      playSound(move);
      onHit?.(hit);
      return;
    }
    waiting.current += 1;
    queue.current = queue.current.then(() => play(move, hit)).finally(() => (waiting.current -= 1));
  }, [isGentle, onHit, play]);

  const isBusy = useCallback(() => waiting.current > 0, []);
  return [strike, isBusy];
};

// a tiny fighting stance me: drops in, bounces on his toes, blinks, looks around, hops when the page scrolls,
// waves hello with a grin, and fights back when poked: a jab, a kick, then a shoryuken. onPoke hears about every
// hit as it lands with its place in the combo, so the third one can set something off
const PixelAvatar = ({ className = "", entersAfterMs = 0, firstWaveAfterMs = FIRST_WAVE_MS, onPoke }) => {
  const buttonRef = useRef(null);
  const isOnScreen = useInView(buttonRef);
  const prefersReducedMotion = useReducedMotion();
  const isBlinking = useBlink(!prefersReducedMotion);
  const lastHitAt = useRef(-Infinity);
  const isFighting = useCallback(() => performance.now() - lastHitAt.current < COMBO_WINDOW_MS, []);
  const [move, perform, stopMove] = useIdleRoutine(!prefersReducedMotion, firstWaveAfterMs, isFighting);
  const armControls = useAnimationControls();
  const chestControls = useAnimationControls();
  const bodyControls = useAnimationControls();
  const [coinBurst, setCoinBurst] = useState(0);
  const [dustBurst, setDustBurst] = useState(0);
  const [attack, setAttack] = useState(null);
  const [spark, setSpark] = useState(null);
  const [pose, setPose] = useState(null);
  const [hasLanded, setHasLanded] = useState(false);
  const coinTimer = useRef(null);
  const dustTimer = useRef(null);
  const sparkTimer = useRef(null);
  const isAirborne = useRef(false);

  const kickUpDust = useCallback((afterMs) => {
    clearTimeout(dustTimer.current);
    dustTimer.current = setTimeout(() => {
      setDustBurst((burst) => burst + 1);
      dustTimer.current = setTimeout(() => setDustBurst(0), DUST_LASTS_MS);
    }, afterMs);
  }, []);

  // he shows up by dropping into the frame, unless the visitor asked for less motion
  useEffect(() => {
    if (prefersReducedMotion) {
      bodyControls.set({ opacity: 1 });
      setHasLanded(true);
      return;
    }
    const dropTimer = setTimeout(async () => {
      isAirborne.current = true;
      kickUpDust(DROP_LANDS_AT_MS);
      await bodyControls.start(DROP_IN);
      isAirborne.current = false;
      setHasLanded(true);
    }, entersAfterMs);
    return () => clearTimeout(dropTimer);
  }, [prefersReducedMotion, entersAfterMs, bodyControls, kickUpDust]);

  // the spark, the sound and the combo counter all wait for the frame where the hit connects
  const connect = useCallback(
    (nextMove, hit) => {
      clearTimeout(sparkTimer.current);
      sparkTimer.current = setTimeout(() => {
        setSpark({ at: nextMove, id: performance.now() });
        onPoke?.(hit);
      }, IMPACT_MS[nextMove]);
    },
    [onPoke]
  );

  const payOut = useCallback(() => {
    setCoinBurst((burst) => burst + 1);
    clearTimeout(coinTimer.current);
    coinTimer.current = setTimeout(() => setCoinBurst(0), COINS_LAST_MS);
  }, []);

  const play = useCallback(
    async (nextMove, hit) => {
      lastHitAt.current = performance.now();
      stopMove();
      playSound(nextMove);
      setAttack(nextMove);
      connect(nextMove, hit);
      if (nextMove === "punch") await throwPunch({ arm: armControls, chest: chestControls });
      if (nextMove === "kick") await throwKick({ body: bodyControls, setPose });
      if (isFinisher(nextMove)) {
        kickUpDust(SHORYUKEN_LANDS_MS);
        await throwShoryuken({ body: bodyControls, setPose });
        payOut();
      }
      setAttack(null);
      lastHitAt.current = performance.now();
    },
    [stopMove, connect, armControls, chestControls, bodyControls, kickUpDust, payOut]
  );

  const [strike, isBusy] = useCombo({ isGentle: prefersReducedMotion, onHit: onPoke, play });

  const hop = useCallback(async () => {
    if (isAirborne.current || isBusy()) return;
    isAirborne.current = true;
    kickUpDust(HOP_LANDS_AT_MS);
    await bodyControls.start(HOP);
    isAirborne.current = false;
  }, [bodyControls, kickUpDust, isBusy]);

  useScrollHop(hasLanded && isOnScreen && !prefersReducedMotion, hop);

  const isWaving = move === "wave" && !attack;
  const isLooking = move === "look" && !attack;
  const waveFrame = useWaveFrame(isWaving, !prefersReducedMotion);
  const frame = pickFrame({ pose, isWaving, waveFrame, isBlinking });
  // he stands up straight to say hi and plants his feet to fight, so the bounce only runs while he waits
  const isBouncedDown = useBounce(!prefersReducedMotion && !isWaving && !attack);
  // a combo pose can bend his knees too, and then everything above the belt drops with them
  const isCrouched = isBouncedDown || Boolean(pose && COMBO_POSES[pose].isCrouched);
  const bob = isCrouched ? 1 : 0;
  const shift = pose ? COMBO_POSES[pose].shift : NO_SHIFT;

  useEffect(
    () => () => {
      clearTimeout(coinTimer.current);
      clearTimeout(dustTimer.current);
      clearTimeout(sparkTimer.current);
    },
    []
  );

  // only a real mouse says hi on hover. a finger dragging across him to scroll the page shouldn't set him off
  const sayHi = (event) => {
    if (event.pointerType === "mouse" && !isWaving && !attack && !isFighting()) perform("wave");
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={strike}
      onPointerEnter={sayHi}
      aria-label="Pixel art version of Cristopher. Poke him."
      className={`relative shrink-0 cursor-pointer touch-manipulation select-none [-webkit-tap-highlight-color:transparent] ${className}`}
    >
      <AnimatePresence>{attack === "shoryuken" && <RisingStreaks key="streaks" />}</AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={bodyControls}
        className="relative h-full origin-bottom"
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
          <PixelLayer pixels={isCrouched ? frame.crouchedLegs : frame.legs} />
          {/* standing up straight to say hi lifts everything above the belt a pixel */}
          <motion.g animate={{ y: isWaving ? -1 : 0 }} transition={POSE_SHIFT}>
            <g transform={`translate(0 ${bob})`}>
              {/* in a combo pose each layer leans on its own, a pixel or two at a time, so the whole body acts */}
              <motion.g animate={chestControls}>
                {attack === "punch" &&
                  ARM_SMEAR.map(({ x, y, color }) => (
                    <rect key={`smear-${y}`} x={x} y={y} width={JAB_REACH} height="1" fill={color} />
                  ))}
                <g transform={shiftTransform(shift.chest)}>
                  <PixelLayer pixels={frame.neck} />
                  <PixelLayer pixels={frame.shoulder} />
                  <PixelLayer pixels={frame.chest} />
                </g>
              </motion.g>
              {/* the guard hand relaxes and drops while he waves */}
              <motion.g animate={{ y: isWaving ? GUARD_DROP : 0 }} transition={POSE_SHIFT}>
                <g transform={shiftTransform(shift.guard)}>
                  <PixelLayer pixels={frame.guard} />
                </g>
              </motion.g>
              <motion.g animate={armControls}>
                <g transform={shiftTransform(shift.arm)}>
                  <PixelLayer pixels={frame.arm} />
                </g>
              </motion.g>
              <g transform={shiftTransform(shift.head)}>
                <PixelLayer pixels={frame.head} />
              </g>
            </g>
          </motion.g>
        </motion.svg>
        <AnimatePresence>{isWaving && <SpeechBubble />}</AnimatePresence>
        {attack === "kick" && <KickArc />}
        {spark && <HitSpark key={spark.id} at={spark.at} />}
      </motion.div>
      <AnimatePresence>{attack === "shoryuken" && <ShoryukenShout key="shout" />}</AnimatePresence>
      <AnimatePresence>
        {dustBurst > 0 && [-1, 1].map((side) => <Dust key={`${dustBurst}-${side}`} side={side} />)}
      </AnimatePresence>
      <AnimatePresence>
        {coinBurst > 0 &&
          COIN_DRIFT.map((drift, index) => <Coin key={`${coinBurst}-${drift}`} drift={drift} delay={index * 0.06} />)}
      </AnimatePresence>
    </button>
  );
};

export default PixelAvatar;
