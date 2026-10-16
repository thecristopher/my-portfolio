// the tab icon is a tiny prompt drawn in the colorscheme's own colors
export const faviconSvg = ({ ink, accent, fg }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${ink}"/>` +
  `<path d="M16 22l12 10-12 10" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<rect x="32" y="40" width="16" height="5" rx="2.5" fill="${fg}"/></svg>`;

export const faviconHref = (colors) => `data:image/svg+xml,${encodeURIComponent(faviconSvg(colors))}`;

// paints the phone's browser bar and the tab icon to match whatever colorscheme is on the page now
export const syncBrowserChrome = () => {
  const style = getComputedStyle(document.documentElement);
  const read = (name) => style.getPropertyValue(`--color-${name}`).trim();
  const colors = { ink: read("ink"), accent: read("accent"), fg: read("fg") };
  if (!colors.ink) return;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", colors.ink);
  document.querySelector('link[rel="icon"]')?.setAttribute("href", faviconHref(colors));
};
