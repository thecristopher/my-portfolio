import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Clock, GraduationCap, Languages, MapPin } from "lucide-react";
import CountUp from "../../components/CountUp";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { localClock } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { HOME_TIMEZONE } from "../../lib/profile";
import { currentCompany, shortCertName } from "./actions";
import Greeting from "./Greeting";
import Sky from "./Sky";
import YearsGrid from "./YearsGrid";

// each tile scales up out of the page as it scrolls in, one after the other
const Tile = ({ index, className = "", children, ...rest }) => (
  <motion.li
    {...rest}
    initial={{ opacity: 0, y: 40, scale: 0.94 }}
    whileInView={{ opacity: 1, y: 0, scale: 1 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 1, delay: (index % 3) * 0.08, ease: easeOutExpo }}
    className={`card flex flex-col gap-3 rounded-3xl p-6 sm:p-8 ${className}`}
  >
    {children}
  </motion.li>
);

const Label = ({ icon: Icon, children }) => (
  <p className="flex items-center gap-2 text-sm font-medium text-muted">
    {Icon && <Icon size={15} aria-hidden="true" />}
    {children}
  </p>
);

// the time in Rosarito right now, so a visitor in another timezone knows when I'll answer
const useHomeTime = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(timer);
  }, []);
  return localClock(now, HOME_TIMEZONE);
};

// the light on a foil card, following the cursor across it. mouse only, a finger has nothing to hover with
const tiltFoil = (event) => {
  if (event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--foil-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
  event.currentTarget.style.setProperty("--foil-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
};

const FOIL = {
  background: [
    "radial-gradient(circle at var(--foil-x, 50%) var(--foil-y, 50%), rgb(255 255 255 / 0.28), transparent 42%)",
    "linear-gradient(115deg, transparent 25%, color-mix(in oklab, var(--color-sunset-1) 22%, transparent) 40%, color-mix(in oklab, var(--color-sunset-3) 22%, transparent) 55%, transparent 70%)",
  ].join(", "),
  backgroundSize: "100% 100%, 220% 220%",
  backgroundPosition: "center, var(--foil-x, 50%) var(--foil-y, 50%)",
};

// the certifications as foil cards: the shine and a band of sunset slide across as the cursor moves over them
const CertificationsTile = ({ certifications, index }) => (
  <Tile index={index} onPointerMove={tiltFoil} className="group relative overflow-hidden">
    <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={FOIL} aria-hidden="true" />
    <Label icon={Award}>Certified</Label>
    <ul className="flex flex-col gap-1.5 text-lg font-semibold tracking-tight">
      {certifications.map((cert) => (
        <li key={cert.name}>{shortCertName(cert.name)}</li>
      ))}
    </ul>
  </Tile>
);

const HomeTile = ({ about, index }) => {
  const clock = useHomeTime();
  const minute = Number(clock.time.split(":")[1]);
  return (
    <Tile index={index} className="justify-between">
      <Label icon={MapPin}>Based in</Label>
      <p className="text-3xl font-semibold tracking-tight">{about.location}</p>
      <Sky hour={clock.hour} minute={minute} />
      <p className="flex items-center gap-2 text-muted">
        <Clock size={14} aria-hidden="true" />
        <span className="tabular-nums">{clock.time}</span> there now · {about.timezone}
      </p>
    </Tile>
  );
};

/**
 * The whole profile in tiles, the facts a recruiter scans for first: years, where, what now, certifications, the
 * degree and the languages.
 * @param {{ about: object }} props
 */
const Glance = ({ about }) => {
  const { data: projects = [] } = useGetProjectsQuery();
  const company = currentCompany(projects);

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm font-semibold text-muted">At a glance</p>
      <ul className="grid gap-4 md:grid-cols-3">
        <Tile index={0} className="gap-6 sm:flex-row sm:items-end sm:justify-between md:col-span-2">
          <div className="flex flex-col gap-3">
            <Label>Shipping software for</Label>
            <p className="text-sunset text-[clamp(4.5rem,10vw,8rem)] leading-none font-semibold tracking-[-0.05em]">
              <CountUp value={`${about.years_of_experience}+`} />
            </p>
            <p className="text-xl font-semibold tracking-tight">years, and still shipping every week.</p>
          </div>
          <YearsGrid years={about.years_of_experience} />
        </Tile>
        <HomeTile about={about} index={1} />
        {company && (
          <Tile index={2}>
            <Label>Building at</Label>
            <p className="text-3xl font-semibold tracking-tight text-balance">{company}</p>
          </Tile>
        )}
        {about.certifications?.length > 0 && <CertificationsTile certifications={about.certifications} index={3} />}
        {about.education?.[0] && (
          <Tile index={4}>
            <Label icon={GraduationCap}>Studied</Label>
            <p className="text-lg font-semibold tracking-tight text-balance">{about.education[0].degree}</p>
            <p className="text-muted">{about.education[0].school}</p>
          </Tile>
        )}
        {about.expertise?.length > 0 && (
          <Tile index={5} className="md:col-span-2">
            <Label>What I lead with</Label>
            <ul className="flex flex-wrap gap-2">
              {about.expertise.map((skill) => (
                <li key={skill} className="rounded-full bg-raised px-3.5 py-1.5 text-sm font-medium">
                  {skill}
                </li>
              ))}
            </ul>
          </Tile>
        )}
        {about.languages?.length > 0 && (
          <Tile index={6}>
            <Label icon={Languages}>Speaks</Label>
            <Greeting languages={about.languages} />
            <p className="text-2xl font-semibold tracking-tight">{about.languages.map((language) => language.name).join(" & ")}</p>
          </Tile>
        )}
      </ul>
    </div>
  );
};

export default Glance;
