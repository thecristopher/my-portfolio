import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import TechIcon from "../../components/TechIcon";
import CountUp from "../../components/CountUp";
import SpotlightCard from "../../components/SpotlightCard";
import { easeOutExpo } from "../../lib/motion";

// what was hard and how I went at it, folded away so the card leads with the result
const HowItWent = ({ study }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.5, ease: easeOutExpo }}
    className="overflow-hidden"
  >
    <div className="grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">The challenge</p>
        <p className="leading-relaxed text-muted text-pretty">{study.challenge}</p>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold">The approach</p>
        <ul className="flex flex-col gap-2 leading-relaxed text-muted">
          {study.approach.map((step) => (
            <li key={step} className="flex gap-2.5 text-pretty">
              <span className="mt-2.5 size-1 shrink-0 rounded-full bg-accent" />
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

/**
 * One case study under its company: what it was, the numbers, what changed, and the challenge and approach a click
 * away. It rises into place as it scrolls in.
 * @param {{ study: object, index: number }} props
 */
const CaseStudyCard = ({ study, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.article
      id={`project-${study.slug}`}
      initial={{ opacity: 0, y: 48, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1, delay: index * 0.06, ease: easeOutExpo }}
      className="scroll-mt-24"
    >
      <SpotlightCard className="card flex flex-col gap-6 rounded-3xl p-7 sm:p-9">
        <span className="w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{study.kind}</span>
        <h4 className="text-[clamp(1.6rem,3vw,2.25rem)] leading-tight font-semibold tracking-tight text-balance">{study.title}</h4>
        <p className="text-lg leading-relaxed text-muted text-pretty">{study.summary}</p>
        {study.metrics?.length > 0 && (
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            {study.metrics.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-1">
                <dt className="text-sunset text-4xl font-semibold tracking-tight">
                  <CountUp value={metric.value} />
                </dt>
                <dd className="text-sm text-muted">{metric.label}</dd>
              </div>
            ))}
          </dl>
        )}
        <p className="text-lg leading-snug font-medium text-pretty">{study.outcome}</p>
        <AnimatePresence initial={false}>{isOpen && <HowItWent study={study} />}</AnimatePresence>
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <ul className="flex flex-wrap gap-3" aria-label="Built with">
            {study.technologies.map((tech) => (
              <li key={tech} className="flex items-center gap-1.5 text-xs text-muted">
                <TechIcon tech={tech} className="size-3.5" />
                {tech}
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            className="flex items-center gap-1.5 text-sm font-medium text-accent"
          >
            {isOpen ? "Less" : "How it went"}
            <Plus size={15} className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </SpotlightCard>
    </motion.article>
  );
};

export default CaseStudyCard;
