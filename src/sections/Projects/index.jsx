import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import SectionIntro, { Gold } from "../../components/SectionIntro";
import { LoadError, SkeletonLines } from "../../components/Skeleton";
import { useGetCaseStudiesQuery } from "../../api/caseStudiesApi";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import CaseStudyCard from "./CaseStudyCard";
import { Trigger as FourNations } from "../../components/Relics/Avatar";

const NO_STUDIES = [];

// how far the rail has to slide so its last card ends flush with the screen, measured after layout
const useRailOverflow = (railRef, cardCount) => {
  const [overflow, setOverflow] = useState(0);
  useLayoutEffect(() => {
    const measure = () => setOverflow(Math.max(0, (railRef.current?.scrollWidth ?? 0) - window.innerWidth));
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [railRef, cardCount]);
  return overflow;
};

// the wide screen version: the section pins and the cards slide past sideways as you keep scrolling down
const PinnedRail = ({ studies }) => {
  const sceneRef = useRef(null);
  const railRef = useRef(null);
  const overflow = useRailOverflow(railRef, studies.length);
  const { scrollYProgress } = useScroll({ target: sceneRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -overflow]);

  return (
    <div ref={sceneRef} style={{ height: `calc(100svh + ${overflow}px)` }}>
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div ref={railRef} style={{ x }} className="flex h-[min(78svh,44rem)] gap-6 px-[max(1.5rem,calc((100vw-72rem)/2))]">
          {studies.map((study, index) => (
            <CaseStudyCard key={study.slug} study={study} index={index} total={studies.length} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

// phones and reduced motion get a plain sideways shelf they can swipe through at their own pace
const Shelf = ({ studies }) => (
  <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-4" data-lenis-prevent>
    {studies.map((study, index) => (
      <div key={study.slug} className="snap-start">
        <CaseStudyCard study={study} index={index} total={studies.length} />
      </div>
    ))}
  </div>
);

/** projects.ts: the work I'd walk a hiring manager through, as a gallery that slides past while you scroll. */
const Projects = ({ number }) => {
  const { data: studies = NO_STUDIES, isLoading, isError } = useGetCaseStudiesQuery();
  const isWide = useMediaQuery("(min-width: 1024px)");
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="projects" className="relative py-24 sm:py-36">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6">
        <SectionIntro
          sectionId="projects"
          number={number}
          title={
            <>
              Things I'd walk you <Gold>through.</Gold>
            </>
          }
          lead="The work I'd bring up if we grabbed a coffee: what was hard, what I did about it and what changed after. Keep scrolling, they slide past on their own."
        />
        {/* four kinds of work in the gallery, four nations beside it */}
        <div className="-mt-6 flex justify-end">
          <FourNations zoom={0.22} />
        </div>
        {isLoading && <SkeletonLines lines={4} />}
        {isError && <LoadError what="the projects" />}
      </div>
      {studies.length > 0 && (isWide && !prefersReducedMotion ? <PinnedRail studies={studies} /> : <div className="mt-10"><Shelf studies={studies} /></div>)}
    </section>
  );
};

export default Projects;
