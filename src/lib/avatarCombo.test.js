import { describe, expect, it } from "vitest";
import { COMBO_MOVES, isFinisher, landHit } from "./avatarCombo";

describe("landHit", () => {
  it("opens with a jab when Claire pokes the avatar for the first time", () => {
    expect(landHit([], 0)).toEqual({ clicks: [0], hit: 1, move: "punch" });
  });

  it("follows up with a kick when Inde pokes again right after", () => {
    expect(landHit([0], 600)).toEqual({ clicks: [0, 600], hit: 2, move: "kick" });
  });

  it("finishes with a shoryuken on Malenia's third poke and starts a fresh combo", () => {
    expect(landHit([0, 600], 1200)).toEqual({ clicks: [], hit: 3, move: "shoryuken" });
  });

  it("starts over with a jab after Claire takes a moment to reread Inde's note", () => {
    expect(landHit([0, 400], 3000)).toEqual({ clicks: [3000], hit: 1, move: "punch" });
  });

  it("lets the window stretch for a slower date night", () => {
    expect(landHit([0], 4000, 5000).move).toBe("kick");
  });
});

describe("isFinisher", () => {
  it("crowns the shoryuken as the move that ends the combo", () => {
    expect(isFinisher("shoryuken")).toBe(true);
  });

  it("keeps the jab and the kick as the warm up", () => {
    expect(COMBO_MOVES.filter(isFinisher)).toEqual(["shoryuken"]);
  });
});
