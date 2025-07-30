import { useEffect, useState } from "react";

export const useTheme = () => {
  const root = window.document.documentElement;
  const [theme, setTheme] = useState();

  useEffect(() => {
      const saved = localStorage.getItem("theme");
      const root = window.document.documentElement;
      if (saved === "light") {
      root.classList.remove("dark");
      setTheme("light");
    }
    else {
      root.classList.remove("light");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
    else {
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };

  return { theme, toggleTheme };
}

export default useTheme;
