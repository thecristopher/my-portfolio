import React from "react";
import Fade from "react-reveal/Fade";
import data from "../yourdata";
import "react-ig-feed/dist/index.css";

const About = () => {
  return (
    <div className="section" id="about">
      <div className="container">
        <div className="about-section">
          <div className="content">
            <Fade bottom cascade>
              <h1>About</h1>
            </Fade>
            {data.about.paragraphs.map((p) => (
              <p id={p.id} style={{ paddingBottom: 10 }}>
                {p.text}
              </p>
            ))}
          </div>
          <img
            className="image-wrapper"
            src={data.about.image}
            alt="about"
          ></img>
        </div>
      </div>
    </div>
  );
};

export default About;
