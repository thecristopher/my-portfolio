/**
 * The relics in the order the log lists them: the found ones first, then the rest, each group in page order.
 * @param {string[]} ids every relic id, in page order
 * @param {string[]} found the ids found so far
 * @returns {string[]} the ids to list
 */
export const relicLogOrder = (ids = [], found = []) => [...ids.filter((id) => found.includes(id)), ...ids.filter((id) => !found.includes(id))];

/**
 * The name a visitor knows a section by, as the nav shows it.
 * @param {{ id: string, title: string }[]} sections the sections on the page
 * @param {string} sectionId like "work"
 * @returns {string} the nav title, or the id when the nav has not arrived yet
 */
export const sectionTitleFor = (sections = [], sectionId = "") => sections.find((section) => section.id === sectionId)?.title ?? sectionId;
