import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { imageMap } from "../../lib/imageMap";
import { techIconMap } from "../../lib/techIconMap";

const Work = () => {
  const { data: workItems = [], isLoading = false } = useGetProjectsQuery();
  const [items, setItems] = useState([]);
  const hasInitialized = useRef(false);
  const hasDraggedRef = useRef(false);

useEffect(() => {
  if (workItems.length > 0 && !hasInitialized.current) {
    setItems(workItems);
    hasInitialized.current = true;
  }
}, [workItems]);


  const handleSwipe = () => {
    const [first, ...rest] = items;
    setItems([...rest, first]);
  };

  if (isLoading)
    return <div className="text-center text-white">Loading skills...</div>;

  return (
    <section
      id="work"
      className="relative text-white py-16 px-6 overflow-hidden flex flex-col items-center justify-center"
    >
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
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-600/40 rounded-full blur-3xl z-0" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/40 rounded-full blur-3xl z-0" />
                <img
                  src={imageMap[item?.image]}
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.technologies?.map(
                      (tech, j) =>
                        techIconMap[tech] && (
                          <div
                            key={j}
                            className="flex items-center gap-1 text-xs bg-zinc-800 text-white px-3 py-2 rounded-full"
                          >
                            <span className="text-base">
                              {techIconMap[tech]}
                            </span>
                          </div>
                        )
                    )}
                  </div>
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
