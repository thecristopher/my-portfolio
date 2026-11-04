import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Clock, GraduationCap, Languages, MapPin } from "lucide-react";
import CountUp from "../../components/CountUp";
import { Trigger as NichirinBlade } from "../../components/Relics/DemonSlayer";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { localClock } from "../../actions";
import { easeOutExpo } from "../../lib/motion";
import { HOME_TIMEZONE } from "../../lib/profile";
import { currentPosition, shortCertName } from "./actions";

// each tile scales up out of the page as it scrolls in, one after the other
const Tile = ({ index, className = "", children }) => (
  <motion.li
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
  return localClock(now, HOME_TIMEZONE).time;
};

const HomeTile = ({ about, index }) => {
  const time = useHomeTime();
  return (
    <Tile index={index} className="justify-between">
      <Label icon={MapPin}>Based in</Label>
      <p className="text-3xl font-semibold tracking-tight">{about.location}</p>
      <p className="flex items-center gap-2 text-muted">
        <Clock size={14} aria-hidden="true" />
        <span className="tabular-nums">{time}</span> there now · {about.timezone}
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
  const position = currentPosition(projects, about.role);

  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm font-semibold text-muted">At a glance</p>
      <ul className="grid gap-4 md:grid-cols-3">
        <Tile index={0} className="md:col-span-2">
          <Label>Shipping software for</Label>
          <p className="text-sunset text-[clamp(4.5rem,10vw,8rem)] leading-none font-semibold tracking-[-0.05em]">
            <CountUp value={`${about.years_of_experience}+`} />
          </p>
          <p className="text-xl font-semibold tracking-tight">years, intern to Engineering Manager.</p>
        </Tile>
        <HomeTile about={about} index={1} />
        <Tile index={2}>
          <Label>Right now</Label>
          <p className="text-2xl font-semibold tracking-tight text-balance">{position}</p>
        </Tile>
        {about.certifications?.length > 0 && (
          <Tile index={3}>
            <span className="flex items-center justify-between gap-2">
              <Label icon={Award}>Certified</Label>
              {/* the exams took total concentration, so Tanjiro's blade rests beside them */}
              <NichirinBlade zoom={0.42} />
            </span>
            <ul className="flex flex-col gap-1.5 text-lg font-semibold tracking-tight">
              {about.certifications.map((cert) => (
                <li key={cert.name}>{shortCertName(cert.name)}</li>
              ))}
            </ul>
          </Tile>
        )}
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
            <p className="text-2xl font-semibold tracking-tight">{about.languages.map((language) => language.name).join(" & ")}</p>
          </Tile>
        )}
      </ul>
    </div>
  );
};

export default Glance;
