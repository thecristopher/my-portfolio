import { motion } from "framer-motion";
import heroImage from "../../assets/images/greeting.png";

const outlined =
  "text-transparent stroke-white stroke-[2.5px] dark:stroke-white/40";
const filled = "text-white dark:text-white";

const repeatWord = (word, totalLetters) => {
  const repeated = word
    .repeat(Math.ceil(totalLetters / word.length))
    .slice(0, totalLetters);
  return repeated.split("");
};

const Greeting = () => {
  const first = "CRISTOPHER";
  const last = "CERVANTES";
  const totalLetters = 36;
  const leftEnd = Math.floor(totalLetters / 2);

  return (
    <section className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col items-center justify-center px-4 sm:px-12 py-16">
      {/* Ambient Glows */}
      <div className="absolute left-[-20%] top-1/2 -translate-y-1/2 w-[55rem] h-[55rem] bg-red-600/20 rounded-full blur-3xl z-0" />
      <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[55rem] h-[55rem] bg-blue-500/20 rounded-full blur-3xl z-0" />

      {/* DESKTOP: Passing behind photo */}
      <div className="hidden md:block absolute top-[calc(50%-11rem)] w-full overflow-hidden z-0 pointer-events-none leading-[0.9]">
        <div className="flex justify-center items-center gap-[6px] text-[9vw] xl:text-[6vw] font-extrabold uppercase tracking-tight">
          {repeatWord(first, totalLetters).map((letter, i) => (
            <span
              key={`top-${i}`}
              className={`${i < leftEnd ? filled : outlined}`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      <div className="hidden md:block absolute bottom-[calc(50%-11rem)] w-full overflow-hidden z-0 pointer-events-none leading-[0.9]">
        <div className="flex justify-center items-center gap-[6px] text-[9vw] xl:text-[6vw] font-extrabold uppercase tracking-tight">
          {repeatWord(last, totalLetters).map((letter, i) => (
            <span
              key={`bottom-${i}`}
              className={`${i < leftEnd ? filled : outlined}`}
            >
              {letter}
            </span>
          ))}
        </div>
      </div>

      {/* MOBILE: Fixed rows above and below image */}
      <div className="md:hidden z-10 text-[11vw] font-extrabold uppercase tracking-widest mb-4">
        <span className="text-white">CRISTOPHER</span>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/40 rounded-full blur-3xl z-0" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/40 rounded-full blur-3xl z-0" />
        <img
          src={heroImage}
          alt="Cristopher"
          className="relative z-10 w-[320px] h-[460px] sm:w-[360px] sm:h-[500px] object-cover rounded-2xl shadow-[0_0_100px_#000000bb]"
        />
      </motion.div>

      <div className="md:hidden z-10 text-[11vw] font-extrabold uppercase tracking-widest mt-4">
        <span className="text-white">CERVANTES</span>
      </div>

      {/* Scroll Cue */}
      <div className="absolute bottom-10 text-white text-lg opacity-30 animate-bounce text-center w-full z-10">
        ↓ Scroll to explore
      </div>
    </section>
  );
};

export default Greeting;
