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
 * Lays the tools out in rings around a center, the deepest ones closest in: level 5 on the inner ring, level 4 on the
 * middle one and everything else on the outer one. Each ring spreads its tools evenly, starting at its own angle so
 * no two rings line up.
 * @param {{ name: string, level: number }[]} tools the tools
 * @returns {{ ring: number, tools: { name: string, level: number, angle: number }[] }[]} rings from inner to outer, empty ones left out
 */
export const orbitLayout = (tools = []) => {
  const ringOf = (level) => (level >= 5 ? 0 : level === 4 ? 1 : 2);
  return [0, 1, 2]
    .map((ring) => {
      const members = tools.filter((tool) => ringOf(tool.level) === ring);
      const start = ring * 23;
      return { ring, tools: members.map((tool, index) => ({ ...tool, angle: start + (index * 360) / members.length })) };
    })
    .filter((ring) => ring.tools.length > 0);
};
