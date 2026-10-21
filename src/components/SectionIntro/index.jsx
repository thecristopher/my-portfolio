import { motion } from "framer-motion";
import { bufferNameFor } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import FileIcon from "../FileIcon";

const rise = (delay) => ({
  initial: { opacity: 0, y: 28, filter: "blur(8px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1.1, delay, ease: easeOutExpo },
});

/**
 * How every section opens, the way an Apple product page opens a chapter: the buffer it lives in, one huge line
 * with its key words in the region's gold, and a short lead under it.
 * @param {{ sectionId: string, number: number, title: React.ReactNode, lead?: React.ReactNode, align?: "left" | "center", children?: React.ReactNode }} props
 */
const SectionIntro = ({ sectionId, number, title, lead, align = "left", children }) => {
  const bufferName = bufferNameFor(sectionId);
  const isCentered = align === "center";

  return (
    <header className={`flex flex-col gap-6 ${isCentered ? "items-center text-center" : ""}`}>
      <motion.p {...rise(0)} className="flex items-center gap-2 font-mono text-xs text-faint">
        <span className="text-accent tabular-nums">{String(number).padStart(2, "0")}</span>
        <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
        <FileIcon name={bufferName} size={12} />
        <span className="text-muted">{bufferName}</span>
      </motion.p>
      <motion.h2
        {...rise(0.08)}
        className={`max-w-5xl text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.045em] text-balance ${isCentered ? "mx-auto" : ""}`}
      >
        {title}
      </motion.h2>
      {lead && (
        <motion.p {...rise(0.16)} className={`max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl ${isCentered ? "mx-auto" : ""}`}>
          {lead}
        </motion.p>
      )}
      {children}
    </header>
  );
};

/** The words of a section title that carry it, in the region's gold. */
export const Gold = ({ children }) => <span className="text-gold">{children}</span>;

export default SectionIntro;
