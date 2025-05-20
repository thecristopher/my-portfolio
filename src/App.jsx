import { useEffect, useState } from "react";
import Greeting from "./sections/Greeting";
import About from "./sections/About";
import Work from "./sections/Work";
import SkillsSection from "./sections/Skills";
import ContactSection from "./sections/Contact";

function App() {
  const [theme, setTheme] = useState("dark");

  // Sync with system/local preference
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme);
      document.documentElement.classList.add(storedTheme);
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 bg-gray-200 dark:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-full shadow-md hover:scale-105 transition"
      >
        {theme === "dark" ? "🌞" : "🌙"}
      </button>
      <main className="flex flex-col gap-32">
        <Greeting />
        <About />
        <Work />
        <SkillsSection />
        <ContactSection />
      </main>
    </div>
  );
}

export default App;
