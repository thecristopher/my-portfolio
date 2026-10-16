# cristophercervantes.com

My personal portfolio. It looks and behaves like a Neovim buffer, has a tiny Scott Pilgrim style pixel me living in the hero, and hides a few secrets for anyone who pokes around.

Live at [cristophercervantes.com](https://cristophercervantes.com). The content comes from [my-portfolio-service](https://github.com/thecristopher/my-portfolio-service), a small FastAPI backend.

## What's in it

- **Hero** with the pixel avatar, a blueprint grid that lights up under your cursor and buttons that lean toward it. He drops in, bounces on his toes in a fighting stance, blinks, glances around, waves hello, hops when you scroll and throws a jab when you poke him.
- **Manifesto**, followed by an endless ribbon of every tool I've shipped with. It speeds up, flips and leans with your scroll.
- **About** with the bio, a portrait and a `profile.json` that types itself out.
- **Work**, opened by a `git log --graph` of my career (every title I've held is a commit, the first job is the root commit), then a stack of cards for every place I've shipped software. Click any tool in a card's stack, or in the skills' `:checkhealth`, and the jobs that never used it fade back.
- **Side quests**, my public GitHub repos pulled live from the GitHub API. Repos without a description show the first paragraph of their README instead.
- **Skills**, how I lead and the tools I reach for. Every tool in the report greps the work history for it.
- **Contact**, a terminal that logs you in and out. It can be skipped, and it prints straight away on a return visit.

### The editor bits

| Key | What it does |
| --- | --- |
| `j` / `k` | Scroll down / up |
| `d` / `u` | Half page down / up |
| `gg` / `G` | Jump to top / bottom |
| `:` or `⌘K` | Open the command line |

From the command line you can jump to any section, copy my email, mute the sound, open the quest log, or switch between five colorschemes (`kanagawa`, `catppuccin`, `rose-pine`, `ember` and the light `lotus`, which a light system gets by default). In browsers with View Transitions, the new colorscheme spreads out in a circle from wherever you clicked.

On wide screens the sections live in a file tree down the left edge, drawn like nvim-tree: the folder for the section you're reading opens by itself and the cursorline follows the file on screen. Narrower screens keep the floating buffer tabs at the top.

The statusline at the bottom shows the current mode, buffer and scroll position, my local time in Rosarito with a guess at what I'm doing, and a sound toggle. On a phone, tapping the mode opens the command line.

### Secrets

There are 10 of them hidden around the page, each with its own full screen moment and a little synth jingle generated on the fly (no audio files shipped). The page remembers which ones you found, and each one leaves behind a tooltip that mashes its franchise up with my career, plus a row of pips in every secret's color so you can see how many are left. After the first find, the score shows up in the statusline and opens a quest log (`:quests`). Its riddles stay locked for the first minute and a half, so the hunt stays a hunt. Some commands are hidden too, if you know what to type. I'm not saying where any of them are.

## Stack

- React 19 + Vite 6
- Tailwind CSS 4
- Framer Motion for every animation
- Redux Toolkit Query for API calls
- Lenis for smooth scrolling
- Vitest for tests

## Running it locally

You need Node and Yarn. Start the [backend](https://github.com/thecristopher/my-portfolio-service) first, then point the frontend at it:

```bash
echo "VITE_API_URL=http://localhost:8000" > .env
yarn install
yarn dev
```

The app runs at `http://localhost:5173`, which is the origin the backend allows for local development.

| Command | What it does |
| --- | --- |
| `yarn dev` | Start the dev server |
| `yarn test` | Run the test suite |
| `yarn lint` | Lint everything |
| `yarn build` | Build for production into `dist/` |
| `yarn preview` | Serve the production build locally |

## Where things live

```
src/
  sections/     one folder per page section (Hero, About, Work, GitHub, Skills, Contact...)
  components/   shared UI, including PixelAvatar and the Secrets
  api/          RTK Query endpoints for the backend and GitHub
  actions/      small pure helpers, with tests next to them
  lib/          the avatar sprite, sounds, secrets, motion presets
  hooks/        vim keys, colorschemes, active section tracking
```

### Editing the pixel avatar

The sprite lives in `src/lib/avatarSprite.js` as plain text, one character per pixel, with a palette mapping each character to a color. Tweaking him is just editing text. The wave is three hand drawn frames in `WAVE_FRAMES` that play out and back, and the blink and smile are small overlays painted on top of the base sprite.
