import { motion, useReducedMotion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";
import { clusterDots, scatterDots } from "./actions";

// past this many people the cluster reads as a crowd anyway, and the dots would start to touch
const MOST_DOTS = 40;
const CLUSTER_RADIUS = 22;
const DOT = 7;

/**
 * The team as one dot per person: spread out in a line, they gather into a tight cluster as it scrolls into view.
 * @param {{ size: number }} props how many people were on the team
 */
const TeamDots = ({ size }) => {
  const isStill = useReducedMotion();
  const count = Math.min(Math.max(Math.round(size), 0), MOST_DOTS);
  if (count === 0) return null;
  const gathered = clusterDots(count);
  const scattered = scatterDots(count);

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: CLUSTER_RADIUS * 2 + DOT, height: CLUSTER_RADIUS * 2 + DOT }} aria-hidden="true">
        {gathered.map((spot, index) => (
          <motion.span
            key={index}
            className={`absolute top-1/2 left-1/2 rounded-full ${index === 0 ? "bg-sunset" : "bg-fg/70"}`}
            style={{ width: DOT, height: DOT, marginLeft: -DOT / 2, marginTop: -DOT / 2 }}
            initial={isStill ? false : { x: scattered[index].x * CLUSTER_RADIUS, y: scattered[index].y * CLUSTER_RADIUS, opacity: 0 }}
            whileInView={{ x: spot.x * CLUSTER_RADIUS, y: spot.y * CLUSTER_RADIUS, opacity: 1 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 1.2, delay: 0.1 + index * 0.025, ease: easeOutExpo }}
          />
        ))}
      </div>
      <p className="text-sm text-muted">
        A team of <span className="font-semibold text-fg tabular-nums">{size}</span>
      </p>
    </div>
  );
};

export default TeamDots;
