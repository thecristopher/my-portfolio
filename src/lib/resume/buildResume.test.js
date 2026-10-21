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
    { name: "Scarlet Rot", level: 5, category: "Waterfowl" },
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
    title: "Umbrella Corporation",
    url: "https://www.umbrella.com/",
    description: "Claire kept the lab honest.",
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

  it("returns null for a date nobody filled in", () => {
    expect(formatMonth(null)).toBeNull();
  });
});

describe("formatRange", () => {
  it("says Present while Claire still works there", () => {
    expect(formatRange("2019-03", null)).toBe("Mar 2019 – Present");
  });

  it("hides the dates when the start is unknown", () => {
    expect(formatRange(null, "2020")).toBeNull();
  });
});

describe("formatRoles", () => {
  it("leads with Claire's newest title and says where she started", () => {
    expect(formatRoles(["Developer", "Senior Developer"])).toBe("Senior Developer (promoted from Developer)");
  });

  it("keeps a single title plain", () => {
    expect(formatRoles(["Intern"])).toBe("Intern");
  });

  it("returns null without titles", () => {
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

  it("keeps a tool with an unknown category under Other", () => {
    expect(groupSkills(about.skill_levels).at(-1)).toEqual({ category: "Other", items: ["Scarlet Rot"] });
  });
});

describe("buildResume", () => {
  const resume = buildResume({ about, projects, caseStudies: [], contact });

  it("leaves Instagram off Malenia's resume", () => {
    expect(resume.contactLine).toEqual(["Elphael, Haligtree", "malenia@haligtree.co", "linkedin.com/in/malenia", "cristophercervantes.com"]);
  });

  it("turns Claire's role into dated resume bullets", () => {
    expect(resume.experience[0]).toMatchObject({
      company: "Umbrella Corporation",
      title: "Lead (promoted from Intern)",
      dates: "Mar 2019 – Present",
      location: "Raccoon City · Remote",
      bullets: ["Shipped the T-virus antidote on a Friday"],
      stack: ["React", "Docker"],
    });
  });

  it("prints a language level only when it's known", () => {
    expect(resume.languages).toBe("Spanish (Native), English");
  });

  it("survives the API not having answered yet", () => {
    expect(() => buildResume({})).not.toThrow();
  });
});

describe("resumeFileName", () => {
  it("names Inde's download after her", () => {
    expect(resumeFileName("Inde Navarrete")).toBe("Inde-Navarrete-Resume.pdf");
  });
});
