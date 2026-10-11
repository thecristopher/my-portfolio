import ScrollText from "../../components/ScrollText";
import StackMarquee from "../../components/StackMarquee";
import { Alchemy } from "../../components/Secrets";
import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { collectStack } from "../../actions";

const STATEMENT =
  "Hand me a hard problem and a team that wants to ship. I'll happily dig in until it works, and leave code a tired dev can still read at 2am.";

const Manifesto = () => {
  const { data: about } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const stack = collectStack(projects, about?.main_stack);

  return (
    <section id="manifesto" className="relative py-32 sm:py-48">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <p className="flex items-center gap-1 font-mono text-xs text-faint">
          <span>
            <span className="text-accent">//</span> philosophy.md
          </span>
          <Alchemy className="-my-2" />
        </p>
        <ScrollText
          text={STATEMENT}
          className="max-w-5xl text-[clamp(2rem,5.6vw,4.75rem)] leading-[1.05] font-medium tracking-[-0.04em] text-balance"
        />
      </div>
      {stack.length > 0 && (
        <div className="mt-24 flex flex-col gap-6 sm:mt-32">
          <p className="mx-auto w-full max-w-6xl px-4 font-mono text-xs text-faint sm:px-6">
            <span className="text-accent">$</span> cat stack.lock <span className="text-fg">→ {stack.length} tools, still counting</span>
          </p>
          <StackMarquee stack={stack} />
        </div>
      )}
    </section>
  );
};

export default Manifesto;
