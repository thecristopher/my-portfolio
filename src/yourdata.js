// Skills Icons
import awsIcon from "./images/aws.svg";
import reactIcon from "./images/react.svg";
import jsIcon from "./images/javascript.svg";
import designIcon from "./images/design.svg";
import codeIcon from "./images/code.svg";
import analyticsIcon from "./images/business-analytics.svg";
import photo from "./images/me.png";

/** Jobs */
import hisense from "./images/hisense.jpg";
import umbrella from "./images/umbrella.png";

// Social Icon
import linkedInIcon from "./images/linkedin.svg";
import instagramIcon from "./images/instagram.svg";
import tiktokIcon from "./images/tiktok.svg";
import twitchIcon from "./images/twitch.svg";

export default {
  //(Please Do Not Remove The comma(,) after every variable)
  //Change The Website Template

  //   Header Details ---------------------
  name: "Cristopher",
  headerTagline: [
    //Line 1 For Header
    "fullstack developer",
    //Line 2 For Header
    "visual designer",
    //Line 3 For Header
    "cloud enthusiast",
  ],
  //   Header Paragraph
  headerParagraph: "",

  //Contact Email
  contactEmail: "isc.cristopher@gmail.com",

  // End Header Details -----------------------

  // Work Section ------------------------
  projects: [
    {
      id: 1, //DO NOT CHANGE THIS (Please)😅
      title: "PSL Group", //Project Title - Add Your Project Title Here
      para: "Software development on the FirstWord stack", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc:
        "https://i.imgur.com/M6R8LMH.png&auto=format&fit=crop&w=400&q=60",
      //Project URL - Add Your Project Url Here
      url: "https://www.pslgroup.com",
    },
    {
      id: 2, //DO NOT CHANGE THIS (Please)😅
      title: "Walt Disney Company", //Project Title - Add Your Project Title Here
      para: "Visual Developer & Artist", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc:
        "https://www.usatoday.com/gcdn/-mm-/091190c344f99fabe8e83297172ad0de8a040519/c=0-156-3072-1892/local/-/media/2017/09/22/USATODAY/USATODAY/636416893787170637-Legends-Plaza-Walt.JPG?width=660&height=373&fit=crop&format=pjpg&auto=webp&auto=format&fit=crop&w=400&q=60",
      //Project URL - Add Your Project Url Here
      url: "https://tress.com.mx",
    },
    {
      id: 3, //DO NOT CHANGE THIS (Please)😅
      title: "Grupo Tress International", //Project Title - Add Your Project Title Here
      para: "Software development utilizing the AWS Cloud", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc:
        "https://i.imgur.com/65zObT2.png&auto=format&fit=crop&w=400&q=60",
      //Project URL - Add Your Project Url Here
      url: "https://tress.com.mx",
    },
    {
      id: 4, //DO NOT CHANGE THIS (Please)😅
      title: "Hisense", //Project Title - Add Your Project Title Here
      para: "Developing in-house software for production lines management", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc: hisense,
      //Project URL - Add Your Project Url Here
      url: "https://hisense.com.mx",
    },
    {
      id: 5, //DO NOT CHANGE THIS (Please)😅
      title: "Umbrella Seguros", //Project Title - Add Your Project Title Here
      para: "Software developing utilizing Azure Services", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc: umbrella,
      //Project URL - Add Your Project Url Here
      url: "https://umbrella-seguros.com",
    },
    {
      id: 6, //DO NOT CHANGE THIS (Please)😅
      title: "Dentist Génesis Cázares", //Project Title - Add Your Project Title Here
      para: "Developing and designing Dentist Dentist Génesis Cázares web page", // Add Your Service Type Here
      //Project Image - Add Your Project Image Here
      imageSrc:
        "https://i.imgur.com/369OAnr.jpeg&auto=format&fit=crop&w=400&q=90",
      //Project URL - Add Your Project Url Here
      url: "https://dentistagenesiscazares.com/",
    },
  ],
  about: {
    paragraphs: [
      {
        id: 1,
        text: `Greetings! I'm Cristopher Cervantes, a highly skilled and versatile professional with over 9 years of hands-on experience across a diverse range of development and design disciplines.`,
      },
      {
        id: 2,
        text: `Throughout my career, I have excelled in developing applications that seamlessly operate both on premises and in the cloud. My proficiency extends to various programming languages, including C#, .NET, PHP, Python, NodeJS, and React.`,
      },
      {
        id: 3,
        text: `Rather than defining myself solely by past accomplishments, I embrace a forward-looking perspective. I believe in continually expanding my knowledge, taking on new challenges, and pursuing meaningful endeavors.`,
      },
      {
        id: 4,
        text: `I have an insatiable appetite for learning, which drives me to stay at the forefront of technology and industry trends. This passion for continuous improvement motivates me to explore innovative and impactful projects.`,
      },
    ],
    image: photo,
  },
  skills: [
    {
      id: 1,
      img: awsIcon,
      para:
        "With my proficient AWS Cloud skills, I can revolutionize the way we handle projects by automating, testing, building, and delivering them rapidly and continuously. By harnessing the power of AWS, we ensure that your users consistently access the latest and most stable versions of your product.",
    },
    {
      id: 2,
      img: codeIcon,
      para:
        "From Lambda to .NET, the backend serves as the foundational pillar for every application. Together, let's construct a robust framework for your software solutions, ensuring a powerful and reliable structure.",
    },
    {
      id: 3,
      img: reactIcon,
      para:
        "With my proficiency in React, we can craft responsive, modern, and stylized user interfaces while ensuring an easy-to-maintain and highly efficient web project.",
    },
    {
      id: 4,
      img: designIcon,
      para:
        "From designing captivating web pages to animating engaging promo videos for your product, I possess the expertise to breathe life into your ideas and turn them into reality!",
    },
    {
      id: 5,
      img: jsIcon,
      para:
        "If React isn't your preference and you seek to enhance your current website, my expertise in JavaScript and CSS can revitalize your brand without altering your existing designs. Let's work together to elevate your online presence and create a seamless user experience.",
    },
    {
      id: 6,
      img: analyticsIcon,
      para:
        "Leveraging web analytics tools, we can gain valuable insights into how your users interact with your product or brand, enabling data-driven decisions to enhance performance and user experience.",
    },
  ],

  interestsHeading: "Interests",
  interestsPara:
    "I am actively pursuing collaborative opportunities with companies, agencies, and individuals. My goal is not simply to work for them but to work with them, bringing my wealth of experience to the table. Together, we can synergistically address real business challenges, harnessing the collective power of our diverse expertise and knowledge.",
  // End interests Section -----------------

  //   Contact Section --------------

  contactSubHeading: "Let's create a new experience together!",
  social: [
    // Add Or Remove The Link Accordingly
    {
      img: linkedInIcon,
      url: "https://www.linkedin.com/in/thecristopher/",
    },
    {
      img: instagramIcon,
      url: "https://www.instagram.com/thecristopher/",
    },
    {
      img: tiktokIcon,
      url: "https://www.tiktok.com/@thecristopher11",
    },
    {
      img: twitchIcon,
      url: "https://www.twitch.tv/thecristopherofficial",
    },
  ],

  // End Contact Section ---------------
};

// Thanks for using this template, I would love to hear from you contact me at hello@chetanverma.com
