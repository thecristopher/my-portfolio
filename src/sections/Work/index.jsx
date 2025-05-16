import { motion } from "framer-motion";

const workItems = [
  {
    title: "Grupo Tress",
    image: "/images/grupotress.jpg",
    url: "https://www.grupotress.com/",
    description: "Enterprise HR solutions across LATAM.",
  },
  {
    title: "Hisense",
    image: "/images/hisense.jpg",
    url: "https://www.hisense.com.mx/",
    description: "Manufacturing excellence & smart devices.",
  },
  {
    title: "Laboratorios DIBA",
    image: "/images/diba.jpg",
    url: "https://www.dibalab.com/",
    description: "Clinical lab solutions and diagnostics.",
  },
  {
    title: "Corporate HQ",
    image: "/images/corporate.jpg",
    url: "#",
    description: "Software support for corporate infrastructure.",
  },
  {
    title: "Medical Packaging",
    image: "/images/medical.jpg",
    url: "#",
    description: "Sterile packaging and product design.",
  },
];

const Work = () => {
  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Work
        </h2>
        <span className="text-xs text-gray-500 animate-pulse">
          ← Swipe to explore →
        </span>
      </div>

      <div className="flex space-x-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-8 md:px-16 lg:px-32">
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
            className="snap-center flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] h-[400px] rounded-xl overflow-hidden border-2 border-white/20 bg-black relative group"
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
            <div className="absolute bottom-0 z-20 p-4">
              <h3 className="text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.description}</p>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
};

export default Work;
