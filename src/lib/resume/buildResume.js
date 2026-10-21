import { cleanTechName, formatMonth, formatRange, hostnameFromUrl } from "../../actions";

export { formatMonth, formatRange };

// how the resume lists the skill groups, the order a hiring manager reads a stack in
export const SKILL_CATEGORY_ORDER = ["Languages", "Frontend", "Backend", "Cloud & DevOps", "Data", "AI"];

/**
 * The title a company knew me by last, with where I started there, the way a promotion reads on a resume.
 * Plain words instead of an arrow, so applicant tracking systems and the pdf's built in font both read it.
 * @param {string[]} roles titles, oldest first
 * @returns {string | null} like "Senior Developer (promoted from Developer)"
 */
export const formatRoles = (roles = []) => {
  if (roles.length === 0) return null;
  const latest = roles.at(-1);
  return roles.length === 1 ? latest : `${latest} (promoted from ${roles[0]})`;
};

/**
 * Groups self rated tools by category in reading order, strongest first inside each group.
 * @param {{ name: string, level: number, category?: string }[]} skillLevels the tools
 * @returns {{ category: string, items: string[] }[]} groups that have at least one tool
 */
export const groupSkills = (skillLevels = []) => {
  const groups = new Map(SKILL_CATEGORY_ORDER.map((category) => [category, []]));
  [...skillLevels]
    .sort((a, b) => b.level - a.level)
    .forEach((skill) => {
      const category = groups.has(skill.category) ? skill.category : "Other";
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(skill.name);
    });
  return [...groups].filter(([, items]) => items.length > 0).map(([category, items]) => ({ category, items }));
};

const professionalLinks = (contact) =>
  (contact?.socials ?? [])
    .filter((social) => social.name !== "Instagram")
    .map((social) => ({ label: social.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), url: social.url }));

const experienceFrom = (project) => ({
  company: project.title,
  website: hostnameFromUrl(project.url),
  title: formatRoles(project.roles),
  dates: formatRange(project.start, project.end),
  location: [project.location, project.work_mode].filter(Boolean).join(" · ") || null,
  teamSize: project.team_size ?? null,
  summary: project.description,
  bullets: project.highlights ?? [],
  stack: (project.technologies ?? []).map(cleanTechName),
});

const languageLine = (languages = []) =>
  languages.map((language) => (language.level ? `${language.name} (${language.level})` : language.name)).join(", ");

/**
 * Turns everything the API serves into the resume's sections, in the order an ATS and a recruiter expect.
 * @param {{ about?: object, projects?: object[], caseStudies?: object[], contact?: object, site?: string }} data
 * @returns {object} the resume, ready for the pdf and the print sheet
 */
export const buildResume = ({ about, projects = [], caseStudies = [], contact, site = "cristophercervantes.com" }) => ({
  name: about?.name ?? "Cristopher Cervantes",
  headline: about?.headline ?? about?.role ?? "",
  contactLine: [
    about?.location,
    contact?.email,
    ...professionalLinks(contact).map((link) => link.label),
    site,
  ].filter(Boolean),
  links: professionalLinks(contact),
  email: contact?.email ?? null,
  site,
  openTo: about?.open_to ?? null,
  summary: about?.summary ?? "",
  experience: projects.map(experienceFrom),
  projects: caseStudies.slice(0, 4).map((study) => ({
    title: study.title,
    context: `${study.company} · ${study.role}`,
    summary: study.summary,
    outcome: study.outcome,
    metrics: study.metrics ?? [],
  })),
  skills: groupSkills(about?.skill_levels),
  expertise: about?.expertise ?? [],
  education: (about?.education ?? []).map((school) => ({
    degree: school.degree,
    school: school.school,
    location: school.location,
    years: school.end_year ? String(school.end_year) : null,
  })),
  certifications: (about?.certifications ?? []).map((cert) => ({
    name: cert.name,
    issuer: cert.issuer,
    year: cert.year ?? null,
  })),
  languages: languageLine(about?.languages),
});

/**
 * The file name a downloaded resume gets.
 * @param {string} name the person's full name
 * @returns {string} like "Cristopher-Cervantes-Resume.pdf"
 */
export const resumeFileName = (name = "Resume") => `${name.trim().split(/\s+/).join("-")}-Resume.pdf`;
