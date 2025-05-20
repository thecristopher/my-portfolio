import { motion } from "framer-motion";
import heroImage from "../../assets/images/greeting.png";

const leftLines = ["FULLSTACK", "VISUAL", "CLOUD"];
const rightLines = ["DEVELOPER", "ARTIST", "ENTHUSIAST"];

const Greeting = () => {
  return (
    <section className="bg-transparent text-black dark:text-white relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-12 py-32 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute left-[-10%] top-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-red-600/20 rounded-full blur-3xl" />
      <div className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[38rem] h-[38rem] bg-blue-500/20 rounded-full blur-3xl" />

      {/* NAME TOP (Desktop) */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="hidden md:block text-center text-6xl lg:text-8xl font-extrabold tracking-widest z-10 uppercase  hover:text-white hover:drop-shadow-[0_0_20px_#ff2c2c]"
      >
        CRISTOPHER
      </motion.h1>

      {/* Middle Grid (Desktop) */}
      <div className="hidden md:grid relative grid-cols-3 gap-6 items-center my-12 z-10">
        {/* Left Tags */}
        <div className="flex flex-col items-end text-right space-y-6 font-bold text-2xl lg:text-3xl">
          {leftLines.map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="text-red-500 uppercase font-extrabold tracking-wider"
            >
              {text}
            </motion.div>
          ))}
        </div>

        {/* Center Photo */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative flex justify-center items-center"
        >
          {/* Red & Blue glows */}
          <div className="absolute bottom-0 left-0 w-52 h-52 bg-red-600/40 rounded-full blur-3xl z-0" />
          <div className="absolute top-0 right-0 w-52 h-52 bg-blue-500/40 rounded-full blur-3xl z-0" />
          <img
            src={heroImage}
            alt="Cristopher"
            className="relative z-10 w-64 h-96 sm:w-72 sm:h-[30rem] md:w-80 md:h-[32rem] object-cover rounded-xl shadow-[0_0_60px_#000000aa] transition-all duration-700"
          />
        </motion.div>

        {/* Right Tags */}
        <div className="flex flex-col items-start text-left space-y-6 font-bold text-2xl lg:text-3xl">
          {rightLines.map((text, i) => (
            <motion.div
              key={text}
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="text-blue-400 uppercase font-extrabold tracking-wider"
            >
              {text}
            </motion.div>
          ))}
        </div>
      </div>

      {/* NAME BOTTOM (Desktop) */}
      <motion.h2
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="hidden md:block text-center text-5xl lg:text-7xl font-extrabold tracking-widest uppercase z-10  hover:text-white hover:drop-shadow-[0_0_20px_#ff2c2c]"
      >
        CERVANTES
      </motion.h2>

      {/* Mobile layout */}
      <div className="flex flex-col items-center justify-center space-y-6 md:hidden z-10 text-center">
        {/* Top Name */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-widest uppercase"
        >
          CRISTOPHER
        </motion.h1>

        {/* Photo */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative flex justify-center items-center"
        >
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-600/40 rounded-full blur-2xl z-0" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/40 rounded-full blur-2xl z-0" />
          <img
            src={heroImage}
            alt="Cristopher"
            className="relative z-10 w-52 h-72 object-cover rounded-xl shadow-[0_0_30px_#00000088] transition-transform duration-500 hover:scale-105 hover:shadow-[0_0_80px_#1c95d7]"
          />
        </motion.div>

        {/* Skills */}
        <div className="flex flex-col gap-3 text-xl font-semibold">
          {leftLines.map((text, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="uppercase"
            >
              <span className="text-red-500">{text} </span>
              <span className="text-blue-400">{rightLines[i]}</span>
            </motion.div>
          ))}
        </div>

        {/* Bottom Name */}
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl sm:text-5xl font-extrabold tracking-widest uppercase mt-4"
        >
          CERVANTES
        </motion.h2>
      </div>

      {/* Scroll Cue */}
      <div className="absolute bottom-10 text-white text-lg opacity-40 animate-bounce text-center w-full">
        ↓ Scroll to explore
      </div>
    </section>
  );
};

export default Greeting;
