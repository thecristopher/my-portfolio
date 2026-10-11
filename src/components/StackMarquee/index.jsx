import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { techIconMap } from "../../lib/techIconMap";
import { wrapRange } from "../../actions";

// percent of one copy of the list per second while the page sits still
const DRIFT_PER_S = 1.4;

const StackItem = ({ name }) => {
  const Icon = techIconMap[name];
  return (
    <li className="flex shrink-0 items-center gap-3 pr-12 text-faint transition-colors duration-300 hover:text-fg">
      {Icon ? <Icon size={22} aria-hidden="true" /> : <span className="text-accent">✦</span>}
      <span className="text-[clamp(1.25rem,2.4vw,2rem)] font-medium tracking-[-0.03em]">{name}</span>
    </li>
  );
};

const StackList = ({ stack, isEcho = false }) => (
  <ul className="flex shrink-0" aria-label={isEcho ? undefined : "Tools I've shipped with"} aria-hidden={isEcho || undefined}>
    {stack.map((name) => (
      <StackItem key={name} name={name} />
    ))}
  </ul>
);

// an endless ribbon of every tool I've shipped with. it idles along on its own, speeds up while you scroll,
// flips direction when you scroll back up, and leans into the motion like it's being dragged
const StackMarquee = ({ stack }) => {
  const prefersReducedMotion = useReducedMotion();
  const offset = useMotionValue(0);
  const direction = useRef(-1);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const boost = useTransform(smoothVelocity, [-2000, 0, 2000], [-6, 0, 6], { clamp: false });
  const skewX = useTransform(smoothVelocity, [-2500, 2500], [8, -8]);
  // two copies sit side by side, so sliding exactly one copy's width lands back where it started
  const x = useTransform(offset, (value) => `${wrapRange(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;
    if (boost.get() < 0) direction.current = 1;
    else if (boost.get() > 0) direction.current = -1;
    const step = direction.current * DRIFT_PER_S * (delta / 1000);
    offset.set(offset.get() + step * (1 + Math.abs(boost.get())));
  });

  if (stack.length === 0) return null;

  if (prefersReducedMotion) {
    return (
      <ul className="flex flex-wrap gap-y-4" aria-label="Tools I've shipped with">
        {stack.map((name) => (
          <StackItem key={name} name={name} />
        ))}
      </ul>
    );
  }

  return (
    <div
      className="relative overflow-hidden py-2"
      style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
    >
      <motion.div style={{ x, skewX }} className="flex w-max">
        <StackList stack={stack} />
        <StackList stack={stack} isEcho />
      </motion.div>
    </div>
  );
};

export default StackMarquee;
