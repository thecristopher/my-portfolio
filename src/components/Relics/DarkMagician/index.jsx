import { motion } from "framer-motion";
import { RelicButton } from "../shared";
import { useRelic } from "../useRelic";
import { MAGIC_BLUE, MAGIC_PINK } from "../../../lib/magic";
import { easeOutExpo } from "../../../lib/motion";
import darkMagicianGirl from "../../../assets/images/dark-magician-girl.png";

// the card back every duelist knows: brown, a darker frame and the swirling oval in the middle
const CardBack = () => (
  <svg viewBox="0 0 40 58" className="absolute inset-0 size-full [backface-visibility:hidden]">
    <rect width="40" height="58" rx="2.5" fill="#5a3a1c" />
    <rect x="2.5" y="2.5" width="35" height="53" rx="1.5" fill="#7a4f26" stroke="#3a240f" strokeWidth="1" />
    <ellipse cx="20" cy="29" rx="12" ry="18" fill="#2a1608" />
    {[0, 1, 2, 3].map((ring) => (
      <ellipse
        key={ring}
        cx="20"
        cy="29"
        rx={10 - ring * 2.3}
        ry={16 - ring * 3.6}
        fill="none"
        stroke={ring % 2 === 0 ? "#c58a3a" : "#8a5420"}
        strokeWidth="1"
        transform={`rotate(${ring * 18} 20 29)`}
      />
    ))}
  </svg>
);

// her side of the card: the pixel art in a monster card frame
const CardFace = () => (
  <span
    className="absolute inset-0 flex flex-col overflow-hidden rounded-[3px] border-2 border-[#c99a3e] bg-gradient-to-b from-[#3b2a64] to-[#1d1236] p-0.5 [backface-visibility:hidden] [transform:rotateY(180deg)]"
  >
    <span className="truncate px-0.5 font-mono text-[5px] leading-tight text-[#f1e3b5]">DARK MAGICIAN GIRL</span>
    <span className="mt-0.5 grid flex-1 place-items-center overflow-hidden bg-[#140b26]">
      <img src={darkMagicianGirl} alt="" className="h-full w-auto [image-rendering:pixelated]" />
    </span>
    <span className="px-0.5 text-right font-mono text-[5px] text-[#f1e3b5]">ATK/2000</span>
  </span>
);

/**
 * A card set face down at the end of the skills, waiting to be flipped. Once she's summoned, it stays face up.
 */
export const Trigger = ({ className = "" }) => {
  const { isFound, touch } = useRelic("magician");

  return (
    <RelicButton id="magician" isFound={isFound} onTouch={() => touch()} className={className}>
      <span className="block [perspective:600px]" aria-hidden="true">
        <motion.span
          className="relative block h-[5.5rem] w-[3.8rem] [transform-style:preserve-3d] sm:h-28 sm:w-[4.8rem]"
          initial={false}
          animate={{ rotateY: isFound ? 180 : 0, rotateZ: isFound ? 0 : -6 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
          style={{ filter: `drop-shadow(0 10px 18px ${isFound ? MAGIC_PINK : MAGIC_BLUE}55)` }}
        >
          <CardBack />
          <CardFace />
        </motion.span>
      </span>
    </RelicButton>
  );
};
