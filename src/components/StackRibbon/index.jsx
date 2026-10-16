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
import { useGetAboutQuery } from "../../api/aboutApi";
import { techIconMap } from "../../lib/techIconMap";
import { wrapRange } from "../../actions";

const CRAFT = ["lead teams", "ship AI people trust", "design systems", "own the pipeline", "review every PR", "write the tests too"];

// one endless row: drifts on its own, races ahead when you scroll fast, turns around when you scroll back up,
// and leans into the motion like it has weight
const Row = ({ items, speed, renderItem, className = "" }) => {
  const prefersReducedMotion = useReducedMotion();
  const offset = useMotionValue(0);
  const direction = useRef(speed > 0 ? 1 : -1);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const boost = useTransform(velocity, [-2500, 0, 2500], [-6, 0, 6], { clamp: false });
  const lean = useTransform(velocity, [-2500, 2500], [7, -7]);
  // the items are laid out twice, so wrapping at half the width loops without a seam
  const x = useTransform(offset, (value) => `${wrapRange(-50, 0, value)}%`);

  useAnimationFrame((_, delta) => {
    if (prefersReducedMotion) return;
    const push = boost.get();
    if (push < 0) direction.current = -Math.sign(speed);
    else if (push > 0) direction.current = Math.sign(speed);
    const step = direction.current * Math.abs(speed) * (delta / 1000);
    offset.set(offset.get() + step + step * Math.abs(push));
  });

  return (
    <div className={`flex overflow-hidden whitespace-nowrap ${className}`}>
      <motion.div className="flex shrink-0 items-center" style={prefersReducedMotion ? undefined : { x, skewX: lean }}>
        {[...items, ...items].map((item, index) => (
          <span key={index} className="flex shrink-0 items-center">
            {renderItem(item)}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

// between the philosophy and the bio: every tool I've shipped with on one row, how I like to work on the other,
// running in opposite directions
const StackRibbon = () => {
  const { data: about } = useGetAboutQuery();
  const tools = (about?.skill_levels ?? []).map((skill) => skill.name);
  if (tools.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      data-search-skip
      className="relative flex flex-col gap-4 py-10 select-none sm:py-16"
      style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
    >
      <Row
        items={tools}
        speed={-2.4}
        renderItem={(tool) => {
          const Icon = techIconMap[tool];
          return (
            <span className="flex items-center gap-4 px-6 text-[clamp(2rem,6vw,4.5rem)] leading-none font-medium tracking-[-0.04em] text-fg/90">
              {Icon && <Icon className="size-[0.6em] text-accent" />}
              {tool}
              <span className="pl-6 text-faint">/</span>
            </span>
          );
        }}
      />
      <Row
        items={CRAFT}
        speed={1.6}
        renderItem={(craft) => (
          <span className="flex items-center gap-6 px-6 font-mono text-sm text-muted sm:text-base">
            <span className="text-signal">~</span>
            {craft}
          </span>
        )}
      />
    </div>
  );
};

export default StackRibbon;
