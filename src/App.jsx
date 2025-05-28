import Greeting from "./sections/Greeting";
import About from "./sections/About";
import Work from "./sections/Work";
import SkillsSection from "./sections/Skills";
import ContactSection from "./sections/Contact";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      {/* <Navbar /> */}
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
