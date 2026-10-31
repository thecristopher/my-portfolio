import { ChevronRight } from "lucide-react";
import TechIcon from "../../components/TechIcon";

// each kind of work gets its own tint from the region, so a company's studies read as a range, not a list
const KIND_TONES = {
  AI: "text-mauve border-mauve/40",
  Frontend: "text-sky border-sky/40",
  Platform: "text-peach border-peach/40",
  Product: "text-string border-string/40",
};

const Block = ({ label, children }) => (
  <div className="flex flex-col gap-2">
    <p className="font-mono text-[11px] text-faint">
      <span className="text-accent">//</span> {label}
    </p>
    {children}
  </div>
);

// what was hard and how I went at it, folded away so the card leads with the result
const HowItWent = ({ study }) => (
  <details className="group/how">
    <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 font-mono text-[11px] text-muted transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
      <ChevronRight size={13} className="transition-transform group-open/how:rotate-90" aria-hidden="true" />
      how it went
    </summary>
    <div className="mt-4 grid gap-5 sm:grid-cols-2">
      <Block label="challenge">
        <p className="text-sm leading-relaxed text-muted text-pretty">{study.challenge}</p>
      </Block>
      <Block label="approach">
        <ul className="flex flex-col gap-1.5 text-sm leading-relaxed text-muted">
          {study.approach.map((step) => (
            <li key={step} className="flex gap-2 text-pretty">
              <span className="text-accent">›</span>
              {step}
            </li>
          ))}
        </ul>
      </Block>
    </div>
  </details>
);

/**
 * One case study inside its company's chapter: what it was, what changed and the numbers, with the challenge and the
 * approach one click away.
 * @param {{ study: object }} props
 */
const CaseStudyCard = ({ study }) => (
  <article id={`project-${study.slug}`} className="flex scroll-mt-24 flex-col gap-5 rounded-3xl border border-line bg-panel/70 p-6 sm:p-7">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h4 className="text-xl font-semibold tracking-tight text-balance sm:text-2xl">{study.title}</h4>
      <span className={`rounded-full border px-2.5 py-1 font-mono text-[11px] ${KIND_TONES[study.kind] ?? "border-line-strong text-muted"}`}>{study.kind}</span>
    </div>
    <p className="leading-relaxed text-muted text-pretty">{study.summary}</p>
    {study.metrics?.length > 0 && (
      <dl className="flex flex-wrap gap-6">
        {study.metrics.map((metric) => (
          <div key={metric.label}>
            <dt className="text-gold text-2xl font-semibold tracking-tight">{metric.value}</dt>
            <dd className="font-mono text-[11px] text-muted">{metric.label}</dd>
          </div>
        ))}
      </dl>
    )}
    <p className="leading-snug font-medium text-pretty">
      <span className="text-string">✓ </span>
      {study.outcome}
    </p>
    <HowItWent study={study} />
    <ul className="flex flex-wrap gap-3 border-t border-line pt-4">
      {study.technologies.map((tech) => (
        <li key={tech} className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
          <TechIcon tech={tech} className="size-3.5" />
          {tech}
        </li>
      ))}
    </ul>
  </article>
);

export default CaseStudyCard;
