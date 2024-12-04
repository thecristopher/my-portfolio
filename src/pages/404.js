import React, { useEffect, useState } from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import travolta from "../images/travolta.gif";
import Fade from "react-reveal/Fade";

/** Página no encontrada */
const NotFoundPage = () => {
  /** Contador de segundos, inicia en 10 */
  const [counter, setCounter] = useState(10);
  /** UseEffect que administra el estado del contador */
  useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
    counter === 0 && handleButtonClick();
  }, [counter]);

  /** Evento onClick del botón */
  const handleButtonClick = () => {
    typeof window !== "undefined" && window?.location?.replace("/");
  };

  /** UI */
  return (
    <Layout>
      <SEO title="404: Not found" />
      <div
        style={{
          justifyContent: "center",
          alignItems: "center",
          margin: 25,
          textAlign: "center",
        }}
      >
        <Fade bottom>
          <h3>Oops! You've just entered a void.</h3>
          <img width={250} src={travolta} />
          <p>I know, the sadness is unbearable.</p>
          <p style={{ paddingBottom: 20 }}> Let's get you...</p>
          <a className="primary-btn" onClick={() => handleButtonClick}>
            Back home in... {counter.toString()}
          </a>
        </Fade>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
