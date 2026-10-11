import { baseApi } from "./baseApi";

export const GITHUB_USER = "thecristopher";

// the service talks to GitHub and picks each pitch from the README, so the cards just render
export const githubApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRepos: builder.query({
      query: () => "/github/repos",
    }),
  }),
  overrideExisting: false,
});

export const { useGetReposQuery } = githubApi;
