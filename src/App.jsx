import About from "./sections/About";
import Greeting from "./sections/Greeting";
import Work from "./sections/Work";

function App() {
  return (
    <main className="h-screen">
      <Greeting />
      <About />
      <Work />
    </main>
  );
}

export default App;
