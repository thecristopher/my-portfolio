// tracks the cursor in css vars so the glow follows the mouse without re-rendering react
const trackCursor = (event) => {
  const card = event.currentTarget;
  const bounds = card.getBoundingClientRect();
  card.style.setProperty("--spot-x", `${event.clientX - bounds.left}px`);
  card.style.setProperty("--spot-y", `${event.clientY - bounds.top}px`);
};

const SpotlightCard = ({ children, className = "" }) => (
  <div onPointerMove={trackCursor} className={`spotlight ${className}`}>
    {children}
  </div>
);

export default SpotlightCard;
