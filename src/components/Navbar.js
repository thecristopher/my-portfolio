import React from "react";
import scrollTo from "gatsby-plugin-smoothscroll";

const Navbar = () => {
  return (
    <div className="section">
      <div className="container">
        <div className="navbar-wrapper">
          <div className="name">{"< 𝕔𝕔 >"}</div>
          <div className="links-wrapper">
          {typeof window !== "undefined" && window?.location?.pathname === "/" ? (
              <>
                <button
                  className="hover-underline-animation"
                  onClick={() => scrollTo("#work")}
                >
                  Work
                </button>
                <button
                  className="hover-underline-animation"
                  onClick={() => scrollTo("#about")}
                >
                  About
                </button>
                <button
                  className="hover-underline-animation"
                  onClick={() => scrollTo("#skills")}
                >
                  Skills
                </button>
                <button
                  className="hover-underline-animation"
                  onClick={() => scrollTo("#contact")}
                >
                  Contact
                </button>
              </>
            ) : (
              <button
                className="hover-underline-animation"
                onClick={() => window?.location?.replace("/")}
              >
                Take me out!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
