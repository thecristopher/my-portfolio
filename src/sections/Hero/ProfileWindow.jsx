import EditorWindow from "../../components/EditorWindow";
import { useGetProjectsQuery } from "../../api/projectsApi";

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

const Field = ({ name, children, comment }) => (
  <div className="pl-4 sm:pl-6">
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
  </div>
);

// only the facts the api actually has, so a field nobody filled in never shows up as a guess
const fieldsFor = (about, current) =>
  [
    { name: "name", value: <Str>{about.name}</Str> },
    { name: "role", value: <Str>{about.role}</Str> },
    current && { name: "currently", value: <Str>{current.title}</Str>, comment: current.products },
    { name: "yearsShipping", value: <Num>{about.years_of_experience}</Num>, comment: "and counting" },
    { name: "location", value: <Str>{about.location}</Str> },
    { name: "timezone", value: <Str>{about.timezone}</Str> },
    about.work_modes?.length > 0 && { name: "workModes", value: <List items={about.work_modes} /> },
    about.open_to && { name: "openTo", value: <Str>{about.open_to}</Str> },
    { name: "stack", value: <List items={about.main_stack.slice(0, 6)} /> },
    about.certifications?.length > 0 && { name: "certified", value: <List items={about.certifications.map((cert) => cert.name.replace("AWS Certified ", "AWS "))} /> },
    about.languages?.length > 0 && { name: "speaks", value: <List items={about.languages.map((language) => language.name)} /> },
    { name: "editor", value: <Str>{about.editor}</Str>, comment: "eldentree, obviously" },
  ].filter(Boolean);

/**
 * The hero's reveal: profile.ts, the facts a recruiter scans for first, written as code in Eldentree's colors.
 */
const ProfileWindow = ({ about }) => {
  const { data: projects = [] } = useGetProjectsQuery();
  if (!about) return null;
  const latest = projects[0];
  const current = latest && { title: latest.title, products: latest.description.match(/: ([^.]+)\./)?.[1] ?? null };
  const fields = fieldsFor(about, current);

  return (
    <EditorWindow path={["cristopher", "src", "profile.ts"]} lines={fields.length + 4}>
      <pre className="overflow-x-auto font-mono text-[12px] leading-[1.75] whitespace-pre sm:text-[13px]">
        <div>
          <Keyword>export const</Keyword> <span className="text-fg">cristopher</span>
          <Punct>: </Punct>
          <Type>Engineer</Type> <Punct>= {"{"}</Punct>
        </div>
        {fields.map((field) => (
          <Field key={field.name} name={field.name} comment={field.comment}>
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
