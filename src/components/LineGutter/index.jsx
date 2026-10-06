import { useEffect, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { gutterLines } from "../../actions";
import { LINE_HEIGHT, cursorLineAt, visibleRows } from "../../lib/editor";

// a decorative relativenumber gutter down the left edge on wide screens
const LineGutter = () => {
  const { scrollY } = useScroll();
  const [rowCount, setRowCount] = useState(visibleRows);
  const [scrollTop, setScrollTop] = useState(() => window.scrollY);

  useMotionValueEvent(scrollY, "change", setScrollTop);

  useEffect(() => {
    const updateRows = () => setRowCount(visibleRows());
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

  // the numbers glide up with the page and relabel once a full line has passed,
  // both come from the same scrollTop so they never drift a frame apart
  const drift = -(scrollTop % LINE_HEIGHT);
  const lines = gutterLines(cursorLineAt(scrollTop), rowCount);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 bottom-7 left-0 z-30 hidden w-14 overflow-hidden font-mono text-[11px] xl:block"
      style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}
    >
      <div style={{ transform: `translateY(${drift}px)` }}>
        {lines.map((line) => (
          <span
            key={line.row}
            style={{ height: LINE_HEIGHT }}
            className={`flex items-center justify-end pr-4 tabular-nums ${line.isCurrent ? "text-accent" : "text-faint/60"}`}
          >
            {line.label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LineGutter;
