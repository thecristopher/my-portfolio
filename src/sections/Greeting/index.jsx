import { motion } from "framer-motion";

const Greeting = () => {
  return (
    <div className="h-screen snap-y snap-mandatory overflow-y-scroll">
      {/* First full-screen line */}
      <section className="snap-start h-screen flex items-center justify-center bg-black text-white">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-center px-6"
        >
          Hi I'm Cristopher 👋
        </motion.h1>
      </section>

      {/* Second section with stacked roles */}
      <section className="snap-start h-screen flex flex-col items-center justify-center bg-black text-white space-y-4">
        {["fullstack developer", "visual artist", "cloud enthusiast"].map(
          (text, index) => (
            <motion.h2
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center"
            >
              {text}
            </motion.h2>
          )
        )}
      </section>
    </div>
  );
};

export default Greeting;
