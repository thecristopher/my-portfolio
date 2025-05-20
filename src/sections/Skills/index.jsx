import { motion } from "framer-motion";
import { FaAws, FaJsSquare, FaReact } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { PiPaintBrushBroadBold } from "react-icons/pi";
import { useState } from "react";
import { TbUserCode } from "react-icons/tb";

const skills = [
  {
    title: "Fullstack Development",
    icon: <TbUserCode size={32} />,
    description:
      "I craft systems that connect frontend and backend seamlessly, focusing on speed, maintainability, and user experience — regardless of the stack.",
  },
  {
    title: "Cloud Infrastructure",
    icon: <FaAws size={32} />,
    description:
      "With AWS and DevOps know-how, I ship scalable and production-ready systems that run smoothly and securely at any scale.",
  },
  {
    title: "Frontend Engineering",
    icon: <FaReact size={32} />,
    description:
      "Beyond React, I focus on creating intuitive interfaces that scale with your users — blending design, accessibility, and performance.",
  },
  {
    title: "Creative Design",
    icon: <PiPaintBrushBroadBold size={32} />,
    description:
      "From motion graphics to UI aesthetics, I turn ideas into visual experiences that resonate with users and elevate brands.",
  },
  {
    title: "Web Craftsmanship",
    icon: <FaJsSquare size={32} />,
    description:
      "My foundation in JavaScript and browser tech allows me to optimize, modernize, and enhance any web experience — with or without frameworks.",
  },
  {
    title: "App Security & Observability",
    icon: <GrShieldSecurity size={32} />,
    description:
      "Performance and trust go hand in hand. I implement analytics, error tracking, and security patterns to ensure stability and insight.",
  },
];

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
  return (
    <section className="relative bg-black text-white px-6 sm:px-12 md:px-24 lg:px-48 py-32 overflow-hidden">
      {/* Section Title */}
      <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-16 tracking-wide relative z-10">
        <span className="text-white drop-shadow-[0_0_15px_rgba(255,0,128,0.2)]">
          Skills
        </span>
      </h2>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
        {skills.map((skill, i) => (
          <FlipCard skill={skill} key={i} />
        ))}
      </div>
    </section>
  );
};

export default SkillsSection;
