import { motion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";

const rise = (delay) => ({
  initial: { opacity: 0, y: 32, filter: "blur(10px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.2, delay, ease: easeOutExpo },
});

/**
 * How every section opens, the way an Apple product page opens a chapter: a small label, one huge line and a short
 * lead under it, each rising out of a blur as it scrolls in.
 * @param {{ eyebrow: string, title: React.ReactNode, lead?: React.ReactNode, align?: "left" | "center", className?: string }} props
 */
const SectionHeading = ({ eyebrow, title, lead, align = "left", className = "" }) => {
  const isCentered = align === "center";
  return (
    <header className={`flex flex-col gap-5 ${isCentered ? "items-center text-center" : ""} ${className}`}>
      <motion.p {...rise(0)} className="text-sm font-semibold text-accent">
        {eyebrow}
      </motion.p>
      <motion.h2 {...rise(0.08)} className="max-w-5xl text-[clamp(2.6rem,7.5vw,6rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance">
        {title}
      </motion.h2>
      {lead && (
        <motion.p {...rise(0.16)} className="max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">
          {lead}
        </motion.p>
      )}
    </header>
  );
};

/** The words of a title that carry it, filled with the sunset. */
export const Sunset = ({ children }) => <span className="text-sunset">{children}</span>;

export default SectionHeading;
