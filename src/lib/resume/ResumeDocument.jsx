import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

// plain Helvetica, black text and one quiet gold rule: what reads best printed, and what applicant tracking
// systems parse without guessing
const INK = "#16130f";
const MUTED = "#5b5348";
const FAINT = "#8a8073";
const GOLD = "#a8862f";

const styles = StyleSheet.create({
  page: { paddingVertical: 34, paddingHorizontal: 40, fontFamily: "Helvetica", fontSize: 9.2, lineHeight: 1.4, color: INK },
  name: { fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.1, letterSpacing: -0.3 },
  headline: { marginTop: 5, fontSize: 10.5, color: MUTED },
  contact: { marginTop: 6, flexDirection: "row", flexWrap: "wrap", fontSize: 8.5, color: MUTED },
  contactItem: { marginRight: 10 },
  link: { color: MUTED, textDecoration: "none" },
  rule: { marginTop: 10, height: 1, backgroundColor: GOLD, opacity: 0.6 },
  section: { marginTop: 12 },
  heading: { fontFamily: "Helvetica-Bold", fontSize: 8.5, letterSpacing: 1.6, color: GOLD, textTransform: "uppercase", marginBottom: 5 },
  paragraph: { color: INK },
  role: { marginBottom: 8 },
  roleTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  company: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  dates: { fontSize: 8.5, color: FAINT },
  title: { fontSize: 9.5, color: MUTED, marginTop: 1 },
  bullet: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10, color: GOLD },
  bulletText: { flex: 1 },
  stack: { marginTop: 3, fontSize: 8, color: FAINT },
  twoColumns: { flexDirection: "row", gap: 18 },
  column: { flex: 1 },
  skillRow: { flexDirection: "row", marginBottom: 2 },
  skillCategory: { width: 92, fontFamily: "Helvetica-Bold", fontSize: 8.6 },
  skillItems: { flex: 1, fontSize: 8.6 },
  project: { marginBottom: 5 },
  projectTitle: { fontFamily: "Helvetica-Bold" },
  small: { fontSize: 8.6, color: MUTED },
  footer: { position: "absolute", bottom: 18, left: 40, right: 40, fontSize: 7.5, color: FAINT, flexDirection: "row", justifyContent: "space-between" },
});

const Section = ({ title, children, wrap = true }) => (
  <View style={styles.section} wrap={wrap}>
    {/* a heading never sits alone at the bottom of a page, it moves over with its first entry */}
    <Text style={styles.heading} minPresenceAhead={48}>
      {title}
    </Text>
    {children}
  </View>
);

const Bullet = ({ children }) => (
  <View style={styles.bullet}>
    <Text style={styles.bulletDot}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const Role = ({ role }) => (
  <View style={styles.role} wrap={false}>
    <View style={styles.roleTop}>
      <Text style={styles.company}>{role.company}</Text>
      {role.dates && <Text style={styles.dates}>{role.dates}</Text>}
    </View>
    {role.title && (
      <Text style={styles.title}>
        {role.title}
        {role.location ? `  ·  ${role.location}` : ""}
        {role.teamSize ? `  ·  led a team of ${role.teamSize}` : ""}
      </Text>
    )}
    {role.bullets.length > 0 ? role.bullets.map((bullet) => <Bullet key={bullet}>{bullet}</Bullet>) : <Text>{role.summary}</Text>}
    {role.stack.length > 0 && <Text style={styles.stack}>{role.stack.join(" · ")}</Text>}
  </View>
);

const Header = ({ resume }) => (
  <View>
    <Text style={styles.name}>{resume.name}</Text>
    <Text style={styles.headline}>{resume.headline}</Text>
    <View style={styles.contact}>
      {resume.contactLine.map((item) => {
        const link = resume.links.find((candidate) => candidate.label === item);
        const href = link?.url ?? (item === resume.email ? `mailto:${item}` : item === resume.site ? `https://${item}` : null);
        return (
          <Text key={item} style={styles.contactItem}>
            {href ? (
              <Link src={href} style={styles.link}>
                {item}
              </Link>
            ) : (
              item
            )}
          </Text>
        );
      })}
    </View>
    <View style={styles.rule} />
  </View>
);

/**
 * The resume as a real pdf: one column, standard section names, selectable text and working links.
 * @param {{ resume: object }} props the output of buildResume
 */
const ResumeDocument = ({ resume }) => (
  <Document title={`${resume.name} · Resume`} author={resume.name} subject={resume.headline} keywords={resume.expertise.join(", ")}>
    <Page size="LETTER" style={styles.page}>
      <Header resume={resume} />

      <Section title="Summary">
        <Text style={styles.paragraph}>{resume.summary}</Text>
        {resume.openTo && <Text style={[styles.small, { marginTop: 3 }]}>Open to: {resume.openTo}</Text>}
      </Section>

      <Section title="Experience">
        {resume.experience.map((role) => (
          <Role key={role.company} role={role} />
        ))}
      </Section>

      {resume.projects.length > 0 && (
        <Section title="Selected projects">
          {resume.projects.map((project) => (
            <View key={project.title} style={styles.project} wrap={false}>
              <Text>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.small}>{`  ·  ${project.context}`}</Text>
              </Text>
              <Text>{`${project.summary} ${project.outcome}`}</Text>
              {project.metrics.length > 0 && <Text style={styles.small}>{project.metrics.map((metric) => `${metric.value} ${metric.label}`).join("  ·  ")}</Text>}
            </View>
          ))}
        </Section>
      )}

      <Section title="Skills" wrap={false}>
        {resume.skills.map((group) => (
          <View key={group.category} style={styles.skillRow}>
            <Text style={styles.skillCategory}>{group.category}</Text>
            <Text style={styles.skillItems}>{group.items.join(", ")}</Text>
          </View>
        ))}
        {resume.expertise.length > 0 && (
          <View style={styles.skillRow}>
            <Text style={styles.skillCategory}>Leadership</Text>
            <Text style={styles.skillItems}>{resume.expertise.join(", ")}</Text>
          </View>
        )}
      </Section>

      <View style={styles.twoColumns} wrap={false}>
        <View style={styles.column}>
          <Section title="Education">
            {resume.education.map((school) => (
              <View key={school.school}>
                <Text style={styles.projectTitle}>{school.degree}</Text>
                <Text style={styles.small}>
                  {school.school}, {school.location}
                  {school.years ? `  ·  ${school.years}` : ""}
                </Text>
              </View>
            ))}
          </Section>
        </View>
        <View style={styles.column}>
          <Section title="Certifications">
            {resume.certifications.map((cert) => (
              <Text key={cert.name}>
                {cert.name}
                {cert.year ? `  ·  ${cert.year}` : ""}
              </Text>
            ))}
          </Section>
          {resume.languages && (
            <Section title="Languages">
              <Text>{resume.languages}</Text>
            </Section>
          )}
        </View>
      </View>

      <View style={styles.footer} fixed>
        <Text>{resume.name} · Resume</Text>
        <Text render={({ pageNumber, totalPages }) => `${resume.site}  ·  ${pageNumber}/${totalPages}`} />
      </View>
    </Page>
  </Document>
);

export default ResumeDocument;
