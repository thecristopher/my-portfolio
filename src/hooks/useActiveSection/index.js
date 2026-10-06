import { useEffect, useState } from "react";

export const useActiveSection = (sectionIds) => {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const idsKey = sectionIds.join(",");

  useEffect(() => {
    const sections = idsKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    // a thin band across the middle of the viewport decides which section is "current"
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [idsKey]);

  return activeId;
};
