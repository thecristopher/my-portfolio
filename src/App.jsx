import About from "./sections/About";
import ContactSection from "./sections/Contact";
import Greeting from "./sections/Greeting";
import SkillsSection from "./sections/Skills";
import Work from "./sections/Work";

function App() {
  return (
    <main className="h-screen">
      <Greeting />
      <About />
      <Work />
      <SkillsSection />
      <ContactSection />
    </main>
  );
}

export default App;
