import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useTransform } from "framer-motion";
import Sprite from "../../components/Sprite";
import { useWalk } from "../../hooks/useWalk";
import { GUNSHIP, SAMUS, SAMUS_SHOT, ZERO_SUIT } from "../../lib/sprites/samus";
import {
  aimPoseFor,
  boardingShift,
  endingCues,
  endingLook,
  endingStage,
  facingToward,
  hunterPose,
  muzzleOffset,
  shipSideFor,
  shotFlight,
  trackSpot,
} from "./actions";

// how long she stands after the scroll rests before curling into a ball, long enough to look both ways first. it's
// shorter than the larva hides between peeks, so after pointing at one she curls up before the next
const CURL_AFTER_MS = 3000;
// how often she turns while she stands looking for the larva
const SCAN_EVERY_MS = 1200;
const SHEETS = { power: SAMUS, zero: ZERO_SUIT };
// how far the gunship tucks in behind her, in sprite px
const SHIP_TUCK = 10;
// how small the ship gets as it flies off into the middle of the orbit
const SHIP_FAR = 0.1;

const centerOf = (element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

// how she points at a spot on the screen: which way she faces and how high she raises the cannon, measured from her chest
const sightOn = (box, spot) => {
  const chest = { x: box.left + box.width / 2, y: box.top + box.height * 0.45 };
  return { facing: facingToward(box, spot.x), pose: aimPoseFor(chest, spot) };
};

// true once she has rested long enough to curl up. running, aiming at a tool or pointing at the larva starts the rest
// over, so she never drops into the ball mid point
const useCurl = (isBusy, isPointing) => {
  const [isCurled, setIsCurled] = useState(false);
  // curled up she's resting, so a peek then doesn't wake her
  const isAwake = isBusy || (isPointing && !isCurled);

  useEffect(() => {
    if (isAwake) {
      setIsCurled(false);
      return undefined;
    }
    const timer = setTimeout(() => setIsCurled(true), CURL_AFTER_MS);
    return () => clearTimeout(timer);
  }, [isAwake]);

  return isCurled;
};

// while she stands hunting she looks one way, then the other, until she curls up or starts moving
const useScan = (isScanning) => {
  const [isLookingBack, setIsLookingBack] = useState(false);

  useEffect(() => {
    setIsLookingBack(false);
    if (!isScanning) return undefined;
    const timer = setInterval(() => setIsLookingBack((current) => !current), SCAN_EVERY_MS);
    return () => clearInterval(timer);
  }, [isScanning]);

  return isLookingBack;
};

// how she points at the larva while it peeks out, null when it's hiding
const useSighting = (sighting, spriteRef) => {
  const [look, setLook] = useState(null);

  useEffect(() => {
    if (!sighting || !spriteRef.current) {
      setLook(null);
      return;
    }
    setLook(sightOn(spriteRef.current.getBoundingClientRect(), centerOf(sighting)));
  }, [sighting, spriteRef]);

  return look;
};

// the ending's stage, null while the hunt is on, moving through every stage on its own timer once the larva is defeated
const useEnding = (isDefeated) => {
  const [stage, setStage] = useState(null);

  useEffect(() => {
    if (!isDefeated) return undefined;
    const timers = endingCues().map((at) => setTimeout(() => setStage(endingStage(at)), at));
    return () => timers.forEach(clearTimeout);
  }, [isDefeated]);

  return stage;
};

// turns her toward the tool in her sights and fires a shot at it, one per tool, telling onLand which tool it hit.
// anyone who asked for less movement gets her aiming, and the shot lands at once
const useAim = (target, spriteRef, scale, isStill, onLand) => {
  const [aim, setAim] = useState({ facing: "right", pose: "aim", flight: null, impact: null });
  const landed = useRef(onLand);
  landed.current = onLand;

  useEffect(() => {
    if (!target || !spriteRef.current) return;
    const box = spriteRef.current.getBoundingClientRect();
    const spot = centerOf(target.element);
    const { facing, pose } = sightOn(box, spot);
    if (isStill) {
      setAim({ facing, pose, flight: null, impact: null });
      landed.current(target.name);
      return;
    }
    const from = muzzleOffset(box, SAMUS.muzzles[pose], scale, facing);
    const to = { x: spot.x - box.left, y: spot.y - box.top };
    setAim({ facing, pose, flight: { from, to, name: target.name, key: Date.now(), ...shotFlight(from, to) }, impact: null });
  }, [target, spriteRef, scale, isStill]);

  const land = () => {
    const { flight } = aim;
    if (!flight) return;
    setAim((current) => ({ ...current, flight: null, impact: { ...flight.to, key: flight.key } }));
    landed.current(flight.name);
  };
  const fade = () => setAim((current) => ({ ...current, impact: null }));
  return { ...aim, land, fade };
};

// the charge shot, centered on the cannon's end and flying along its own angle until it hits
const Shot = ({ flight, scale, onLand }) => {
  const width = SAMUS_SHOT.width * scale;
  const height = SAMUS_SHOT.height * scale;
  return (
    <motion.img
      src={SAMUS_SHOT.src}
      alt=""
      width={width}
      height={height}
      className="absolute max-w-none [image-rendering:pixelated]"
      style={{ left: flight.from.x - width / 2, top: flight.from.y - height / 2, rotate: flight.angle }}
      initial={{ x: 0, y: 0 }}
      animate={{ x: flight.dx, y: flight.dy }}
      transition={{ duration: flight.seconds, ease: "linear" }}
      onAnimationComplete={onLand}
    />
  );
};

// the flash where a shot lands, a burst of the shot's own orange
const Impact = ({ impact, onFade }) => (
  <motion.span
    className="absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#fff6c8_0%,#ffb03a_35%,transparent_70%)]"
    style={{ left: impact.x, top: impact.y }}
    initial={{ scale: 0.2, opacity: 1 }}
    animate={{ scale: 1.8, opacity: 0 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    onAnimationComplete={onFade}
  />
);

// where the ship goes in each stage: down out of the sky to land, then up off the ground and away into the middle of
// the orbit, shrinking into the distance
const shipMotion = (stage, flight, scale, isStill) => {
  if (stage !== "departing") return { animate: { x: 0, y: 0, scale: 1, opacity: 1 }, transition: { duration: isStill ? 0.3 : 1.4, ease: [0.16, 1, 0.3, 1] } };
  if (isStill || !flight) return { animate: { opacity: 0 }, transition: { duration: 0.6 } };
  return {
    animate: { x: [0, 0, flight.dx], y: [0, -30 * scale, flight.dy], scale: [1, 1, SHIP_FAR], opacity: [1, 1, 1, 0] },
    transition: { duration: 2.4, times: [0, 0.25, 1], ease: "easeInOut", opacity: { duration: 2.4, times: [0, 0.3, 0.85, 1] } },
  };
};

// her gunship: lands beside her, waits while she leaps aboard, then flies off into the middle of the orbit
const Gunship = ({ scale, side, stage, flight, isStill, shipRef }) => {
  const tuck = `calc(100% - ${SHIP_TUCK * scale}px)`;
  const { animate, transition } = shipMotion(stage, flight, scale, isStill);
  return (
    <motion.img
      ref={shipRef}
      src={GUNSHIP.src}
      alt=""
      width={GUNSHIP.width * scale}
      height={GUNSHIP.height * scale}
      className="absolute bottom-0 max-w-none [image-rendering:pixelated]"
      style={side === "left" ? { right: tuck } : { left: tuck }}
      initial={isStill ? { opacity: 0 } : { y: -320 * scale, opacity: 0 }}
      animate={animate}
      transition={transition}
    />
  );
};

// the Zero Suit as she leaps up and into the ship, and out of sight while the ship flies her away. her box stays where
// it was, so the ship beside it doesn't move
const leapMotion = (stage, side, scale, isStill) => {
  if (stage === "departing") return { opacity: 0 };
  if (stage !== "boarding" || isStill) return { x: 0, y: 0, opacity: 1 };
  const shift = boardingShift(side, ZERO_SUIT.cell.width * scale, GUNSHIP.width * scale, SHIP_TUCK * scale);
  return { x: [0, shift / 2, shift], y: [0, -34 * scale, -8 * scale], opacity: [1, 1, 0], transition: { duration: 0.6, ease: "easeOut" } };
};

const facingFor = ({ target, aim, walk, isRunning, isCurled, sightingLook, isLookingBack }) => {
  if (target) return aim.facing;
  if (isRunning || isCurled) return walk.facing;
  if (sightingLook) return sightingLook.facing;
  if (!isLookingBack) return walk.facing;
  return walk.facing === "left" ? "right" : "left";
};

// where she stands along the track. once the ending starts she stays where the larva fell, so scrolling doesn't slide
// her or the ship around
const useTrack = (progress, width, isStill, isFrozen) => {
  const tracked = useTransform(progress, (at) => {
    const spot = isStill ? 0.5 : trackSpot(at);
    return `calc(${spot * 100}% - ${spot * width}px)`;
  });
  const [frozen, setFrozen] = useState(null);

  useEffect(() => {
    setFrozen(isFrozen ? tracked.get() : null);
  }, [isFrozen, tracked]);

  return frozen ?? tracked;
};

/**
 * Samus under the orbit, hunting the Metroid larva hiding in it: running along as the section scrolls, looking both
 * ways when the scroll rests and curling into the morph ball after a while, pointing the cannon at the larva whenever
 * it peeks out, and firing a charge shot at whichever tool is hovered or focused. The third hit defeats the larva, and
 * she raises the cannon in triumph, steps out of the suit, leaps aboard her gunship and flies off into the orbit.
 * @param {{ progress: import("framer-motion").MotionValue<number>, target: { name: string, element: HTMLElement } | null,
 *   sighting: HTMLElement | null, orbitRef: { current: HTMLElement | null }, scale: number, isDefeated: boolean,
 *   onLand: (name: string) => void }} props
 *   target is the tool in her sights, sighting the larva while it peeks out, orbitRef the orbit the ship flies into,
 *   onLand fires with the tool each shot lands on
 */
const Hunter = ({ progress, target, sighting, orbitRef, scale, isDefeated, onLand }) => {
  const isStill = useReducedMotion();
  const spriteRef = useRef(null);
  const shipRef = useRef(null);
  const stage = useEnding(isDefeated);
  const isEnding = Boolean(stage);
  const walk = useWalk(progress);
  const isRunning = walk.isWalking && !isStill && !isEnding;
  const aimTarget = isEnding ? null : target;
  // a page held still never curls her up, she'd just sit there as a ball
  const sightingLook = useSighting(isEnding ? null : sighting, spriteRef);
  const isCurled = useCurl(isRunning || Boolean(aimTarget) || isStill || isEnding, Boolean(sightingLook));
  const isLookingBack = useScan(!isEnding && !isRunning && !isCurled && !aimTarget && !sightingLook && !isStill);
  const aim = useAim(aimTarget, spriteRef, scale, isStill, onLand);
  const [shipSide, setShipSide] = useState("left");
  const [shipFlight, setShipFlight] = useState(null);
  // aboard the ship she keeps her last look, hidden, so her box keeps its size and the ship beside it stays put
  const ending = endingLook(stage === "departing" ? "boarding" : stage);
  const suit = ending?.suit ?? "power";
  const sheet = SHEETS[suit];
  const left = useTrack(progress, sheet.cell.width * scale, isStill, isEnding);
  const pose = ending?.pose ?? hunterPose({ targetPose: aimTarget ? aim.pose : null, sightingPose: sightingLook?.pose ?? null, isRunning, isCurled });
  const facing = facingFor({ target: aimTarget, aim, walk, isRunning, isCurled, sightingLook, isLookingBack });
  const hasShip = stage === "landing" || stage === "boarding" || stage === "departing";

  useEffect(() => {
    if (stage === "landing" && spriteRef.current) setShipSide(shipSideFor(spriteRef.current.getBoundingClientRect(), window.innerWidth));
    if (stage === "departing" && shipRef.current && orbitRef.current) setShipFlight(shotFlight(centerOf(shipRef.current), centerOf(orbitRef.current)));
  }, [stage, orbitRef]);

  if (stage === "gone") return null;

  return (
    <motion.div style={{ left }} className="pointer-events-none absolute top-full" aria-hidden="true">
      <div ref={spriteRef} className="relative">
        {hasShip && <Gunship scale={scale} side={shipSide} stage={stage} flight={shipFlight} isStill={isStill} shipRef={shipRef} />}
        {ending && (
          // the triumph and the suit coming off both flash white, the way she does when she touches a power up
          <motion.div
            key={suit}
            className="relative"
            initial={isStill ? false : { filter: "brightness(4)" }}
            animate={isStill ? undefined : { filter: ["brightness(4)", "brightness(1)", "brightness(2.2)", "brightness(1)"] }}
            transition={{ duration: 1, times: [0, 0.4, 0.6, 1] }}
          >
            <motion.div animate={leapMotion(stage, shipSide, scale, isStill)}>
              <Sprite key={pose} sheet={sheet} animation={pose} scale={scale} isFlipped={facing === "left"} />
            </motion.div>
          </motion.div>
        )}
        {!ending && <Sprite key={pose} sheet={sheet} animation={pose} scale={scale} isFlipped={facing === "left"} />}
      </div>
      <AnimatePresence>{aim.flight && <Shot key={aim.flight.key} flight={aim.flight} scale={scale} onLand={aim.land} />}</AnimatePresence>
      {aim.impact && <Impact key={aim.impact.key} impact={aim.impact} onFade={aim.fade} />}
    </motion.div>
  );
};

export default Hunter;
