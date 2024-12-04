import React from "react";
import Layout from "../components/layout";
import SEO from "../components/seo";
import Helmet from "react-helmet";
import Header from "../components/Header";
import Work from "../components/Work";
import About from "../components/about";
import Skills from "../components/skills";
import Interests from "../components/Interests";
import Footer from "../components/Footer";
import ScrollUpButton from "../components/scroll-button";

const IndexPage = () => (
  <div>
    <Helmet>
      <html lang="en" />
      <meta
        name="google-site-verification"
        content="Oh2pceCjOVrlVw5yo-ILaQU2uaDqXCPYFVzmarJ7cAY"
      />
    </Helmet>
    <Layout>
      <SEO title="Cristopher Cervantes" />
      <Header />
      <Work />
      <About />
      <Skills />
      <Interests />
      <Footer />
      <ScrollUpButton />
    </Layout>
  </div>
);

export default IndexPage;
