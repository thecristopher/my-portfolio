import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "../api/baseApi";
import "../api/navBarApi";
import "../api/aboutApi";
import "../api/projectsApi";
import "../api/caseStudiesApi";
import "../api/skillsApi";
import "../api/contactApi";
import "../api/githubApi";
import snapshot from "../data/snapshot.json";

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

// the page paints straight away from the snapshot saved at build time, then every query still asks the API and
// swaps in anything that changed since
for (const [endpoint, data] of Object.entries(snapshot)) {
  store.dispatch(baseApi.util.upsertQueryData(endpoint, undefined, data));
}
