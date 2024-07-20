import { Box } from "@mui/material";
import { Header } from "../../components/header";
import "./index.css";
import WorkInProgress from "../work-in-progress";

export const MainPage = () => {
  return (
    <div>
      <Header />
      <Box className="portfolio-container">
        <WorkInProgress />
      </Box>
    </div>
  );
};
