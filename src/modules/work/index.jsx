import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { data } from "../../data";

export const Work = () => {
  return (
    <Grid container spacing={2} paddingLeft={20} paddingRight={20}>
      {data.work.jobs.map((job, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            key={index}
          >
            <CardMedia sx={{ height: 200 }} title={job.name} />
            <CardContent>
              <Typography gutterBottom variant="h5" component="div">
                {job.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {job.description}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" href={job.url}>
                Show More
              </Button>
            </CardActions>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
