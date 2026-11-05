import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleAlert, Info } from "lucide-react";
import { useEchoMessage } from "../../lib/echo";
import { easeOutExpo } from "../../lib/motion";

const TONE_ICONS = { success: Check, error: CircleAlert, info: Info };
const TONE_COLORS = { success: "text-string", error: "text-error", info: "text-muted" };

/** Whatever the page has to say (a copied email, a résumé download), in a pill at the bottom. */
const Toast = () => {
  const message = useEchoMessage();
  const Icon = TONE_ICONS[message?.tone] ?? Info;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={message.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.4, ease: easeOutExpo }}
            className="glass flex max-w-md items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-sm shadow-lg"
          >
            <Icon size={15} className={`shrink-0 ${TONE_COLORS[message.tone] ?? "text-muted"}`} aria-hidden="true" />
            <span className="text-pretty">{message.text}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;
