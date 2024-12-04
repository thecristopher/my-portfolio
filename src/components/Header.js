import React from "react";
import Fade from "react-reveal/Fade";
import data from "../yourdata";

const Header = () => {
  return (
    <div className="section" id="home">
      <div className="container">
        <div className="header-wrapper">
          <Fade bottom>
            <h2>
              Hi I'm Cristopher{" "}
              <span role="img" aria-label="Emoji">
                👋
              </span>
            </h2>
          </Fade>
          <Fade bottom cascade>
            <div className="heading-wrapper">
              <h1>{data.headerTagline[0]}</h1>
              <h1> {data.headerTagline[1]}</h1>
              <h1> {data.headerTagline[2]}</h1>
            </div>
          </Fade>
          <Fade bottom>
            <p>{data.headerParagraph}</p>
          </Fade>
          <Fade bottom>
            <a
              href={`mailto:${
                data.contactEmail
              }`}
              className="primary-btn"
            >
              LET'S CONNECT
            </a>
          </Fade>
        </div>
      </div>
    </div>
  );
};

export default Header;
