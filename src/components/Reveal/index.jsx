import { motion } from "framer-motion";
import { easeOutExpo } from "../../lib/motion";

const Reveal = ({ children, delay = 0, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: true, margin: "-80px" }}
    transition={{ duration: 1.1, delay, ease: easeOutExpo }}
    className={className}
  >
    {children}
  </motion.div>
);

export default Reveal;
