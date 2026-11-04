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
