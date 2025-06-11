import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLazyGetRollQuery } from "../../api/rollApi";
import D20Icon from "../D20";

const faces = [1, 20, 7, 13, 5, 18, 11, 3, 16, 10];

export default function PerceptionCheck({ onSuccess }) {
  const [triggerRoll] = useLazyGetRollQuery();
  const [rollResult, setRollResult] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayRoll, setDisplayRoll] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("perception-check");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.success) {
        setRollResult(parsed);
        setDisplayRoll(parsed.roll);
      }
    }
  }, []);

  const handleRoll = async () => {
    setIsRolling(true);

    let i = 0;
    const animationInterval = setInterval(() => {
      setDisplayRoll(faces[i % faces.length]);
      i++;
    }, 80);

    const result = await triggerRoll().unwrap();
    const isSuccess = result.roll >= 10;

    setTimeout(() => {
      clearInterval(animationInterval);
      setDisplayRoll(result.roll);
      const fullResult = { ...result, success: isSuccess };
      setRollResult(fullResult);

      if (isSuccess) {
        localStorage.setItem("perception-check", JSON.stringify(fullResult));
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      }

      setIsRolling(false);
    }, 1200);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-white text-center px-4 space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-zinc-400 italic">
          Narrator: The veil shimmers faintly... perhaps a keener eye would
          pierce it?
        </p>
        <div className="text-zinc-200 font-bold text-lg">DIFFICULTY CLASS</div>
        <div className="text-5xl font-bold text-purple-400">10</div>
      </div>

      {!rollResult && !isRolling && (
        <div className="text-sm text-white opacity-60 animate-bounce mb-2 mt-2">
          Click the d20 to roll
        </div>
      )}

      <motion.div
        className="relative w-32 h-32 cursor-pointer transition"
        animate={isRolling ? { rotate: 1080 } : { rotate: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        onClick={
          !isRolling && (!rollResult || !rollResult.success)
            ? handleRoll
            : undefined
        }
      >
        <D20Icon
          className={`w-full h-full ${
            isRolling
              ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]"
              : rollResult?.success
              ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(255,223,70,0.8)]"
              : "text-red-500 drop-shadow-[0_0_15px_rgba(255,50,50,0.5)] hover:text-red-400"
          }`}
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 512 512" className="w-full h-full">
            <text
              x="256"
              y="285"
              fontSize="80"
              fontWeight="bold"
              textAnchor="middle"
              fill={rollResult ? "#ffffff" : "#e0e0e0"}
              stroke={rollResult ? "#000000" : "#4b5563"}
              strokeWidth="2"
              className="select-none uppercase tracking-wide"
            >
              {displayRoll}
            </text>
          </svg>
        </div>
      </motion.div>

      <AnimatePresence>
        {rollResult && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-2 mt-4"
          >
            <div className="text-3xl font-bold text-yellow-400">
              You rolled a {rollResult.roll}!
            </div>
            <motion.div
              className={`text-xl font-semibold ${
                rollResult.success ? "text-green-400" : "text-red-500"
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {rollResult.success
                ? "Success! Your keen senses pierce the illusion."
                : "Failure... the secrets remain just out of reach. Try again?"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
