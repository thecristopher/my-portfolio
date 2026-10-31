# cristophercervantes.com

My personal portfolio, drawn from my Neovim config. The config is Eldentree: Catppuccin recolored for whichever Elden Ring region you wake up in, with a dashboard, banners, a rune tally and a Site of Grace to rest at. The site is that editor, laid out like an Apple product page: huge type, scenes that hold still while you scroll, frosted glass and bento tiles.

Live at [cristophercervantes.com](https://cristophercervantes.com). The content comes from [my-portfolio-service](https://github.com/thecristopher/my-portfolio-service), a small FastAPI backend.

## For recruiters

- One **Résumé** button, in the bar at the top of every screen. It writes a real PDF in the browser (one column, standard section names, selectable text and working links, so applicant tracking systems read it cleanly), built from the same API as the page, so it's never out of date. `space r` and `:resume` call the same function, and `⌘P` prints the same resume.
- The hero's `profile.ts` is the greeter: the whole profile at a glance (role, current company, years, location and timezone, stack, what I lead with, certifications, degree, languages and email). After it, each section tells one part in full and only once: About the story, Experience the roles with each case study under its company, Skills the tools. Education and certifications live in `profile.ts` and the PDF. The PDF follows the same rule: each case study is a bullet under its company.

## What's in it

The very first visit opens on Eldentree's hub: my name shimmering in the region's gold, embers rising and a player message writing itself in. Any key skips it, and returning visitors go straight to the page.

- **Hero** with my name in Geist's variable weights and the pixel me (Scott Pilgrim style) in the tall grass, with `profile.ts` right under it.
- **About**: the story in my own words next to my portrait.
- **Experience**: a `git log --graph` of every title I've held, then one chapter per company, the masthead pinned beside its wins and its case studies. Each case study leads with the result and keeps the challenge and approach one click away. Click any tool in a stack, or in the skills report, and the jobs that never used it fade back.
- **Skills**: every tool as a `:checkhealth` report grouped by category.
- **Side quests**: Eldentree, the nvim config this page is drawn from, pinned as the main quest, then my public repos live from GitHub, browsed like a Telescope picker.
- **Contact**: the closing line filling with gold, every way to reach me and a terminal that logs in and out.

The page paints with real content straight away: every build saves what the API serves into `src/data/snapshot.json`, the page starts from that, and then asks the API for anything newer.

### Regions

The colorschemes are Eldentree's six regions with their exact palettes: Leyndell, Haligtree, Raya Lucaria, Caelid, Mohgwyn and Ordina. Like in nvim, the first visit wakes up in Leyndell and every visit after that rolls one you didn't see last time. Pick one in `:region` (Telescope repaints the page live while you move through the list, and puts it back if you leave) and it stays pinned. Each region plays its own synthesized sound when you arrive, the new palette spreads out in a circle from where you clicked, and the browser bar and tab icon follow it.

### The editor bits

| Key | What it does |
| --- | --- |
| `space` | The leader. which-key shows what it unlocks: résumé, yank my email, telescope, regions, quest log and more |
| `:` or `⌘K` | Telescope: every section, project, command and region, with a preview. Keyboard only, there's no button for it |
| `f` | Follow a hint: every link and button on screen gets a short label, type it to click |
| `1` to `6` | Jump to a section by its buffer number |
| `]]` / `[[` | Next / previous section |
| `j` / `k`, `d` / `u` | Scroll a line, or half a page |
| `gg` / `G` | Jump to top / bottom |
| `/` | Search the page. `n` / `N` step through the matches, `esc` or `:noh` clears them |

The bar across the top has a tab per section on wide screens, and a menu with the same list on small ones. The lualine at the bottom shows the mode, the buffer, the relic score, the rune tally (exploring pays runes, once per thing), my local time in Rosarito with a guess at what I'm doing, the region and where in the page you are. Leave the page alone long enough and it rests at a Site of Grace, the way Eldentree does. Some commands are hidden, if you know what to type.

### Relics

Thirteen franchises I grew up with left a relic somewhere in the sections: tiny, nearly see through, with no label, no glow and no cursor change, so only a careful eye finds them. Each one plays its own full screen moment with a jingle synthesized on the fly (no audio files shipped), told through my own career in that franchise's voice. A 16 bit counter in the top right ticks up on every find, and the moment holds on its last frame until you press Continue, so there's time to read it. After the first find, the score shows up in the statusline and opens the quest log (`:quests`), which keeps what you found and gives a riddle for the rest. Finds from before the redesign carry over. One of them asks the API to roll for you. I'm not saying where any of them are.

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

The app runs at `http://localhost:5173`, which is the origin the backend allows for local development. The frontend reads fields the backend added with this redesign (`/case-studies` and the resume bullets), so deploy the backend first.

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
  components/   the editor chrome (Bufferline, Statusline, Telescope, WhichKey, Hub, Banner, Rest) and shared UI
  components/Relics/
                one folder per relic: index.jsx (the object on the page), Effect.jsx (its moment), sound.js (its jingle)
  lib/          regions, relics, runes, banners, sound, the resume (lib/resume) and other self contained pieces
  api/          RTK Query endpoints for the backend and GitHub
  actions/      small pure helpers, with tests next to them
  hooks/        vim keys, the region, active section tracking
```

### Editing the pixel avatar

The sprite lives in `src/lib/avatarSprite.js` as plain text, one character per pixel, with a palette mapping each character to a color. Tweaking him is just editing text.
