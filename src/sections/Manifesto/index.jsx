import ScrollText from "../../components/ScrollText";

const STATEMENT =
  "Good software should feel a little boring. It just works, it is easy to read, nobody gets paged at 2am, and everyone logs off on time.";

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
