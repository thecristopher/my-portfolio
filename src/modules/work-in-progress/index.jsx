import { PictureAsPdf } from "@mui/icons-material";
import { Box, IconButton, Stack, Typography } from "@mui/material";

export const WorkInProgress = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", padding: 2 }}>
      <Stack
        spacing={2}
        direction="column"
        sx={{ width: "100%", maxWidth: "600px" }}
      >
        <Typography variant="h4" sx={{ textAlign: "center" }}>
          Well, this is awkward...
        </Typography>
        <Box sx={{ textAlign: "center" }}>
          <img
            src="https://i.imgur.com/qhMbkGi.jpg"
            style={{ width: "100%", maxWidth: "300px" }}
          />
        </Box>
        <Typography
          variant="h6"
          sx={{ textAlign: "center" }}
        >{`You came all the way here but this page is full of nothing... yeah, sorry about that.`}</Typography>
        <Typography
          variant="body1"
          sx={{ textAlign: "center" }}
        >{`I am currently updating my portfolio so I can use a show off a bunch of my new skills, but that (like everything in life) takes time.`}</Typography>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          {`In the meantime, why don't you hit me up at: `}
          <Typography
            component="a"
            href="mailto:isc.cristopher@gmail.com"
            sx={{ color: "black", cursor: "pointer" }}
          >
            isc.cristopher@gmail.com
          </Typography>
        </Typography>
        <Typography variant="body1" sx={{ textAlign: "center" }}>
          {`Or you can download my CV right here 👉`}
          <IconButton
            href="https://drive.google.com/uc?export=download&id=12HOAktZLP48HdT2YxUAbPxl0t1wxP5fj"
            download
          >
            <PictureAsPdf sx={{ color: "red" }} />
          </IconButton>
        </Typography>
      </Stack>
    </Box>
  );
};

export default WorkInProgress;
