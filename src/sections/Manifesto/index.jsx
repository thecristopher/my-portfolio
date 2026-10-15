import ScrollText from "../../components/ScrollText";
import { Hanafuda } from "../../components/Secrets";

const STATEMENT =
  "Hand me a hard problem and a team that wants to ship. I'll happily dig in until it works, and leave code a tired dev can still read at 2am.";

const Manifesto = () => {
  return (
    <section id="manifesto" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <p className="font-mono text-xs text-faint">
          <span className="text-accent">//</span> philosophy.md
        </p>
        <div className="flex max-w-5xl flex-col">
          <ScrollText
            text={STATEMENT}
            className="text-[clamp(2rem,5.6vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.04em] text-balance"
          />
          <Hanafuda className="-mt-1 self-end" />
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
