import { centerOf, dotsPath, linePath, projectOnMap } from "./actions";
import { BAJA_COAST, WORLD } from "./world";

// everything the map scene draws, worked out once

export const MAP = { width: WORLD.rows[0].length, height: WORLD.rows.length };
export const LAND = dotsPath(WORLD.rows);
export const HOME = projectOnMap({ lat: 32.36, lon: -117.06 }, WORLD);

const COAST_POINTS = BAJA_COAST.map(([lat, lon]) => projectOnMap({ lat, lon }, WORLD));
export const COAST = linePath(COAST_POINTS);
export const BAJA = centerOf(COAST_POINTS);

// how many times bigger the map starts, so the peninsula fills most of the scene while its coast draws. a phone's map
// is a third as wide, so it starts a little closer, as close as it can without cutting the peninsula off
export const CLOSENESS = { wide: 9, narrow: 11 };

// the scroll, split into the story's beats: home lights up, the coast draws, the camera pulls back to the world, the
// routes fly to the countries, then the light spreads over every coast
export const BEATS = {
  // home lights up just before the scene pins, so it's already glowing when the map takes the screen
  home: [-0.05, 0],
  coast: [0.03, 0.17],
  pull: [0.17, 0.37],
  land: [0.22, 0.37],
  flights: [0.37, 0.56],
  light: [0.58, 0.86],
};

// the countries Grupo Tress' payroll runs in, each at its geographic center
export const COUNTRIES = [
  { name: "Mexico", ...projectOnMap({ lat: 23.6, lon: -102.5 }, WORLD) },
  { name: "the U.S.", ...projectOnMap({ lat: 39.8, lon: -98.6 }, WORLD) },
  { name: "Canada", ...projectOnMap({ lat: 56.1, lon: -106.3 }, WORLD) },
];

// the three chapters of the story. each place comes from that company's own description in the work history
export const STOPS = [
  { id: "home", company: "Systems Communications", place: "Rosarito and the border", beat: [0, 0.37] },
  { id: "countries", company: "Grupo Tress Internacional", place: "Mexico, the U.S. and Canada", beat: [0.37, 0.58] },
  { id: "world", company: "PSL Group", place: "Read all over the world", beat: [0.58, 1] },
];

// the lights you can open a card from. the worldwide one sits out in the open ocean, since its readers are everywhere
// rather than in one place
export const LIGHTS = [
  { key: "home", stop: "home", label: "Rosarito", x: HOME.x, y: HOME.y, appearsAt: 0.4 },
  ...COUNTRIES.map((country, index) => ({ key: country.name, stop: "countries", label: country.name, x: country.x, y: country.y, appearsAt: 0.45 + index * 0.04 })),
  { key: "world", stop: "world", label: "Worldwide", x: MAP.width * 0.12, y: MAP.height * 0.8, appearsAt: 0.7 },
];
