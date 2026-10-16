// the mark at the center of each section's seal, drawn from lucide's icons (ISC) so they share one stroke style.
// circles stay circles, framer draws both with pathLength
export const EMBLEMS = {
  // who I am: a fingerprint
  about: [
    ["path", { d: "M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" }],
    ["path", { d: "M14 13.12c0 2.38 0 6.38-1 8.88" }],
    ["path", { d: "M17.29 21.02c.12-.6.43-2.3.5-3.02" }],
    ["path", { d: "M2 12a10 10 0 0 1 18-6" }],
    ["path", { d: "M21.8 16c.2-2 .131-5.354 0-6" }],
    ["path", { d: "M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" }],
    ["path", { d: "M8.65 22c.21-.66.45-1.32.57-2" }],
    ["path", { d: "M9 6.8a6 6 0 0 1 9 5.2v2" }],
  ],
  // where it shipped: a branch merging back in
  work: [
    ["circle", { cx: 5, cy: 6, r: 3 }],
    ["path", { d: "M5 9v6" }],
    ["circle", { cx: 5, cy: 18, r: 3 }],
    ["path", { d: "M12 3v18" }],
    ["circle", { cx: 19, cy: 6, r: 3 }],
    ["path", { d: "M16 15.7A9 9 0 0 0 19 9" }],
  ],
  // what's certified: a rosette
  education: [
    ["circle", { cx: 12, cy: 8, r: 6 }],
    ["path", { d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" }],
  ],
  // side quests: a compass
  github: [
    ["circle", { cx: 12, cy: 12, r: 10 }],
    ["path", { d: "m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z" }],
  ],
  // the tools: a radar sweeping for them
  skills: [
    ["path", { d: "M19.07 4.93A10 10 0 0 0 6.99 3.34" }],
    ["path", { d: "M2.29 9.62A10 10 0 1 0 21.31 8.35" }],
    ["path", { d: "M16.24 7.76A6 6 0 1 0 8.23 16.67" }],
    ["path", { d: "M17.99 11.66A6 6 0 0 1 15.77 16.67" }],
    ["circle", { cx: 12, cy: 12, r: 2 }],
    ["path", { d: "m13.41 10.59 5.66-5.66" }],
  ],
  // reach out: a tower on the air
  contact: [
    ["path", { d: "M4.9 16.1C1 12.2 1 5.8 4.9 1.9" }],
    ["path", { d: "M7.8 4.7a6.14 6.14 0 0 0-.8 7.5" }],
    ["circle", { cx: 12, cy: 9, r: 2 }],
    ["path", { d: "M16.2 4.8c2 2 2.26 5.11.8 7.47" }],
    ["path", { d: "M19.1 1.9a9.96 9.96 0 0 1 0 14.1" }],
    ["path", { d: "M9.5 18h5" }],
    ["path", { d: "m8 22 4-11 4 11" }],
  ],
};
