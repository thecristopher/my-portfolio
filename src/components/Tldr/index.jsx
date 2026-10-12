import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Copy, Mail, Printer, X } from "lucide-react";
import TerminalWindow from "../TerminalWindow";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetContactQuery } from "../../api/contactApi";
import { socialIconMap } from "../../lib/socialIconMap";
import { extractYearsOfExperience, hostnameFromUrl, splitFeatured } from "../../actions";
import { CERTIFICATIONS, FULL_NAME, HOME, TIMEZONE } from "../../lib/profile";
import { pauseSmoothScroll, resumeSmoothScroll } from "../../lib/smoothScroll";
import { echo } from "../../lib/echo";
import { easeOutExpo } from "../../lib/motion";

const Heading = ({ children }) => (
  <p className="font-mono text-[11px] text-faint">
    <span className="text-accent">##</span> {children}
  </p>
);

const ActionLink = ({ href, onClick, icon, children, isPrimary = false }) => {
  const Icon = icon;
  const className = `inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
    isPrimary ? "bg-fg text-ink hover:bg-accent" : "border border-line-strong text-muted hover:border-faint hover:text-fg"
  }`;
  const content = (
    <>
      <Icon size={14} aria-hidden="true" />
      {children}
    </>
  );
  if (href) {
    const isExternal = href.startsWith("http");
    return (
      <a href={href} className={className} {...(isExternal ? { target: "_blank", rel: "noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
};

// everything a recruiter scrolls the whole page for, on one screen
const Readme = ({ onClose }) => {
  const { data: about } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: contact } = useGetContactQuery();
  const { featured, earlier } = splitFeatured(projects);
  const [current, ...pastFeatured] = featured;
  const years = extractYearsOfExperience(about?.description);

  const copyEmail = async () => {
    await navigator.clipboard?.writeText(contact.email);
    echo(`yanked "${contact.email}" to the + register.`, "success");
  };

  const printResume = () => {
    onClose();
    // the dialog has to be gone before the print preview snapshots the page
    setTimeout(() => window.print(), 350);
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="The short version"
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: 8 }}
      transition={{ duration: 0.45, ease: easeOutExpo }}
      onClick={(event) => event.stopPropagation()}
      className="mx-auto w-full max-w-3xl"
    >
      <TerminalWindow title="~/cristopher/README.md" bodyClassName="p-0">
        <div className="relative max-h-[78svh] overflow-y-auto p-6 sm:p-10" data-lenis-prevent>
          <button
            type="button"
            autoFocus
            onClick={onClose}
            aria-label="Close the short version"
            className="absolute top-4 right-4 grid size-9 place-items-center rounded-full text-faint transition-colors hover:bg-raised hover:text-fg"
          >
            <X size={16} />
          </button>

          <div className="flex flex-col gap-10">
            <header className="flex flex-col gap-3">
              <p className="font-mono text-xs text-faint">
                <span className="text-accent">#</span> tl;dr
              </p>
              <h2 className="text-[clamp(2rem,6vw,3.25rem)] leading-none font-medium tracking-[-0.04em]">{FULL_NAME}</h2>
              <p className="text-lg text-fg">{about?.role}</p>
              <p className="flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
                <span>{HOME}</span>
                <span className="text-faint">·</span>
                <span>{TIMEZONE}</span>
                {years && (
                  <>
                    <span className="text-faint">·</span>
                    <span className="text-accent">{years} years shipping</span>
                  </>
                )}
              </p>
              {contact && (
                <div className="flex flex-wrap gap-2 pt-3">
                  <ActionLink href={contact.mailto} icon={Mail} isPrimary>
                    Email me
                  </ActionLink>
                  <ActionLink onClick={copyEmail} icon={Copy}>
                    Copy email
                  </ActionLink>
                  <ActionLink onClick={printResume} icon={Printer}>
                    Save resume as PDF
                  </ActionLink>
                </div>
              )}
            </header>

            <div className="grid gap-10 sm:grid-cols-[1.4fr_1fr]">
              <div className="flex flex-col gap-8">
                {current && (
                  <section className="flex flex-col gap-3">
                    <Heading>right now</Heading>
                    <p className="font-medium text-fg">{current.title}</p>
                    <p className="text-sm leading-relaxed text-muted text-pretty">{current.description}</p>
                  </section>
                )}

                {(pastFeatured.length > 0 || earlier.length > 0) && (
                  <section className="flex flex-col gap-3">
                    <Heading>before that</Heading>
                    <ul className="flex flex-col gap-3">
                      {[...pastFeatured, ...earlier].map((project) => (
                        <li key={project.title} className="flex flex-col gap-0.5">
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noreferrer"
                            className="w-fit text-sm text-fg transition-colors hover:text-accent"
                          >
                            {project.title} <span className="font-mono text-[11px] text-faint">{hostnameFromUrl(project.url)}</span>
                          </a>
                          <p className="text-sm text-muted text-pretty">{project.description}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              <div className="flex flex-col gap-8">
                {about?.main_stack?.length > 0 && (
                  <section className="flex flex-col gap-3">
                    <Heading>main stack</Heading>
                    <ul className="flex flex-wrap gap-1.5">
                      {about.main_stack.map((tool) => (
                        <li key={tool} className="rounded-full border border-line px-2.5 py-1 font-mono text-[11px] text-muted">
                          {tool}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="flex flex-col gap-3">
                  <Heading>certified</Heading>
                  <ul className="flex flex-col gap-1 text-sm text-muted">
                    {CERTIFICATIONS.map((cert) => (
                      <li key={cert}>{cert}</li>
                    ))}
                  </ul>
                </section>

                {contact && (
                  <section className="flex flex-col gap-3">
                    <Heading>elsewhere</Heading>
                    <ul className="flex flex-col gap-1.5">
                      {contact.socials.map((social) => {
                        const Icon = socialIconMap[social.name];
                        return (
                          <li key={social.id}>
                            <a
                              href={social.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
                            >
                              {Icon && <Icon size={13} className="text-faint group-hover:text-accent" aria-hidden="true" />}
                              {social.name}
                              <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover:opacity-100" />
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}
              </div>
            </div>

          </div>
        </div>
      </TerminalWindow>
    </motion.div>
  );
};

const Tldr = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    pauseSmoothScroll();
    const closeOnEscape = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      resumeSmoothScroll();
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center bg-ink/70 px-4 backdrop-blur-sm"
        >
          <Readme onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Tldr;
