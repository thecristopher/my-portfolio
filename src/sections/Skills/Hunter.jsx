import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "framer-motion";
import Sprite from "../../components/Sprite";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { GUNSHIP, SAMUS, ZERO_SUIT } from "../../lib/sprites/samus";
import {
  aimPoseFor,
  boardingShift,
  endingCues,
  endingLook,
  endingStage,
  facingToward,
  hunterPose,
  restFor,
  shipSideFor,
  spotUnder,
  strideFor,
  travel,
  wanderGoal,
} from "./actions";

const PIXEL = { fontFamily: '"Pixelify Sans", ui-monospace, monospace' };
// how the Zero Suit is drawn: shrunk or grown, smoothly, to stand as tall as the Power Suit she stepped out of
const OUT_OF_SUIT = SAMUS.cell.height / ZERO_SUIT.cell.height;
// how far the gunship tucks in behind her, in its own pixels
const SHIP_TUCK = 7;
// what she says once the larva is down, to whoever helped her find it
const THANKS = "You found it! Thanks for the help, hunter.";
// how small the ship gets as it flies off into the middle of the orbit
const SHIP_FAR = 0.1;

const centerOf = (element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

// how she points at a spot on the screen: which way she faces and how high she raises the arm cannon
const sightOn = (box, spot) => {
  const chest = { x: box.left + box.width / 2, y: box.top + box.height * 0.4 };
  return { facing: facingToward(box, spot.x), pose: aimPoseFor(chest, spot) };
};

// how long her track is: the orbit's width, less her own, kept up to date as the window resizes
const useTrack = (orbitRef, width) => {
  const [track, setTrack] = useState(0);

  useEffect(() => {
    const orbit = orbitRef.current;
    if (!orbit) return undefined;
    const measure = () => setTrack(Math.max(0, orbit.offsetWidth - width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(orbit);
    return () => observer.disconnect();
  }, [orbitRef, width]);

  return track;
};

// her legs: rolls or runs her to a spot along the track at her own pace, and says how she's moving and which way she
// faces. a new trip or a halt cuts the one underway short
const useLegs = (x, track) => {
  const [stride, setStride] = useState({ gait: null, facing: "right" });
  const trip = useRef(null);

  const halt = useCallback(() => {
    trip.current?.stop();
    trip.current = null;
    setStride((current) => ({ ...current, gait: null }));
  }, []);

  const goTo = useCallback(
    (goal, isChasing = false) => {
      trip.current?.stop();
      const { gait, seconds, facing } = strideFor(x.get(), goal, track, isChasing);
      setStride({ gait, facing });
      trip.current = animate(x, goal, { duration: seconds, ease: "linear" });
      return trip.current.then(() => setStride((current) => ({ ...current, gait: null })));
    },
    [x, track],
  );

  // the trip underway, or one already done, so a new plan can wait for her to arrive first
  const settle = useCallback(() => trip.current ?? Promise.resolve(), []);

  return { ...stride, goTo, halt, settle };
};

// what she's up to: playing out her ending, out of sight while a card is open, aiming at a picked tool, running after
// the peeking larva, or strolling around
const modeFor = ({ isEnding, isHidden, target, sighting }) => {
  if (isEnding) return "ending";
  if (isHidden) return "hidden";
  if (target) return "aiming";
  return sighting ? "chasing" : "wandering";
};

// her mind: strolls from spot to spot with a rest between, runs to stand right under the larva when it peeks, and
// stops for a picked tool. anyone who asked for less movement gets her standing in the middle
const useBrain = ({ mode, sighting, legs, x, track, width, orbitRef, isStill }) => {
  const { goTo, halt, settle } = legs;
  const hasArrived = useRef(false);

  useEffect(() => {
    if (!track) return undefined;
    // she starts in the middle of the track, once
    if (!hasArrived.current || isStill) x.set(track / 2);
    hasArrived.current = true;
    if (isStill) return undefined;
    if (mode !== "wandering" && mode !== "chasing") {
      halt();
      return undefined;
    }
    if (mode === "chasing") {
      const larva = centerOf(sighting);
      goTo(spotUnder(larva.x, orbitRef.current.getBoundingClientRect().left, width, track), true);
      return undefined;
    }
    let isCancelled = false;
    let timer = null;
    const stroll = () => {
      timer = setTimeout(() => {
        if (!isCancelled) goTo(wanderGoal(x.get(), track)).then(() => !isCancelled && stroll());
      }, restFor());
    };
    // a chase underway runs to its end before she starts strolling again
    settle().then(() => !isCancelled && stroll());
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [mode, sighting, track, width, isStill, x, orbitRef, goTo, halt, settle]);
};

// how she aims at the picked tool or points at the peeking larva, measured again whenever she stops moving
const useSight = (thing, spriteRef, gait) => {
  const [look, setLook] = useState(null);

  useEffect(() => {
    if (!thing || !spriteRef.current) {
      setLook(null);
      return;
    }
    setLook(sightOn(spriteRef.current.getBoundingClientRect(), centerOf(thing)));
  }, [thing, spriteRef, gait]);

  return look;
};

// the ending's stage, null until it starts, then moving through every stage on its own timer
const useEndingStage = (isEnding) => {
  const [stage, setStage] = useState(null);

  useEffect(() => {
    if (!isEnding) return undefined;
    const timers = endingCues().map((at) => setTimeout(() => setStage(endingStage(at)), at));
    return () => timers.forEach(clearTimeout);
  }, [isEnding]);

  return stage;
};

// a "!" over her head the moment she spots the larva
const Alert = () => (
  <motion.span
    className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-2xl leading-none font-bold text-[#ff4d6d] drop-shadow-[0_2px_0_#0b1430]"
    style={PIXEL}
    initial={{ opacity: 0, y: 6, scale: 0.5 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 14 }}
  >
    !
  </motion.span>
);

// her thanks to the visitor, in a speech bubble over her head while she spins her pistol
const Thanks = () => (
  <motion.p
    className="absolute bottom-full left-1/2 mb-3 w-max max-w-[14rem] -translate-x-1/2 rounded-2xl bg-[#0b1430] px-4 py-2.5 text-center text-sm leading-snug text-white shadow-xl after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-[#0b1430] after:content-['']"
    style={PIXEL}
    initial={{ opacity: 0, y: 10, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ type: "spring", stiffness: 380, damping: 18 }}
  >
    {THANKS}
  </motion.p>
);

// where the ship goes: down out of the sky to land, then up off the ground and away into the middle of the orbit,
// shrinking into the distance
const shipMotion = (stage, flight, isStill) => {
  if (stage !== "departing") return { animate: { x: 0, y: 0, scale: 1, opacity: 1 }, transition: { duration: isStill ? 0.3 : 1.4, ease: [0.16, 1, 0.3, 1] } };
  if (isStill || !flight) return { animate: { opacity: 0 }, transition: { duration: 0.6 } };
  return {
    animate: { x: [0, 0, flight.dx], y: [0, -40, flight.dy], scale: [1, 1, SHIP_FAR], opacity: [1, 1, 1, 0] },
    transition: { duration: 2.4, times: [0, 0.25, 1], ease: "easeInOut", opacity: { duration: 2.4, times: [0, 0.3, 0.85, 1] } },
  };
};

// her gunship: lands beside her, waits while she flips aboard, then flies off into the middle of the orbit
const Gunship = ({ side, stage, flight, scale, isStill, shipRef }) => {
  const tuck = `calc(100% - ${SHIP_TUCK * scale}px)`;
  const { animate: to, transition } = shipMotion(stage, flight, isStill);
  return (
    <motion.img
      ref={shipRef}
      src={GUNSHIP.src}
      alt=""
      width={GUNSHIP.width * scale}
      height={GUNSHIP.height * scale}
      className="absolute bottom-0 max-w-none [image-rendering:pixelated]"
      style={side === "left" ? { right: tuck } : { left: tuck }}
      initial={isStill ? { opacity: 0 } : { y: -500, opacity: 0 }}
      animate={to}
      transition={transition}
    />
  );
};

// her flip from her spot up and into the ship, and out of sight while the ship flies her away
const flipMotion = (stage, side, scale, isStill) => {
  if (stage === "departing") return { opacity: 0 };
  if (stage !== "boarding" || isStill) return { x: 0, y: 0, opacity: 1 };
  const shift = boardingShift(side, ZERO_SUIT.cell.width * scale * OUT_OF_SUIT, GUNSHIP.width * scale, SHIP_TUCK * scale);
  return { x: [0, shift / 2, shift], y: [0, -30 * scale, -5 * scale], opacity: [1, 1, 0], transition: { duration: 0.6, ease: "easeOut" } };
};

// the Power Suit at whole multiples so her pixels stay sharp, the Zero Suit's finer art drawn smoothly at her height
const SuitSprite = ({ suit, pose, scale, isFlipped }) =>
  suit === "zero" ? (
    <Sprite key={`zero-${pose}`} sheet={ZERO_SUIT} animation={pose} scale={scale * OUT_OF_SUIT} isFlipped={isFlipped} isSmooth />
  ) : (
    <Sprite key={pose} sheet={SAMUS} animation={pose} scale={scale} isFlipped={isFlipped} />
  );

const facingFor = ({ aim, legs, sight }) => {
  if (aim) return aim.facing;
  if (legs.gait) return legs.facing;
  return sight?.facing ?? legs.facing;
};

/**
 * Samus in the Power Suit, on her own patrol under the orbit: rolling short ways in the morph ball and running long
 * ones, running to stand right under the Metroid larva with a "!" whenever it peeks out and pointing her arm cannon at
 * it, and aiming at whichever tool is hovered or focused. Opening a tool is her shot, played out in the card. Once the
 * larva is defeated and the card closes, she turns to face you, steps out of the suit and thanks you in the Zero Suit,
 * her gunship lands beside her, and she flips aboard and flies off into the middle of the orbit.
 * @param {{ target: { name: string, element: HTMLElement } | null, sighting: HTMLElement | null,
 *   orbitRef: { current: HTMLElement | null }, isHidden: boolean, isEnding: boolean }} props
 *   target is the tool in her sights, sighting the larva while it peeks out, orbitRef the orbit she patrols under and
 *   the ship flies into, isHidden whether a card is open over her
 */
const Hunter = ({ target, sighting, orbitRef, isHidden, isEnding }) => {
  const isStill = useReducedMotion();
  const spriteRef = useRef(null);
  const shipRef = useRef(null);
  const scale = useMediaQuery("(min-width: 640px)") ? 3 : 2;
  const width = SAMUS.cell.width * scale;
  const x = useMotionValue(0);
  const track = useTrack(orbitRef, width);
  const legs = useLegs(x, track);
  const stage = useEndingStage(isEnding);
  const mode = modeFor({ isEnding, isHidden, target, sighting });
  useBrain({ mode, sighting, legs, x, track, width, orbitRef, isStill });
  const aim = useSight(mode === "aiming" ? target.element : null, spriteRef, legs.gait);
  const sight = useSight(mode === "chasing" ? sighting : null, spriteRef, legs.gait);
  const [shipSide, setShipSide] = useState("left");
  const [shipFlight, setShipFlight] = useState(null);
  const ending = stage ? endingLook(stage) : null;
  const suit = ending?.suit ?? "power";
  const pose = ending?.pose ?? hunterPose({ targetPose: aim?.pose ?? null, sightingPose: sight?.pose ?? null, gait: legs.gait });
  const facing = stage ? "right" : facingFor({ aim, legs, sight });

  useEffect(() => {
    if (stage === "landing") setShipSide(shipSideFor(x.get(), track));
    if (stage === "departing" && shipRef.current && orbitRef.current) setShipFlight(travel(centerOf(shipRef.current), centerOf(orbitRef.current)));
  }, [stage, x, track, orbitRef]);

  if (stage === "gone") return null;
  const hasShip = stage === "landing" || stage === "boarding" || stage === "departing";

  return (
    <motion.div style={{ x }} className={`pointer-events-none absolute top-full left-0 transition-opacity ${isHidden ? "opacity-0" : ""}`} aria-hidden="true">
      <div ref={spriteRef} className="relative">
        {hasShip && <Gunship side={shipSide} stage={stage} flight={shipFlight} scale={scale} isStill={isStill} shipRef={shipRef} />}
        {mode === "chasing" && <Alert />}
        <AnimatePresence>{stage === "congrats" && <Thanks />}</AnimatePresence>
        {/* stepping out of the suit flashes white, the way she does touching a power up */}
        <motion.div
          key={suit}
          initial={isStill || !stage ? false : { filter: "brightness(4)" }}
          animate={{ filter: "brightness(1)" }}
          transition={{ duration: 0.7 }}
        >
          <motion.div animate={flipMotion(stage, shipSide, scale, isStill)}>
            <SuitSprite suit={suit} pose={pose} scale={scale} isFlipped={facing === "left"} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hunter;
