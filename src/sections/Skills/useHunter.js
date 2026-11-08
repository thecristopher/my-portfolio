import { useEffect, useRef, useState } from "react";
import { useMotionValue } from "framer-motion";
import { frameAtDistance } from "../../components/Sprite/actions";
import { SAMUS } from "../../lib/sprites/samus";
import {
  aimPoseFor,
  facingFor,
  flipSpotFor,
  fromAnchor,
  gaitFor,
  hasArrived,
  hasPassed,
  jumpFrom,
  poseFor,
  restFor,
  restingBody,
  sideOf,
  spotUnder,
  stepBody,
  wanderGoal,
} from "./actions";

// a long pause, like a hidden tab, never turns into one giant step
const LONGEST_STEP = 0.05;
// how high she hops to shoot the larva and how high a somersault goes, in sprite px
const HOP = 22;
const FLIP = 30;
// where she aims from, in sprite px above her feet
const CHEST = 26;
// how close under the larva counts as under it, in sprite px
const UNDER_WITHIN = 4;
// how long she waits before strolling again once something else had her attention, in ms
const SETTLE_FOR = 700;

/** The center of an element on the screen. */
export const centerOf = (element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};

// her feet on the screen: the track runs along the orbit's bottom edge, her ground one sprite's height below it
const footOf = (world, body) => {
  const orbit = world.orbit.getBoundingClientRect();
  return { x: orbit.left + body.x + world.width / 2, y: orbit.bottom + SAMUS.cell.height * world.scale - body.y };
};

const standStill = () => ({ goal: null, gait: null, aim: null, lookingTo: null });

const lookAt = (world, body, element) => {
  const foot = footOf(world, body);
  const spot = centerOf(element);
  const chest = { x: foot.x, y: foot.y - CHEST * world.scale };
  return { aim: aimPoseFor(chest, spot), lookingTo: sideOf(foot.x, spot.x), spot };
};

const aimAtTarget = (world, body) => {
  const look = lookAt(world, body, world.target);
  return { goal: null, gait: null, aim: look.aim, lookingTo: look.lookingTo };
};

// runs to stand right under the larva wherever the turning ring has carried it, then hops up and shoots it, once a peek
const chase = (world, body, plan) => {
  const look = lookAt(world, body, world.sighting);
  const goal = spotUnder(look.spot.x, world.orbit.getBoundingClientRect().left, world.width, world.track);
  const intent = { goal, gait: "run", aim: look.aim, lookingTo: look.lookingTo };
  const isUnder = Math.abs(body.x - goal) < UNDER_WITHIN * world.scale && body.y === 0;
  if (plan.shotAt === world.sighting || !isUnder) return intent;
  plan.shotAt = world.sighting;
  plan.isHopping = true;
  return { ...intent, jump: { height: HOP, isSpinning: false } };
};

// strolls to a spot, rests a while, strolls again, now and then throwing a somersault into a long run
const wander = (world, body, plan, now) => {
  if (plan.goal === null && now < plan.restUntil) return standStill();
  if (plan.goal === null) {
    plan.goal = wanderGoal(body.x, world.track);
    plan.gait = gaitFor(body.x, plan.goal, world.track);
    plan.flipAt = flipSpotFor(body.x, plan.goal, plan.gait);
  }
  if (!hasArrived(body, plan.goal)) return { goal: plan.goal, gait: plan.gait, aim: null, lookingTo: null };
  plan.goal = null;
  plan.restUntil = now + restFor();
  return standStill();
};

// a new mode drops whatever stroll was underway, so she never wanders off mid aim or right after a chase
const settleInto = (plan, mode, now) => {
  if (plan.mode === mode) return;
  Object.assign(plan, { mode, goal: null, flipAt: null, isHopping: false, restUntil: now + SETTLE_FOR });
};

const think = (world, body, plan, now) => {
  settleInto(plan, world.mode, now);
  if (world.isStill) return world.target ? aimAtTarget(world, body) : standStill();
  if (world.mode === "aiming") return aimAtTarget(world, body);
  if (world.mode === "chasing") return chase(world, body, plan);
  if (world.mode === "wandering") return wander(world, body, plan, now);
  return standStill();
};

// the leap she takes this step, in sprite px: the hop she asked for, or the somersault waiting on her way
const leapFor = (intent, plan, before, after) => {
  if (intent.jump) return intent.jump;
  if (!hasPassed(before.x, after.x, plan.flipAt)) return null;
  plan.flipAt = null;
  return { height: FLIP, isSpinning: true };
};

// where her shot leaves the arm cannon, on the screen
const muzzleOf = (world, body, pose, facing) => {
  const foot = footOf(world, body);
  const tip = fromAnchor(SAMUS.muzzles[pose] ?? SAMUS.muzzles.jumpUp, SAMUS.anchor, facing);
  return { x: foot.x + tip.x * world.scale, y: foot.y - (SAMUS.anchor.y - tip.y) * world.scale };
};

// at the top of her hop she fires at the larva
const fireAtApex = (world, plan, before, after, view, onFire) => {
  if (!plan.isHopping || before.vy <= 0 || after.vy > 0 || !world.sighting) return;
  plan.isHopping = false;
  const orbit = world.orbit.getBoundingClientRect();
  const from = muzzleOf(world, after, view.pose, view.facing);
  const to = centerOf(world.sighting);
  onFire({ from: { x: from.x - orbit.left, y: from.y - orbit.top }, to: { x: to.x - orbit.left, y: to.y - orbit.top } });
};

const viewFor = (body, intent, plan, was, scale) => {
  if (intent.gait) plan.gait = intent.gait;
  const gait = intent.gait ?? (body.vx !== 0 ? plan.gait : null);
  const pose = poseFor(body, { gait, aim: intent.aim, scale });
  const facing = facingFor(body, intent.lookingTo, was.facing, scale);
  const animation = SAMUS.animations[pose];
  const frame = animation.stride ? frameAtDistance(body.distance, animation) : 0;
  return { pose, facing, distance: body.distance, frame };
};

const isSameView = (a, b) => a.pose === b.pose && a.facing === b.facing && a.frame === b.frame;

/**
 * Samus's body and mind under the orbit, run one animation frame at a time: she thinks about what to do, her body
 * runs, rolls, brakes and jumps by real physics, and her pose follows what her body is doing, with her feet and the
 * ball turning exactly as far as she travels.
 * @param {{ mode: "ending" | "hidden" | "aiming" | "chasing" | "wandering", target: HTMLElement | null,
 *   sighting: HTMLElement | null, orbitRef: { current: HTMLElement | null }, track: number, width: number,
 *   scale: number, isStill: boolean, onFire: (shot: { from: object, to: object }) => void }} options
 *   target is the tool she aims at, sighting the peeking larva, track how far she can go, width her sprite's width,
 *   onFire gets every shot she takes at the larva, in px from the orbit's top left
 * @returns {{ x: import("framer-motion").MotionValue<number>, lift: import("framer-motion").MotionValue<number>,
 *   view: { pose: string, facing: "left" | "right", distance: number } }} lift is her height off the ground, negative up
 */
export const useHunter = ({ mode, target, sighting, orbitRef, track, width, scale, isStill, onFire }) => {
  const x = useMotionValue(0);
  const lift = useMotionValue(0);
  const [view, setView] = useState({ pose: "aim", facing: "right", distance: 0, frame: 0 });
  const shown = useRef(view);
  const body = useRef(null);
  const plan = useRef({ mode: null, goal: null, gait: null, flipAt: null, restUntil: 0, shotAt: null, isHopping: false });
  const world = useRef(null);
  world.current = { mode, target, sighting, orbit: orbitRef.current, track, width, scale, isStill };
  const fired = useRef(onFire);
  fired.current = onFire;

  useEffect(() => {
    if (!track) return undefined;
    // she starts in the middle of the track, and stays on it when the window shrinks
    body.current = body.current ? { ...body.current, x: Math.min(body.current.x, track) } : restingBody(track / 2);
    let last = performance.now();
    let frame = requestAnimationFrame(function loop(now) {
      const dt = Math.min(LONGEST_STEP, (now - last) / 1000);
      last = now;
      const before = body.current;
      const intent = think(world.current, before, plan.current, now);
      let after = stepBody(before, intent, dt, scale);
      const leap = leapFor(intent, plan.current, before, after);
      if (leap) after = jumpFrom(after, leap.height * scale, scale, leap.isSpinning);
      body.current = after;
      x.set(after.x);
      lift.set(-after.y);
      const next = viewFor(after, intent, plan.current, shown.current, scale);
      fireAtApex(world.current, plan.current, before, after, next, fired.current);
      // her pose only re-renders when it shows something new, her position moves without React
      if (!isSameView(shown.current, next)) {
        shown.current = next;
        setView(next);
      }
      frame = requestAnimationFrame(loop);
    });
    return () => cancelAnimationFrame(frame);
  }, [track, scale, x, lift]);

  return { x, lift, view };
};
