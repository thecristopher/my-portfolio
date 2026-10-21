import { baseApi } from "./baseApi";

export const caseStudiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCaseStudies: builder.query({
      query: () => "/case-studies",
    }),
  }),
  overrideExisting: false,
});

export const { useGetCaseStudiesQuery } = caseStudiesApi;
