import { FaLinkedin, FaInstagram, FaTiktok, FaTwitch } from "react-icons/fa";

const socials = [
  {
    icon: <FaLinkedin size={24} />,
    url: "https://www.linkedin.com/in/cristophercervantes",
  },
  {
    icon: <FaInstagram size={24} />,
    url: "https://www.instagram.com/cris.artcode",
  },
  {
    icon: <FaTiktok size={24} />,
    url: "https://www.tiktok.com/@cris.artcode",
  },
  {
    icon: <FaTwitch size={24} />,
    url: "https://www.twitch.tv/yourchannel",
  },
];

const ContactSection = () => {
  return (
    <section className="relative bg-black text-white py-32 px-6 sm:px-12 text-center overflow-hidden">
      <h2 className="text-3xl md:text-4xl font-extrabold mb-6 tracking-wide relative z-10">
        Let’s Create Something Together
      </h2>

      <p className="text-gray-300 mb-8 text-base md:text-lg relative z-10">
        Have an idea, a challenge, or a spark? Let’s turn it into something
        real.
      </p>

      {/* CTA Email */}
      <div className="relative z-10">
        <a
          href="mailto:isc.cristopher@gmail.com"
          className="inline-block bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition shadow-md"
        >
          isc.cristopher@gmail.com
        </a>
      </div>

      {/* Social Icons */}
      <div className="relative z-10 mt-10 flex justify-center gap-6">
        {socials.map((item, idx) => (
          <a
            key={idx}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-red-400 transition transform hover:scale-110"
          >
            {item.icon}
          </a>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-xs text-gray-600 mt-12 relative z-10">
        © {new Date().getFullYear()} Cristopher Cervantes
      </div>
    </section>
  );
};

export default ContactSection;
