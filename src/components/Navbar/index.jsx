const Navbar = () => {
  const links = [
    { name: "Home", href: "#greeting" },
    { name: "About", href: "#about" },
    { name: "Work", href: "#work" },
    { name: "Skills", href: "#skills" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-lg shadow-md px-6 sm:px-12 py-4">
      <ul className="flex justify-center gap-6 text-sm sm:text-base font-semibold text-gray-200">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="hover:text-blue-500 transition-colors duration-300"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>    
    </nav>
  );
};

export default Navbar;
