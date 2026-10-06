import ScrollText from "../../components/ScrollText";

const STATEMENT =
  "I turn tangled requirements into systems that scale, teams that ship, and code a tired dev can still read at 2am.";

const Manifesto = () => (
  <section id="manifesto" className="relative py-32 sm:py-48">
    <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
      <p className="font-mono text-xs text-faint">
        <span className="text-accent">//</span> philosophy.md
      </p>
      <ScrollText
        text={STATEMENT}
        className="max-w-5xl text-[clamp(2rem,5.6vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.04em] text-balance"
      />
    </div>
  </section>
);

export default Manifesto;
