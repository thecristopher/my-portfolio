import { baseApi } from "./baseApi";

export const GITHUB_USER = "thecristopher";

// straight from GitHub's public API, so a new repo shows up here without touching the backend
export const githubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepos: builder.query({
      query: () => `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`,
    }),
    // the raw markdown, only asked for when a repo has no description to show instead
    getReadme: builder.query({
      query: (repoName) => ({
        url: `https://api.github.com/repos/${GITHUB_USER}/${repoName}/readme`,
        headers: { Accept: "application/vnd.github.raw" },
        responseHandler: "text",
      }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetReposQuery, useGetReadmeQuery } = githubApi;
