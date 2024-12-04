import React, { useState } from "react";

const Card = ({ heading, paragraph, imgUrl, projectLink }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="card"
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundImage: hovered
          ? `linear-gradient(90deg, rgba(98,98,98,0.5690275493421053) 100%, rgba(203,203,203,0) 100%, rgba(142,142,142,0.5065275493421053) 100%),url('${imgUrl}')`
          : `url('${imgUrl}')`,
      }}
    >
      <div className="content">
        <h1 className="header">{heading}</h1>
        <p className="text">{paragraph}</p>
        <a
          href={projectLink ? projectLink : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="btn"
        >
          Learn more!
        </a>
      </div>
    </div>
  );
};

export default Card;
