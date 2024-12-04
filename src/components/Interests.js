import React from "react";
import Fade from "react-reveal/Fade";
import data from "../yourdata";

const Interests = () => {
  return (
    <div className="section" id="interests">
      <div className="container">
        <div className="interests-container">
          <Fade bottom cascade>
            <h1>{data.interestsHeading}</h1>
          </Fade>
          <p>{data.interestsPara}</p>
        </div>
      </div>
    </div>
  );
};

export default Interests;
