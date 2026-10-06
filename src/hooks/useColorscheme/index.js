import { useCallback, useState } from "react";
import { resolveTheme } from "../../actions";
import { echo } from "../../lib/echo";

const STORAGE_KEY = "colorscheme";

const readSavedTheme = () => {
  try {
    return resolveTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return resolveTheme(null);
  }
};

export const useColorscheme = () => {
  const [colorscheme, setColorscheme] = useState(readSavedTheme);

  const applyColorscheme = useCallback((name) => {
    const theme = resolveTheme(name);
    document.documentElement.dataset.theme = theme;
    setColorscheme(theme);
    echo(`colorscheme ${theme}`, "success");
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // private windows can block storage, the theme still applies for this visit
    }
  }, []);

  return { colorscheme, applyColorscheme };
};
