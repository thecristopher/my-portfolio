import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetCaseStudiesQuery } from "../../api/caseStudiesApi";
import { useGetContactQuery } from "../../api/contactApi";
import { buildResume } from "../../lib/resume/buildResume";

const Heading = ({ children }) => (
  <h2 className="mb-1.5 border-b border-neutral-300 pb-1 text-[8.5pt] font-semibold tracking-[0.15em] text-[#a8862f] uppercase">{children}</h2>
);

const Role = ({ role }) => (
  <li className="break-inside-avoid">
    <p className="flex items-baseline justify-between gap-4">
      <span className="text-[10.5pt] font-semibold">{role.company}</span>
      {role.dates && <span className="text-[8pt] text-neutral-500">{role.dates}</span>}
    </p>
    {role.title && <p className="text-neutral-600">{[role.title, role.location].filter(Boolean).join(" · ")}</p>}
    <ul className="mt-0.5 list-disc pl-4">
      {(role.bullets.length > 0 ? role.bullets : [role.summary]).map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
    <p className="mt-0.5 text-[8pt] text-neutral-500">{role.stack.join(" · ")}</p>
  </li>
);

/**
 * Never on screen. Printing the site prints this instead of the page: the same resume the pdf download writes,
 * built from the same api, so the two can never disagree.
 */
const Resume = () => {
  const { data: about } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: caseStudies = [] } = useGetCaseStudiesQuery();
  const { data: contact } = useGetContactQuery();
  const resume = buildResume({ about, projects, caseStudies, contact, site: typeof window === "undefined" ? undefined : window.location.host || undefined });

  return (
    <article className="print-resume hidden bg-white font-sans text-[9pt] leading-snug text-neutral-900 print:block">
      <header className="mb-3 border-b border-[#a8862f]/60 pb-3">
        <h1 className="text-[22pt] leading-none font-semibold tracking-tight">{resume.name}</h1>
        <p className="mt-1.5 text-[10.5pt] text-neutral-600">{resume.headline}</p>
        <p className="mt-1.5 flex flex-wrap gap-x-3 text-[8.5pt] text-neutral-600">
          {resume.contactLine.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </p>
      </header>

      <section className="mb-3">
        <Heading>Summary</Heading>
        <p>{resume.summary}</p>
      </section>

      <section className="mb-3">
        <Heading>Experience</Heading>
        <ul className="flex flex-col gap-2.5">
          {resume.experience.map((role) => (
            <Role key={role.company} role={role} />
          ))}
        </ul>
      </section>

      <section className="mb-3 break-inside-avoid">
        <Heading>Skills</Heading>
        {resume.skills.map((group) => (
          <p key={group.category}>
            <span className="inline-block w-28 font-semibold">{group.category}</span>
            {group.items.join(", ")}
          </p>
        ))}
        {resume.expertise.length > 0 && (
          <p>
            <span className="inline-block w-28 font-semibold">Leadership</span>
            {resume.expertise.join(", ")}
          </p>
        )}
      </section>

      <section className="grid grid-cols-2 gap-6 break-inside-avoid">
        <div>
          <Heading>Education</Heading>
          {resume.education.map((school) => (
            <div key={school.school}>
              <p className="font-semibold">{school.degree}</p>
              <p className="text-neutral-600">
                {school.school}, {school.location}
              </p>
            </div>
          ))}
        </div>
        <div>
          <Heading>Certifications</Heading>
          {resume.certifications.map((cert) => (
            <p key={cert.name}>{cert.name}</p>
          ))}
          {resume.languages && (
            <>
              <div className="mt-2" />
              <Heading>Languages</Heading>
              <p>{resume.languages}</p>
            </>
          )}
        </div>
      </section>
    </article>
  );
};

export default Resume;
