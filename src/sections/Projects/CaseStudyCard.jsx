import TechIcon from "../../components/TechIcon";

// each kind of work gets its own tint from the region, so the gallery reads as a range, not a list
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

/**
 * One case study as a big card: what was hard, how I went at it and what changed, with the numbers once they exist.
 * @param {{ study: object, index: number, total: number }} props
 */
const CaseStudyCard = ({ study, index, total }) => (
  <article
    id={`project-${study.slug}`}
    className="flex h-full w-[min(86vw,40rem)] shrink-0 flex-col gap-6 rounded-[28px] border border-line-strong bg-panel/80 p-7 shadow-[0_40px_80px_-40px_color-mix(in_oklab,var(--color-shadow)_90%,transparent)] backdrop-blur-xl sm:p-10"
  >
    <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
      <span className={`rounded-full border px-2.5 py-1 ${KIND_TONES[study.kind] ?? "text-muted border-line-strong"}`}>{study.kind}</span>
      <span className="text-faint tabular-nums">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>
    <div className="flex flex-col gap-2">
      <h3 className="text-[clamp(2rem,4vw,3rem)] leading-[1] font-semibold tracking-[-0.04em] text-balance">{study.title}</h3>
      <p className="font-mono text-xs text-muted">
        {study.company} · {study.role}
      </p>
    </div>
    <p className="text-lg leading-relaxed text-fg text-pretty">{study.summary}</p>
    <div className="grid gap-6 sm:grid-cols-2">
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
    <div className="mt-auto flex flex-col gap-4 border-t border-line pt-5">
      {study.metrics?.length > 0 && (
        <dl className="flex flex-wrap gap-6">
          {study.metrics.map((metric) => (
            <div key={metric.label}>
              <dt className="text-gold text-3xl font-semibold tracking-tight">{metric.value}</dt>
              <dd className="font-mono text-[11px] text-muted">{metric.label}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-base leading-snug font-medium text-pretty">
        <span className="text-string">✓ </span>
        {study.outcome}
      </p>
      <ul className="flex flex-wrap gap-3">
        {study.technologies.map((tech) => (
          <li key={tech} className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
            <TechIcon tech={tech} className="size-3.5" />
            {tech}
          </li>
        ))}
      </ul>
    </div>
  </article>
);

export default CaseStudyCard;
