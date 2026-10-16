import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { auroraLayout, mixColors, parseCssColor } from "../../actions";

// the two colors the light behind each section is mixed from, out of the colorscheme's own palette
const SECTION_LIGHT = {
  home: ["accent", "signal"],
  manifesto: ["accent", "error"],
  about: ["signal", "string"],
  work: ["accent", "signal"],
  education: ["string", "signal"],
  github: ["error", "accent"],
  skills: ["signal", "error"],
  contact: ["accent", "error"],
};

const STRENGTH = [0.15, 0.12];
// how much of the way to the new section's colors each frame closes, about a second and a half to settle
const CROSSFADE = 0.045;

const VERTEX = `
attribute vec2 corner;
void main() { gl_Position = vec4(corner, 0.0, 1.0); }
`;

// the light is worked out per pixel at full precision. the falloff is a bell curve, so a pool of light never has an
// edge, and a single step of noise goes in right before the color is rounded to the screen's 8 bits. that's what
// stops the fade from breaking into rings, and one step is too small for the eye to read as grain
const FRAGMENT = `
precision highp float;
uniform vec2 size;
uniform vec3 ink;
uniform vec3 firstColor;
uniform vec3 secondColor;
uniform vec2 firstAt;
uniform vec2 secondAt;
uniform float reach;
uniform vec2 strength;

float pool(vec2 at, vec2 center) {
  vec2 away = (at - center) / reach;
  return exp(-dot(away, away) * 2.2);
}

float hash(vec2 at) {
  return fract(sin(dot(at, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 at = vec2(gl_FragCoord.x, size.y - gl_FragCoord.y);
  vec3 color = ink;
  color = mix(color, firstColor, strength.x * pool(at, firstAt));
  color = mix(color, secondColor, strength.y * pool(at, secondAt));
  float dither = hash(at) + hash(at + 19.19) - 1.0;
  gl_FragColor = vec4(color + dither / 255.0, 1.0);
}
`;

const readColor = (name) => parseCssColor(getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`)) ?? [0, 0, 0];

const compile = (gl, type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
};

// sets up the full screen quad and hands back a draw function, or null when the browser can't do webgl
const createRenderer = (canvas) => {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
  if (!gl) return null;
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const corner = gl.getAttribLocation(program, "corner");
  gl.enableVertexAttribArray(corner);
  gl.vertexAttribPointer(corner, 2, gl.FLOAT, false, 0, 0);
  const uniform = (name) => gl.getUniformLocation(program, name);

  return ({ density, ink, first, second, progress }) => {
    const width = canvas.width;
    const height = canvas.height;
    const layout = auroraLayout({ width: width / density, height: height / density, progress });
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniform("size"), width, height);
    gl.uniform3fv(uniform("ink"), ink);
    gl.uniform3fv(uniform("firstColor"), first);
    gl.uniform3fv(uniform("secondColor"), second);
    gl.uniform2f(uniform("firstAt"), layout.first.x * density, layout.first.y * density);
    gl.uniform2f(uniform("secondAt"), layout.second.x * density, layout.second.y * density);
    gl.uniform1f(uniform("reach"), layout.reach * density);
    gl.uniform2f(uniform("strength"), STRENGTH[0], STRENGTH[1]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
};

// a slow wash of colored light behind the whole page. it drifts as you scroll and takes on each section's colors
// as you reach it. drawn on the gpu so the faint fade stays perfectly smooth, which css gradients can't promise
const Aurora = ({ sectionId }) => {
  const canvasRef = useRef(null);
  const sectionRef = useRef(sectionId);
  const wakeRef = useRef(() => {});
  const [hasWebGL, setHasWebGL] = useState(true);
  const prefersReducedMotion = useReducedMotion();

  sectionRef.current = sectionId;

  useEffect(() => {
    const canvas = canvasRef.current;
    const draw = canvas && createRenderer(canvas);
    if (!draw) {
      setHasWebGL(false);
      return undefined;
    }

    const targetColors = () => (SECTION_LIGHT[sectionRef.current] ?? SECTION_LIGHT.home).map(readColor);
    let ink = readColor("ink");
    let colors = targetColors();
    let density = 1;
    let frame = null;

    const fit = () => {
      density = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(window.innerWidth * density);
      canvas.height = Math.round(window.innerHeight * density);
    };

    const progress = () => {
      if (prefersReducedMotion) return 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      return scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    };

    const render = () => {
      frame = null;
      const target = targetColors();
      const step = prefersReducedMotion ? 1 : CROSSFADE;
      colors = colors.map((color, index) => mixColors(color, target[index], step));
      const isSettled = colors.every((color, index) => color.every((channel, at) => Math.abs(channel - target[index][at]) < 0.002));
      draw({ density, ink, first: colors[0], second: colors[1], progress: progress() });
      if (!isSettled) frame = requestAnimationFrame(render);
    };

    const wake = () => {
      frame ??= requestAnimationFrame(render);
    };
    wakeRef.current = wake;

    // a new colorscheme repaints at once, so the theme's circular reveal already shows the new light
    const repaintTheme = () => {
      ink = readColor("ink");
      colors = targetColors();
      cancelAnimationFrame(frame);
      render();
    };
    const themeWatcher = new MutationObserver(repaintTheme);
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      fit();
      render();
    };

    fit();
    render();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      themeWatcher.disconnect();
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", resize);
    };
  }, [prefersReducedMotion]);

  // a new section starts the crossfade toward its colors
  useEffect(() => wakeRef.current(), [sectionId]);

  if (!hasWebGL) return <CssAurora sectionId={sectionId} />;
  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 size-full" />;
};

// the same light in plain css, for the rare browser without webgl. it can band a little on dark screens
const CssAurora = ({ sectionId }) => {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const driftA = useTransform(scrollYProgress, [0, 1], ["-10%", "35%"]);
  const driftB = useTransform(scrollYProgress, [0, 1], ["20%", "-25%"]);
  const [first, second] = SECTION_LIGHT[sectionId] ?? SECTION_LIGHT.home;

  return (
    <div
      aria-hidden="true"
      className="aurora pointer-events-none fixed inset-0 overflow-hidden"
      style={{ "--aurora-a": `var(--color-${first})`, "--aurora-b": `var(--color-${second})` }}
    >
      <motion.div className="aurora-a absolute -top-1/4 -left-1/4 size-[80vmax]" style={prefersReducedMotion ? undefined : { x: driftA }} />
      <motion.div className="aurora-b absolute -right-1/4 -bottom-1/3 size-[80vmax]" style={prefersReducedMotion ? undefined : { x: driftB }} />
    </div>
  );
};

export default Aurora;
