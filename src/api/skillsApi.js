import { baseApi } from "./baseApi";

export const skillsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSkills: builder.query({
      query: () => "/skills",
    }),
  }),
  overrideExisting: false,
});

export const { useGetSkillsQuery } = skillsApi;
