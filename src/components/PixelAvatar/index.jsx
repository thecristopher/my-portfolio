import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import {
  AVATAR_PALETTE,
  AVATAR_ROWS,
  BLINK_SWAPS,
  GUARD_ARM,
  HEAD_UNTIL_ROW,
  KNEE_ROW,
  LEGS_FROM_ROW,
  PUNCH_ARM,
  SMILE,
  WALK_FRAME_COUNT,
  WALK_GAIT,
  WAVE_ERASE,
  WAVE_FRAMES,
} from "../../lib/avatarSprite";
import {
  crouchLegs,
  idleMoveDelay,
  isInRegion,
  overlaySprite,
  pickIdleMove,
  pingPong,
  spriteToPixels,
  stepToward,
  walkBob,
  walkLegs,
} from "../../actions";
import { useCompanionEnabled } from "../../lib/companion";
import { playSound } from "../../lib/sound";

const WIDTH = AVATAR_ROWS[0].length;
const HEIGHT = AVATAR_ROWS.length;
const JAB_REACH = 4;
const GUARD_DROP = 2;
const TEE_COLORS = [AVATAR_PALETTE.T, AVATAR_PALETTE.t, AVATAR_PALETTE.u];
const NOTHING = { left: 0, top: 0, rows: [] };
const GUARDLESS_ROWS = WAVE_ERASE.reduce((rows, region) => overlaySprite(rows, NOTHING, region), overlaySprite(AVATAR_ROWS, SMILE));
const waveRows = (armRows) => overlaySprite(GUARDLESS_ROWS, { left: WAVE_FRAMES.left, top: WAVE_FRAMES.top, rows: armRows });

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
};

// the walk cycle only swaps the legs, everything above the belt rides along and bobs a pixel
const STRIDE_PHASES = [...Array(WALK_FRAME_COUNT).keys()].map((index) => index / WALK_FRAME_COUNT);
const STRIDE_FRAMES = STRIDE_PHASES.map((phase) => ({ ...FRAMES.idle, legs: walkLegs(FRAMES.idle.legs, phase, WALK_GAIT) }));

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

// the white flash where a jab connects, the comic book way of saying "that one landed"
const HitSpark = ({ delay }) => (
  <motion.svg
    viewBox="0 0 9 9"
    shapeRendering="crispEdges"
    className="pointer-events-none absolute top-[28%] left-[81%] size-7"
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: [0, 1.3, 0.6], opacity: [1, 1, 0], rotate: [0, 20] }}
    transition={{ duration: 0.18, delay, ease: "easeOut" }}
    aria-hidden="true"
  >
    <path d="M4 0h1v3h1v-1h1v1h-1v1h3v1h-3v1h1v1h-1v-1h-1v3h-1v-3h-1v1h-1v-1h1v-1h-3v-1h3v-1h-1v-1h1v1h1z" fill="#ffe066" />
    <path d="M4 3h1v3h-1zM3 4h3v1h-3z" fill="#ffffff" />
  </motion.svg>
);

const SpeechBubble = () => (
  <motion.span
    initial={{ opacity: 0, y: 6, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.25 }}
    className="pointer-events-none absolute -top-7 left-[60%] rounded-md border-2 border-ink bg-fg px-2 py-0.5 font-mono text-[11px] font-bold text-ink"
    aria-hidden="true"
  >
    hola!
    <span className="absolute -bottom-[5px] left-2 size-2 rotate-45 border-r-2 border-b-2 border-ink bg-fg" />
  </motion.span>
);

// a tiny fighting stance me: drops in, bounces on his toes, blinks, looks around, hops when the page scrolls,
// waves hello with a grin, and jabs when poked
const PixelAvatar = ({ className = "", entersAfterMs = 0, firstWaveAfterMs = FIRST_WAVE_MS }) => {
  const buttonRef = useRef(null);
  const isOnScreen = useInView(buttonRef);
  const prefersReducedMotion = useReducedMotion();
  const isBlinking = useBlink(!prefersReducedMotion);
  const [move, perform, stopMove] = useIdleRoutine(!prefersReducedMotion, firstWaveAfterMs);
  const armControls = useAnimationControls();
  const chestControls = useAnimationControls();
  const bodyControls = useAnimationControls();
  const [coinBurst, setCoinBurst] = useState(0);
  const [dustBurst, setDustBurst] = useState(0);
  const [isPunching, setIsPunching] = useState(false);
  const [hasLanded, setHasLanded] = useState(false);
  const coinTimer = useRef(null);
  const dustTimer = useRef(null);
  const isAirborne = useRef(false);
  const isBusy = useRef(false);

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

  const hop = useCallback(async () => {
    if (isAirborne.current || isBusy.current) return;
    isAirborne.current = true;
    kickUpDust(HOP_LANDS_AT_MS);
    await bodyControls.start(HOP);
    isAirborne.current = false;
  }, [bodyControls, kickUpDust]);

  useScrollHop(hasLanded && isOnScreen && !prefersReducedMotion, hop);

  const isWaving = move === "wave";
  const isLooking = move === "look";
  const waveFrame = useWaveFrame(isWaving, !prefersReducedMotion);
  const frame = isWaving ? FRAMES.wave[waveFrame] : isBlinking ? FRAMES.idleBlink : FRAMES.idle;
  // he stands up straight to say hi, so the bounce only runs in his fighting stance
  const isCrouched = useBounce(!prefersReducedMotion && !isWaving);
  const bob = isCrouched ? 1 : 0;

  useEffect(
    () => () => {
      clearTimeout(coinTimer.current);
      clearTimeout(dustTimer.current);
    },
    []
  );

  const throwCombo = async () => {
    if (isBusy.current) return;
    stopMove();
    playSound("punch");
    if (prefersReducedMotion) return;
    const snap = { duration: 0.32, ease: (progress) => Math.round(progress * 4) / 4 };
    isBusy.current = true;
    setIsPunching(true);
    chestControls.start({ x: [0, 1, 0, 1, 0], transition: snap });
    await armControls.start({ x: [0, JAB_REACH, 0, JAB_REACH, 0], transition: snap });
    setIsPunching(false);
    isBusy.current = false;
    setCoinBurst((burst) => burst + 1);
    clearTimeout(coinTimer.current);
    coinTimer.current = setTimeout(() => setCoinBurst(0), COINS_LAST_MS);
  };

  // only a real mouse says hi on hover. a finger dragging across him to scroll the page shouldn't set him off
  const sayHi = (event) => {
    if (event.pointerType === "mouse" && !isWaving && !isPunching) perform("wave");
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={throwCombo}
      onPointerEnter={sayHi}
      aria-label="Pixel art version of Cristopher. Poke him."
      className={`relative shrink-0 cursor-pointer touch-manipulation select-none [-webkit-tap-highlight-color:transparent] ${className}`}
    >
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
              <PixelLayer pixels={frame.head} />
            </g>
          </motion.g>
        </motion.svg>
        <AnimatePresence>{isWaving && <SpeechBubble />}</AnimatePresence>
        {isPunching && [0.06, 0.22].map((delay) => <HitSpark key={delay} delay={delay} />)}
      </motion.div>
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

// how the little me paces along the statusline, in screen pixels and seconds
const PACE = { walkSpeed: 110, runSpeed: 240, runFrom: 260, stopWithin: 6, startFrom: 36 };
// a long gap between frames (a background tab) shouldn't teleport him across the screen
const MAX_TICK_SECONDS = 0.05;
// running takes longer strides, so the legs don't spin like a cartoon
const RUN_STRIDE_SCALE = 1.8;
// he only comes along once the big me in the hero has scrolled out of view
const SHOWS_PAST_VIEWPORT = 0.6;
const COMPANION_WAVES_AFTER_MS = 2500;
// he keeps a couple of steps to the side of the cursor instead of under it, so he never sits on what you're pointing at
const TRAIL_SPRITE_PIXELS = 36;

const useIsPastHero = () => {
  const { scrollY } = useScroll();
  const [isPastHero, setIsPastHero] = useState(false);
  useMotionValueEvent(scrollY, "change", (latest) => setIsPastHero(latest > window.innerHeight * SHOWS_PAST_VIEWPORT));
  return isPastHero;
};

// a mouse leads him straight to the cursor. on a touch screen there's no cursor, so he walks the bar as you read
const useWalkTarget = () => {
  const target = useRef(window.innerWidth / 2);

  useEffect(() => {
    let hasMouse = false;
    const followPointer = (event) => {
      if (event.pointerType !== "mouse") return;
      hasMouse = true;
      target.current = event.clientX;
    };
    const followScroll = () => {
      if (hasMouse) return;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      target.current = (window.scrollY / Math.max(1, maxScroll)) * window.innerWidth;
    };
    window.addEventListener("pointermove", followPointer, { passive: true });
    window.addEventListener("scroll", followScroll, { passive: true });
    return () => {
      window.removeEventListener("pointermove", followPointer);
      window.removeEventListener("scroll", followScroll);
    };
  }, []);

  return target;
};

const WalkingMe = () => {
  const spriteRef = useRef(null);
  const target = useWalkTarget();
  const x = useMotionValue(target.current);
  const bodyControls = useAnimationControls();
  const [stride, setStride] = useState(null);
  const [facing, setFacing] = useState(1);
  const [dustBurst, setDustBurst] = useState(0);
  const [hasLanded, setHasLanded] = useState(false);
  const isAirborne = useRef(false);
  const isHovered = useRef(false);
  const dustTimer = useRef(null);
  const isWalking = stride !== null;
  const isBlinking = useBlink(!isWalking);
  const [move, perform] = useIdleRoutine(hasLanded && !isWalking, COMPANION_WAVES_AFTER_MS);
  const isWaving = move === "wave";
  const waveFrame = useWaveFrame(isWaving, true);
  const isCrouched = useBounce(hasLanded && !isWalking && !isWaving);

  const kickUpDust = useCallback((afterMs) => {
    clearTimeout(dustTimer.current);
    dustTimer.current = setTimeout(() => {
      setDustBurst((burst) => burst + 1);
      dustTimer.current = setTimeout(() => setDustBurst(0), DUST_LASTS_MS);
    }, afterMs);
  }, []);

  useEffect(() => {
    isAirborne.current = true;
    kickUpDust(DROP_LANDS_AT_MS);
    bodyControls.start(DROP_IN).then(() => {
      isAirborne.current = false;
      setHasLanded(true);
    });
    return () => clearTimeout(dustTimer.current);
  }, [bodyControls, kickUpDust]);

  const hop = useCallback(async () => {
    if (isAirborne.current) return;
    isAirborne.current = true;
    kickUpDust(HOP_LANDS_AT_MS);
    await bodyControls.start(HOP);
    isAirborne.current = false;
  }, [bodyControls, kickUpDust]);

  useScrollHop(hasLanded, hop);

  // one loop moves him and picks the leg frame from how far he has actually walked, so his feet never skate
  useEffect(() => {
    if (!hasLanded) return;
    let frameRequest;
    let lastTick = performance.now();
    let walked = 0;
    let isMoving = false;
    let wasRunning = false;
    let shownStride = null;
    let shownFacing = 1;

    const tick = (now) => {
      const seconds = Math.min((now - lastTick) / 1000, MAX_TICK_SECONDS);
      lastTick = now;
      const scale = (spriteRef.current?.clientHeight ?? HEIGHT) / HEIGHT;
      const halfWidth = (WIDTH / 2) * scale;
      const here = x.get();
      const side = here < target.current ? -1 : 1;
      const beside = target.current + side * TRAIL_SPRITE_PIXELS * scale;
      // someone pointing at him wants to say hi, so he holds still
      const goal = isHovered.current ? here : Math.min(Math.max(beside, halfWidth), window.innerWidth - halfWidth);
      const step = stepToward(here, goal, seconds, { ...PACE, isMoving });
      isMoving = step.isMoving;
      x.set(step.x);
      walked += Math.abs(step.moved);

      if (step.isRunning && !wasRunning) kickUpDust(0);
      wasRunning = step.isRunning;

      const strideLength = 4 * WALK_GAIT.stride * scale * (step.isRunning ? RUN_STRIDE_SCALE : 1);
      const nextStride = isMoving ? Math.floor(((walked / strideLength) % 1) * WALK_FRAME_COUNT) : null;
      if (nextStride !== shownStride) setStride((shownStride = nextStride));
      // he faces where he's headed, and turns to look at the cursor once he's there
      const toCursor = target.current - step.x;
      const nextFacing = step.moved ? Math.sign(step.moved) : Math.abs(toCursor) > 2 ? Math.sign(toCursor) : shownFacing;
      if (nextFacing !== shownFacing) setFacing((shownFacing = nextFacing));

      frameRequest = requestAnimationFrame(tick);
    };

    frameRequest = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRequest);
  }, [hasLanded, target, x, kickUpDust]);

  const frame = isWalking
    ? STRIDE_FRAMES[stride]
    : isWaving
      ? FRAMES.wave[waveFrame]
      : isBlinking
        ? FRAMES.idleBlink
        : FRAMES.idle;
  const bob = isWalking ? walkBob(STRIDE_PHASES[stride]) : isCrouched ? 1 : 0;
  const isLooking = move === "look" && !isWalking;

  const sayHi = (event) => {
    if (event.pointerType !== "mouse") return;
    isHovered.current = true;
    if (!isWaving) perform("wave");
  };

  return (
    <motion.div style={{ x }} className="pointer-events-none fixed bottom-7 left-0 z-30" exit={{ opacity: 0, y: -24, transition: { duration: 0.3 } }}>
      <button
        type="button"
        onClick={hop}
        onPointerEnter={sayHi}
        onPointerLeave={() => (isHovered.current = false)}
        aria-label="A tiny Cristopher walking along with you. Poke him to make him jump."
        className="pointer-events-auto relative block h-[63px] -translate-x-1/2 cursor-pointer touch-manipulation select-none [-webkit-tap-highlight-color:transparent] lg:h-[126px]"
      >
        <motion.div initial={{ opacity: 0 }} animate={bodyControls} className="relative h-full origin-bottom">
          <motion.svg
            ref={spriteRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            shapeRendering="crispEdges"
            className="h-full w-auto overflow-visible"
            aria-hidden="true"
            animate={{ scaleX: isLooking ? -facing : facing }}
            transition={{ duration: 0.12, ease: "linear" }}
          >
            <PixelLayer pixels={frame.waist} />
            <PixelLayer pixels={isCrouched && !isWalking ? frame.crouchedLegs : frame.legs} />
            <motion.g animate={{ y: isWaving ? -1 : 0 }} transition={POSE_SHIFT}>
              <g transform={`translate(0 ${bob})`}>
                <PixelLayer pixels={frame.neck} />
                <PixelLayer pixels={frame.shoulder} />
                <PixelLayer pixels={frame.chest} />
                <motion.g animate={{ y: isWaving ? GUARD_DROP : 0 }} transition={POSE_SHIFT}>
                  <PixelLayer pixels={frame.guard} />
                </motion.g>
                <PixelLayer pixels={frame.arm} />
                <PixelLayer pixels={frame.head} />
              </g>
            </motion.g>
          </motion.svg>
          <AnimatePresence>{isWaving && <SpeechBubble />}</AnimatePresence>
        </motion.div>
        <AnimatePresence>
          {dustBurst > 0 && [-1, 1].map((side) => <Dust key={`${dustBurst}-${side}`} side={side} />)}
        </AnimatePresence>
      </button>
    </motion.div>
  );
};

// a pocket sized me that drops onto the statusline once the hero scrolls away and walks along with the visitor.
// :set nocompanion sends him home, and he stays out of the way of anyone who asked for less motion
export const Companion = () => {
  const isEnabled = useCompanionEnabled();
  const isPastHero = useIsPastHero();
  const prefersReducedMotion = useReducedMotion();

  return <AnimatePresence>{isEnabled && isPastHero && !prefersReducedMotion && <WalkingMe />}</AnimatePresence>;
};

export default PixelAvatar;
