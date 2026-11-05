import { createStore } from "./store";

// whether the loader has finished and the page is showing. anything with an entrance waits for this, so it plays where
// the visitor can see it instead of behind the loader
const pageReady = createStore(false);

/** Marks the page as showing. The loader calls it the moment its iris starts opening. */
export const markPageReady = () => pageReady.set(true);

/** @returns {boolean} whether the page is showing, read outside React */
export const isPageReady = () => pageReady.get();

/** @returns {boolean} whether the page is showing, live inside a component */
export const usePageReady = () => pageReady.use();
