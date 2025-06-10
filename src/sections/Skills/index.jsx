import { motion } from "framer-motion";
import { useState } from "react";
import { iconMap } from "../../lib/iconMap";
import { useGetSkillsQuery } from "../../api/skillsApi";

const FlipCard = ({ skill }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      onClick={() => setFlipped(!flipped)}
      whileHover={{ scale: 1.05 }}
      className="relative w-full h-64 sm:h-60 cursor-pointer perspective"
    >
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front */}
        <div className="absolute w-full h-full bg-zinc-900 border border-zinc-700 rounded-xl flex flex-col items-center justify-center gap-3 shadow-md backface-hidden">
          <div className="text-white bg-zinc-800 p-4 rounded-full shadow-lg">
            {skill.icon}
          </div>
          <h3 className="text-white text-lg font-semibold uppercase tracking-wide text-center px-4">
            {skill.title}
          </h3>
          <p className="text-xs text-gray-500">Click to learn more</p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full bg-zinc-800 border border-zinc-600 rounded-xl flex items-center justify-center p-6 text-center text-sm text-gray-300 rotate-y-180 backface-hidden">
          {skill.description}
        </div>
      </div>
    </motion.div>
  );
};

const SkillsSection = () => {
  const { data: skills = [], isLoading } = useGetSkillsQuery();

  if (isLoading)
    return <div className="text-center text-white">Loading skills...</div>;
  return (
    <section
      id="skills"
      className="relative  text-white px-6 sm:px-12 md:px-24 lg:px-48 py-20 overflow-hidden"
    >
      {/* Section Title */}
      <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-16 tracking-wide relative z-10">
        <span className="text-white drop-shadow-[0_0_15px_rgba(255,0,128,0.2)]">
          Skills
        </span>
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {skills.map((skill, i) => (
          <FlipCard skill={{ ...skill, icon: iconMap[skill.icon] }} key={i} />
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
