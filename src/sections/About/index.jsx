import { motion } from "framer-motion";

const paragraphs = [
  `Hey there! I’m Cristopher Cervantes, a fullstack developer with 9+ years of experience crafting everything from quick prototypes to enterprise-grade systems. I bridge the gap between front-end finesse and back-end muscle.`,

  `Throughout my career, I’ve had the chance to work with companies that didn’t just need "a developer," but someone who could jump between stacks, tackle legacy obstacles, and still deliver clean, scalable code. From building PHP-based platforms to wrangling cloud-native APIs with Python, I’ve pretty much been everywhere.`,

  `I'm fluent in several tech dialects: C#, .NET, React, PHP, Python, Node.js — you name it. Databases? Oh yeah. Whether it's MySQL, PostgreSQL, or NoSQL flavors, I love getting into data structure debates.`,

  `I’m also officially AWS-certified — both as a Cloud Practitioner and a Developer Associate. Translation: I can launch, scale, and troubleshoot your cloud infrastructure before my second cup of coffee.`,

  `At the core of it all, I’m someone who loves learning, building, and solving the kind of problems that make other developers sigh dramatically. I’m always up for a challenge — especially the kind that lets me push tech boundaries while having a good laugh in the process.`,
];

const About = () => {
  return (
    <section
      id="about"
      className="relative bg-black text-white px-6 sm:px-12 md:px-20 lg:px-40 py-30 overflow-hidden bg-gradient-to-b from-black via-[#250c15] via-40% to-[#000001]"
    >
      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Title with animated stripe */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12 sticky top-10"
        >
          <div className="relative inline-block">
            <h2 className="text-sm uppercase tracking-widest  text-gray-400 z-10 relative">
              About
            </h2>
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 h-0.5 w-full bg-gradient-to-r from-cyan-500 to-transparent opacity-30" />
          </div>
        </motion.div>

        {/* Paragraphs with motion and glowing dividers */}
        <div className="space-y-16">
          {paragraphs.map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              className="relative"
            >
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed">
                {text}
              </p>
              {index !== paragraphs.length - 1 && (
                <div className="w-32 h-1 mt-6 bg-gradient-to-r from-red-400 to-blue-400 opacity-30 rounded-full" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
