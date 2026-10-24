import hisense from "../assets/images/companies/hisense-mark.png";
import grupoTress from "../assets/images/companies/grupo-tress-mark.png";
import pslGroup from "../assets/images/companies/psl-group-mark.png";

// the mark of every company I worked at that has one on file, keyed by the job title the API serves. each mark is a
// flat shape the page tints in the brand's color
export const COMPANY_LOGOS = {
  "PSL Group": { src: pslGroup, color: "#c9a15e" },
  "Grupo Tress Internacional": { src: grupoTress, color: "#f47b20" },
  Hisense: { src: hisense, color: "#00a19c" },
};
