import { baseApi } from "./baseApi";

export const rollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoll: builder.query({
      query: () => "/roll",
    }),
  }),
  overrideExisting: false,
});

export const { useLazyGetRollQuery } = rollApi;
