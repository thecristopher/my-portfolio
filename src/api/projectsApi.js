import { baseApi } from "./baseApi";

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => "/projects",
    }),
  }),
  overrideExisting: false,
});

export const { useGetProjectsQuery } = projectsApi;
