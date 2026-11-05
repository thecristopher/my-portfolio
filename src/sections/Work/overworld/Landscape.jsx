import { memo, useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import { pixelsToPaths, spriteToPixels } from "../../../actions";
import { CLOUD, LAMP, PALM, SCENE, SKY_DISC, TREE } from "./art";
import {
  ART_HEIGHT,
  ART_PIXEL,
  GROUND_ROW,
  HORIZON_ROW,
  SHORE_ROW,
  cloudsAlong,
  layerWidth,
  rectPath,
  ridgeHeights,
  roadside,
  seededRandom,
  skyline,
  windowsOf,
  zoneAt,
} from "./actions";

const PROP_ART = { palm: PALM, tree: TREE, lamp: LAMP };

// each art's paths are worked out once and reused at every spot it stands
const pathCache = new Map();
const artPaths = (art) => {
  if (!pathCache.has(art)) pathCache.set(art, pixelsToPaths(spriteToPixels(art.rows, art.palette)));
  return pathCache.get(art);
};

const Placed = ({ art, x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    {artPaths(art).map(({ color, d }) => (
      <path key={color} d={d} fill={color} />
    ))}
  </g>
);

const Canvas = ({ width, className = "", children }) => (
  <svg
    width={width * ART_PIXEL}
    height={ART_HEIGHT * ART_PIXEL}
    viewBox={`0 0 ${width} ${ART_HEIGHT}`}
    shapeRendering="crispEdges"
    className={`absolute bottom-0 left-0 max-w-none ${className}`}
    aria-hidden="true"
  >
    {children}
  </svg>
);

const Clouds = memo(({ width }) => (
  <Canvas width={width} className="dark:opacity-25">
    {cloudsAlong(width, 21).map((cloud) => (
      <Placed key={cloud.x} art={CLOUD} x={cloud.x} y={cloud.y} />
    ))}
  </Canvas>
));

// only out at night, a scatter of single pixel stars
const Stars = memo(({ width }) => {
  const d = useMemo(() => {
    const random = seededRandom(77);
    return Array.from({ length: Math.round(width / 6) }, () => rectPath(Math.floor(random() * width), 2 + Math.floor(random() * 40), 1, 1)).join("");
  }, [width]);
  return (
    <Canvas width={width} className="hidden dark:block">
      <path d={d} fill="#f4efd9" />
    </Canvas>
  );
});

const Ridge = memo(({ width }) => {
  const { body, top } = useMemo(() => {
    const heights = ridgeHeights(width, 4);
    return {
      body: heights.map((height, x) => rectPath(x, HORIZON_ROW + 2 - height, 1, height)).join(""),
      top: heights.map((height, x) => rectPath(x, HORIZON_ROW + 2 - height, 1, 1)).join(""),
    };
  }, [width]);
  return (
    <Canvas width={width}>
      <path d={body} fill={SCENE.ridge} />
      <path d={top} fill={SCENE.ridgeTop} />
    </Canvas>
  );
});

// the Pacific off the coast, with a few crests catching the light
const Sea = memo(({ width }) => {
  const crests = useMemo(() => {
    const random = seededRandom(13);
    return Array.from({ length: Math.round(width / 4) }, () => rectPath(Math.floor(random() * width), HORIZON_ROW + 1 + Math.floor(random() * 14), 2, 1)).join("");
  }, [width]);
  return (
    <Canvas width={width}>
      <path d={rectPath(0, HORIZON_ROW, width, GROUND_ROW - HORIZON_ROW)} fill={SCENE.sea} />
      <path d={rectPath(0, HORIZON_ROW + 9, width, GROUND_ROW - HORIZON_ROW - 9)} fill={SCENE.seaDeep} />
      <path d={crests} fill={SCENE.crest} />
    </Canvas>
  );
});

const BUILDING_COLORS = {
  coast: { body: SCENE.house, top: SCENE.roof },
  city: { body: SCENE.block, top: SCENE.blockTop },
  offices: { body: SCENE.tower, top: SCENE.towerTop },
};

// groups every building by how it's painted, so the whole skyline is a handful of paths
const skylinePaths = (width) => {
  const paths = { coast: { body: "", top: "" }, city: { body: "", top: "" }, offices: { body: "", top: "" }, windows: "" };
  for (const building of skyline(width, 11)) {
    const roof = SHORE_ROW - building.height;
    paths[building.zone].body += rectPath(building.x, roof, building.width, building.height);
    paths[building.zone].top += rectPath(building.x - (building.zone === "coast" ? 1 : 0), roof - 1, building.width + (building.zone === "coast" ? 2 : 0), 2);
    paths.windows += windowsOf(building, SHORE_ROW)
      .map((spot) => rectPath(spot.x, spot.y, 1, 1))
      .join("");
  }
  return paths;
};

// the windows sit on their own canvas so they can glow at night while the walls go dark
const City = memo(({ width }) => {
  const paths = useMemo(() => skylinePaths(width), [width]);
  return (
    <>
      <Canvas width={width} className="dark:brightness-[.55]">
        {Object.entries(BUILDING_COLORS).map(([zone, colors]) => (
          <g key={zone}>
            <path d={paths[zone].body} fill={colors.body} />
            <path d={paths[zone].top} fill={colors.top} />
          </g>
        ))}
      </Canvas>
      <Canvas width={width} className="dark:drop-shadow-[0_0_2px_#ffcf6b]">
        <path d={paths.windows} fill="var(--ow-window)" />
      </Canvas>
    </>
  );
});

const Roadside = memo(({ width }) => (
  <Canvas width={width}>
    {roadside(width, 9).map((prop) => (
      <Placed key={prop.x} art={PROP_ART[prop.kind]} x={prop.x} y={GROUND_ROW - PROP_ART[prop.kind].rows.length} />
    ))}
  </Canvas>
));

const GROUND_COLORS = {
  coast: { fill: SCENE.sand, dot: SCENE.sandDot },
  city: { fill: SCENE.grass, dot: SCENE.grassDot },
  offices: { fill: SCENE.stone, dot: SCENE.stoneDot },
};

// the path Link walks: sand by the sea, grass through the city, paving stones at the offices
const groundPaths = (width) => {
  const paths = { coast: { fill: "", dot: "" }, city: { fill: "", dot: "" }, offices: { fill: "", dot: "" } };
  for (let x = 0; x < width; x += 1) {
    const zone = zoneAt(x / width);
    paths[zone].fill += rectPath(x, GROUND_ROW, 1, ART_HEIGHT - GROUND_ROW);
    for (let y = GROUND_ROW + 2; y < ART_HEIGHT; y += 1) if ((x * 31 + y * 17) % 13 === 0) paths[zone].dot += rectPath(x, y, 1, 1);
  }
  return paths;
};

const Ground = memo(({ width }) => {
  const paths = useMemo(() => groundPaths(width), [width]);
  return (
    <Canvas width={width} className="dark:brightness-[.6]">
      {Object.entries(GROUND_COLORS).map(([zone, colors]) => (
        <g key={zone}>
          <path d={paths[zone].fill} fill={colors.fill} />
          <path d={paths[zone].dot} fill={colors.dot} />
        </g>
      ))}
      <path d={rectPath(0, GROUND_ROW, width, 1)} fill={SCENE.edge} opacity="0.35" />
    </Canvas>
  );
});

// the far layers barely move and the path moves with the titles, so the world has depth as Link walks it
const LAYERS = [
  { key: "stars", factor: 0.02, Art: Stars },
  { key: "clouds", factor: 0.06, Art: Clouds },
  { key: "ridge", factor: 0.15, Art: Ridge, className: "dark:brightness-[.5]" },
  { key: "sea", factor: 0.3, Art: Sea, className: "dark:brightness-[.45]" },
  { key: "city", factor: 0.5, Art: City },
  { key: "roadside", factor: 0.75, Art: Roadside, className: "dark:brightness-[.6]" },
  { key: "ground", factor: 1, Art: Ground },
];

const Layer = ({ layer, trackX, viewport, track }) => {
  const x = useTransform(trackX, (value) => value * layer.factor);
  const width = Math.ceil(layerWidth(viewport, track, layer.factor) / ART_PIXEL);
  const { Art } = layer;
  return (
    <motion.div style={{ x }} className={`absolute inset-0 ${layer.className ?? ""}`}>
      <Art width={width} />
    </motion.div>
  );
};

// the sun hangs still in the corner of the sky by day, the moon by night
const DISC_PATH = pixelsToPaths(spriteToPixels(SKY_DISC.rows, { X: "disc" }))[0].d;

const SkyDisc = () => (
  <svg
    viewBox="0 0 10 10"
    shapeRendering="crispEdges"
    className="absolute top-4 right-[8%] size-[30px] fill-[#ffd84a] drop-shadow-[0_0_14px_#ffd84a] dark:fill-[#f1ecd6] dark:drop-shadow-[0_0_10px_#f1ecd6]"
    aria-hidden="true"
  >
    <path d={DISC_PATH} />
  </svg>
);

/**
 * The world behind Link: a sky, far hills, the sea, a skyline that goes from beach houses to office towers, the palms
 * and lamps by the road and the road itself, each sliding at its own speed with the track.
 * @param {{ trackX: import("framer-motion").MotionValue<number>, viewport: number, track: number }} props
 *   trackX is how far the row of titles has slid, viewport and track are their widths in px
 */
const Landscape = ({ trackX, viewport, track }) => (
  <div
    className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_bottom,#6cbcf0,#c4ebfb_70%)] [--ow-window:#d7f0fb] [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] dark:bg-[linear-gradient(to_bottom,#070b24,#2a1f4f_75%)] dark:[--ow-window:#ffcf6b]"
    aria-hidden="true"
  >
    <SkyDisc />
    {viewport > 0 && LAYERS.map((layer) => <Layer key={layer.key} layer={layer} trackX={trackX} viewport={viewport} track={track} />)}
  </div>
);

export default Landscape;
