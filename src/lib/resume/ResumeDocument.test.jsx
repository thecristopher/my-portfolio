import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
import snapshot from "../../data/snapshot.json";
import ResumeDocument from "./ResumeDocument";
import { buildResume } from "./buildResume";

const resume = buildResume({
  about: snapshot.getAbout,
  projects: snapshot.getProjects,
  caseStudies: snapshot.getCaseStudies,
  contact: snapshot.getContact,
});

describe("ResumeDocument", () => {
  it("writes a real pdf from the data the site ships with", async () => {
    const buffer = await renderToBuffer(<ResumeDocument resume={resume} />);
    expect(buffer.subarray(0, 4).toString()).toBe("%PDF");
  }, 20000);

  it("still writes when Claire has only filled in her name", async () => {
    const buffer = await renderToBuffer(<ResumeDocument resume={buildResume({ about: { name: "Claire Redfield" } })} />);
    expect(buffer.length).toBeGreaterThan(1000);
  }, 20000);
});
