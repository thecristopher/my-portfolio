import { store } from "../../app/store";
import { aboutApi } from "../../api/aboutApi";
import { projectsApi } from "../../api/projectsApi";
import { caseStudiesApi } from "../../api/caseStudiesApi";
import { contactApi } from "../../api/contactApi";
import { echo } from "../echo";
import { earnRunes } from "../runes";
import { buildResume, resumeFileName } from "./buildResume";

// what the page already has cached, the same data on screen right now
const readCachedData = () => {
  const state = store.getState();
  return {
    about: aboutApi.endpoints.getAbout.select()(state).data,
    projects: projectsApi.endpoints.getProjects.select()(state).data ?? [],
    caseStudies: caseStudiesApi.endpoints.getCaseStudies.select()(state).data ?? [],
    contact: contactApi.endpoints.getContact.select()(state).data,
  };
};

/**
 * The resume built from whatever the page is showing right now.
 * @returns {object} the output of buildResume
 */
export const currentResume = () => buildResume({ ...readCachedData(), site: window.location.host || "cristophercervantes.com" });

const download = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const anchor = Object.assign(document.createElement("a"), { href: url, download: fileName });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // give the browser a moment to start the download before the url goes away
  setTimeout(() => URL.revokeObjectURL(url), 4000);
};

let isExporting = false;

/**
 * Writes the resume to a real pdf and downloads it. The pdf library only loads the first time this runs.
 * Falls back to the print sheet if the pdf can't be made.
 * @returns {Promise<boolean>} whether a pdf was downloaded
 */
export const exportResume = async () => {
  if (isExporting) return false;
  isExporting = true;
  echo(":w resume.pdf  writing...");
  try {
    const [{ pdf }, { default: ResumeDocument }, { createElement }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("./ResumeDocument"),
      import("react"),
    ]);
    const resume = currentResume();
    const blob = await pdf(createElement(ResumeDocument, { resume })).toBlob();
    const fileName = resumeFileName(resume.name);
    download(blob, fileName);
    echo(`"${fileName}" written, ${Math.max(1, Math.round(blob.size / 1024))}K`, "success");
    earnRunes("resume", "resume");
    return true;
  } catch {
    echo("E212: Can't write the pdf here, opening the print dialog instead", "error");
    setTimeout(() => window.print(), 300);
    return false;
  } finally {
    isExporting = false;
  }
};
