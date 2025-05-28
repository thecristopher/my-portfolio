import { motion } from "framer-motion";
import { useRef, useState } from "react";
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
  const [items, setItems] = useState(workItems);
  const hasDraggedRef = useRef(false);

  const handleSwipe = () => {
    const [first, ...rest] = items;
    setItems([...rest, first]);
  };

  return (
    <section id="work" className="relative bg-black text-white py-16 px-6 overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/noise-texture.png')] bg-repeat z-0 pointer-events-none" />

      <div className="z-10 mb-10 text-center">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">
          Work
        </h2>
        <p className="text-xs text-gray-500 mt-1 animate-pulse">
          ↑ Slightly drag the card ↑
        </p>
      </div>

      <div className="relative w-full max-w-md h-[550px] z-10">
        {items.map((item, index) => {
          const isTop = index === 0;

          return (
            <motion.div
              key={item.title}
              className={`absolute top-0 left-0 w-full h-full ${
                isTop ? "cursor-grab active:cursor-grabbing" : "cursor-default"
              }`}
              style={{ zIndex: workItems.length - index }}
              animate={{
                y: index * 12,
                scale: isTop ? 1 : 0.95,
                opacity: 1,
              }}
              transition={{ duration: 0.3 }}
              drag={isTop ? "y" : false}
              dragConstraints={{ top: -80, bottom: 0 }}
              onDragStart={() => {
                hasDraggedRef.current = false;
              }}
              onDrag={(event, info) => {
                if (Math.abs(info.offset.y) > 10) {
                  hasDraggedRef.current = true;
                }
              }}
              onDragEnd={(e, info) => {
                if (info.offset.y < -30) {
                  handleSwipe(); // swipe up
                }
              }}
              onClick={(e) => {
                if (hasDraggedRef.current) {
                  e.preventDefault(); // suppress accidental click
                } else {
                  window.open(item.url, "_blank");
                }
              }}
            >
              <motion.div
                className="w-full h-full rounded-xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl relative"
                whileHover={isTop ? { scale: 1.02 } : {}}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/30 z-10" />
                <div className="relative z-20 p-5 flex flex-col justify-end h-full">
                  <h3 className="text-lg sm:text-xl font-bold text-white/90 mb-1 uppercase tracking-wide">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-snug font-light">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Work;
