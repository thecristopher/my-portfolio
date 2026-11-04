# cristophercervantes.com

My personal portfolio, laid out like an Apple product page: huge type, scenes that pin while you scroll through them, and light and dark mode that follow your system until you pick one.

Live at [cristophercervantes.com](https://cristophercervantes.com). The content comes from [my-portfolio-service](https://github.com/thecristopher/my-portfolio-service), a small FastAPI backend.

## For recruiters

- One **Résumé** button in the bar at the top of every screen (and in the menu on phones). It writes a real PDF in the browser (one column, standard section names, selectable text and working links, so applicant tracking systems read it cleanly), built from the same API as the page, so it's never out of date. `⌘P` prints the same resume.
- The **At a glance** tiles in About carry the whole profile: years, where I'm based and the time there right now, current role, certifications, degree, what I lead with and languages.

## What's in it

Every section is its own scene:

- **Hero**: my name swings up out of the floor over a slow sunset aurora, then my photo rises and grows until it owns the screen while the green of the wall spreads out from behind it. A warm lamp follows the cursor across the photo.
- **About**: the first paragraph pins to the screen and lights up word by word as you scroll, then the at a glance tiles, with the sun (or the moon) sitting on its arc over Rosarito right now.
- **Experience**: every title I've held on a row that slides sideways as you scroll down, then one chapter per company with its masthead pinned beside the wins, and its case studies stacking into a deck as you scroll. Click any tool in a stack, or in the skills, and the jobs that never used it fade back.
- **Skills**: every tool in orbit around a core, the deepest ones closest in, the rings turning against each other as you scroll. Hover one and the core names it. Then every category graded from one to five dots.
- **Side projects**: Eldentree, my Neovim config, on a laptop whose lid opens as it scrolls in, then my public repos live from GitHub on a shelf that slides past while the scene stays pinned.
- **Contact**: the sun sets into the sea off Rosarito while the closing line fills with its light, then every way to reach me.

The page paints with real content straight away: every build saves what the API serves into `src/data/snapshot.json`, the page starts from that, and then asks the API for anything newer. Anyone who asks their system for reduced motion gets every section without the pinned scenes.

### Light and dark

The theme follows the system until the sun or moon in the bar picks one, and then it sticks. `index.html` applies it before the first paint so there's never a flash of the wrong one. The colors are tokens in `src/index.css`, light by default and repeated under `[data-theme="dark"]`.

### Relics

Eleven franchises I grew up with left a relic somewhere in the sections: tiny, nearly see through, with no label, so only a careful eye finds them. Each one is a clean vector emblem and plays its own full screen moment, drawn in the same language as the page (light that draws itself, blooms, keynote type) in its franchise's colors, with a jingle synthesized on the fly (no audio files shipped), told through my own career in that franchise's voice. After the first find a counter shows up in the bar and opens the relic log, which keeps what you found and gives a riddle for the rest. Finds from before the redesign carry over. One of them asks the API to roll for you. I'm not saying where any of them are. The sound switch lives in the footer.

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
  sections/     one folder per page section, with its pure helpers and their tests in actions/
  components/   the nav, footer, toast, relic log and shared UI (section headings, scroll lit text, cards)
  components/Relics/
                one folder per relic: index.jsx (the object on the page), Effect.jsx (its moment), sound.js (its jingle)
  lib/          theme, relics, sound, motion helpers, the resume (lib/resume) and other self contained pieces
  hooks/        pinned sideways tracks, scroll ranges, active section tracking
  api/          RTK Query endpoints for the backend and GitHub
  actions/      small pure helpers, with tests next to them
```

The pixel avatar (`src/components/PixelAvatar`, sprite in `src/lib/avatarSprite.js`) is off the page for now, the photo leads instead.
