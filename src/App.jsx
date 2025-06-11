import { useEffect, useState } from "react";
import Greeting from "./sections/Greeting";
import About from "./sections/About";
import Work from "./sections/Work";
import SkillsSection from "./sections/Skills";
import ContactSection from "./sections/Contact";
import Navbar from "./components/Navbar";
import PerceptionCheck from "./components/PerceptionCheck";

function App() {
  const [passedCheck, setPassedCheck] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const result = localStorage.getItem("perception-check");
    if (result) {
      const parsed = JSON.parse(result);
      setPassedCheck(parsed.success === true);
    }
    setLoading(false);
  }, []);

  const handleSuccess = () => {
    setPassedCheck(true); // 🌟 Actualiza la UI inmediatamente
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      <Navbar />
      <main className="flex flex-col gap-32">
        <Greeting />
        <About />
        <Work />
        <SkillsSection />
        <ContactSection />
      </main>

      {!passedCheck && !loading && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/70 flex items-center justify-center">
          <PerceptionCheck onSuccess={handleSuccess} />
        </div>
      )}
    </div>
  );
}

export default App;
