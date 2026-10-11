import { useRef } from "react";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useMediaQuery } from "../../hooks/useMediaQuery";

const PULL = 0.3;
const SPRING = { stiffness: 220, damping: 16, mass: 0.4 };

// leans toward the cursor while it hovers nearby and springs back home when it leaves. mouse only
const Magnetic = ({ children, className = "" }) => {
  const ref = useRef(null);
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const hasMouse = useMediaQuery("(hover: hover) and (pointer: fine)");
  const prefersReducedMotion = useReducedMotion();
  const isActive = hasMouse && !prefersReducedMotion;

  const pull = (event) => {
    const bounds = ref.current.getBoundingClientRect();
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * PULL);
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * PULL);
  };

  const release = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={isActive ? pull : undefined}
      onPointerLeave={isActive ? release : undefined}
      style={{ x, y }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
