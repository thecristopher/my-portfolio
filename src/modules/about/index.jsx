import { Box, Grid, Grow, Stack, Typography } from "@mui/material";
import profilePicture from "../../assets/images/Profile Picture.png";

export const About = () => {
  const paragraphs = [
    "I'm Cristopher Cervantes, a 31-year-old developer, artist, and web designer hailing from Rosarito, Baja California. With a passion for creating modern, compact web applications, I strive to build solutions that are not only visually appealing but also leverage the latest technological advancements to deliver exceptional features and functionality for my clients.",
    "My journey in the tech world has been defined by a relentless pursuit of growth and innovation. I thrive on challenging myself to step outside my comfort zone, a mindset that has propelled me across various companies and technologies. From foundational .NET applications to cutting-edge web services utilizing AWS, Lambda, and React, I have continually expanded my skill set to stay at the forefront of the industry.",
    "Collaboration and continuous learning are at the core of my professional ethos. I believe in surrounding myself with individuals who inspire and challenge me, fostering an environment of mutual growth and excellence. Together, we strive to deliver high-quality products that exceed expectations and drive success.",
    "In addition to my technical expertise, I bring an artistic flair to my work, ensuring that the web applications I create are not only functional but also aesthetically pleasing. This unique blend of technical proficiency and creative vision allows me to deliver holistic solutions that resonate with users and clients alike.",
    "Whether it's developing a sleek, modern web application or diving into the latest technological trends, I am committed to pushing the boundaries of what's possible and delivering outstanding results in every project I undertake.",
  ];
  return (
    <Grid container spacing={2} paddingLeft={30} paddingRight={30}>
      <Grid item xs={12} sx={{ textAlign: "center" }}>
        <Box sx={{ padding: 50 }}>
          <Stack direction="column" spacing={2}>
            <Grow in timeout={1000}>
              <Typography variant="h3">Hello there 👋🏻</Typography>
            </Grow>
            <Grow in timeout={1500}>
              <Typography variant="h1">{`I'm Cristopher Cervantes`}</Typography>
            </Grow>
            <Grow in timeout={2000}>
              <Typography variant="h2">
                Developer, artist and anime enthusiast
              </Typography>
            </Grow>
          </Stack>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" spacing={2}>
          <img src={profilePicture} alt="Profile" width={"30%"} />
          <Stack direction="column" spacing={2}>
            {paragraphs.map((paragraph, index) => (
              <Typography variant="h6" component="p" key={index} gutterBottom>
                {paragraph}
              </Typography>
            ))}
          </Stack>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default About;
