import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
  }),
  // the cache starts filled from the build's snapshot, so every query still checks the API once on mount
  refetchOnMountOrArgChange: true,
  endpoints: () => ({}),
});
