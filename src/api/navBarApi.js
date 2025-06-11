import { baseApi } from "./baseApi";

export const navBarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNavBar: builder.query({
      query: () => "/navbar",
    }),
  }),
  overrideExisting: false,
});

export const { useGetNavBarQuery } = navBarApi;
