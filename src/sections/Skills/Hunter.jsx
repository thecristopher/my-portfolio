import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import AnchoredSprite from "../../components/Sprite/Anchored";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { GUNSHIP, SAMUS, SAMUS_SHOT } from "../../lib/sprites/samus";
import { boardingArc, endingCues, endingPose, endingStage, shipSideFor, travel } from "./actions";
import { centerOf, useHunter } from "./useHunter";

const PIXEL = { fontFamily: '"Pixelify Sans", ui-monospace, monospace' };
// what she says once the larva is down, to whoever helped her find it
const THANKS = "You found it! Thanks for the help, hunter.";
// how small the ship gets as it flies off into the middle of the orbit
const SHIP_FAR = 0.1;
// how far the ship's middle lands from her, and how high she spins over it boarding, in sprite px
const SHIP_GAP = 8;
const BOARDING_HEIGHT = 40;
// how fast her shot flies, in screen px per second
const SHOT_SPEED = 900;

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

// what she's up to: playing out her ending, out of sight while a card is open, aiming at a picked tool, running after
// the peeking larva, or strolling around
const modeFor = ({ isEnding, isHidden, target, sighting }) => {
  if (isEnding) return "ending";
  if (isHidden) return "hidden";
  if (target) return "aiming";
  return sighting ? "chasing" : "wandering";
};

// the shots in flight, each one gone once it lands
const useShots = (onLanded) => {
  const [shots, setShots] = useState([]);
  const fire = useCallback((shot) => setShots((flying) => [...flying, { ...shot, id: performance.now() }]), []);
  const land = (id) => {
    setShots((flying) => flying.filter((shot) => shot.id !== id));
    onLanded();
  };
  return { shots, fire, land };
};

// a "!" over her head the moment she spots the larva
const Alert = ({ scale }) => (
  <motion.span
    className="absolute -translate-x-1/2 text-2xl leading-none font-bold text-[#ff4d6d] drop-shadow-[0_2px_0_#0b1430]"
    style={{ ...PIXEL, left: 0, bottom: SAMUS.anchor.y * scale + 6 }}
    initial={{ opacity: 0, y: 6, scale: 0.5 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 14 }}
  >
    !
  </motion.span>
);

// her thanks to the visitor, in a speech bubble over her head while she faces you
const Thanks = ({ scale }) => (
  <motion.p
    className="absolute w-max max-w-[14rem] -translate-x-1/2 rounded-2xl bg-[#0b1430] px-4 py-2.5 text-center text-sm leading-snug text-white shadow-xl after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-[#0b1430] after:content-['']"
    style={{ ...PIXEL, left: 0, bottom: SAMUS.anchor.y * scale + 14 }}
    initial={{ opacity: 0, y: 10, scale: 0.8 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ type: "spring", stiffness: 380, damping: 18 }}
  >
    {THANKS}
  </motion.p>
);

// her beam, from the arm cannon to the larva, with a flash where it leaves
const Shot = ({ shot, scale, onLanded }) => {
  const path = travel(shot.from, shot.to);
  const width = SAMUS_SHOT.width * scale;
  const height = SAMUS_SHOT.height * scale;
  return (
    <>
      <motion.span
        className="absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#ffffff_0%,#fff6a8_40%,transparent_70%)]"
        style={{ left: shot.from.x, top: shot.from.y }}
        initial={{ scale: 0.4, opacity: 1 }}
        animate={{ scale: 1.6, opacity: 0 }}
        transition={{ duration: 0.18 }}
      />
      <motion.img
        src={SAMUS_SHOT.src}
        alt=""
        width={width}
        height={height}
        className="absolute max-w-none drop-shadow-[0_0_8px_#7dff9a] [image-rendering:pixelated]"
        style={{ left: shot.from.x - width / 2, top: shot.from.y - height / 2, rotate: path.angle }}
        initial={{ x: 0, y: 0 }}
        animate={{ x: path.dx, y: path.dy }}
        transition={{ duration: path.length / SHOT_SPEED, ease: "linear" }}
        onAnimationComplete={onLanded}
      />
    </>
  );
};

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

// how far the ship's middle sits from her feet
const shipReach = (scale) => ((SAMUS.cell.width + GUNSHIP.width) / 2 + SHIP_GAP) * scale;

// her gunship: lands beside her with its belly on her ground, waits while she space jumps aboard, then flies off
const Gunship = ({ side, stage, flight, scale, isStill, shipRef }) => {
  const width = GUNSHIP.width * scale;
  const middle = side === "left" ? -shipReach(scale) : shipReach(scale);
  const { animate: to, transition } = shipMotion(stage, flight, isStill);
  return (
    <motion.img
      ref={shipRef}
      src={GUNSHIP.src}
      alt=""
      width={width}
      height={GUNSHIP.height * scale}
      className="absolute bottom-0 max-w-none [image-rendering:pixelated]"
      style={{ left: middle - width / 2 }}
      initial={isStill ? { opacity: 0 } : { y: -500, opacity: 0 }}
      animate={to}
      transition={transition}
    />
  );
};

// her space jump into the ship, and out of sight once she's aboard
const boardingMotion = (stage, side, scale, isStill) => {
  if (stage === "departing") return { opacity: 0 };
  if (stage !== "boarding" || isStill) return { x: 0, y: 0, opacity: 1 };
  const arc = boardingArc(side, shipReach(scale), BOARDING_HEIGHT * scale);
  return { ...arc, opacity: [1, 1, 0], transition: { duration: 0.8, ease: "easeInOut" } };
};

// the ship's trip from where it landed into the middle of the orbit
const useShipFlight = (stage, shipRef, orbitRef) => {
  const [flight, setFlight] = useState(null);

  useEffect(() => {
    if (stage === "departing" && shipRef.current && orbitRef.current) setFlight(travel(centerOf(shipRef.current), centerOf(orbitRef.current)));
  }, [stage, shipRef, orbitRef]);

  return flight;
};

/**
 * Samus in the Power Suit, on her own patrol under the orbit: rolling short ways in the morph ball and running long
 * ones, somersaulting now and then, running to stand right under the Metroid larva with a "!" whenever it peeks out,
 * and hopping up to shoot it, which sends it ducking back. She aims at whichever tool is hovered or focused. Opening a
 * tool is her real shot, played out in the card. Once the larva is defeated and the card closes, she faces you and
 * thanks you, her gunship lands beside her and she space jumps aboard before it flies off into the orbit.
 * @param {{ target: { name: string, element: HTMLElement } | null, sighting: HTMLElement | null,
 *   orbitRef: { current: HTMLElement | null }, isHidden: boolean, isEnding: boolean, onShotLanded: () => void }} props
 *   target is the tool in her sights, sighting the larva while it peeks out, orbitRef the orbit she patrols under,
 *   isHidden whether a card is open over her, onShotLanded fires when one of her shots reaches the larva
 */
const Hunter = ({ target, sighting, orbitRef, isHidden, isEnding, onShotLanded }) => {
  const isStill = useReducedMotion();
  const shipRef = useRef(null);
  const scale = useMediaQuery("(min-width: 640px)") ? 3 : 2;
  const width = SAMUS.cell.width * scale;
  const track = useTrack(orbitRef, width);
  const stage = useEndingStage(isEnding);
  const mode = modeFor({ isEnding, isHidden, target, sighting });
  const { shots, fire, land } = useShots(onShotLanded);
  const { x, lift, view } = useHunter({ mode, target: target?.element ?? null, sighting, orbitRef, track, width, scale, isStill, onFire: fire });
  const [shipSide, setShipSide] = useState("left");
  const flight = useShipFlight(stage, shipRef, orbitRef);

  useEffect(() => {
    if (stage === "landing") setShipSide(shipSideFor(x.get(), track));
  }, [stage, x, track]);

  if (stage === "gone") return null;
  const pose = stage ? endingPose(stage) : view.pose;
  const hasShip = stage === "landing" || stage === "boarding" || stage === "departing";

  return (
    <>
      <div className={`pointer-events-none absolute top-full left-0 transition-opacity ${isHidden ? "opacity-0" : ""}`} aria-hidden="true">
        {/* her feet: everything about her is placed from this point on the ground */}
        <motion.div className="absolute" style={{ left: width / 2, top: SAMUS.cell.height * scale, x, y: lift }}>
          {hasShip && <Gunship side={shipSide} stage={stage} flight={flight} scale={scale} isStill={isStill} shipRef={shipRef} />}
          {mode === "chasing" && <Alert scale={scale} />}
          <AnimatePresence>{stage === "triumph" && <Thanks scale={scale} />}</AnimatePresence>
          <motion.div animate={boardingMotion(stage, shipSide, scale, isStill)}>
            {pose && <AnchoredSprite sheet={SAMUS} animation={pose} scale={scale} facing={stage ? "right" : view.facing} distance={view.distance} />}
          </motion.div>
        </motion.div>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden="true">
        {shots.map((shot) => (
          <Shot key={shot.id} shot={shot} scale={scale} onLanded={() => land(shot.id)} />
        ))}
      </div>
    </>
  );
};

export default Hunter;
