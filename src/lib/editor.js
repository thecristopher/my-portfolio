export const LINE_HEIGHT = 28;

export const visibleRows = () => Math.floor((window.innerHeight - LINE_HEIGHT) / LINE_HEIGHT);

// the cursor line sits in the middle of the screen, the way scrolloff=999 feels in nvim
export const cursorLineAt = (scrollY) => Math.floor(scrollY / LINE_HEIGHT) + Math.floor(visibleRows() / 2) + 1;
