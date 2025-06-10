import { motion } from "framer-motion";
import d20 from "../../assets/icons/d20.svg";

const LoadingD20 = ({ message = "Rolling the D20..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-white p-6">
      <motion.img
        src={d20}
        alt="D20 rolling"
        className="w-16 h-16"
        animate={{ rotate: [0, 360] }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
        }}
      />
      <p className="text-sm text-gray-400 animate-pulse">{message}</p>
    </div>
  );
};

export default LoadingD20;
