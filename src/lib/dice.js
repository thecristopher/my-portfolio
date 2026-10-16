// the perception check the d20 rolls. the API rolls it, and if it can't answer in time the page rolls the same check
export const PERCEPTION_DC = 8;

export const localRoll = (random = Math.random) => {
  const roll = Math.floor(random() * 20) + 1;
  const success = roll >= PERCEPTION_DC;
  const message = roll === 20 ? "Natural 20! Critical success." : roll === 1 ? "Natural 1. Critical failure." : success ? "Check passed. Nice roll." : "Check failed. Roll again?";
  return { roll, dc: PERCEPTION_DC, success, message };
};

// the big word Baldur's Gate stamps under the die once it settles
export const verdictFor = ({ roll, success }) => {
  if (roll === 20) return { label: "Critical Success", tone: "critical" };
  if (roll === 1) return { label: "Critical Failure", tone: "fumble" };
  return success ? { label: "Success", tone: "success" } : { label: "Failure", tone: "failure" };
};
