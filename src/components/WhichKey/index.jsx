import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";

/**
 * which-key: press the leader (space, like Eldentree) and the bindings it unlocks show up along the bottom.
 * The next key runs one and closes it.
 * @param {{ isOpen: boolean, bindings: { key: string, label: string, run: () => void, group?: boolean }[], onClose: () => void }} props
 */
const WhichKey = ({ isOpen, bindings, onClose }) => {
  useEffect(() => {
    if (!isOpen) return;
    const runBinding = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const binding = bindings.find((candidate) => candidate.key === (event.key === " " ? "␣" : event.key));
      onClose();
      binding?.run();
    };
    // capture, so the key never reaches the page's own vim keys underneath
    window.addEventListener("keydown", runBinding, { capture: true });
    return () => window.removeEventListener("keydown", runBinding, { capture: true });
  }, [isOpen, bindings, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-label="Leader key bindings"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.35, ease: easeOutExpo }}
          className="glass-strong fixed inset-x-2 bottom-9 z-50 mx-auto max-w-4xl rounded-xl border border-accent/50 p-4 shadow-[0_30px_80px_-20px_color-mix(in_oklab,var(--color-shadow)_80%,transparent)] sm:p-5"
        >
          <p className="mb-3 flex items-center justify-between font-mono text-[11px] text-faint">
            <span>
              <span className="text-accent">&lt;leader&gt;</span> which-key
            </span>
            <span>esc to close</span>
          </p>
          <ul className="grid grid-cols-1 gap-x-8 gap-y-1.5 font-mono text-[13px] sm:grid-cols-2 lg:grid-cols-3">
            {bindings.map((binding) => (
              <li key={binding.key}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    binding.run();
                  }}
                  className="flex w-full items-center gap-3 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-raised"
                >
                  <kbd className="min-w-6 text-center text-accent">{binding.key}</kbd>
                  <span className="text-faint">→</span>
                  <span className="text-muted">{binding.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WhichKey;
