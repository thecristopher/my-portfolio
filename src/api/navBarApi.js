import { baseApi } from "./baseApi";
import { pageLinks } from "../actions";

export const navBarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNavBar: builder.query({
      query: () => "/navbar",
    }),
  }),
  overrideExisting: false,
});

export const { useGetNavBarQuery } = navBarApi;

// one shared empty list, so the section ids only change when the nav actually arrives
const NO_LINKS = [];

/**
 * The nav links for the sections the page renders, the list every buffer, tree and picker reads.
 * @returns {{ title: string, url: string }[]} the links in nav order, empty until the nav arrives
 */
export const usePageLinks = () => {
  const { data } = useGetNavBarQuery();
  return data ? pageLinks(data) : NO_LINKS;
};
