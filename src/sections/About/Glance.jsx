import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Bot, Globe2, Languages, Sparkles, Users } from "lucide-react";
import CountUp from "../../components/CountUp";
import SpotlightCard from "../../components/SpotlightCard";
import TechIcon from "../../components/TechIcon";
import { localClock } from "../../actions";
import { HOME_TIMEZONE } from "../../lib/profile";
import { easeOutExpo } from "../../lib/motion";

// tiles deal in one after another, a little tipped back, the way Apple lays out its highlight grids
const Tile = ({ index, className = "", children }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.96 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 1, delay: (index % 4) * 0.08, ease: easeOutExpo }}
    className={className}
  >
    <SpotlightCard className="flex h-full flex-col gap-3 rounded-3xl border border-line bg-panel/70 p-6 backdrop-blur sm:p-7">{children}</SpotlightCard>
  </motion.div>
);

const Label = ({ icon: Icon, children }) => (
  <p className="flex items-center gap-2 font-mono text-[11px] text-faint">
    {Icon && <Icon size={13} className="text-accent" aria-hidden="true" />}
    {children}
  </p>
);

const Big = ({ children, className = "" }) => <p className={`text-[clamp(2.75rem,6vw,4.5rem)] leading-none font-semibold tracking-[-0.05em] ${className}`}>{children}</p>;

const LiveClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return <span className="tabular-nums">{localClock(now, HOME_TIMEZONE).time}</span>;
};

// "I run engineering for four of PSL Group's products: DGPL, AMI, IDH and MEC." gives the four names
const productsFrom = (description = "") => description.match(/: ([^.]+)\./)?.[1]?.split(/, | and /) ?? [];

/**
 * The page at a glance, the facts a recruiter looks for in the first ten seconds, as a bento grid of tiles.
 * Every number comes from the api, so the tiles never drift from the resume.
 */
const Glance = ({ about, current }) => {
  const products = productsFrom(current?.description);
  const certCount = about.certifications?.length ?? 0;

  return (
    <div id="glance" className="grid auto-rows-[minmax(11rem,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-6">
      <Tile index={0} className="sm:col-span-2 lg:col-span-3 lg:row-span-2">
        <Label icon={Sparkles}>years shipping production software</Label>
        <Big className="text-gold mt-auto text-[clamp(6rem,16vw,11rem)]">
          <CountUp value={`${about.years_of_experience}+`} />
        </Big>
        <p className="max-w-sm text-muted text-pretty">From a truck log at the Tijuana customs office to AI agents on AWS. Intern to Engineering Manager, one step at a time.</p>
      </Tile>

      {products.length > 0 && (
        <Tile index={1} className="lg:col-span-3">
          <Label icon={Users}>{current.title} · products I run engineering for</Label>
          <Big>
            <CountUp value={String(products.length)} />
          </Big>
          <p className="flex flex-wrap gap-2 font-mono text-xs">
            {products.map((product) => (
              <span key={product} className="rounded-full border border-line-strong px-2.5 py-1 text-muted">
                {product}
              </span>
            ))}
          </p>
        </Tile>
      )}

      <Tile index={2} className="lg:col-span-2">
        <Label icon={Bot}>AI in production</Label>
        <p className="mt-auto text-2xl leading-tight font-semibold tracking-tight">Claude agents on AWS Bedrock</p>
        <p className="text-sm text-muted">Versioned, streamed and behind guardrails.</p>
      </Tile>

      {certCount > 0 && (
        <Tile index={3} className="lg:col-span-1">
          <Label icon={Award}>AWS</Label>
          <Big className="mt-auto">
            <CountUp value={`${certCount}x`} />
          </Big>
          <p className="text-sm text-muted">certified</p>
        </Tile>
      )}

      <Tile index={4} className="lg:col-span-2">
        <Label icon={Globe2}>based in</Label>
        <p className="mt-auto text-2xl font-semibold tracking-tight">{about.location}</p>
        <p className="text-sm text-muted">
          {about.timezone} · it's <LiveClock /> here
        </p>
      </Tile>

      <Tile index={5} className="sm:col-span-2 lg:col-span-3">
        <Label>main stack</Label>
        <ul className="mt-auto grid grid-cols-4 gap-3">
          {about.main_stack.map((tech) => (
            <li key={tech} className="flex flex-col items-center gap-2 text-center">
              <TechIcon tech={tech} className="size-7" fallback={<span className="size-7 rounded-md bg-raised" />} />
              <span className="font-mono text-[10px] text-muted">{tech}</span>
            </li>
          ))}
        </ul>
      </Tile>

      {about.languages?.length > 0 && (
        <Tile index={6} className="lg:col-span-1">
          <Label icon={Languages}>speaks</Label>
          <p className="mt-auto text-xl font-semibold tracking-tight">{about.languages.map((language) => language.name).join(" · ")}</p>
        </Tile>
      )}
    </div>
  );
};

export default Glance;
