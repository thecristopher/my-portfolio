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
    setPassedCheck(true);
  };

  return (
    <div className="relative min-h-screen bg-black text-white transition-colors duration-500">
      <Navbar />
      <div className="fixed left-[-25%] top-1/2 -translate-y-1/2 w-[70rem] h-[70rem] max-sm:h-[15rem] bg-red-600/10 rounded-full blur-[150px] z-0 pointer-events-none" />
      <div className="fixed right-[-25%] top-1/2 -translate-y-1/2 w-[70rem] h-[70rem] max-sm:h-[15rem] bg-blue-500/10 rounded-full blur-[150px] z-0 pointer-events-none" />
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
