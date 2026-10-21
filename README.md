# cristophercervantes.com

My personal portfolio, drawn from my Neovim config. The config is Eldentree: Catppuccin recolored for whichever Elden Ring region you wake up in, with a dashboard, banners, a rune tally and a Site of Grace to rest at. The site is that editor, laid out like an Apple product page: huge type, scenes that hold still while you scroll, frosted glass and bento tiles.

Live at [cristophercervantes.com](https://cristophercervantes.com). The content comes from [my-portfolio-service](https://github.com/thecristopher/my-portfolio-service), a small FastAPI backend.

## For recruiters

- The **Résumé** button is on every screen. It writes a real PDF in the browser (one column, standard section names, selectable text and working links, so applicant tracking systems read it cleanly), built from the same API as the page, so it's never out of date. `space r`, `:resume` and the hub's `r` do the same. `⌘P` prints the same resume.
- The hero's `profile.ts` and the bento under it hold the quick facts: role, years, location, timezone, stack, certifications and languages.
- Experience reads one company per chapter with the wins as resume bullets, and Projects walks through challenge, approach and outcome.

## What's in it

The first visit opens on Eldentree's hub: my name shimmering in the region's gold, embers rising and a player message writing itself in, then the area's name rolls across the screen like entering it in the game. Any key skips it.

- **Hero** with my name in Geist's variable weights and the pixel me (Scott Pilgrim style) in the tall grass. Scroll and the name sinks back while `profile.ts` rises out of the page.
- **About**: the philosophy, held still while it lights up word by word; the page at a glance as bento tiles; the story with my portrait; and how I lead, as four vim marks.
- **Experience**: a `git log --graph` of every title I've held, then one chapter per company, the masthead pinned while the wins light up as they pass. Click any tool in a stack, or in the skills report, and the jobs that never used it fade back.
- **Projects**: case studies on a rail that slides sideways while you scroll down.
- **Skills**: how I lead as a deck of cards, and every tool as a `:checkhealth` report grouped by category.
- **Side quests**: my public repos live from GitHub, browsed like a Telescope picker.
- **Education**: the degree and the AWS badges.
- **Contact**: the closing line filling with gold, every way to reach me and a terminal that logs in and out.

The page paints with real content straight away: every build saves what the API serves into `src/data/snapshot.json`, the page starts from that, and then asks the API for anything newer.

### Regions

The colorschemes are Eldentree's six regions with their exact palettes: Leyndell, Haligtree, Raya Lucaria, Caelid, Mohgwyn and Ordina. Like in nvim, the first visit wakes up in Leyndell and every visit after that rolls one you didn't see last time. Pick one in `:region` (Telescope repaints the page live while you move through the list, and puts it back if you leave) and it stays pinned. The new region spreads out in a circle from where you clicked, and the browser bar and tab icon follow it.

### The editor bits

| Key | What it does |
| --- | --- |
| `space` | The leader. which-key shows what it unlocks: résumé, yank my email, telescope, neo-tree, regions, quest log and more |
| `:` or `⌘K` | Telescope: every section, project, command and region, with a preview |
| `f` | Follow a hint: every link and button on screen gets a short label, type it to click |
| `1` to `8` | Jump to a section by its buffer number |
| `]]` / `[[` | Next / previous section |
| `j` / `k`, `d` / `u` | Scroll a line, or half a page |
| `gg` / `G` | Jump to top / bottom |
| `/` | Search the page. `n` / `N` step through the matches, `esc` or `:noh` clears them |
| `\e` | Toggle neo-tree. In it, `j` / `k` move, `l` opens, `h` closes, `q` hides it |

The bufferline across the top has a tab per section on wide screens. The lualine at the bottom shows the mode, the buffer, the relic score, the rune tally (exploring pays runes, once per thing), my local time in Rosarito with a guess at what I'm doing, the region and where in the page you are. Leave the page alone long enough and it rests at a Site of Grace, the way Eldentree does. Some commands are hidden, if you know what to type.

### Relics

Twelve franchises I grew up with left a relic on the page, out in the open where its line fits it, each breathing softly until it's touched. Each one plays its own full screen moment with a jingle synthesized on the fly (no audio files shipped), and the quest log (`:quests`, `space q` or the score in the statusline) keeps what you found and says where the rest wait. Finds from before the redesign carry over. One of them asks the API to roll for you.

## Stack

- React 19 + Vite 6
- Tailwind CSS 4
- Framer Motion for every animation, Lenis for smooth scrolling
- Redux Toolkit Query for API calls
- @react-pdf/renderer for the resume, loaded only when someone asks for it
- Vitest for tests

## Running it locally

You need Node and Yarn. Start the [backend](https://github.com/thecristopher/my-portfolio-service) first, then point the frontend at it:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
yarn install
yarn dev
```

The app runs at `http://localhost:5173`, which is the origin the backend allows for local development. The frontend reads fields the backend added with this redesign (`/case-studies`, resume bullets, principles), so deploy the backend first.

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn test` | Run the test suite |
| `yarn lint` | Lint everything |
| `yarn snapshot` | Save what the API serves into `src/data/snapshot.json` (also runs before every build) |
| `yarn build` | Build for production into `dist/` |
| `yarn preview` | Serve the production build locally |

## Where things live

```
src/
  sections/     one folder per page section, split into smaller pieces where it grows
  components/   the editor chrome (Bufferline, Statusline, Telescope, WhichKey, FileTree, Hub, Banner, Rest) and shared UI
  components/Relics/
                one folder per relic: index.jsx (the object on the page), Effect.jsx (its moment), sound.js (its jingle)
  lib/          regions, relics, runes, banners, sound, the resume (lib/resume) and other self contained pieces
  api/          RTK Query endpoints for the backend and GitHub
  actions/      small pure helpers, with tests next to them
  hooks/        vim keys, the region, active section tracking
```

### Editing the pixel avatar

The sprite lives in `src/lib/avatarSprite.js` as plain text, one character per pixel, with a palette mapping each character to a color. Tweaking him is just editing text.
