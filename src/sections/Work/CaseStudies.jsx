import CaseStudyCard from "./CaseStudyCard";

/**
 * A company's case studies under its chapter, so each piece of work is told once, right where it happened.
 * @param {{ studies: object[], relic?: React.ReactNode }} props
 */
const CaseStudies = ({ studies, relic }) => {
  if (studies.length === 0) return null;
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-3 font-mono text-xs text-faint">
        <span>
          <span className="text-accent">$</span> ls ./case-studies
        </span>
        {relic}
      </p>
      {studies.map((study) => (
        <CaseStudyCard key={study.slug} study={study} />
      ))}
    </div>
  );
};

export default CaseStudies;
