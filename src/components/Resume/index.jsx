import { useGetAboutQuery } from "../../api/aboutApi";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetContactQuery } from "../../api/contactApi";
import { useGetSkillsQuery } from "../../api/skillsApi";
import { cleanTechName, hostnameFromUrl, splitParagraphs } from "../../actions";
import { CERTIFICATIONS, FULL_NAME, HOME, TIMEZONE } from "../../lib/profile";

const ResumeHeading = ({ children }) => (
  <h2 className="mb-2 border-b border-neutral-300 pb-1 text-[9pt] font-semibold tracking-[0.15em] text-neutral-500 uppercase">
    {children}
  </h2>
);

// never on screen. ctrl+p anywhere on the site prints this instead of the page: a plain one page resume built from
// the same api, so it can't fall out of date with the site
const Resume = () => {
  const { data: about } = useGetAboutQuery();
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: contact } = useGetContactQuery();
  const { data: skills = [] } = useGetSkillsQuery();
  const [lead] = splitParagraphs(about?.description);
  const otherTools = (about?.skill_levels ?? [])
    .map((tool) => tool.name)
    .filter((name) => !about.main_stack.includes(name));

  return (
    <article className="print-resume hidden bg-white font-sans text-[9pt] leading-snug text-neutral-900 print:block">
      <header className="mb-3">
        <h1 className="text-[22pt] leading-none font-semibold tracking-tight">{FULL_NAME}</h1>
        <p className="mt-1 text-[11pt]">{about?.role}</p>
        <p className="mt-1.5 flex flex-wrap gap-x-2 text-[8.5pt] text-neutral-600">
          <span>{HOME}</span>
          <span>·</span>
          <span>{TIMEZONE}</span>
          {contact && (
            <>
              <span>·</span>
              <span>{contact.email}</span>
              {contact.socials
                .filter((social) => social.name !== "Instagram")
                .map((social) => (
                  <span key={social.id}>· {social.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</span>
                ))}
            </>
          )}
        </p>
      </header>

      {lead && <p className="mb-3">{lead}</p>}

      <section className="mb-3">
        <ResumeHeading>Experience</ResumeHeading>
        <ul className="flex flex-col gap-2">
          {projects.map((project) => (
            <li key={project.title} className="break-inside-avoid">
              <p className="flex items-baseline justify-between gap-4">
                <span className="font-semibold">{project.title}</span>
                <span className="text-[8pt] text-neutral-500">{hostnameFromUrl(project.url)}</span>
              </p>
              <p>{project.description}</p>
              {project.featured !== false && project.detailed_description && (
                <p className="mt-0.5 text-neutral-700">{project.detailed_description}</p>
              )}
              <p className="mt-0.5 text-[8pt] text-neutral-500">{project.technologies.map(cleanTechName).join(" · ")}</p>
            </li>
          ))}
        </ul>
      </section>

      {skills.length > 0 && (
        <section className="mb-3 break-inside-avoid">
          <ResumeHeading>How I work</ResumeHeading>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1 text-[8.5pt]">
            {skills.map((skill) => (
              <li key={skill.title}>
                <span className="font-semibold">{skill.title}.</span> <span className="text-neutral-700">{skill.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid grid-cols-[2fr_1fr] gap-6 break-inside-avoid">
        {about && (
          <div>
            <ResumeHeading>Stack</ResumeHeading>
            <p>
              <span className="font-semibold">{about.main_stack.join(", ")}</span>
            </p>
            {otherTools.length > 0 && <p className="mt-0.5 text-neutral-700">Also: {otherTools.join(", ")}</p>}
          </div>
        )}
        <div>
          <ResumeHeading>Certified</ResumeHeading>
          {CERTIFICATIONS.map((cert) => (
            <p key={cert}>{cert}</p>
          ))}
        </div>
      </section>

      <p className="mt-3 text-[7.5pt] text-neutral-400">
        Printed from {typeof window !== "undefined" ? window.location.host : "my portfolio"}, where the same data lives with more personality.
      </p>
    </article>
  );
};

export default Resume;
