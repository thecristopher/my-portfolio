import { useRef, useState } from "react";
import { motion, useMotionTemplate, useReducedMotion, useScroll } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import Magnetic from "../../components/Magnetic";
import { Trigger as GraceSigil } from "../../components/Relics/EldenRing";
import { Trigger as D20 } from "../../components/Relics/BaldursGate";
import { Trigger as OneWishWillow } from "../../components/Relics/Obsession";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useScrollRange } from "../../hooks/useScrollRange";
import { useGetContactQuery } from "../../api/contactApi";
import { socialIconMap } from "../../lib/socialIconMap";
import { easeOutExpo } from "../../lib/motion";
import { echo } from "../../lib/echo";

const CopyEmailButton = ({ email }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setIsCopied(true);
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

// the promise fills with the sunset as you scroll toward it, left to right, the way the light goes down over the water
const SunsetHeadline = () => {
  const ref = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.4"] });
  const unlit = useScrollRange(scrollYProgress, [0, 1], [100, 0]);
  // the clip reaches past the tight line box so the descenders of the lit words never get cut off
  const clipPath = useMotionTemplate`inset(-0.2em ${unlit}% -0.3em 0)`;
  const scale = useScrollRange(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <motion.h2 ref={ref} style={prefersReducedMotion ? undefined : { scale }} className="text-[clamp(3rem,10vw,8.5rem)] leading-[0.92] font-semibold tracking-[-0.055em]">
      <span className="block">Let's build</span>
      <span className="relative block">
        <span className="block text-line-strong">something worth keeping.</span>
        <motion.span aria-hidden="true" className="text-sunset absolute inset-0 block" style={{ clipPath: prefersReducedMotion ? "none" : clipPath }}>
          something worth keeping.
        </motion.span>
      </span>
    </motion.h2>
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

// the address itself, huge, with the die waiting beside it: sending it is a persuasion check like any other
const Email = ({ contact }) => (
  <motion.div {...rise(0)} className="flex flex-col gap-5">
    <p className="flex items-center gap-2 text-sm font-semibold text-muted">
      Write me at
      <D20 zoom={0.42} />
    </p>
    <a href={contact.mailto} className="group flex w-fit items-center gap-3 text-[clamp(1.5rem,5vw,3.75rem)] font-semibold tracking-[-0.035em] transition-colors hover:text-accent">
      <EmailAddress email={contact.email} />
      <ArrowUpRight className="size-[0.8em] shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
    </a>
    <div className="flex flex-wrap items-center gap-3">
      <Magnetic>
        <a
          href={contact.mailto}
          className="bg-sunset inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
        >
          Email me
          <ArrowUpRight size={17} />
        </a>
      </Magnetic>
      <CopyEmailButton email={contact.email} />
      {/* writing me is the wish, the twig is right there for it */}
      <OneWishWillow zoom={0.2} />
    </div>
  </motion.div>
);

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

/** The closing line, filling with the sunset as you reach it, and every way to reach me. */
const Contact = () => {
  const { data: contact, isLoading, isError } = useGetContactQuery();

  return (
    <section id="contact" className="relative overflow-hidden pt-28 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <div className="flex flex-col gap-8">
          <p className="text-sm font-semibold text-accent">Contact</p>
          <SunsetHeadline />
          <motion.p {...rise(0.1)} className="max-w-2xl text-xl leading-relaxed text-muted text-pretty">
            Hiring, building something, or just want to argue about Neovim configs? Write me. I read every message, and I answer all of them.
          </motion.p>
        </div>

        {isLoading && <SkeletonLines lines={2} />}
        {isError && !contact && <LoadError what="the contact details" />}
        {contact && <Email contact={contact} />}
        {contact && <Socials socials={contact.socials} />}

        <p className="flex items-center gap-2 text-sm text-faint">
          Thanks for scrolling all the way down.
          {/* the page signs off at a site of grace, the place you come back to */}
          <GraceSigil zoom={0.42} />
        </p>
      </div>
    </section>
  );
};

export default Contact;
