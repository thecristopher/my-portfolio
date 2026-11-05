import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { COMPANY_LOGOS } from "../../lib/companyLogos";

// the glow fades out before every edge of the chapter, so it never shows where its box ends
const EDGE_FADE = "linear-gradient(to right, transparent, black 18%, black 82%, transparent), linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)";

/**
 * A soft glow of the company's brand color behind its chapter, there only while the chapter is on screen, so each
 * company feels like its own room. Companies without a color on file get no glow.
 * @param {{ company: string }} props
 */
const BrandWash = ({ company }) => {
  const ref = useRef(null);
  const isOnScreen = useInView(ref, { amount: 0.25 });
  const color = COMPANY_LOGOS[company]?.color;
  if (!color) return null;

  return (
    <motion.div
      ref={ref}
      className="pointer-events-none absolute inset-x-0 -top-16 bottom-0 -z-10"
      style={{
        background: `radial-gradient(55% 40% at 22% 18%, color-mix(in oklab, ${color} 16%, transparent), transparent 75%), radial-gradient(45% 35% at 85% 70%, color-mix(in oklab, ${color} 9%, transparent), transparent 75%)`,
        maskImage: EDGE_FADE,
        maskComposite: "intersect",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOnScreen ? 1 : 0 }}
      transition={{ duration: 1.2 }}
      aria-hidden="true"
    />
  );
};

export default BrandWash;
