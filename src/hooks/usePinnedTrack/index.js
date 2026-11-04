import { useLayoutEffect, useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import { trackDistance } from "../../lib/motion";

/**
 * A scene that pins to the screen while its track slides sideways, one screen of scroll per screen of track, the way
 * Apple walks a row of products past you. The section grows tall enough to scroll the whole track through.
 * @returns {{ sectionRef: object, trackRef: object, x: import("framer-motion").MotionValue, height: string, progress: import("framer-motion").MotionValue }}
 */
export const usePinnedTrack = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(trackDistance(track.scrollWidth, window.innerWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return { sectionRef, trackRef, x, height: `calc(100svh + ${distance}px)`, progress: scrollYProgress };
};
