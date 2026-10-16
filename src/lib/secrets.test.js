import { describe, expect, it } from "vitest";
import { HINT_UNLOCK_MS, SECRETS, SECRET_IDS, hintFor, isComplete, migrateFound, secretCount } from "./secrets";
import { bufferNameFor } from "../actions";

describe("migrateFound", () => {
  it("turns an old lit bonfire into a discovered grace", () => {
    expect(migrateFound(["triforce", "bonfire"])).toEqual(["triforce", "grace"]);
  });

  it("does not count the grace twice", () => {
    expect(migrateFound(["bonfire", "grace"])).toEqual(["grace"]);
  });
});

describe("secretCount", () => {
  it("keeps score out of every secret on the page", () => {
    expect(secretCount(["triforce", "grace"])).toBe(`2/${SECRET_IDS.length} secrets found`);
  });
});

describe("secret list", () => {
  it("gives every secret a quip and a pip color", () => {
    SECRET_IDS.forEach((id) => {
      expect(SECRETS[id].quip).toBeTruthy();
      expect(SECRETS[id].color).toMatch(/^#[0-9a-f]{6}$/);
    });
  });

  it("counts the hunt as complete only once every secret is found", () => {
    expect(isComplete(SECRET_IDS)).toBe(true);
    expect(isComplete(["grace"])).toBe(false);
  });
});

describe("quest log entries", () => {
  it("names every secret and says where it hides", () => {
    const buffers = ["home", "manifesto", "about", "work", "education", "github", "skills", "contact"].map(bufferNameFor);
    for (const id of SECRET_IDS) {
      expect(SECRETS[id].name).toBeTruthy();
      expect(SECRETS[id].riddle).toBeTruthy();
      expect(buffers).toContain(SECRETS[id].where);
    }
  });
});

describe("hintFor", () => {
  it("keeps the riddle locked at first and counts down", () => {
    expect(hintFor("bat", 0)).toEqual({ isLocked: true, secondsLeft: HINT_UNLOCK_MS / 1000 });
  });

  it("gives the riddle away once the wait is over", () => {
    expect(hintFor("bat", HINT_UNLOCK_MS)).toMatchObject({ isLocked: false, where: "contact.sh" });
  });

  it("knows nothing about a secret that doesn't exist", () => {
    expect(hintFor("hollow-knight", HINT_UNLOCK_MS)).toBeNull();
  });
});
