import { describe, expect, it } from "vitest";
import { frameAtDistance, frameWindow, nextFrame, playLength } from ".";

const LOVE_NOTE = { frames: 4, loop: false, fps: 8 };
const DANCE = { frames: 3, loop: true, fps: 10 };

const sheet = {
  cell: { width: 10, height: 20 },
  columns: 4,
  animations: { idle: { row: 0 }, dance: { row: 1 }, wave: { row: 2 } },
};

describe("nextFrame", () => {
  it("given Claire mid dance, expect the next step of it", () => {
    expect(nextFrame(1, DANCE)).toEqual({ frame: 2, isDone: false });
  });

  it("given the last step of a looping dance, expect Malenia back at the first one", () => {
    expect(nextFrame(2, DANCE)).toEqual({ frame: 0, isDone: false });
  });

  it("given the last frame of Inde's love note, expect it held there and marked done", () => {
    expect(nextFrame(3, LOVE_NOTE)).toEqual({ frame: 3, isDone: true });
  });
});

describe("frameWindow", () => {
  it("given the third frame of the second row, expect the atlas slid left and up by whole cells", () => {
    expect(frameWindow(sheet, "dance", 2).backgroundPosition).toBe("-20px -20px");
  });

  it("given a scale of 2, expect the window and the whole atlas doubled", () => {
    expect(frameWindow(sheet, "wave", 1, 2)).toEqual({
      width: 20,
      height: 40,
      backgroundSize: "80px 120px",
      backgroundPosition: "-20px -80px",
    });
  });
});

describe("playLength", () => {
  it("given four frames at eight per second, expect Claire's note to land in half a second", () => {
    expect(playLength(LOVE_NOTE)).toBe(500);
  });
});

describe("frameAtDistance", () => {
  const STROLL = { frames: 4, stride: 5 };

  it("given Claire standing at the start of her walk to Inde, expect the first frame", () => {
    expect(frameAtDistance(0, STROLL)).toBe(0);
  });

  it("given Malenia a little past two strides along, expect the third frame", () => {
    expect(frameAtDistance(11, STROLL)).toBe(2);
  });

  it("given Inde walking far enough to finish the loop, expect the frames starting over", () => {
    expect(frameAtDistance(21, STROLL)).toBe(0);
  });

  it("given a walk back the other way, expect the same frames as walking forward", () => {
    expect(frameAtDistance(-11, STROLL)).toBe(2);
  });
});
