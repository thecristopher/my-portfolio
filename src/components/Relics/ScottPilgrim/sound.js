// Scott Pilgrim: two meaty hits and a K.O. crash, the coins spill out of the beaten backlog, then an 8 bit
// level up fanfare and a little extra life arpeggio, every beat landing with the comic panel it belongs to
export const sound = {
  wave: "square",
  volume: 0.045,
  notes: [
    // POW and BAM
    [-24, 0, 0.09, { wave: "triangle", slideTo: -40, volume: 0.3 }],
    [-24, 0.3, 0.09, { wave: "triangle", slideTo: -40, volume: 0.3 }],
    // K.O.
    [-26, 0.6, 0.45, { wave: "triangle", slideTo: -48, volume: 0.34 }],
    [-2, 0.6, 0.3, { wave: "sawtooth", slideTo: -26, volume: 0.05 }],
    // coins, the b to e blip every arcade player knows by heart
    [14, 1.5, 0.07],
    [19, 1.57, 0.2],
    [14, 1.72, 0.07],
    [19, 1.79, 0.2],
    [14, 1.94, 0.07],
    [19, 2.01, 0.3],
    // level up
    [3, 2.6, 0.08],
    [7, 2.68, 0.08],
    [10, 2.76, 0.08],
    [15, 2.84, 0.14],
    [10, 3.0, 0.08],
    [15, 3.08, 0.08],
    [19, 3.16, 0.6],
    [-9, 2.6, 0.38, { wave: "triangle", volume: 0.12 }],
    [-5, 2.84, 0.3, { wave: "triangle", volume: 0.12 }],
    [-9, 3.16, 0.6, { wave: "triangle", volume: 0.12 }],
    [-2, 3.16, 0.6, { wave: "triangle", volume: 0.08 }],
    // +1 life
    [22, 3.85, 0.06, { volume: 0.035 }],
    [26, 3.91, 0.06, { volume: 0.035 }],
    [29, 3.97, 0.06, { volume: 0.035 }],
    [34, 4.03, 0.3, { volume: 0.035 }],
  ],
  noises: [
    [0, 0.06, { filter: "lowpass", frequency: 1800, volume: 0.35 }],
    [0.3, 0.06, { filter: "lowpass", frequency: 1800, volume: 0.35 }],
    [0.6, 0.4, { filter: "lowpass", frequency: 1400, sweepTo: 200, volume: 0.4 }],
  ],
};
