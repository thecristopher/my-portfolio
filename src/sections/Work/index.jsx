import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { imageMap } from "../../lib/imageMap";
import { techIconMap } from "../../lib/techIconMap";
import SkeletonCard from "../../components/SkeletonCard";

const FlipCard = ({ item, isTop, onClick, flipped, onDragEnd, onDragStart }) => {

  const parseBullets = (text) => {
    return text
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line, i) => <li key={i}>{line.trim()}</li>);
  };

  return (
    <motion.div
      className={`absolute top-0 left-0 w-full h-full ${isTop ? "cursor-grab active:cursor-grabbing z-20" : "cursor-default z-10"}`}
      style={{ y: isTop ? 0 : 12 }}
      animate={{ y: 0 }}
      drag={isTop ? "y" : false}
      dragConstraints={{ top: -80, bottom: 80 }}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      <div
        className={`relative w-full h-full perspective`}
        onClick={onClick}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
            }`}
        >
          {/* FRONT */}
          <div className="absolute inset-0 w-full h-full bg-zinc-900 border border-white/10 shadow-2xl rounded-xl overflow-hidden backface-hidden transform-style-preserve-3d">
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
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 via-zinc-900 to-black
 border border-zinc-700 rounded-xl flex items-center justify-center p-6 text-gray-300 backface-hidden rotate-y-180 transform-style-preserve-3d">
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
  const [items, setItems] = useState([]);
  const [flippedIndex, setFlippedIndex] = useState(null);
  const hasInitialized = useRef(false);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    if (workItems.length > 0 && !hasInitialized.current) {
      setItems(workItems);
      hasInitialized.current = true;
    }
  }, [workItems]);

  const handleSwipeUp = () => {
    const [first, ...rest] = items;
    setItems([...rest, first]);
    setFlippedIndex(null);
  };

  const handleSwipeDown = () => {
    const last = items[items.length - 1];
    const rest = items.slice(0, -1);
    setItems([last, ...rest]);
    setFlippedIndex(null);
  };

  if (isLoading)
    return (
      <section
        id="work"
        className="relative text-white py-16 px-6 overflow-hidden flex flex-col items-center justify-center"
      >
        <div className="absolute inset-0 opacity-5 bg-[url('/images/noise-texture.png')] bg-repeat z-0 pointer-events-none" />

        <div className="z-10 mb-10 text-center">
          <h2 className="text-sm uppercase tracking-widest text-gray-400">Work</h2>
          <p className="text-xs text-gray-500 mt-1 animate-pulse">
            Loading projects...
          </p>
        </div>

        <div className="relative w-full max-w-md h-[550px] z-10">
          <div className="absolute top-0 left-0 w-full h-full z-20">
            <SkeletonCard />
          </div>
        </div>
      </section>
    );


  return (
    <section
      id="work"
      className="relative text-white py-16 px-6 overflow-hidden flex flex-col items-center justify-center"
    >
      <div className="absolute inset-0 opacity-5 bg-[url('/images/noise-texture.png')] bg-repeat z-0 pointer-events-none" />

      <div className="z-10 mb-10 text-center">
        <h2 className="text-sm uppercase tracking-widest text-gray-400">Work</h2>
        <p className="text-xs text-gray-500 mt-1 animate-pulse">
          ↑ Slightly drag the card ↑
        </p>
        <p className="text-xs text-gray-500 mt-1 animate-pulse">
          or click it to know more!
        </p>

      </div>

      <div className="relative w-full max-w-md h-[550px] z-10">
        {items.map((item, index) => {
          const isTop = index === 0;
          return (
            <FlipCard
              key={item.title}
              item={item}
              isTop={isTop}
              flipped={flippedIndex === index}
              onClick={() => {
                if (isTop) {
                  setFlippedIndex(flippedIndex === index ? null : index);
                }
              }}
              onDragStart={() => {
                hasDraggedRef.current = false;
              }}
              onDragEnd={(e, info) => {
                const threshold = 30;
                if (info.offset.y < -threshold) {
                  hasDraggedRef.current = true;
                  handleSwipeUp();
                } else if (info.offset.y > threshold) {
                  hasDraggedRef.current = true;
                  handleSwipeDown();
                }
              }}
            />
          );
        })}
      </div>
    </section>
  );
};

export default Work;

