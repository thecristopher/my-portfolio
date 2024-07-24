import { Grid } from "@mui/material";
import { Header } from "../../components/header";
import "./index.css";
import { data } from "../../data";
import { About } from "../about";
import { Work } from "../work";

export const MainPage = () => {
  return (
    <Grid container spacing={2} className="portfolio-container">
      <Grid item xs={12}>
        <Header options={data.header.options} />
      </Grid>
      <Grid item xs={12}>
        <About />
      </Grid>
      <Grid item xs={12}>
        <Work />
      </Grid>
    </Grid>
  );
};
