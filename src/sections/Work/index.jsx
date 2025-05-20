import { motion } from "framer-motion";
import psl from "../../assets/images/psl.png";
import grupoTress from "../../assets/images/grupotress.jpg";
import hisense from "../../assets/images/hisense.png";
import umbrella from "../../assets/images/umbrella.jpg";
import dentist from "../../assets/images/dentist_genesis.png";

const workItems = [
  {
    title: "PSL Group / FirstWord",
    image: psl,
    url: "https://www.pslgroup.com/",
    description:
      "Delivered scalable pharma insights through modern web apps & feed infrastructure.",
  },
  {
    title: "Grupo Tress",
    image: grupoTress,
    url: "https://www.tress.com.mx/",
    description:
      "Built enterprise-grade payroll tools with secure, high-performance architecture.",
  },
  {
    title: "Hisense México",
    image: hisense,
    url: "https://www.hisense.com.mx/",
    description:
      "Developed corporate & factory tooling for productivity and systems integration.",
  },
  {
    title: "Umbrella Seguros",
    image: umbrella,
    url: "https://www.umbrella-seguros.com/",
    description:
      "Built modern insurance platform focused on speed, UX, and digital reach.",
  },
  {
    title: "Genesis Cazares, DDS",
    image: dentist,
    url: "https://dentistagenesiscazares.com",
    description:
      "Promoted services through a responsive C# MVC web app tailored for visibility.",
  },
];

const Work = () => {
  return (
    <section className="relative  text-white py-24 px-6">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/noise-texture.png')] bg-repeat z-0 pointer-events-none" />

      <div className="relative z-10 mb-10 px-2 sm:px-8 md:px-16 lg:px-32 flex justify-between items-center">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Work
        </h2>
        <span className="text-xs text-gray-500 animate-pulse">← Swipe →</span>
      </div>

      <div className="relative z-10 flex space-x-8 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-2 sm:px-8 md:px-16 lg:px-32">
        {workItems.map((item, index) => (
          <motion.a
            key={index}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="snap-center flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[28vw] h-[360px] bg-zinc-900 rounded-2xl overflow-hidden relative shadow-lg border border-white/10 hover:border-white/30 transition-all duration-500 group"
          >
            {/* Background image */}
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30 z-10" />

            {/* Content */}
            <div className="relative z-20 p-5 flex flex-col justify-end h-full">
              <h3 className="text-lg sm:text-xl font-bold text-white/90 mb-1 uppercase tracking-wide">
                {item.title}
              </h3>
              <p className="text-sm text-gray-300 leading-snug font-light">
                {item.description}
              </p>
            </div>

            {/* Accent ring glow on hover */}
            <div className="absolute inset-0 z-0 rounded-2xl border border-transparent group-hover:border-blue-500/30 group-hover:shadow-[0_0_30px_#1c95d733] transition-all duration-500" />
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default Work;
