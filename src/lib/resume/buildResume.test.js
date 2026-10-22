import { describe, expect, it } from "vitest";
import { buildResume, formatMonth, formatRange, formatRoles, groupSkills, resumeFileName } from "./buildResume";

const about = {
  name: "Malenia",
  headline: "Blade of Miquella",
  summary: "Never known defeat.",
  location: "Elphael, Haligtree",
  open_to: null,
  languages: [{ name: "Spanish", level: "Native" }, { name: "English", level: null }],
  skill_levels: [
    { name: "React", level: 4, category: "Frontend" },
    { name: "TypeScript", level: 5, category: "Languages" },
    { name: "Next.js", level: 5, category: "Frontend" },
    { name: "Love Letters", level: 5, category: "Romance" },
  ],
  education: [{ degree: "B.S. in Swordsmanship", school: "Haligtree Academy", location: "Elphael", end_year: 2016 }],
  certifications: [{ name: "Unalloyed Gold Needle", issuer: "Miquella", year: null }],
};

const contact = {
  email: "malenia@haligtree.co",
  socials: [
    { id: 1, name: "LinkedIn", url: "https://www.linkedin.com/in/malenia/" },
    { id: 2, name: "Instagram", url: "https://www.instagram.com/malenia/" },
  ],
};

const projects = [
  {
    title: "TerraSave",
    url: "https://www.terrasave.org/",
    description: "Claire helped people find their way home.",
    roles: ["Intern", "Lead"],
    highlights: ["Shipped the T-virus antidote on a Friday"],
    technologies: ["React", "Docker (optional)"],
    start: "2019-03",
    end: null,
    location: "Raccoon City",
    work_mode: "Remote",
  },
];

describe("formatMonth", () => {
  it("prints Inde's anniversary month the way resumes do", () => {
    expect(formatMonth("2021-02")).toBe("Feb 2021");
  });

  it("keeps a bare year as is", () => {
    expect(formatMonth("2016")).toBe("2016");
  });

  it("returns null for a date still waiting to be filled in", () => {
    expect(formatMonth(null)).toBeNull();
  });
});

describe("formatRange", () => {
  it("says Present while Claire still works at TerraSave", () => {
    expect(formatRange("2019-03", null)).toBe("Mar 2019 – Present");
  });

  it("hides the dates until the start is known", () => {
    expect(formatRange(null, "2020")).toBeNull();
  });
});

describe("formatRoles", () => {
  it("leads with Claire's newest title and celebrates where she started", () => {
    expect(formatRoles(["Developer", "Senior Developer"])).toBe("Senior Developer (promoted from Developer)");
  });

  it("names every step Malenia climbed, newest first", () => {
    expect(formatRoles(["Senior Application Developer", "Tech Lead", "Engineering Manager"])).toBe(
      "Engineering Manager (promoted from Tech Lead and Senior Application Developer)"
    );
  });

  it("keeps a single title plain", () => {
    expect(formatRoles(["Intern"])).toBe("Intern");
  });

  it("returns null when there are no titles yet", () => {
    expect(formatRoles([])).toBeNull();
  });
});

describe("groupSkills", () => {
  it("lists languages before frontend and puts the strongest tool first", () => {
    expect(groupSkills(about.skill_levels).slice(0, 2)).toEqual([
      { category: "Languages", items: ["TypeScript"] },
      { category: "Frontend", items: ["Next.js", "React"] },
    ]);
  });

  it("files Malenia's love letters under Other, since Romance is not a known category", () => {
    expect(groupSkills(about.skill_levels).at(-1)).toEqual({ category: "Other", items: ["Love Letters"] });
  });
});

describe("buildResume", () => {
  const resume = buildResume({ about, projects, caseStudies: [], contact });

  it("keeps Instagram for friends and leaves it off Malenia's resume", () => {
    expect(resume.contactLine).toEqual(["Elphael, Haligtree", "malenia@haligtree.co", "linkedin.com/in/malenia", "cristophercervantes.com"]);
  });

  it("turns Claire's role into dated resume bullets", () => {
    expect(resume.experience[0]).toMatchObject({
      company: "TerraSave",
      title: "Lead (promoted from Intern)",
      dates: "Mar 2019 – Present",
      location: "Raccoon City · Remote",
      bullets: ["Shipped the T-virus antidote on a Friday"],
      stack: ["React", "Docker"],
    });
  });

  it("puts Claire's case study first under her company", () => {
    const withStudy = buildResume({
      about,
      projects,
      contact,
      caseStudies: [{ title: "Antidote", company: "TerraSave", summary: "A cure for Raccoon City.", metrics: [{ value: "1", label: "city saved" }] }],
    });
    expect(withStudy.experience[0].bullets).toEqual(["Antidote: A cure for Raccoon City (1 city saved)", "Shipped the T-virus antidote on a Friday"]);
  });

  it("prints a language level only when it is known", () => {
    expect(resume.languages).toBe("Spanish (Native), English");
  });

  it("builds patiently while the API has not answered yet", () => {
    expect(() => buildResume({})).not.toThrow();
  });
});

describe("resumeFileName", () => {
  it("names Inde's download after them", () => {
    expect(resumeFileName("Inde Navarrete")).toBe("Inde-Navarrete-Resume.pdf");
  });
});
