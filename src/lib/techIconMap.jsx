import { AiOutlineDotNet } from "react-icons/ai";
import {
  FaReact,
  FaDocker,
  FaPhp,
  FaAws,
  FaNodeJs,
  FaPython,
} from "react-icons/fa";
import { SiMysql, SiPostgresql } from "react-icons/si";
import { TbBrandCSharp, TbSql } from "react-icons/tb";
import { VscAzure } from "react-icons/vsc";

export const techIconMap = {
  React: <FaReact />,
  Docker: <FaDocker />,
  PHP: <FaPhp />,
  AWS: <FaAws />,
  "Node.js": <FaNodeJs />,
  MySQL: <SiMysql />,
  PostgreSQL: <SiPostgresql />,
  "C#": <TbBrandCSharp />,
  ".NET": <AiOutlineDotNet />,
  MVC: <AiOutlineDotNet />,
  "SQL Server": <TbSql />,
  SQL: <TbSql />,
  Python: <FaPython />,
  Azure: <VscAzure />,
};
