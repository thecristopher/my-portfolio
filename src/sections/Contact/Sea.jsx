import { useEffect, useRef } from "react";
import { RIPPLE_SQUASH, dripPoint, isFarEnough, reflectionShift, reflectionStrength, rippleAt } from "./actions";

const SUN_AT = 0.7;
const STREAK = { gap: 14, height: 6, pieces: 7 };
const MOVE_RIPPLE = { gap: 26, size: 70 };
const SPLASH_SIZE = 150;
const DRIP = { everyMs: 900, size: 38 };
const MAX_RIPPLES = 40;
const REFLECTION_MAX = 416;
const NO_CALM = { current: null };

// the theme's own sunset color, read again every so often so a theme switch reaches the canvas too
const readSunColor = (canvas) => getComputedStyle(canvas).getPropertyValue("--color-sunset-1").trim() || "#ff9a3d";

const fitToScreen = (canvas) => {
  const ratio = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height };
};

// how wide the reflection is and how far down it reaches on a sea of this size
const reflectionBox = (size) => ({
  center: size.width * SUN_AT,
  span: Math.min(0.5 * Math.min(window.innerWidth, window.innerHeight), REFLECTION_MAX),
  depth: size.height * 0.7,
});

// the sun's reflection as stripes on the water, each stripe cut into pieces so a ripple can push them apart
const drawReflection = (context, size, strength, time, rings, color) => {
  const { span, depth } = reflectionBox(size);
  context.fillStyle = color;
  for (let y = 0; y < depth; y += STREAK.gap) {
    const width = span * (1 - (y / depth) * 0.35);
    const piece = width / STREAK.pieces;
    const left = size.width * SUN_AT - width / 2;
    context.globalAlpha = (1 - y / depth) * strength * 0.85;
    for (let index = 0; index < STREAK.pieces; index += 1) {
      const x = left + index * piece;
      const shift = reflectionShift({ x: x + piece / 2, y: y + STREAK.height / 2 }, time, rings);
      context.fillRect(x + shift, y, piece - 1, STREAK.height);
    }
  }
};

const drawRings = (context, rings, color) => {
  context.lineWidth = 1.2;
  for (const ring of rings) {
    context.globalAlpha = ring.alpha * 0.55;
    context.strokeStyle = color;
    context.beginPath();
    context.ellipse(ring.x, ring.y, ring.radius, ring.radius * RIPPLE_SQUASH, 0, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = ring.alpha * 0.35;
    context.strokeStyle = "rgb(255 244 214)";
    context.beginPath();
    context.ellipse(ring.x, ring.y, ring.radius * 0.7, ring.radius * 0.7 * RIPPLE_SQUASH, 0, 0, Math.PI * 2);
    context.stroke();
  }
};

// whether the cursor is over an element, like the pier, that the water shouldn't ripple under
const isOver = (element, event) => {
  if (!element) return false;
  const box = element.getBoundingClientRect();
  return event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
};

// the ripples the cursor leaves, a bigger splash on a click, and a slow drip so the sea is never perfectly still
const useRipples = (canvasRef, calmRef) => {
  const ripples = useRef([]);

  useEffect(() => {
    let last = null;
    const add = (point, size) => {
      ripples.current = [...ripples.current.slice(-MAX_RIPPLES + 1), { ...point, size, born: performance.now() }];
    };
    const onSea = (event) => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (!bounds) return null;
      const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      const isInside = point.x >= 0 && point.y >= 0 && point.x <= bounds.width && point.y <= bounds.height;
      return isInside && !isOver(calmRef.current, event) ? point : null;
    };
    const move = (event) => {
      const point = onSea(event);
      if (!point || !isFarEnough(last, point, MOVE_RIPPLE.gap)) return;
      last = point;
      add(point, MOVE_RIPPLE.size);
    };
    const splash = (event) => {
      const point = onSea(event);
      if (point) add(point, SPLASH_SIZE);
    };
    const drip = setInterval(() => {
      const bounds = canvasRef.current?.getBoundingClientRect();
      if (bounds) add(dripPoint(Math.random(), Math.random(), reflectionBox(bounds)), DRIP.size);
    }, DRIP.everyMs);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", splash, { passive: true });
    return () => {
      clearInterval(drip);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", splash);
    };
  }, [canvasRef, calmRef]);

  return ripples;
};

/**
 * The sea under the sunset, drawn live: the sun's reflection breaking apart wherever the cursor stirs the water, the
 * ripples spreading out flat the way they look from the beach, and a splash on a click. Nothing ripples over the pier.
 * @param {{ progress: import("framer-motion").MotionValue<number>, calmRef?: import("react").RefObject<Element> }} props
 *   progress is how far the sunset has gone and dims the reflection, calmRef is the pier the ripples stay off
 */
const Sea = ({ progress, calmRef = NO_CALM }) => {
  const canvasRef = useRef(null);
  const ripples = useRipples(canvasRef, calmRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    let size = fitToScreen(canvas);
    let color = readSunColor(canvas);
    let frame = 0;
    let request = 0;
    let isOnScreen = false;
    const observer = new ResizeObserver(() => (size = fitToScreen(canvas)));
    observer.observe(canvas);

    const draw = (time) => {
      // the loop rests while the sea is off screen and picks up again when it comes back
      if (!isOnScreen) {
        request = 0;
        return;
      }
      const context = canvas.getContext("2d");
      frame += 1;
      if (frame % 60 === 0) color = readSunColor(canvas);
      const rings = ripples.current.map((ripple) => rippleAt(ripple, time)).filter(Boolean);
      ripples.current = ripples.current.filter((ripple) => time - ripple.born < 2000);
      context.clearRect(0, 0, size.width, size.height);
      drawReflection(context, size, reflectionStrength(progress.get()), time, rings, color);
      drawRings(context, rings, color);
      context.globalAlpha = 1;
      request = requestAnimationFrame(draw);
    };
    const watcher = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
      if (isOnScreen && !request) request = requestAnimationFrame(draw);
    });
    watcher.observe(canvas);

    return () => {
      cancelAnimationFrame(request);
      observer.disconnect();
      watcher.disconnect();
    };
  }, [progress, ripples]);

  return <canvas ref={canvasRef} className="absolute inset-0 size-full" />;
};

export default Sea;
