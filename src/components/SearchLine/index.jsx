import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { echo } from "../../lib/echo";
import { search, searchCount } from "../../lib/search";
import { pauseSmoothScroll, resumeSmoothScroll } from "../../lib/smoothScroll";

// the `/` prompt, typed right where vim types it: over the statusline at the bottom of the screen
const SearchLine = ({ onClose }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    pauseSmoothScroll();
    return () => resumeSmoothScroll();
  }, []);

  const submit = () => {
    onClose();
    // lenis drops scrollTo calls while stopped, and the jump to the first match needs it running
    resumeSmoothScroll();
    if (!query.trim()) return;
    const result = search(query);
    if (result.total === 0) echo(`E486: Pattern not found: ${query.trim()}`, "error");
    else echo(`/${result.query} ${searchCount(result)} · n next · N previous · :noh to clear`, "success");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.18 }}
      data-search-skip
      className="fixed inset-x-0 bottom-0 z-50 flex h-7 items-center gap-1 border-t border-line bg-panel px-3 font-mono text-[11px]"
    >
      <span className="text-signal">/</span>
      <input
        autoFocus
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") submit();
          if (event.key === "Escape") onClose();
        }}
        onBlur={onClose}
        aria-label="Search the page"
        spellCheck={false}
        autoComplete="off"
        className="flex-1 bg-transparent text-fg placeholder:text-faint focus:outline-none"
        placeholder="search the page, enter to jump"
      />
    </motion.div>
  );
};

export default SearchLine;
