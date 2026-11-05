import { useRef, useState } from "react";
import { motion, useInView, useMotionTemplate, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import Magnetic from "../../components/Magnetic";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import BugHunt from "./BugHunt";
import Bottle from "./Bottle";
import Sea from "./Sea";
import { Moon, Pier, Stars } from "./Dusk";
import { useScrollRange } from "../../hooks/useScrollRange";
import { useGetContactQuery } from "../../api/contactApi";
import { socialIconMap } from "../../lib/socialIconMap";
import { easeOutExpo } from "../../lib/motion";
import { echo } from "../../lib/echo";

const CopyEmailButton = ({ email, onCopied }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      onCopied();
      echo("Email copied", "success");
      setTimeout(() => setIsCopied(false), 1800);
    } catch {
      // clipboard can be blocked in some browsers, the mailto link still works
    }
  };

  return (
    <button
      type="button"
      onClick={copyEmail}
      className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      {isCopied ? <Check size={14} className="text-string" /> : <Copy size={14} />}
      {isCopied ? "Copied" : "Copy"}
    </button>
  );
};

// the promise fills with the sunset left to right as the sun goes down behind it
const SunsetHeadline = ({ progress, isStill }) => {
  const unlit = useScrollRange(progress, [0.15, 0.75], [100, 0]);
  // the clip reaches past the tight line box so the descenders of the lit words never get cut off
  const clipPath = useMotionTemplate`inset(-0.2em ${unlit}% -0.3em 0)`;

  return (
    <h2 className="text-[clamp(2.75rem,min(10vw,14svh),8.5rem)] leading-[0.92] font-semibold tracking-[-0.055em]">
      <span className="block">Let's build</span>
      <span className="relative block">
        <span className="block text-line-strong">something worth keeping.</span>
        <motion.span aria-hidden="true" className="text-sunset absolute inset-0 block" style={{ clipPath: isStill ? "none" : clipPath }}>
          something worth keeping.
        </motion.span>
      </span>
    </h2>
  );
};

// low enough that the headline always ends above the water and the pier, even on a short wide screen
const HORIZON = "74%";

// the reflection as plain stripes, for anyone who asked for less movement
const StillReflection = () => (
  <span
    className="absolute top-0 left-[70%] h-[70%] w-[min(50vmin,26rem)] -translate-x-1/2 blur-[2px]"
    style={{
      opacity: 0.5,
      background: "linear-gradient(to bottom, var(--color-sunset-1), transparent)",
      maskImage: "repeating-linear-gradient(to bottom, black 0 6px, transparent 6px 14px)",
    }}
  />
);

// the sun going down into the sea off Rosarito: it sinks past the horizon as you scroll, its reflection breaking up
// wherever the cursor stirs the water, while the stars come out, the moon climbs on the other side and the lamps on the
// pier turn on
const Sunset = ({ progress, isStill }) => {
  // by the end only the last sliver is left above the water, so the sunset actually finishes
  const sunY = useScrollRange(progress, [0, 0.95], ["-30%", "90%"]);
  const sky = useScrollRange(progress, [0, 0.9], [0.15, 0.6]);
  const still = { y: "30%" };
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.div className="bg-sunset absolute inset-x-0 top-0 blur-3xl" style={{ height: HORIZON, opacity: isStill ? 0.35 : sky, maskImage: "linear-gradient(to bottom, transparent, black)" }} />
      <Stars progress={progress} isStill={isStill} height={HORIZON} />
      <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: HORIZON }}>
        <Moon progress={progress} isStill={isStill} />
        <motion.span
          className="absolute bottom-0 left-[70%] aspect-square w-[min(56vmin,30rem)] -translate-x-1/2 rounded-full"
          style={{ ...(isStill ? still : { y: sunY }), background: "radial-gradient(circle at 50% 40%, #fff4d1 0%, var(--color-sunset-1) 45%, var(--color-sunset-2) 100%)", boxShadow: "0 0 120px 30px color-mix(in oklab, var(--color-sunset-1) 45%, transparent)" }}
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-[color-mix(in_oklab,var(--color-sunset-3)_10%,var(--color-ink))]" style={{ top: HORIZON }}>
        {isStill ? <StillReflection /> : <Sea progress={progress} />}
      </div>
      <span className="absolute inset-x-0 h-px bg-[color-mix(in_oklab,var(--color-sunset-1)_60%,transparent)]" style={{ top: HORIZON }} />
      <Pier progress={progress} isStill={isStill} horizon={HORIZON} />
    </div>
  );
};

// the closing scene, pinned while the sun sets and the line fills with its light
const SunsetScene = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const scene = (
    <div className="relative flex h-svh flex-col justify-start overflow-hidden pt-[14svh]">
      <Sunset progress={scrollYProgress} isStill={prefersReducedMotion} />
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <p className="text-sm font-semibold text-accent">Contact</p>
        <SunsetHeadline progress={scrollYProgress} isStill={prefersReducedMotion} />
      </div>
    </div>
  );
  if (prefersReducedMotion) return scene;
  return (
    <div ref={ref} className="relative h-[220svh]">
      <div className="sticky top-0">{scene}</div>
    </div>
  );
};

// if the address ever has to wrap, break it after the @ instead of mid word
const EmailAddress = ({ email }) => {
  const [name, domain] = email.split("@");
  return (
    <span>
      {name}@<wbr />
      {domain}
    </span>
  );
};

const rise = (delay) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 1, delay, ease: easeOutExpo },
});

// the address itself, huge, with the ways to send it right under it and Jill's stage below, reacting to both
const Email = ({ contact, onCopy, isMissionComplete }) => {
  const [cue, setCue] = useState(null);
  const cueJill = (name) => setCue((last) => ({ name, key: (last?.key ?? 0) + 1 }));
  // a copied address is on its way: Jill celebrates and a bottle sets out to sea
  const sendOff = () => {
    cueJill("happy");
    onCopy();
  };

  return (
    <motion.div {...rise(0)} className="flex flex-col gap-5">
      <p className="text-sm font-semibold text-muted">Write me at</p>
      <a href={contact.mailto} className="group flex w-fit items-center gap-3 text-[clamp(1.5rem,5vw,3.75rem)] font-semibold tracking-[-0.035em] transition-colors hover:text-accent">
        <EmailAddress email={contact.email} />
        <ArrowUpRight className="size-[0.8em] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
      </a>
      <div className="flex flex-wrap items-center gap-3">
        <Magnetic>
          <a
            href={contact.mailto}
            onPointerEnter={() => cueJill("herb")}
            onFocus={() => cueJill("herb")}
            className="bg-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
          >
            Email me
            <ArrowUpRight size={17} />
          </a>
        </Magnetic>
        <CopyEmailButton email={contact.email} onCopied={sendOff} />
      </div>
      <BugHunt cue={cue} isMissionComplete={isMissionComplete} />
    </motion.div>
  );
};

const Socials = ({ socials }) => (
  <ul className="flex flex-wrap gap-3">
    {socials.map((social, index) => {
      const Icon = socialIconMap[social.name];
      return (
        <motion.li key={social.id} {...rise(0.1 + index * 0.06)}>
          <a
            href={social.url}
            target="_blank"
            rel="noreferrer"
            className="card group inline-flex items-center gap-2.5 rounded-full px-5 py-3 font-medium transition-transform duration-300 hover:-translate-y-0.5"
          >
            {Icon && <Icon size={16} aria-hidden="true" />}
            {social.name}
            <ArrowUpRight size={14} className="text-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </motion.li>
      );
    })}
  </ul>
);

/** The closing line, filling with the sunset as you reach it, every way to reach me, and a bottle for every copy. */
const Contact = () => {
  const { data: contact, isLoading, isError } = useGetContactQuery();
  const [bottles, setBottles] = useState(0);
  // the last line counts as reached as soon as it's clearly on screen, while Jill's stage right above it is still in
  // view, so her mission complete is something the visitor actually sees
  const lastLine = useRef(null);
  const isMissionComplete = useInView(lastLine, { once: true, margin: "0px 0px -10% 0px" });

  return (
    <section id="contact" className="relative pb-24 sm:pb-32">
      <SunsetScene />
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 pt-20 sm:px-6">
        <motion.p {...rise(0.1)} className="max-w-2xl text-2xl leading-snug font-medium text-pretty sm:text-3xl">
          Hiring, building something, or just want to argue about Neovim configs? Write me. <span className="text-muted">I read every message, and I answer all of them.</span>
        </motion.p>

        {isLoading && <SkeletonLines lines={2} />}
        {isError && !contact && <LoadError what="the contact details" />}
        {contact && <Email contact={contact} onCopy={() => setBottles((count) => count + 1)} isMissionComplete={isMissionComplete} />}
        {contact && <Socials socials={contact.socials} />}

        <p ref={lastLine} className="text-sm text-faint">
          Thanks for scrolling all the way down.
        </p>
      </div>
      <Bottle launch={bottles} />
    </section>
  );
};

export default Contact;
