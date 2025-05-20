import { motion } from "framer-motion";

const paragraphs = [
  `Hi, I'm Cristopher Cervantes, a design and development professional with over nine years of experience across a variety of creative and technical disciplines. I've built a career out of translating innovative ideas into compelling digital solutions.`,

  `I've worked across on-premises and cloud environments, developing applications that solve complex technical challenges. My technical toolkit includes languages like C#, .NET, PHP, Python, NodeJS, and React, allowing me to craft versatile and robust software solutions.`,

  `Instead of focusing only on what I’ve done in the past, I like to keep my eyes on the future. I’m all about learning new things, tackling challenges, and going after goals that truly matter.`,

  `I have an insatiable appetite to keep learning — this drives me to stay at the forefront of technology and industry trends. My passion for continuous improvement motivates me to seek innovative, impactful projects.`,
];

const About = () => {
  return (
    <section className="relative  text-white px-6 sm:px-12 md:px-20 lg:px-40 py-32 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Sticky Title on larger screens */}
        <div className="mb-10 md:mb-16 sticky top-10">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-sm uppercase tracking-widest text-gray-400"
          >
            About
          </motion.h2>
        </div>

        {/* Paragraphs */}
        <div className="space-y-12">
          {paragraphs.map((text, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-100 leading-relaxed"
            >
              {text}
            </motion.p>
          ))}
        </div>
      </div>

      {/* Scroll fade hint (bottom gradient) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </section>
  );
};

export default About;
