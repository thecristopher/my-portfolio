import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useTransform } from "framer-motion";
import { useScrollRange } from "../../hooks/useScrollRange";
import { ArrowUpRight } from "lucide-react";
import { COMPANY_LOGOS } from "../../lib/companyLogos";
import { easeOutExpo } from "../../lib/motion";
import { cardPlacement } from "./actions";
import { MAP } from "./mapStory";

const percent = (value, of) => `${(value / of) * 100}%`;

// the company's mark tinted in its brand color, the same way the work history draws it
const Mark = ({ company }) => {
  const logo = COMPANY_LOGOS[company];
  if (!logo) return null;
  const tint = { background: logo.color, maskImage: `url(${logo.src})`, maskSize: "contain", maskRepeat: "no-repeat", maskPosition: "left center" };
  return <span className="block h-6 w-24" style={tint} aria-hidden="true" />;
};

/**
 * What a stop says once it's opened: the company, where the work reached and what was done there.
 * @param {{ card: { company: string, place: string, description: string, highlight: string | null, url: string | null } }} props
 */
export const CardBody = ({ card }) => (
  <div className="flex flex-col gap-2.5">
    <Mark company={card.company} />
    <p className="text-lg leading-tight font-semibold tracking-tight">{card.company}</p>
    <p className="text-sunset text-xs font-semibold">{card.place}</p>
    <p className="text-sm leading-snug text-muted text-pretty">{card.description}</p>
    {card.highlight && <p className="border-l-2 border-[var(--color-sunset-2)] pl-3 text-sm leading-snug text-pretty">{card.highlight}</p>}
    {card.url && (
      <a href={card.url} target="_blank" rel="noreferrer" className="group flex w-fit items-center gap-1 text-xs font-medium text-accent">
        {new URL(card.url).hostname.replace("www.", "")}
        <ArrowUpRight size={12} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </a>
    )}
  </div>
);

const RISE = { up: "-85%", middle: "-50%", down: "-12%" };

/**
 * The open card floating beside its light, on screens wide enough to write on the map.
 * @param {{ light: object, card: object }} props
 */
export const FloatingCard = ({ light, card }) => {
  const spot = { x: light.x / MAP.width, y: light.y / MAP.height };
  const { side, rise } = cardPlacement(spot);
  const shift = side === "right" ? "1.25rem" : "calc(-100% - 1.25rem)";
  return (
    <motion.div
      key={light.key}
      initial={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: easeOutExpo }}
      style={{ left: percent(spot.x, 1), top: percent(spot.y, 1), translateX: shift, translateY: RISE[rise] }}
      className="glass absolute z-20 hidden w-72 rounded-2xl p-5 shadow-2xl ring-1 ring-line md:block"
      role="dialog"
      aria-label={card.company}
    >
      <CardBody card={card} />
    </motion.div>
  );
};

// one light you can open: it only shows up, and only takes clicks, once its part of the route is on the map
const Light = ({ light, progress, isOpen, onOpen, onClose, onToggle }) => {
  const opacity = useScrollRange(progress, [light.appearsAt - 0.03, light.appearsAt], [0, 1]);
  const pointerEvents = useTransform(opacity, (value) => (value > 0.5 ? "auto" : "none"));
  // a light that hasn't shown up yet stays out of the tab order too, so the keyboard never lands on an empty spot
  const [isShown, setIsShown] = useState(() => opacity.get() > 0.5);
  useMotionValueEvent(opacity, "change", (value) => setIsShown(value > 0.5));
  const forMouse = (handler) => (event) => event.pointerType === "mouse" && handler();
  // a tap focuses the button before it clicks it, so on touch only the click decides, or the card would open and close
  const pressedWith = useRef(null);
  return (
    <motion.button
      type="button"
      style={{ left: percent(light.x, MAP.width), top: percent(light.y, MAP.height), opacity, pointerEvents }}
      onPointerEnter={forMouse(onOpen)}
      onPointerLeave={forMouse(onClose)}
      onPointerDown={(event) => (pressedWith.current = event.pointerType)}
      onFocus={() => pressedWith.current !== "touch" && onOpen()}
      onBlur={onClose}
      onClick={() => {
        if (pressedWith.current === "touch") onToggle();
        pressedWith.current = null;
      }}
      tabIndex={isShown ? 0 : -1}
      aria-hidden={!isShown}
      aria-expanded={isOpen}
      aria-label={`${light.label}: what the work was there`}
      className="group absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none"
    >
      <span className={`size-3 rounded-full ring-2 transition-transform duration-300 group-hover:scale-150 group-focus-visible:scale-150 ${isOpen ? "scale-150 bg-[var(--color-sunset-1)] ring-white/70" : "bg-white/80 ring-[var(--color-sunset-1)]"}`} />
      {light.key === "world" && <span className="absolute left-full ml-1 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap ring-1 ring-line">Worldwide</span>}
    </motion.button>
  );
};

/**
 * Every light on the map you can open, plus the card of the open one floating beside it.
 * @param {{ lights: object[], progress: import("framer-motion").MotionValue<number>, openKey: string | null, cardFor: (light: object) => object | null, onOpen: (key: string) => void, onClose: () => void }} props
 */
export const Lights = ({ lights, progress, openKey, cardFor, onOpen, onClose }) => {
  const open = lights.find((light) => light.key === openKey);
  const openCard = open ? cardFor(open) : null;
  return (
    <div className="absolute inset-0">
      {lights
        .filter((light) => cardFor(light))
        .map((light) => (
          <Light
            key={light.key}
            light={light}
            progress={progress}
            isOpen={openKey === light.key}
            onOpen={() => onOpen(light.key)}
            onClose={onClose}
            onToggle={() => (openKey === light.key ? onClose() : onOpen(light.key))}
          />
        ))}
      <AnimatePresence>{open && openCard && <FloatingCard light={open} card={openCard} />}</AnimatePresence>
    </div>
  );
};
