import { useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowUp, RotateCcw } from "lucide-react";
import { scrollToEdge } from "../../lib/smoothScroll";
import Pier, { PIER_LAMPS } from "../Pier";
import { CREDIT_BLOCKS, rollPath, scatterStars } from "./actions";

const STARS = scatterStars(90);
const PIXEL = { fontFamily: '"Pixelify Sans", ui-monospace, monospace' };
const PARKED = 4000;
const LINK_CLASS = "underline underline-offset-2 transition-colors hover:text-white";

// every lamp on the pier is on by the time the night comes
const ALL_LIT = Array.from({ length: PIER_LAMPS }, () => true);

// now and then a star falls across the sky, high over the credits, then the sky waits a while before the next one
const ShootingStar = () => (
  <motion.span
    className="absolute top-[14%] left-[8%] h-px w-28 origin-right rotate-[-18deg] rounded-full bg-gradient-to-r from-transparent via-[#cfd6ff]/70 to-white sm:w-40"
    initial={{ x: 0, y: 0, opacity: 0 }}
    animate={{ x: [0, 260], y: [0, 84], opacity: [0, 1, 0] }}
    transition={{ duration: 1.1, ease: "easeIn", repeat: Infinity, repeatDelay: 9, delay: 4 }}
  />
);

// the sky after the sunset in Contact: deep blue, the stars out and twinkling, a moon, a falling star now and then, and
// the sea under it all with the same pier the page opened with at dawn, every lamp on now that it's night
const NightBeach = ({ isStill }) => (
  <div className="pointer-events-none absolute inset-0 [--sea:8rem] sm:[--sea:6rem]" aria-hidden="true">
    <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#03050f_0%,#0a1030_55%,#1a1640_88%,#2a1d4a_100%)]" />
    {STARS.map((star) => (
      <motion.span
        key={`${star.x}-${star.y}`}
        className="absolute rounded-full bg-white"
        style={{ left: `${star.x}%`, top: `${star.y}%`, width: star.size, height: star.size }}
        animate={isStill ? undefined : { opacity: [0.25, 1, 0.25] }}
        transition={{ duration: 2.6 + star.delay / 2, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
    {/* on a phone it rises off to the side, clear of the credits rolling down the middle */}
    <span className="absolute top-[5%] right-[6%] size-10 rounded-full bg-[#f4efd9] shadow-[0_0_60px_18px_rgba(244,239,217,0.25)] sm:top-[12%] sm:right-[26%] sm:size-20" />
    {!isStill && <ShootingStar />}
    {/* the sea is a band of fixed height, so the bottom bar always sits on the water and the credits always in the sky */}
    <div className="absolute inset-x-0 bottom-0 h-(--sea) border-t border-[#8c7bd8]/40 bg-[linear-gradient(to_bottom,#0b1430,#050c18)]">
      <span className="absolute top-0 right-[6%] h-full w-10 bg-[linear-gradient(to_bottom,rgba(244,239,217,0.3),transparent_80%)] [mask-image:repeating-linear-gradient(to_bottom,black_0_3px,transparent_3px_8px)] blur-[1px] sm:right-[26%] sm:w-20" />
    </div>
    {/* the footer is always night, so the pier keeps its night ink whatever the page's theme */}
    <Pier lit={ALL_LIT} horizon="calc(100% - var(--sea))" className="[--pier-ink:#2a2140]! [--pier:min(58vw,15rem)] sm:[--pier:min(34vw,26rem)]" />
  </div>
);

// one role and the people in it, the way a game ends: the role small, the names big
const CreditBlock = ({ block }) => (
  <div className="flex flex-col items-center gap-2">
    <p className="text-xs tracking-[0.3em] text-[#a99fd6] uppercase" style={PIXEL}>
      {block.role}
    </p>
    {block.names.map((name) => (
      <p key={name} className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
        {name}
      </p>
    ))}
  </div>
);

// the characters walking the page belong to their studios, and the rippers who pulled them out of the games did the hard part
const SpriteCredits = () => (
  <div className="flex max-w-xl flex-col items-center gap-2">
    <p className="text-xs tracking-[0.3em] text-[#a99fd6] uppercase" style={PIXEL}>
      Sprites
    </p>
    <p className="text-sm leading-relaxed text-[#d9d3f0]">
      Link is from The Legend of Zelda: A Link to the Past, © Nintendo, sprites ripped by Mister Man. Jill Valentine, the zombie, the Cerberus and the Tyrant are from Marvel vs. Capcom, ©
      Capcom. Samus Aran and the Metroid larva are from Super Metroid, ©
      Nintendo, ripped by Barack Obama. Every sheet comes from{" "}
      <a href="https://www.spriters-resource.com" target="_blank" rel="noreferrer" className={LINK_CLASS}>
        The Spriters Resource
      </a>
      . A fan tribute, not affiliated with or endorsed by Nintendo or Capcom.
    </p>
  </div>
);

const SignOff = () => (
  <div className="flex flex-col items-center gap-3">
    <p className="text-sunset text-4xl font-semibold tracking-[-0.03em] sm:text-6xl">Thanks for playing.</p>
    <p className="text-sm text-[#a99fd6]">© {new Date().getFullYear()} Cristopher Cervantes</p>
  </div>
);

const CreditList = () => (
  <>
    {CREDIT_BLOCKS.map((block) => (
      <CreditBlock key={block.role} block={block} />
    ))}
    <SpriteCredits />
    <SignOff />
  </>
);

// rolls the list up through its frame once, from under the bottom edge until the sign off rests in view
const useRoll = (isRolling) => {
  const frameRef = useRef(null);
  const listRef = useRef(null);
  // parked under the frame until the roll starts, so nothing shows before the visitor arrives
  const y = useMotionValue(PARKED);
  const [isDone, setIsDone] = useState(false);
  const [take, setTake] = useState(0);

  useLayoutEffect(() => {
    if (!isRolling || !frameRef.current || !listRef.current) return undefined;
    const { from, to, seconds } = rollPath(frameRef.current.offsetHeight, listRef.current.offsetHeight);
    setIsDone(false);
    y.set(from);
    const roll = animate(y, to, { duration: seconds, ease: "linear" });
    roll.then(() => setIsDone(true));
    return () => roll.stop();
  }, [isRolling, take, y]);

  return { frameRef, listRef, y, isDone, replay: () => setTake((count) => count + 1) };
};

// the credits through a window that fades at both ends, like text rising off a screen
const RollingCredits = ({ isRolling }) => {
  const { frameRef, listRef, y, isDone, replay } = useRoll(isRolling);
  return (
    <div className="relative">
      <div
        ref={frameRef}
        // the window leaves room for the nav, the title and the bottom bar, so the whole footer fits on a short laptop
        className="relative h-[clamp(16rem,calc(100svh-17rem),36rem)] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]"
      >
        <motion.div ref={listRef} style={{ y }} className="absolute inset-x-0 top-0 flex flex-col items-center gap-14 px-4 text-center">
          <CreditList />
        </motion.div>
      </div>
      {isDone && (
        <motion.button
          type="button"
          onClick={replay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto mt-4 flex items-center gap-1.5 text-xs text-[#a99fd6] transition-colors hover:text-white"
          style={PIXEL}
        >
          <RotateCcw size={12} aria-hidden="true" /> Roll the credits again
        </motion.button>
      )}
    </div>
  );
};

// anyone who asked for less movement reads the same credits standing still
const StillCredits = () => (
  <div className="flex flex-col items-center gap-14 px-4 py-10 text-center">
    <CreditList />
  </div>
);

/**
 * The end of the page as the end of a game: the night falls over the beach after the sunset, and the credits roll
 * once the visitor gets here, with the sprite credits and the sign off resting on screen when they're done.
 */
const Footer = () => {
  const ref = useRef(null);
  const isHere = useInView(ref, { once: true, amount: 0.4 });
  const prefersReducedMotion = useReducedMotion();

  return (
    <footer ref={ref} className="relative overflow-hidden text-[#d9d3f0]">
      <NightBeach isStill={prefersReducedMotion} />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-20 sm:px-6">
        <p className="text-center text-xs tracking-[0.4em] text-[#a99fd6]" style={PIXEL}>
          THE END
        </p>
        {prefersReducedMotion ? <StillCredits /> : <RollingCredits isRolling={isHere} />}
        <div className="flex flex-col gap-3 py-8 text-xs text-[#a99fd6] sm:flex-row sm:items-center sm:justify-between">
          <p>Designed and built in Rosarito, written in Neovim.</p>
          <button type="button" onClick={() => scrollToEdge("top")} className="-my-3 flex items-center gap-1.5 py-3 transition-colors hover:text-white">
            Back to top
            <ArrowUp size={13} aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
