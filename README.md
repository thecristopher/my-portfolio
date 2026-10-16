# cristophercervantes.com

My personal portfolio. It looks and behaves like a Neovim buffer, has a tiny Scott Pilgrim style pixel me living in the hero, and hides a few secrets for anyone who pokes around.

Live at [cristophercervantes.com](https://cristophercervantes.com). The content comes from [my-portfolio-service](https://github.com/thecristopher/my-portfolio-service), a small FastAPI backend.

## What's in it

The first visit opens on an nvim dashboard that boots and then pushes through into the page. On a mouse, the cursor is vim's block: it inverts whatever it sits on, wraps itself around anything you can click the way iPadOS does, and thins into the insert bar over a text field. A wash of colored light sits behind the whole page and takes on each section's colors as you reach it.

Every section has its own seal (its buffer name running around a ring that turns as you scroll, with a mark that draws itself in the middle), its number set huge and hollow behind the header, a label that decodes itself like a terminal, and its own way of moving:

- **Hero** with my name set in Geist's variable weights, the letters bulking up as the cursor passes (on a phone, a wave rolls through them once), the pixel avatar, a blueprint grid that lights up under your cursor and buttons that lean toward it. He drops in, bounces on his toes in a fighting stance, blinks, glances around, waves hello, hops when you scroll and throws a jab when you poke him. Scroll away and the grid tips back into a floor running off to the horizon.
- **Philosophy**, which holds the page still while the sentence lights up word by word, with a reading line filling underneath. After it, two ribbons run in opposite directions, every tool I've shipped with and how I like to work, racing and leaning with how fast you scroll.
- **About** with the bio, a portrait that drifts inside its frame as you scroll, and a `profile.json` that types itself out.
- **Work**, opened by a `git log --graph` of my career whose branch line draws itself as you read (every title I've held is a commit, the first job is the root commit), then a stack of cards for every place I've shipped software. Click any tool in a card's stack, or in the skills' `:checkhealth`, and the jobs that never used it fade back.
- **Education**, the degree and the AWS badges, with light glinting across each badge like a foil seal.
- **Side quests**, my public GitHub repos pulled live from the GitHub API. On wide screens the page pins and the repos slide past sideways as you keep scrolling. Repos without a description show the first paragraph of their README instead.
- **Skills**, how I lead and the tools I reach for, dealt onto the page like cards. Every tool in the report greps the work history for it.
- **Contact**, where the closing line fills with the sunset as you scroll to it, and a terminal logs you in and out. It can be skipped, and it prints straight away on a return visit.

The page paints with real content straight away: every build saves what the API serves into `src/data/snapshot.json`, the page starts from that, and then asks the API for anything newer.

### The editor bits

| Key | What it does |
| --- | --- |
| `j` / `k` | Scroll down / up |
| `d` / `u` | Half page down / up |
| `gg` / `G` | Jump to top / bottom |
| `/` | Search the page. `n` / `N` step through the matches, `esc` or `:noh` clears them |
| `\e` | Focus the file tree. In it, `j` / `k` move, `l` opens, `h` closes or climbs to the folder, `esc` goes back |
| `:` or `⌘K` | Open the command line |

From the command line you can jump to any section, search, copy my email, mute the sound, open the quest log, or switch between six colorschemes. The default is `rosarito`, the Pacific after dark with the sunset in the accent, made for this site; a light system gets the light `lotus` instead, and `kanagawa`, `catppuccin`, `rose-pine` and `ember` are there too. In browsers with View Transitions, the new colorscheme spreads out in a circle from wherever you clicked, and the browser bar and tab icon follow it.

On wide screens the sections live in a file tree down the left edge, drawn like nvim-tree: the folder for the section you're reading opens by itself and the cursorline follows the file on screen. On smaller screens the menu up top opens the same tree.

The statusline at the bottom shows the current mode, buffer and scroll position, the search and its match count, my local time in Rosarito with a guess at what I'm doing, and a sound toggle. On a phone, tapping the mode opens the command line.

### Secrets

There are 11 of them hidden around the page, each with its own full screen moment and a little synth jingle generated on the fly (no audio files shipped). The page remembers which ones you found, and each one leaves behind a tooltip that mashes its franchise up with my career, plus a row of pips in every secret's color so you can see how many are left. After the first find, the score shows up in the statusline and opens a quest log (`:quests`). Its riddles stay locked for the first minute and a half, so the hunt stays a hunt. One of them asks the API to roll for you. Some commands are hidden too, if you know what to type. I'm not saying where any of them are.

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
| `yarn snapshot` | Save what the API serves into `src/data/snapshot.json` (also runs before every build) |
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
