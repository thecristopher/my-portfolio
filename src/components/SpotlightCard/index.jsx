const MAX_TILT_DEG = 4;

// tracks the cursor in css vars so the glow, the lit border and the tilt follow the mouse without re-rendering react
const trackCursor = (event) => {
  if (event.pointerType !== "mouse") return;
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  card.style.setProperty("--spot-x", `${x}px`);
  card.style.setProperty("--spot-y", `${y}px`);
  // leans away from the cursor, like pressing on a card that's lying on a table
  card.style.setProperty("--tilt-x", `${((0.5 - y / bounds.height) * MAX_TILT_DEG * 2).toFixed(2)}deg`);
  card.style.setProperty("--tilt-y", `${((x / bounds.width - 0.5) * MAX_TILT_DEG * 2).toFixed(2)}deg`);
};

const settle = (event) => {
  event.currentTarget.style.setProperty("--tilt-x", "0deg");
  event.currentTarget.style.setProperty("--tilt-y", "0deg");
};

const SpotlightCard = ({ children, className = "" }) => (
  <div onPointerMove={trackCursor} onPointerLeave={settle} className={`spotlight ${className}`}>
    {children}
  </div>
);

export default SpotlightCard;
