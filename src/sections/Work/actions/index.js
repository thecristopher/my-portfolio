import { careerCommits } from "../../../actions";

const STEP_LABELS = { init: "First job", join: "Joined", promote: "Promoted" };

/**
 * Every title I held as a step on the timeline, oldest first so it reads left to right like a career does.
 * @param {object[]} projects the jobs as the API serves them, newest first
 * A job with no titles on file shows the company as the title, and points at its chapter underneath instead of
 * naming the company twice.
 * @returns {{ key: string, label: string, title: string, subtitle: string, years: string | null, targetId: string, isCurrent: boolean }[]}
 */
export const careerSteps = (projects = []) =>
  careerCommits(projects)
    .map((commit) => {
      const title = commit.type === "promote" ? commit.message : commit.message.split(" @ ")[0];
      return { commit, title, subtitle: title === commit.company ? "Read the chapter" : commit.company };
    })
    .map(({ commit, title, subtitle }) => ({
      key: commit.hash,
      label: STEP_LABELS[commit.type],
      title,
      subtitle,
      years: commit.years,
      targetId: commit.targetId,
      isCurrent: commit.isHead,
    }))
    .reverse();

/**
 * The line under a filter: how many jobs shipped with the tool.
 * @param {string} tech the tool picked
 * @param {number} matches jobs that used it
 * @param {number} total every job
 * @returns {string} like "3 of 5 jobs shipped with React"
 */
export const filterSummary = (tech, matches, total) => `${matches} of ${total} ${total === 1 ? "job" : "jobs"} shipped with ${tech}`;

/**
 * How small a card in the deck ends up once every card after it has slid over: a little smaller per card on top.
 * @param {number} index the card's place in the deck, 0 is the first
 * @param {number} count how many cards the deck has
 * @returns {number} the scale it settles at, 1 for the last card
 */
export const stackedScale = (index, count) => 1 - (count - 1 - index) * 0.05;

/**
 * How a metric fills its ring, told honestly: a percentage fills to its value, a multiplier draws one full lap split
 * into that many equal parts, anything else draws a single full lap.
 * @param {string | number} value like "40%", "3×" or "12"
 * @returns {{ fill: number, segments: number }} fill from 0 to 1, segments from 1 to 12
 */
export const metricRing = (value) => {
  const text = String(value).trim();
  const percent = text.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (percent) return { fill: Math.min(Number(percent[1]), 100) / 100, segments: 1 };
  const times = text.match(/^(\d+(?:\.\d+)?)\s*[x×]$/i);
  if (times) return { fill: 1, segments: Math.min(Math.max(Math.round(Number(times[1])), 1), 12) };
  return { fill: 1, segments: 1 };
};

// the golden angle spreads points around a center so none ever line up, the way seeds sit in a sunflower
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Where each person sits once the team gathers: a tight round cluster, the first one in the middle.
 * @param {number} count how many people
 * @returns {{ x: number, y: number }[]} offsets from the center, inside a circle of radius 1
 */
export const clusterDots = (count) =>
  Array.from({ length: count }, (_, index) => {
    const radius = count > 1 ? Math.sqrt(index / (count - 1)) : 0;
    const angle = index * GOLDEN_ANGLE;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });

/**
 * Where each person starts before the team gathers: spread out in a wide line, the same spot every visit.
 * @param {number} count how many people
 * @returns {{ x: number, y: number }[]} offsets from the center, x from -3 to 3 and y from -1 to 1
 */
export const scatterDots = (count) =>
  Array.from({ length: count }, (_, index) => ({
    x: count > 1 ? (index / (count - 1)) * 6 - 3 : 0,
    y: Math.sin(index * 2.4) * 0.9,
  }));
