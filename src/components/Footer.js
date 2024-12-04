import React from "react";
import Fade from "react-reveal/Fade";
import data from "../yourdata";
import InstagramFeed from "react-ig-feed";
import "react-ig-feed/dist/index.css";

const Footer = () => {
  return (
    <div className="section" id="contact">
      <div className="container">
        <div className="footer-container">
          <Fade bottom cascade>
            <h1>Contact</h1>
            <h2>{data.contactSubHeading}</h2>
          </Fade>
          <a className="email-link" href={`mailto:${data.contactEmail}`}>
            {data.contactEmail}
          </a>
          <div className="social-icons">
            {data.social.map((socialLink) => (
              <a
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-underline-animation"
              >
                <img src={socialLink.img} alt="icons"></img>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
