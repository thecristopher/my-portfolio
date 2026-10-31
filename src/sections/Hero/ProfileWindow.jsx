import EditorWindow from "../../components/EditorWindow";
import { useGetProjectsQuery } from "../../api/projectsApi";
import { useGetContactQuery } from "../../api/contactApi";
import { Trigger as NichirinBlade } from "../../components/Relics/DemonSlayer";
import { Trigger as SpiderEmblem } from "../../components/Relics/SpiderMan";

// Eldentree's highlight groups: keywords in bold gold, properties in rosewater, strings in grace green,
// numbers in steel blue, types in arcane purple and comments in italic mist
const Keyword = ({ children }) => <span className="font-semibold text-accent">{children}</span>;
const Prop = ({ children }) => <span className="text-rose">{children}</span>;
const Str = ({ children }) => <span className="text-string">"{children}"</span>;
const Num = ({ children }) => <span className="text-blue">{children}</span>;
const Type = ({ children }) => <span className="text-lavender">{children}</span>;
const Comment = ({ children }) => <span className="text-faint italic">{`// ${children}`}</span>;
const Punct = ({ children }) => <span className="text-faint">{children}</span>;

const List = ({ items }) => (
  <>
    <Punct>[</Punct>
    {items.map((item, index) => (
      <span key={item}>
        <Str>{item}</Str>
        {index < items.length - 1 && <Punct>, </Punct>}
      </span>
    ))}
    <Punct>]</Punct>
  </>
);

const Field = ({ name, children, comment, relic }) => (
  <div className="flex items-center pl-4 sm:pl-6">
    <span>
    <Prop>{name}</Prop>
    <Punct>: </Punct>
    {children}
    <Punct>,</Punct>
    {comment && (
      <>
        {" "}
        <Comment>{comment}</Comment>
      </>
    )}
    </span>
    {/* zero height, so a relic never makes its line taller than the others */}
    {relic && <span className="ml-2 inline-flex h-0 items-center">{relic}</span>}
  </div>
);

const latestRole = (project) => project?.roles?.at(-1) ?? null;

// everything a recruiter scans for first, in one place: who, where, what now, with what, and how to reach me
const fieldsFor = ({ about, current, contact }) =>
  [
    { name: "name", value: <Str>{about.name}</Str> },
    { name: "role", value: <Str>{about.role}</Str> },
    current && { name: "currently", value: <Str>{`${latestRole(current) ?? about.role} @ ${current.title}`}</Str> },
    { name: "yearsShipping", value: <Num>{about.years_of_experience}</Num>, comment: "intern to engineering manager" },
    { name: "basedIn", value: <Str>{about.location}</Str>, comment: about.timezone },
    about.open_to && { name: "openTo", value: <Str>{about.open_to}</Str> },
    about.work_modes?.length > 0 && { name: "workModes", value: <List items={about.work_modes} /> },
    { name: "stack", value: <List items={about.main_stack} /> },
    about.expertise?.length > 0 && { name: "leads", value: <List items={about.expertise.slice(0, 3)} /> },
    about.certifications?.length > 0 && {
      name: "certified",
      value: <List items={about.certifications.map((cert) => cert.name.replace("AWS Certified ", "AWS "))} />,
      // the exams took total concentration, so Tanjiro's blade rests beside them
      relic: <NichirinBlade zoom={0.42} />,
    },
    about.education?.[0] && {
      name: "studied",
      value: <Str>{about.education[0].degree}</Str>,
      comment: about.education[0].school,
      // Peter Parker was a student first, so his spider clings to where I studied
      relic: <SpiderEmblem zoom={0.42} />,
    },
    about.languages?.length > 0 && { name: "speaks", value: <List items={about.languages.map((language) => (language.level ? `${language.name} (${language.level})` : language.name))} /> },
    contact && { name: "email", value: <Str>{contact.email}</Str> },
    { name: "editor", value: <Str>{about.editor}</Str>, comment: "eldentree, obviously" },
  ].filter(Boolean);

/**
 * The page's greeter: profile.ts, the whole profile at a glance written as code in Eldentree's colors, education and
 * certifications included. The sections below tell the rest in full.
 */
const ProfileWindow = ({ about }) => {
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: contact } = useGetContactQuery();
  if (!about) return null;
  const fields = fieldsFor({ about, current: projects[0], contact });

  return (
    <EditorWindow path={["cristopher", "src", "profile.ts"]} lines={fields.length + 4}>
      <pre className="no-scrollbar overflow-x-auto font-mono text-[11px] leading-[1.7] whitespace-pre sm:text-[13px]">
        <div>
          <Keyword>export const</Keyword> <span className="text-fg">cristopher</span>
          <Punct>: </Punct>
          <Type>Engineer</Type> <Punct>= {"{"}</Punct>
        </div>
        {fields.map((field) => (
          <Field key={field.name} name={field.name} comment={field.comment} relic={field.relic}>
            {field.value}
          </Field>
        ))}
        <div>
          <Punct>{"}"};</Punct>
        </div>
        <div>&nbsp;</div>
        <div>
          <Comment>scroll on, the rest of the story is below</Comment>
          <span className="caret ml-0.5 inline-block h-4 w-2 translate-y-0.5 bg-accent" aria-hidden="true" />
        </div>
      </pre>
    </EditorWindow>
  );
};

export default ProfileWindow;
