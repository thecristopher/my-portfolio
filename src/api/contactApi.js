import { baseApi } from "./baseApi";

export const contactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getContact: builder.query({
      query: () => "/contact",
    }),
  }),
  overrideExisting: false,
});

export const { useGetContactQuery } = contactApi;
