import { usePageReady } from "../../lib/pageReady";

/**
 * Whether the opening may start playing: the name swinging up, the role rising and the photo fading in. Every entrance
 * in the Hero waits on this one switch, so it plays as the loader's iris opens instead of behind the loader.
 * @returns {boolean} true once the page is showing
 */
export const useEntrance = () => usePageReady();
