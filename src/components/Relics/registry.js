import { lazy } from "react";
import { sound as scott } from "./ScottPilgrim/sound";
import { sound as pokeball } from "./Pokemon/sound";
import { sound as alchemy } from "./Fullmetal/sound";
import { sound as umbrella } from "./ResidentEvil/sound";
import { sound as magician } from "./DarkMagician/sound";
import { sound as airbender } from "./Avatar/sound";
import { sound as triforce } from "./Zelda/sound";
import { sound as hanafuda } from "./DemonSlayer/sound";
import { sound as spider } from "./SpiderMan/sound";
import { sound as grace } from "./EldenRing/sound";
import { sound as bat } from "./Batman/sound";
import { sound as d20 } from "./BaldursGate/sound";

// every relic's jingle, small enough to ship up front so it plays the instant the relic is touched
export const RELIC_SOUNDS = { scott, pokeball, alchemy, umbrella, magician, airbender, triforce, hanafuda, spider, grace, bat, d20 };

// the moments themselves only download the first time someone touches their relic
export const RELIC_EFFECTS = {
  scott: lazy(() => import("./ScottPilgrim/Effect")),
  pokeball: lazy(() => import("./Pokemon/Effect")),
  alchemy: lazy(() => import("./Fullmetal/Effect")),
  umbrella: lazy(() => import("./ResidentEvil/Effect")),
  magician: lazy(() => import("./DarkMagician/Effect")),
  airbender: lazy(() => import("./Avatar/Effect")),
  triforce: lazy(() => import("./Zelda/Effect")),
  hanafuda: lazy(() => import("./DemonSlayer/Effect")),
  spider: lazy(() => import("./SpiderMan/Effect")),
  grace: lazy(() => import("./EldenRing/Effect")),
  bat: lazy(() => import("./Batman/Effect")),
  d20: lazy(() => import("./BaldursGate/Effect")),
};
