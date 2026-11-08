import { motion, useMotionTemplate, useReducedMotion } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { DeskKeyboard, LaptopKeyboard, Mouse } from "./Keyboard";
import Screen from "./Screen";

/**
 * The ultrawide on its stand, for a wide screen: it powers on as it scrolls in, with the keyboard and the mouse on the
 * desk in front of it, every key lighting up as the editor types.
 * @param {{ progress: import("framer-motion").MotionValue<number>, typed: number }} props progress of the desk
 *   scrolling in, from 0 to 1
 */
export const Monitor = ({ progress, typed }) => {
  const prefersReducedMotion = useReducedMotion();
  const brightness = useScrollRange(progress, [0.25, 0.75], [0.2, 1]);
  const scale = useScrollRange(progress, [0, 0.85], [0.94, 1]);
  const filter = useMotionTemplate`brightness(${brightness})`;
  const led = useScrollRange(progress, [0.6, 0.75], ["#d08a2a", "#7ee08a"]);

  return (
    <motion.div style={prefersReducedMotion ? undefined : { scale }} className="relative z-10 mx-auto flex w-full flex-col items-center">
      <div className="relative w-full rounded-[0.9rem] bg-[#0c0c0e] px-2 pt-2 pb-4 shadow-2xl ring-1 ring-white/10">
        <motion.div style={prefersReducedMotion ? undefined : { filter }}>
          {/* a fixed height, the way a real screen is, so the editor typing never stretches the monitor */}
          <Screen typed={typed} shape="h-[29rem] rounded-[0.35rem] px-10 py-9" isWide />
        </motion.div>
        {/* the power light in the chin, amber on standby and green once it's on */}
        <motion.span style={{ backgroundColor: prefersReducedMotion ? "#7ee08a" : led }} className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full" aria-hidden="true" />
      </div>
      {/* the stand: a neck down from the back of the monitor and a foot flat on the desk */}
      <span className="h-14 w-[8%] bg-gradient-to-b from-[#1a1a1e] to-[#2e2e34]" aria-hidden="true" />
      <span className="h-2.5 w-[28%] rounded-t-lg bg-gradient-to-b from-[#3a3a41] to-[#1e1e22] shadow-[0_10px_18px_-6px_#000]" aria-hidden="true" />
      <div className="mt-6 flex w-full items-end justify-center gap-[3.5%]">
        <DeskKeyboard typed={typed} className="w-[60%]" />
        <Mouse className="w-[5.5%]" />
      </div>
    </motion.div>
  );
};

/**
 * The laptop, for a medium screen: the lid opens as it scrolls in and the keys light up under the editor's typing.
 * @param {{ progress: import("framer-motion").MotionValue<number>, typed: number }} props progress of the desk
 *   scrolling in, from 0 to 1
 */
export const Laptop = ({ progress, typed }) => {
  const prefersReducedMotion = useReducedMotion();
  const lid = useScrollRange(progress, [0.1, 0.85], [78, 0]);
  const scale = useScrollRange(progress, [0, 0.85], [0.9, 1]);

  return (
    <motion.div style={prefersReducedMotion ? undefined : { scale }} className="relative z-10 mx-auto w-full max-w-3xl">
      <div className="[perspective:1800px]">
        <motion.div
          style={prefersReducedMotion ? undefined : { rotateX: lid }}
          className="relative origin-bottom rounded-t-[1.6rem] rounded-b-md bg-[#0c0c0e] px-3.5 pt-5 pb-3.5 shadow-2xl ring-1 ring-white/10"
        >
          {/* the camera in the top bezel */}
          <span className="absolute top-2 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-[#1d2630] ring-1 ring-white/10" aria-hidden="true" />
          <Screen typed={typed} shape="rounded-[1.1rem] p-10" />
        </motion.div>
      </div>
      <LaptopKeyboard typed={typed} />
    </motion.div>
  );
};

// the top of an iPhone screen: the time on the left, the Dynamic Island in the middle, signal and battery on the right
const StatusBar = () => (
  <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-12 items-center justify-between px-7 text-[13px] font-semibold text-stage-fg" aria-hidden="true">
    <span className="tabular-nums">9:41</span>
    <span className="absolute top-2.5 left-1/2 h-7 w-[34%] -translate-x-1/2 rounded-full bg-black" />
    <span className="flex items-center gap-1.5">
      <span className="flex items-end gap-[2px]">
        {[4, 6, 8, 10].map((height) => (
          <span key={height} className="w-[3px] rounded-sm bg-stage-fg" style={{ height }} />
        ))}
      </span>
      <span className="relative h-[11px] w-[22px] rounded-[3px] border border-stage-fg/50 p-[1.5px]">
        <span className="block h-full w-[80%] rounded-[1.5px] bg-stage-fg" />
      </span>
    </span>
  </div>
);

/**
 * The iPhone, for a phone screen: it tips up toward you as it scrolls in, the same editor running on it.
 * @param {{ progress: import("framer-motion").MotionValue<number>, typed: number }} props progress of the desk
 *   scrolling in, from 0 to 1
 */
export const Phone = ({ progress, typed }) => {
  const prefersReducedMotion = useReducedMotion();
  const tilt = useScrollRange(progress, [0, 0.8], [28, 0]);
  const y = useScrollRange(progress, [0, 0.8], [40, 0]);

  return (
    <div className="relative z-10 mx-auto w-full max-w-[22rem] [perspective:1400px]">
      <motion.div
        style={prefersReducedMotion ? undefined : { rotateX: tilt, y }}
        className="relative origin-bottom rounded-[3.2rem] bg-[#0c0c0e] p-[0.6rem] shadow-2xl ring-1 ring-white/15"
      >
        {/* the action button and volume on the left side, power on the right */}
        <span className="absolute top-[16%] -left-[3px] h-7 w-[3px] rounded-l bg-[#2a2a2f]" aria-hidden="true" />
        <span className="absolute top-[23%] -left-[3px] h-12 w-[3px] rounded-l bg-[#2a2a2f]" aria-hidden="true" />
        <span className="absolute top-[31%] -left-[3px] h-12 w-[3px] rounded-l bg-[#2a2a2f]" aria-hidden="true" />
        <span className="absolute top-[25%] -right-[3px] h-20 w-[3px] rounded-r bg-[#2a2a2f]" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[2.65rem]">
          <StatusBar />
          <Screen typed={typed} shape="px-5 pt-16 pb-10" />
          <span className="pointer-events-none absolute bottom-2 left-1/2 h-1 w-[36%] -translate-x-1/2 rounded-full bg-stage-fg/60" aria-hidden="true" />
        </div>
      </motion.div>
    </div>
  );
};
