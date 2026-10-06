import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { splitStatValue } from "../../actions";

const CountUp = ({ value, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const prefersReducedMotion = useReducedMotion();
  const { number, suffix } = splitStatValue(value);
  const [shown, setShown] = useState(prefersReducedMotion ? number : 0);

  useEffect(() => {
    if (!isInView || number === null || prefersReducedMotion) return;
    const controls = animate(0, number, {
      duration: 1.6,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setShown(Math.round(latest)),
    });
    return () => controls.stop();
  }, [isInView, number, delay, prefersReducedMotion]);

  return (
    <span ref={ref} className="tabular-nums">
      {number === null ? suffix : `${shown}${suffix}`}
    </span>
  );
};

export default CountUp;
