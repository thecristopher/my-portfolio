import { baseApi } from "./baseApi";

export const aboutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAbout: builder.query({
      query: () => "/about",
    }),
  }),
  overrideExisting: false,
});

export const { useGetAboutQuery } = aboutApi;
