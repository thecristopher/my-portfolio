import { motion } from "framer-motion";
import { lightUpAt } from "./actions";

const MONTHS = 12;
// the same length the years take to count up beside it
const COUNT_SECONDS = 1.6;

const square = {
  dark: { opacity: 0, scale: 0.6 },
  lit: (delay) => ({ opacity: 1, scale: 1, transition: { delay, duration: 0.35 } }),
};

// the first year in the sunrise color, the latest in the dusk one
const yearColor = (year, years) => {
  const dusk = years > 1 ? Math.round((year / (years - 1)) * 100) : 0;
  return `color-mix(in oklab, var(--color-sunset-3) ${dusk}%, var(--color-sunset-1))`;
};

/**
 * The years of experience as a grid, one column per year and one square per month, lighting up in step with the
 * number counting up beside it. It counts time, not activity, so every square is the same brightness.
 * @param {{ years: number }} props whole years of experience
 */
const YearsGrid = ({ years }) => {
  const total = years * MONTHS;
  return (
    <div className="flex flex-col gap-2">
      <motion.ol
        initial="dark"
        whileInView="lit"
        viewport={{ once: true }}
        className="grid w-fit grid-flow-col grid-rows-12 gap-[3px]"
        aria-label={`${years} years, ${total} months`}
      >
        {Array.from({ length: total }, (_, index) => {
          const year = Math.floor(index / MONTHS);
          return (
            <li key={index} className="relative size-2.5 rounded-[3px] bg-raised">
              <motion.span
                variants={square}
                custom={lightUpAt(index, total, COUNT_SECONDS)}
                className="absolute inset-0 rounded-[3px]"
                style={{ background: yearColor(year, years) }}
              />
            </li>
          );
        })}
      </motion.ol>
      <p className="max-w-[9rem] text-xs text-faint">One square a month, from the first year to now.</p>
    </div>
  );
};

export default YearsGrid;
