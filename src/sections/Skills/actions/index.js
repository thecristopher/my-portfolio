import { SKILL_CATEGORY_ORDER } from "../../../lib/resume/buildResume";

export const MAX_LEVEL = 5;

/**
 * The tools grouped by category in the résumé's order, any tool without one at the end under "Other".
 * @param {{ name: string, category?: string }[]} tools the tools in the API's relevance order
 * @returns {{ category: string, tools: object[] }[]} only the categories that have tools
 */
export const groupByCategory = (tools = []) =>
  [...SKILL_CATEGORY_ORDER, "Other"]
    .map((category) => ({ category, tools: tools.filter((tool) => (tool.category ?? "Other") === category) }))
    .filter((group) => group.tools.length > 0);

/**
 * Which of the five dots a level lights.
 * @param {number} level from 0 to MAX_LEVEL
 * @returns {boolean[]} one entry per dot, true when lit
 */
export const levelDots = (level = 0) => Array.from({ length: MAX_LEVEL }, (_, index) => index < level);

/**
 * Splits the tools into the two marquee rows, alternating so both rows mix the main stack with the rest.
 * @param {string[]} tools tool names in relevance order
 * @returns {[string[], string[]]} the first row and the second
 */
export const splitMarqueeRows = (tools = []) => [tools.filter((_, index) => index % 2 === 0), tools.filter((_, index) => index % 2 === 1)];
