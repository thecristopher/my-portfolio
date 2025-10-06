import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { imageMap } from "../../lib/imageMap";
import { techIconMap } from "../../lib/techIconMap";
import SkeletonCard from "../../components/SkeletonCard";

const FlipCard = ({ item, isTop, flipped, onClick, onDragEnd, onDragStart }) => {
  const parseBullets = (text) => {
    return text
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((line, i) => <li key={i}>{line.trim()}</li>);
  };

  return (
    <motion.div
      className={`relative w-full h-full ${isTop ? "cursor-grab active:cursor-grabbing z-20 touch-none" : "cursor-default z-10"}`}
      dragListener={isTop}
      style={{ y: isTop ? 0 : 12 }}
      drag={isTop ? "y" : false}
      dragConstraints={{ top: -80, bottom: 80 }}
      dragElastic={0.2}
      dragSnapToOrigin
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div
        className="relative w-full h-full"
        onClick={onClick}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700`}
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >        {/* FRONT */}
          <div className="absolute inset-0 w-full h-full bg-zinc-900 border border-white/10 shadow-2xl rounded-xl backface-hidden transform-style-preserve-3d">
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
                        <span className="text-base">{techIconMap[tech]}</span>
                      </div>
                    )
                )}
              </div>
            </div>
          </div>

          {/* BACK */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 via-zinc-900 to-black border border-zinc-700 rounded-xl flex items-center justify-center p-6 text-gray-300 backface-hidden rotate-y-180 transform-style-preserve-3d">
            <div className="text-left max-w-sm overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4 text-white">
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line">
                {parseBullets(item.detailed_description)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Work = () => {
  const { data: workItems = [], isLoading = false } = useGetProjectsQuery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const hasInitialized = useRef(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (workItems.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setCurrentIndex(0);

      // 💡 Asegura que el scroll esté al inicio
      if (scrollRef.current) {
        scrollRef.current.scrollLeft = 0;
      }
    }
  }, [workItems]);

  if (isLoading) {
    return (
      <section
        id="work"
        className="relative text-white py-16 px-6 min-h-[600px] flex flex-col items-center justify-center"
      >
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section
      id="work"
      style={{ perspective: "1500px" }}
      className="relative text-white py-16 px-6 overflow-visible flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 opacity-5 bg-[url('/images/noise-texture.png')] bg-repeat z-0 pointer-events-none" />
      <div className="z-10 mb-10 text-center">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">Work</h2>
        <p className="text-xs text-gray-500 mt-1 animate-pulse">
          ← Swipe or scroll to explore →
        </p>
        <p className="text-xs text-gray-500 mt-1 animate-pulse">Tap to flip</p>
      </div>
      <div
        ref={scrollRef}
        className="relative w-full overflow-x-auto overflow-y-hidden px-4 snap-x snap-mandatory scroll-smooth no-scrollbar"
      >



        <div className="flex gap-6 items-stretch w-max">
          {workItems.map((item, index) => (
            <motion.div
              key={item.title}
              className="snap-center shrink-0 w-[350px] md:w-[400px] h-[550px] relative flex"
            >
              <FlipCard
                item={item}
                isTop={false}
                flipped={currentIndex === index && flipped}
                onClick={() => {
                  if (currentIndex === index) setFlipped(f => !f);
                  else {
                    setCurrentIndex(index);
                    setFlipped(false);
                  }
                }}
                onDragStart={() => { }}
                onDragEnd={() => { }}
              />
            </motion.div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default Work;

