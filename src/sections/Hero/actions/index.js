/**
 * When each beat of the opening plays, as slices of the pinned scroll from 0 to 1: the name leaves, the photo grows
 * into the stage, the page dims to the photo's green, and the story lands on the photo last.
 */
export const HERO_BEATS = {
  title: [0, 0.3],
  grow: [0, 0.55],
  stage: [0.25, 0.55],
  caption: [0.55, 0.8],
};

/**
 * The story half of the API's headline, without the job title it opens with, since the title already sits above the name.
 * @param {string} headline like "Engineering Manager & Tech Lead. Nine years of shipping software..."
 * @returns {string} the sentences after the first, empty when there are none
 */
export const headlineStory = (headline = "") =>
  (headline ?? "")
    .split(". ")
    .slice(1)
    .join(". ")
    .trim();
