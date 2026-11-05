import { describe, expect, it } from "vitest";
import { BEATS, COUNTRIES, LIGHTS, OFFICES, ROUTE_DRAW, STOPS } from "./mapStory";

describe("map story", () => {
  it("flies to every PSL office Claire could visit Inde from", () => {
    expect(OFFICES.map((office) => office.name)).toEqual(["Querétaro", "New York", "Montreal", "London", "India", "Kuala Lumpur"]);
  });

  it("keeps Grupo Tress in Mexico, the U.S. and Canada", () => {
    expect(COUNTRIES.map((country) => country.name)).toEqual(["Mexico", "the U.S.", "Canada"]);
  });

  it("sends Malenia's office routes out one after the other inside their beat", () => {
    const starts = OFFICES.map((office) => office.at);
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
    expect(starts[0]).toBeGreaterThanOrEqual(BEATS.offices[0]);
    expect(starts.at(-1) + ROUTE_DRAW).toBeLessThanOrEqual(BEATS.offices[1] + ROUTE_DRAW);
  });

  it("lights each office only once its route has landed", () => {
    const london = LIGHTS.find((light) => light.key === "London");
    expect(london).toMatchObject({ stop: "world", appearsAt: OFFICES[3].at + ROUTE_DRAW });
  });

  it("names every PSL office in the world chapter", () => {
    const world = STOPS.find((stop) => stop.id === "world");
    OFFICES.forEach((office) => expect(world.place).toContain(office.name));
  });
});
