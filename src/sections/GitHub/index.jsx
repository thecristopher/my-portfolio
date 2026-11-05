import SectionHeading, { Sunset } from "../../components/SectionHeading";
import { SkeletonLines } from "../../components/Skeleton";
import { GITHUB_USER, useGetReposQuery } from "../../api/githubApi";
import { MAIN_PROJECT } from "./actions";
import Desk from "./Desk";
import Shelf from "./Shelf";

const NO_REPOS = [];

// when GitHub can't be reached the section still points somewhere useful instead of leaving a hole
const Offline = () => (
  <p className="mx-auto max-w-6xl px-4 text-muted sm:px-6">
    GitHub isn't answering right now. Everything else lives on{" "}
    <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noreferrer" className="text-accent underline-offset-4 hover:underline">
      github.com/{GITHUB_USER}
    </a>
    .
  </p>
);

/** What I build when nobody's asking: my desk at night with the editor config open, then the public repos on a shelf. */
const GitHub = () => {
  const { data: repos = NO_REPOS, isLoading, isError } = useGetReposQuery();
  const others = repos.filter((repo) => repo.name !== MAIN_PROJECT.name);

  return (
    <section id="github" className="relative pt-28 sm:pt-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-14 px-4 sm:px-6">
        <SectionHeading
          eyebrow="Side projects"
          title={
            <>
              Built for fun. <Sunset>Shipped anyway.</Sunset>
            </>
          }
          lead="What I build when nobody's asking, starting with the editor I write everything in. The rest load live from GitHub, each one pitched by its own README."
        />
        <Desk />
        {isLoading && <SkeletonLines lines={4} />}
      </div>
      {isError && repos.length === 0 && (
        <div className="pt-14">
          <Offline />
        </div>
      )}
      {others.length > 0 && <Shelf repos={others} />}
    </section>
  );
};

export default GitHub;
