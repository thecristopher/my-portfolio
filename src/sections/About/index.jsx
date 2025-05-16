import { motion } from "framer-motion";

const paragraphs = [
  `Hi, I'm Cristopher Cervantes, a design and development professional with over nine years of experience across a variety of creative and technical disciplines. I've built a career out of translating innovative ideas into compelling digital solutions.`,

  `I've worked across on-premises and cloud environments, developing applications that solve complex technical challenges. My technical toolkit includes languages like C#, .NET, PHP, Python, NodeJS, and React, allowing me to craft versatile and robust software solutions.`,

  `Instead of focusing only on what I’ve done in the past, I like to keep my eyes on the future. I’m all about learning new things, tackling challenges, and going after goals that truly matter.`,

  `I have an insatiable appetite to keep learning — this drives me to stay at the forefront of technology and industry trends. My passion for continuous improvement motivates me to seek innovative, impactful projects.`,
];

const About = () => {
  return (
    <section className="bg-black text-white px-6 sm:px-12 md:px-32 lg:px-60 py-24 space-y-12">
      <h2 className="text-sm uppercase tracking-widest text-gray-400 mb-6">
        About
      </h2>

      {paragraphs.map((text, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="text-lg md:text-xl leading-relaxed max-w-4xl"
        >
          {text}
        </motion.p>
      ))}
    </section>
  );
};

export default About;
