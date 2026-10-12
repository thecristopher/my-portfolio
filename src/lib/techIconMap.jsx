import { AiOutlineDotNet } from "react-icons/ai";
import { FaAws, FaDocker, FaNodeJs, FaPhp, FaPython, FaReact } from "react-icons/fa";
import {
  SiClaude,
  SiGithubactions,
  SiJavascript,
  SiKubernetes,
  SiMysql,
  SiNextdotjs,
  SiOpensearch,
  SiPostgresql,
  SiServerless,
  SiSymfony,
  SiTerraform,
  SiTypescript,
} from "react-icons/si";
import { TbBrandCSharp, TbDatabase, TbLambda, TbSql } from "react-icons/tb";
import { VscAzure } from "react-icons/vsc";

export const techIconMap = {
  React: FaReact,
  Docker: FaDocker,
  PHP: FaPhp,
  AWS: FaAws,
  "Node.js": FaNodeJs,
  MySQL: SiMysql,
  PostgreSQL: SiPostgresql,
  "C#": TbBrandCSharp,
  ".NET": AiOutlineDotNet,
  MVC: AiOutlineDotNet,
  "SQL Server": TbSql,
  SQL: TbSql,
  Python: FaPython,
  Azure: VscAzure,
  TypeScript: SiTypescript,
  "Next.js": SiNextdotjs,
  Serverless: SiServerless,
  // Simple Icons dropped the DynamoDB logo, so it gets the generic database glyph
  DynamoDB: TbDatabase,
  Aurora: TbDatabase,
  Lambda: TbLambda,
  "GitHub Actions": SiGithubactions,
  JavaScript: SiJavascript,
  Bedrock: FaAws,
  LLMs: SiClaude,
  Terraform: SiTerraform,
  Kubernetes: SiKubernetes,
  OpenSearch: SiOpensearch,
  Symfony: SiSymfony,
};
