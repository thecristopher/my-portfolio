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

// the scroll, split into the story's beats: home lights up, the coast draws while the trip hops between the cities I
// worked in, the camera pulls back to the world, the routes fly to the countries, then the light spreads over every coast
export const BEATS = {
  // home lights up just before the scene pins, so it's already glowing when the map takes the screen
  home: [-0.05, 0],
  coast: [0.03, 0.2],
  // every job, oldest first, hopping between Tijuana and Rosarito in the loupe while the camera is still close
  closeUp: [0.06, 0.27],
  pull: [0.3, 0.45],
  land: [0.34, 0.45],
  flights: [0.45, 0.62],
  light: [0.64, 0.88],
};

// Tijuana and Rosarito are 20 km apart, a few pixels on a world map, so the loupe draws the corridor up close: the
// border on top, the Pacific on the left and the free road down the coast. in its own 0 to 100 box, north up
export const LOUPE = {
  cities: {
    Tijuana: { x: 66, y: 28 },
    Rosarito: { x: 38, y: 78 },
  },
  border: 12,
  coast: "M24 0C26 14 27 26 30 40S28 62 30 76 34 92 33 100",
  road: "M66 28C58 40 48 52 44 62S39 72 38 78",
};

// the countries Grupo Tress' payroll runs in, each at its geographic center
export const COUNTRIES = [
  { name: "Mexico", ...projectOnMap({ lat: 23.6, lon: -102.5 }, WORLD) },
  { name: "the U.S.", ...projectOnMap({ lat: 39.8, lon: -98.6 }, WORLD) },
  { name: "Canada", ...projectOnMap({ lat: 56.1, lon: -106.3 }, WORLD) },
];

// the three chapters of the story. each place comes from that company's own description in the work history
export const STOPS = [
  { id: "home", company: "Systems Communications", place: "Rosarito and the border", beat: [0, 0.45] },
  { id: "countries", company: "Grupo Tress Internacional", place: "Mexico, the U.S. and Canada", beat: [0.45, 0.64] },
  { id: "world", company: "PSL Group", place: "Read all over the world", beat: [0.64, 1] },
];

// the lights you can open a card from. the worldwide one sits out in the open ocean, since its readers are everywhere
// rather than in one place
export const LIGHTS = [
  { key: "home", stop: "home", label: "Rosarito", x: HOME.x, y: HOME.y, appearsAt: 0.48 },
  ...COUNTRIES.map((country, index) => ({ key: country.name, stop: "countries", label: country.name, x: country.x, y: country.y, appearsAt: 0.53 + index * 0.04 })),
  { key: "world", stop: "world", label: "Worldwide", x: MAP.width * 0.12, y: MAP.height * 0.8, appearsAt: 0.76 },
];
