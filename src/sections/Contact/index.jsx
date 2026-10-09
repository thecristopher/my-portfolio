import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import TextReveal from "../../components/TextReveal";
import TerminalWindow from "../../components/TerminalWindow";
import TypeLine from "../../components/TypeLine";
import { Grace } from "../../components/Secrets";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
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

const ContactTerminal = ({ contact }) => {
  const [isEmailPrinted, setIsEmailPrinted] = useState(false);
  const [isSocialsPrinted, setIsSocialsPrinted] = useState(false);
  const [hasExited, setHasExited] = useState(false);

  return (
    <TerminalWindow title="~/contact · zsh" bodyClassName="p-6 sm:p-10">
      <div className="flex flex-col gap-4 font-mono text-sm">
        <p className="text-faint"># what're ya buyin', stranger?</p>
        <TypeLine text="echo $EMAIL" delay={0.3} onDone={() => setIsEmailPrinted(true)} />
        {isEmailPrinted && (
          <motion.div {...printedLine(0)} className="flex flex-col gap-4 pb-4">
            <a
              href={contact.mailto}
              className="group inline-flex w-fit items-center gap-3 font-sans text-[clamp(1rem,4.2vw,3rem)] font-medium tracking-[-0.03em] transition-colors hover:text-accent"
            >
              <EmailAddress email={contact.email} />
              <ArrowUpRight className="shrink-0 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
            <CopyEmailButton email={contact.email} />
          </motion.div>
        )}

        {isEmailPrinted && (
          <TypeLine text="ls ./elsewhere" delay={0.4} onDone={() => setIsSocialsPrinted(true)} />
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

        {isSocialsPrinted && <TypeLine text="exit" delay={0.8} onDone={() => setHasExited(true)} className="pt-4" />}
        {hasExited && (
          <motion.div {...printedLine(0)} className="flex flex-col gap-1 text-faint">
            <p>logout</p>
            <p className="flex items-center gap-1">
              <span>
                <span className="text-accent">#</span> touch grace any time, Tarnished.
              </span>
              <Grace className="-my-1.5" />
            </p>
          </motion.div>
        )}
      </div>
    </TerminalWindow>
  );
};

const Contact = () => {
  const { data: contact, isLoading, isError } = useGetContactQuery();

  return (
    <section id="contact" className="relative pt-16 pb-20 sm:pt-24 sm:pb-28">
      {/* the glow fades out before the section edge so it never leaves a hard line above the footer */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ maskImage: "linear-gradient(to bottom, black 40%, transparent 95%)" }}
        aria-hidden="true"
      >
        <div className="absolute top-1/2 left-1/2 size-[44rem] -translate-x-1/2 rounded-full bg-accent/10 blur-[160px]" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <div className="flex flex-col gap-6">
          <p className="font-mono text-xs tracking-[0.15em] text-muted">
            <span className="text-accent">05</span> <span className="text-faint">/</span> contact.sh
          </p>
          <h2 className="text-[clamp(2.75rem,9vw,7.5rem)] leading-[0.92] font-medium tracking-[-0.05em]">
            <TextReveal text="Let's build" className="block" />
            <TextReveal text="something that lasts." delay={0.15} className="block text-muted" />
          </h2>
        </div>

        {isLoading && <SkeletonLines lines={2} />}
        {isError && <LoadError what="contact details" />}
        {contact && <ContactTerminal contact={contact} />}
      </div>
    </section>
  );
};

export default Contact;
