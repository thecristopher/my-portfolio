/**
 * What I do now and where, from the newest job the API lists.
 * @param {{ title: string, roles?: string[] }[]} projects the jobs, newest first
 * @param {string} fallbackRole the role to show while the jobs are on their way
 * @returns {string} like "Engineering Manager at PSL Group"
 */
export const currentPosition = (projects = [], fallbackRole = "") => {
  const current = projects[0];
  if (!current) return fallbackRole;
  const role = current.roles?.at(-1) ?? fallbackRole;
  return role ? `${role} at ${current.title}` : current.title;
};

/**
 * An AWS certification without the words every one of them repeats.
 * @param {string} name like "AWS Certified Developer – Associate"
 * @returns {string} like "AWS Developer – Associate"
 */
export const shortCertName = (name = "") => name.replace("AWS Certified ", "AWS ");
