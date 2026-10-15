import { motion } from "framer-motion";
import { ArrowUpRight, BadgeCheck, GraduationCap } from "lucide-react";
import { FaAws } from "react-icons/fa";
import SectionHeader from "../../components/SectionHeader";
import SpotlightCard from "../../components/SpotlightCard";
import TerminalWindow from "../../components/TerminalWindow";
import { Airbender, Spider } from "../../components/Secrets";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetAboutQuery } from "../../api/aboutApi";
import { hostnameFromUrl } from "../../actions";
import { easeOutExpo } from "../../lib/motion";

const formatYears = (start, end) => {
  if (start && end) return `${start} – ${end}`;
  return start ? `${start} – present` : null;
};

const TomlLine = ({ name, children }) => (
  <p>
    <span className="text-signal">{name}</span>
    <span className="text-faint"> = </span>
    <span className="text-string">"{children}"</span>
  </p>
);

const Diploma = ({ school }) => {
  const years = formatYears(school.start_year, school.end_year);

  return (
    <TerminalWindow title="~/education/degree.toml" bodyClassName="p-0">
      <div className="flex flex-col gap-8 p-6 sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-3">
            <p className="font-mono text-xs text-accent">{years ?? "[degree]"}</p>
            <h3 className="text-[clamp(1.75rem,3.5vw,2.5rem)] leading-tight font-medium tracking-[-0.03em] text-balance">
              {school.degree}
            </h3>
            <p className="text-muted italic">{school.original_name}</p>
          </div>
          <span className="hidden size-14 shrink-0 place-items-center rounded-2xl border border-line bg-ink text-accent sm:grid">
            <GraduationCap size={26} aria-hidden="true" />
          </span>
        </div>

        <div className="flex flex-col gap-1 border-l-2 border-accent/50 pl-4">
          <p className="text-lg font-medium">{school.school}</p>
          <p className="text-sm text-muted">{school.location}</p>
        </div>

        {school.highlights.length > 0 && (
          <ul className="flex flex-col gap-2.5">
            {school.highlights.map((highlight) => (
              <li key={highlight} className="flex gap-3 leading-relaxed text-muted text-pretty">
                <span className="font-mono text-accent" aria-hidden="true">
                  ›
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line bg-ink/30 px-6 py-4 font-mono text-xs sm:px-10">
        <div className="flex items-center gap-1 text-muted">
          <TomlLine name="graduated_as">Computer Systems Engineer</TomlLine>
          <Spider className="-my-2" />
        </div>
        <a
          href={school.url}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-1.5 text-muted transition-colors hover:text-accent"
        >
          <span className="text-accent">$</span> open {hostnameFromUrl(school.url)}
          <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>
      </div>
    </TerminalWindow>
  );
};

// the six sided shape of an AWS badge, drawn here so it takes the theme's colors
const HEXAGON = "M50 2 L93 26 L93 74 L50 98 L7 74 L7 26 Z";

const CertBadge = ({ cert, index }) => {
  const isAssociate = cert.level.toLowerCase() === "associate";
  const tone = isAssociate ? "text-signal" : "text-accent";

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90 }}
      whileInView={{ opacity: 1, rotateY: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 1.1, delay: index * 0.15, ease: easeOutExpo }}
      style={{ perspective: 1000 }}
    >
      <SpotlightCard className="group flex items-center gap-5 rounded-2xl border border-line bg-panel p-5 transition-colors duration-500 hover:border-line-strong sm:p-6">
        <div className={`relative grid size-20 shrink-0 place-items-center ${tone}`}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
            <path d={HEXAGON} fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M50 12 L84 31 L84 69 L50 88 L16 69 L16 31 Z" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1" />
          </svg>
          <FaAws size={26} className="relative -mt-4" aria-hidden="true" />
          {/* a band across the badge like the real ones, wide enough that "foundational" never spills past the edges */}
          <span className="absolute inset-x-0 bottom-[22px] rounded-[3px] bg-current py-0.5 text-center font-mono text-[7px] leading-none font-semibold tracking-[0.12em] uppercase">
            <span className="text-ink">{cert.level}</span>
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-1.5">
          <p className={`font-mono text-[10px] tracking-[0.2em] uppercase ${tone}`}>{cert.level}</p>
          <h3 className="leading-snug font-medium text-pretty">{cert.name}</h3>
          {cert.verify_url ? (
            <a
              href={cert.verify_url}
              target="_blank"
              rel="noreferrer"
              className="flex w-fit items-center gap-1.5 font-mono text-[11px] text-muted transition-colors hover:text-accent"
            >
              <BadgeCheck size={13} aria-hidden="true" /> verify credential
            </a>
          ) : (
            <p className="flex items-center gap-1.5 font-mono text-[11px] text-faint">
              <BadgeCheck size={13} aria-hidden="true" /> issued by {cert.issuer}
            </p>
          )}
        </div>
      </SpotlightCard>
    </motion.div>
  );
};

const Education = () => {
  const { data: about, isLoading, isError } = useGetAboutQuery();
  const schools = about?.education ?? [];
  const certifications = about?.certifications ?? [];

  return (
    <section id="education" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 sm:px-6">
        <SectionHeader index="04" label="education.toml" title="Where it started, and what's certified." />

        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="education" />}

        <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
          <div className="flex flex-col gap-8 lg:col-span-7">
            {schools.map((school) => (
              <Diploma key={school.school} school={school} />
            ))}
          </div>

          {certifications.length > 0 && (
            <div className="flex flex-col gap-4 lg:col-span-5">
              <div className="flex items-center gap-1">
                <p className="font-mono text-xs text-faint">
                  <span className="text-accent">$</span> aws certifications list <span className="text-fg">→ {certifications.length} earned</span>
                </p>
                <Airbender className="-my-2" />
              </div>
              {certifications.map((cert, index) => (
                <CertBadge key={cert.name} cert={cert} index={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Education;
