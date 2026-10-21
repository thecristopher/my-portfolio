import { useRef, useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, Check, Copy, SkipForward } from "lucide-react";
import TextReveal from "../../components/TextReveal";
import EditorWindow from "../../components/EditorWindow";
import TypeLine from "../../components/TypeLine";
import FileIcon from "../../components/FileIcon";
import { Trigger as SiteOfGrace } from "../../components/Relics/EldenRing";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetContactQuery } from "../../api/contactApi";
import { socialIconMap } from "../../lib/socialIconMap";
import { easeOutExpo } from "../../lib/motion";
import { echo } from "../../lib/echo";
import { earnRunes } from "../../lib/runes";

const CopyEmailButton = ({ email }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
      echo(`yanked "${email}" to the + register. stored in the item box.`, "success");
      setTimeout(() => setIsCopied(false), 1800);
    } catch {
      // clipboard can be blocked in some browsers, the mailto link still works
    }
  };

  return (
    <button
      type="button"
      onClick={copyEmail}
      className="inline-flex w-fit items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-xs text-muted transition-colors hover:border-faint hover:text-fg"
    >
      {isCopied ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
      {isCopied ? "yanked" : "yank"}
    </button>
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

const printedLine = (delay) => ({
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: easeOutExpo },
});

// once the session has played through, later visits print it straight away instead of making you wait again
const SEEN_KEY = "contact-seen";

const readSeen = () => {
  try {
    return localStorage.getItem(SEEN_KEY) === "true";
  } catch {
    return false;
  }
};

const markSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "true");
  } catch {
    // private windows can block storage, it just plays again next time
  }
};

const ContactTerminal = ({ contact }) => {
  const [isInstant, setIsInstant] = useState(readSeen);
  const [isEmailPrinted, setIsEmailPrinted] = useState(false);
  const [isSocialsPrinted, setIsSocialsPrinted] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  const logOut = () => {
    setHasExited(true);
    markSeen();
  };

  return (
    <EditorWindow path={["cristopher", "contact.sh"]}>
      <div className="flex flex-col gap-4 font-mono text-sm">
        <div className="flex items-center justify-between gap-4">
          <p className="text-faint"># what're ya buyin', stranger?</p>
          {!hasExited && !isInstant && (
            <button
              type="button"
              onClick={() => setIsInstant(true)}
              className="flex shrink-0 items-center gap-1.5 text-xs text-faint transition-colors hover:text-fg"
            >
              <SkipForward size={12} aria-hidden="true" /> skip
            </button>
          )}
        </div>
        <TypeLine text="echo $EMAIL" delay={0.3} instant={isInstant} onDone={() => setIsEmailPrinted(true)} />
        {isEmailPrinted && (
          <motion.div {...printedLine(0)} className="flex flex-col gap-4 pb-4">
            <a
              href={contact.mailto}
              onClick={() => earnRunes("contact", "contact")}
              className="group inline-flex w-fit items-center gap-3 font-sans text-[clamp(1rem,4.2vw,3rem)] font-medium tracking-[-0.03em] transition-colors hover:text-accent"
            >
              <EmailAddress email={contact.email} />
              <ArrowUpRight className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
            <CopyEmailButton email={contact.email} />
          </motion.div>
        )}

        {isEmailPrinted && (
          <TypeLine text="ls ./elsewhere" delay={0.4} instant={isInstant} onDone={() => setIsSocialsPrinted(true)} />
        )}
        {isSocialsPrinted && (
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {contact.socials.map((social, index) => {
              const Icon = socialIconMap[social.name];
              return (
                <motion.li key={social.id} {...printedLine(index * 0.07)}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-muted transition-colors hover:text-fg"
                  >
                    {Icon && <Icon size={13} className="text-faint transition-colors group-hover:text-accent" aria-hidden="true" />}
                    {social.name.toLowerCase()}
                    <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </motion.li>
              );
            })}
          </ul>
        )}

        {isSocialsPrinted && <TypeLine text="exit" delay={0.8} instant={isInstant} onDone={logOut} className="pt-4" />}
        {hasExited && (
          <motion.div {...printedLine(0)} className="flex flex-col gap-1 text-faint">
            <p>logout</p>
            <p className="flex items-center gap-2">
              <span>
                <span className="text-accent">#</span> touch grace any time, Tarnished.
              </span>
              <SiteOfGrace zoom={0.25} />
            </p>
          </motion.div>
        )}
      </div>
    </EditorWindow>
  );
};

// the promise fills with the sunset as you scroll toward it, left to right, the way the light goes down over the water
const SunsetHeadline = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const unlit = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const clipPath = useMotionTemplate`inset(0 ${unlit}% 0 0)`;

  return (
    <h2 ref={ref} className="text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.92] font-semibold tracking-[-0.055em]">
      <TextReveal text="Let's build" className="block" />
      <span className="relative block">
        <TextReveal text="something worth keeping." delay={0.15} className="block text-muted" />
        <motion.span aria-hidden="true" data-search-skip className="absolute inset-0" style={{ clipPath: prefersReducedMotion ? "none" : clipPath }}>
          <TextReveal text="something worth keeping." delay={0.15} className="block text-gold" />
        </motion.span>
      </span>
    </h2>
  );
};

// the way in, as big as Apple makes its last call to action. the resume stays in the bufferline
const CallsToAction = ({ contact }) => (
  <div className="flex flex-wrap items-center gap-3">
    <a
      href={contact.mailto}
      onClick={() => earnRunes("contact", "contact")}
      className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-semibold text-ink transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
    >
      Email me
      <ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
    {contact.socials
      .filter((social) => social.name === "LinkedIn")
      .map((social) => (
        <a key={social.id} href={social.url} target="_blank" rel="noreferrer" className="px-3 text-base text-accent underline-offset-4 hover:underline">
          LinkedIn ›
        </a>
      ))}
  </div>
);

/** contact.sh: the closing line and every way to reach me. */
const Contact = ({ number }) => {
  const { data: contact, isLoading, isError } = useGetContactQuery();

  return (
    <section id="contact" className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
      <div className="relative mx-auto flex max-w-6xl flex-col gap-14 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <p className="flex items-center gap-2 font-mono text-xs text-faint">
            <span className="text-accent tabular-nums">{String(number).padStart(2, "0")}</span>
            <span className="h-px w-6 bg-line-strong" aria-hidden="true" />
            <FileIcon name="contact.sh" size={12} />
            <span className="text-muted">contact.sh</span>
          </p>
          <SunsetHeadline />
          <p className="max-w-2xl text-lg leading-relaxed text-muted text-pretty sm:text-xl">
            Hiring, building something, or just want to argue about Neovim configs? Write me. I read every message, and I answer all of them.
          </p>
          {contact && <CallsToAction contact={contact} />}
        </div>

        {isLoading && <SkeletonLines lines={2} />}
        {isError && <LoadError what="contact details" />}
        {contact && <ContactTerminal contact={contact} />}
      </div>
    </section>
  );
};

export default Contact;
