"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { cn } from "../lib/utils";
import {
  Zap,
  X,
  Upload,
  CheckCircle2,
  FileText,
  Briefcase,
  Loader2,
  ExternalLink,
  AlertCircle,
  Info,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Code,
  Layers,
  Sparkles,
  Copy,
  Check,
  User,
  Building2,
  FolderGit2,
  GraduationCap,
  Award,
  BookOpen,
  Trophy,
  Languages,
  ChevronsUpDown,
} from "lucide-react";

// ============================================================
// PDF VIEWER — lazy-loaded, client-only
// ============================================================
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PDFLoadingPlaceholder /> }
);

const PDFLoadingPlaceholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-[#0D0D1A]">
    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
    <span className="text-neutral-500 text-sm">Loading PDF viewer…</span>
  </div>
);

// ============================================================
// FONT
// ============================================================
Font.register({
  family: "Times-Roman",
  src: "http://fonts.gstatic.com/s/tinos/v15/rr0ijBVAkixDK-Nuba7zP20.ttf",
});

// ============================================================
// PDF STYLES
// ============================================================
const pdfStyles = StyleSheet.create({
  page: { flexDirection: "column", backgroundColor: "#FFFFFF", padding: 20 },
  section: { marginTop: 3, marginBottom: 5 },
  header: { alignItems: "center", justifyContent: "center", width: "100%" },
  nameText: {
    fontSize: 18,
    fontFamily: "Times-Roman",
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000",
    textTransform: "uppercase",
  },
  skillsText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    textAlign: "center",
    color: "#000000",
    textTransform: "none",
  },
  headerContactText: {
    marginTop: 3,
    marginBottom: 2,
    fontSize: 13,
    fontFamily: "Times-Roman",
    textAlign: "center",
    color: "#303030",
    textTransform: "none",
  },
  separator: {
    height: 0.5,
    backgroundColor: "#D9D9D9",
    width: "100%",
    marginTop: 5,
  },
  sectionTitle: {
    marginTop: 1,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#000000",
    textTransform: "uppercase",
  },
  summaryContent: {
    marginTop: 5,
    fontSize: 13,
    fontFamily: "Times-Roman",
    color: "#303030",
    textAlign: "justify",
  },
  skillsContent: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#303030",
    textTransform: "none",
  },
  listOfSkills: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: "Times-Roman",
    color: "#303030",
    textTransform: "none",
    fontWeight: "normal",
  },
  experienceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    fontSize: 13,
    fontFamily: "Times-Roman",
    color: "#303030",
  },
  bulletPoint: {
    flexDirection: "row",
    marginTop: 3,
    fontSize: 13,
    fontFamily: "Times-Roman",
    color: "#303030",
    textAlign: "justify",
  },
  bullet: { width: 10, fontSize: 13, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 13 },
  techStackLabel: {
    marginTop: 3,
    fontSize: 13,
    fontWeight: "bold",
    color: "#000000",
    fontFamily: "Times-Roman",
  },
  techStackValue: {
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: "normal",
    color: "#303030",
    fontFamily: "Times-Roman",
  },
  educationDegree: {
    marginTop: 2,
    fontSize: 13,
    fontFamily: "Times-Roman",
    color: "#303030",
  },
  projectName: {
    fontSize: 13,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#303030",
  },
  link: { color: "#2563EB", textDecoration: "underline" },
});

// ============================================================
// SECTION CONFIGURATION & THEMES
// ============================================================
const SECTION_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  header: { label: "Header", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.15)", icon: User },
  summary: { label: "Summary", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", icon: FileText },
  skills: { label: "Skills", color: "#6366f1", bg: "rgba(99, 102, 241, 0.15)", icon: Sparkles },
  experience: { label: "Experience", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.15)", icon: Briefcase },
  internships: { label: "Internships", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.15)", icon: Building2 },
  projects: { label: "Projects", color: "#14b8a6", bg: "rgba(20, 184, 166, 0.15)", icon: FolderGit2 },
  education: { label: "Education", color: "#10b981", bg: "rgba(16, 185, 129, 0.15)", icon: GraduationCap },
  certifications: { label: "Certifications", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.15)", icon: Award },
  training: { label: "Training", color: "#f97316", bg: "rgba(249, 115, 22, 0.15)", icon: BookOpen },
  achievements: { label: "Achievements", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.15)", icon: Trophy },
  languages: { label: "Languages", color: "#ec4899", bg: "rgba(236, 72, 153, 0.15)", icon: Languages },
  professionalLinks: { label: "Links", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.15)", icon: ExternalLink },
};

const getSectionCount = (data: any, key: string): string => {
  const val = data?.[key];
  if (!val) return "";
  if (Array.isArray(val)) return `${val.length} item${val.length === 1 ? "" : "s"}`;
  if (typeof val === "object") return `${Object.keys(val).length} fields`;
  if (typeof val === "string") return `${val.length} chars`;
  return "";
};

// ============================================================
// INITIAL DATA
// ============================================================
const INITIAL_RESUME_DATA = {
  header: {
    name: "John Doe",
    title:
      "Full Stack Software Engineer | TypeScript | React | Next.js | Node.js | Cloud Architecture",
    contact:
      "New York, USA | Phone:1234567890 | Email: john.doe@example.com",
    links: {
      linkedin: "https://www.linkedin.com/in/johndoe/",
      github: "https://github.com/johndoe",
      portfolio: "https://johndoe.example.com",
    },
  },
  summary:
    "Results-driven Software Engineer with 3+ years of experience designing and delivering scalable web applications and distributed backend services. Skilled in TypeScript, React, Next.js, Node.js, and cloud-native architectures with a strong focus on code quality, performance, and user experience.",
  skills: [
    { label: "Programming", value: "TypeScript, JavaScript, Python, Java, SQL" },
    {
      label: "Frameworks",
      value:
        "React, Next.js, Node.js, Express, Tailwind CSS, GraphQL",
    },
    { label: "Databases", value: "PostgreSQL, MongoDB, Redis, MySQL" },
    {
      label: "Tools & Cloud",
      value:
        "Git, Docker, Kubernetes, AWS, GitHub Actions, Postman",
    },
  ],
  experience: [
    {
      company: "Acme Corp",
      role: "Software Engineer",
      duration: "2023 - Present",
      link: "https://acme.example.com",
      points: [
        "Designed and maintained scalable REST and GraphQL APIs serving 100K+ monthly active users with 99.9% uptime.",
        "Built responsive front-end modules with React, TypeScript, and Next.js, improving page load performance by 35%.",
        "Collaborated with cross-functional teams to implement automated CI/CD pipelines using Docker and GitHub Actions.",
      ],
      techStack:
        "TypeScript, React, Next.js, Node.js, PostgreSQL, Docker",
    },
  ],
  projects: [
    {
      name: "TaskFlow Workspace",
      role: "Full Stack Project",
      duration: "Jan 2025 - Present",
      link: "https://github.com/johndoe/taskflow-workspace",
      points: [
        "Built a collaborative project management web app with real-time kanban boards and role-based access control.",
        "Implemented WebSocket event syncing for instant task updates across concurrent team sessions.",
        "Optimized database queries and caching with Redis, reducing API response latency by 45%.",
      ],
      techStack: "Next.js, TypeScript, PostgreSQL, Redis, Tailwind CSS",
    },
    {
      name: "CloudMetrics Dashboard",
      role: "Web Application",
      duration: "Jun 2024 - Dec 2024",
      link: "https://github.com/johndoe/cloudmetrics-dashboard",
      points: [
        "Created an analytics dashboard to monitor service health, request throughput, and error rates in real time.",
        "Integrated automated threshold alerts via webhooks and email notifications for incident response.",
        "Containerized microservices and deployed the stack using Docker Compose and CI workflows.",
      ],
      techStack: "React, Node.js, Express, MongoDB, Docker",
    },
    {
      name: "ShopSphere Storefront",
      role: "E-Commerce Demo",
      duration: "Jan 2024 - May 2024",
      link: "https://github.com/johndoe/shopsphere-storefront",
      points: [
        "Developed a full-featured online storefront with product search, cart persistence, and checkout workflows.",
        "Integrated sandbox payment processing and order confirmation receipts with clean error handling.",
        "Improved mobile responsiveness and accessibility scores across core shopping pages.",
      ],
      techStack: "React, TypeScript, Node.js, PostgreSQL, Stripe",
    },
  ],
  education: [
    {
      college: "State University of Technology",
      degree: "B.S. in Computer Science",
      duration: "2019 - 2023",
    },
  ],
  certifications: [
    {
      name: "Certified Cloud Application Developer",
      issuer: "Open Cloud Foundation",
      date: "2024",
      link: "https://certs.example.com/verify/12345",
    },
  ],
  internships: [
    {
      company: "Globex Systems",
      role: "Software Engineering Intern",
      duration: "Jan 2023 - Jun 2023",
      link: "https://globex.example.com",
      points: [
        "Assisted in developing internal REST APIs and reusable UI components for customer onboarding workflows.",
        "Wrote unit and integration tests using Jest and Playwright, increasing test coverage by 25%.",
      ],
      techStack: "TypeScript, React, Node.js, PostgreSQL, Git",
    },
  ],
  achievements: [
    {
      title: "Annual Campus Hackathon Winner",
      issuer: "University Tech Society",
      year: "2023",
      points: [
        "Led a 4-person team to build an accessible transit routing prototype selected first out of 40 participating teams.",
      ],
    },
  ],
  training: [
    {
      name: "Full Stack Cloud Engineering Workshop",
      organization: "Tech Academy Online",
      duration: "2024",
      points: [
        "Completed hands-on training in distributed systems, container orchestration, and observability best practices.",
      ],
    },
  ],
  languages: [
    { language: "English", proficiency: "Native" },
    { language: "Spanish", proficiency: "Conversational" },
  ],
  professionalLinks: [
    { name: "GitHub", url: "https://github.com/johndoe" },
    { name: "LinkedIn", url: "https://www.linkedin.com/in/johndoe/" },
    { name: "Portfolio", url: "https://johndoe.example.com" },
    { name: "LeetCode", url: "https://leetcode.com/johndoe" },
    { name: "HackerRank", url: "https://hackerrank.com/johndoe" },
  ],
};

// ============================================================
// PDF DOCUMENT COMPONENT — Conditional sections
// ============================================================
const Separator = () => <View style={pdfStyles.separator} />;
const BulletPoint = ({ text }: { text: string }) => (
  <View style={pdfStyles.bulletPoint}>
    <Text style={pdfStyles.bullet}>•</Text>
    <Text style={pdfStyles.bulletText}>{text}</Text>
  </View>
);
const SectionHeader = ({ title }: { title: string }) => (
  <>
    <Text style={pdfStyles.sectionTitle}>{title}</Text>
    <Separator />
  </>
);

const ResumeDocument = ({
  data,
  hiddenSections = [],
}: {
  data: any;
  hiddenSections?: string[];
}) => {
  const isHidden = (key: string) => hiddenSections.includes(key);

  const hasHeader = !isHidden("header");
  const hasSummary = !isHidden("summary") && !!data.summary?.trim();
  const hasSkills = !isHidden("skills") && Array.isArray(data.skills) && data.skills.length > 0;
  const hasExperience = !isHidden("experience") && Array.isArray(data.experience) && data.experience.length > 0;

  const internshipsList: any[] = Array.isArray(data.internships)
    ? data.internships
    : data.internships
    ? [data.internships]
    : [];
  const hasInternships = !isHidden("internships") && internshipsList.length > 0;

  const hasProjects = !isHidden("projects") && Array.isArray(data.projects) && data.projects.length > 0;
  const educationList: any[] = Array.isArray(data.education)
    ? data.education
    : data.education
    ? [data.education]
    : [];
  const hasEducation =
    !isHidden("education") &&
    educationList.length > 0 &&
    educationList.some((edu: any) => edu && (edu.college || edu.degree || edu.duration));

  const certificationsList: any[] = Array.isArray(data.certifications)
    ? data.certifications
    : data.certifications
    ? [data.certifications]
    : [];
  const hasCertifications = !isHidden("certifications") && certificationsList.length > 0;

  const rawTraining = data.training || data.workshops || data.trainingWorkshops || data.trainings;
  const trainingList: any[] = Array.isArray(rawTraining)
    ? rawTraining
    : rawTraining
    ? [rawTraining]
    : [];
  const hasTraining = !isHidden("training") && trainingList.length > 0;

  const rawAchievements = data.achievements || data.achievementsAwards || data.awards;
  const achievementsList: any[] = Array.isArray(rawAchievements)
    ? rawAchievements
    : rawAchievements
    ? [rawAchievements]
    : [];
  const hasAchievements = !isHidden("achievements") && achievementsList.length > 0;

  const rawLanguages = data.languages || data.language;
  const languagesList: any[] = Array.isArray(rawLanguages)
    ? rawLanguages
    : rawLanguages
    ? [rawLanguages]
    : [];
  const hasLanguages = !isHidden("languages") && languagesList.length > 0;

  const rawLinks = data.professionalLinks;
  const professionalLinksList: any[] = Array.isArray(rawLinks)
    ? rawLinks
    : rawLinks && typeof rawLinks === "object"
    ? Object.entries(rawLinks).map(([k, v]) => ({
        name: k.charAt(0).toUpperCase() + k.slice(1),
        url: v,
      }))
    : [];
  const hasProfessionalLinks = !isHidden("professionalLinks") && professionalLinksList.length > 0;

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header — shown unless hidden */}
        {hasHeader && (
        <View style={pdfStyles.header}>
          <Text style={pdfStyles.nameText}>{data.header?.name || "Your Name"}</Text>
          <Separator />
          <Text style={pdfStyles.skillsText}>{data.header?.title || "Your Title"}</Text>
          <Text style={pdfStyles.headerContactText}>
            {data.header?.contact || "Contact Info"}
            {data.header?.links?.linkedin && (
              <Text>{" | "}<Link src={data.header.links.linkedin} style={pdfStyles.link}>LinkedIn</Link></Text>
            )}
            {data.header?.links?.github && (
              <Text>{" | "}<Link src={data.header.links.github} style={pdfStyles.link}>GitHub</Link></Text>
            )}
            {data.header?.links?.portfolio && (
              <Text>{" | "}<Link src={data.header.links.portfolio} style={pdfStyles.link}>Portfolio</Link></Text>
            )}
          </Text>
        </View>
        )}

        {/* Summary — only if present */}
        {hasSummary && (
          <View style={pdfStyles.section}>
            <SectionHeader title="SUMMARY" />
            <Text style={pdfStyles.summaryContent}>{data.summary}</Text>
          </View>
        )}

        {/* Skills — only if present */}
        {hasSkills && (
          <View style={pdfStyles.section}>
            <SectionHeader title="SKILLS" />
            {data.skills.map((skill: any, i: number) => (
              <Text key={i} style={pdfStyles.skillsContent}>
                {skill.label}: <Text style={pdfStyles.listOfSkills}>{skill.value}</Text>
              </Text>
            ))}
          </View>
        )}

        {/* Experience — only if present */}
        {hasExperience && (
          <View style={pdfStyles.section}>
            <SectionHeader title="EXPERIENCE" />
            {data.experience.map((exp: any, i: number) => (
              <View key={i} style={{ marginTop: i > 0 ? 8 : 0 }}>
                <View style={pdfStyles.experienceContent}>
                  <Text style={pdfStyles.projectName}>
                    {exp.role} | {exp.company}
                    {exp.link && (
                      <Text style={{ fontWeight: "normal" }}>
                        {" | "}<Link src={exp.link} style={pdfStyles.link}>Project Link</Link>
                      </Text>
                    )}
                  </Text>
                  <Text>{exp.duration}</Text>
                </View>
                {exp.points?.map((p: string, j: number) => p && <BulletPoint key={j} text={p} />)}
                {exp.techStack && (
                  <Text style={pdfStyles.techStackLabel}>
                    Tech Stack: <Text style={pdfStyles.techStackValue}>{exp.techStack}</Text>
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Internships — only if present */}
        {hasInternships && (
          <View style={pdfStyles.section}>
            <SectionHeader title="INTERNSHIPS" />
            {internshipsList.map((intern: any, i: number) => {
              const points = Array.isArray(intern.points)
                ? intern.points
                : Array.isArray(intern.responsibilities)
                ? intern.responsibilities
                : [];
              const tech = intern.techStack || intern.technologies;
              return (
                <View key={i} style={{ marginTop: i > 0 ? 8 : 0 }}>
                  <View style={pdfStyles.experienceContent}>
                    <Text style={pdfStyles.projectName}>
                      {intern.role} | {intern.company}
                      {intern.link && (
                        <Text style={{ fontWeight: "normal" }}>
                          {" | "}<Link src={intern.link} style={pdfStyles.link}>Project Link</Link>
                        </Text>
                      )}
                    </Text>
                    <Text>{intern.duration}</Text>
                  </View>
                  {points.map((p: string, j: number) => p && <BulletPoint key={j} text={p} />)}
                  {tech && (
                    <Text style={pdfStyles.techStackLabel}>
                      Tech Stack: <Text style={pdfStyles.techStackValue}>{tech}</Text>
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Projects — only if present */}
        {hasProjects && (
          <View style={pdfStyles.section}>
            <SectionHeader title="PROJECTS" />
            {data.projects.map((proj: any, i: number) => (
              <View key={i} style={{ marginTop: i > 0 ? 5 : 0 }}>
                <View style={pdfStyles.experienceContent}>
                  <Text style={pdfStyles.projectName}>
                    {proj.name} | {proj.role}
                    {proj.link && (
                      <Text style={{ fontWeight: "normal" }}>
                        {" | "}<Link src={proj.link} style={pdfStyles.link}>Project Link</Link>
                      </Text>
                    )}
                  </Text>
                  <Text>{proj.duration}</Text>
                </View>
                {proj.points?.map((p: string, j: number) => p && <BulletPoint key={j} text={p} />)}
                {proj.techStack && (
                  <Text style={pdfStyles.techStackLabel}>
                    Tech Stack: <Text style={pdfStyles.techStackValue}>{proj.techStack}</Text>
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education — only if present */}
        {hasEducation && (
          <View style={pdfStyles.section}>
            <SectionHeader title="EDUCATION" />
            {educationList.map((edu: any, i: number) => (
              <View key={i} style={{ marginTop: i > 0 ? 5 : 0 }}>
                <View style={pdfStyles.experienceContent}>
                  <View style={{ flex: 1 }}>
                    <Text style={pdfStyles.projectName}>{edu.college}</Text>
                    <Text style={pdfStyles.educationDegree}>{edu.degree}</Text>
                  </View>
                  <Text>{edu.duration}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Certifications — only if present */}
        {hasCertifications && (
          <View style={pdfStyles.section}>
            <SectionHeader title="CERTIFICATIONS" />
            {certificationsList.map((cert: any, i: number) => {
              const name = cert.name || cert.title || cert.certification;
              const issuer = cert.issuer || cert.organization || cert.issuingOrganization;
              const link = cert.link || cert.credentialUrl || cert.url;
              const date = cert.date || cert.issueDate;
              return (
                <View key={i} style={{ marginTop: i > 0 ? 5 : 0 }}>
                  <View style={pdfStyles.experienceContent}>
                    <Text style={pdfStyles.projectName}>
                      {name}
                      {issuer ? <Text style={{ fontWeight: "normal" }}>{` | ${issuer}`}</Text> : null}
                      {link ? (
                        <Text style={{ fontWeight: "normal" }}>
                          {" | "}<Link src={link} style={pdfStyles.link}>Credential</Link>
                        </Text>
                      ) : null}
                    </Text>
                    {date ? <Text>{date}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Training & Workshops — only if present */}
        {hasTraining && (
          <View style={pdfStyles.section}>
            <SectionHeader title="TRAINING & WORKSHOPS" />
            {trainingList.map((item: any, i: number) => {
              if (typeof item === "string") {
                return <BulletPoint key={i} text={item} />;
              }
              const name = item.name || item.title || item.program;
              const org = item.organization || item.institution || item.provider;
              const duration = item.duration || item.date || item.year;
              const link = item.link || item.url;
              const points = Array.isArray(item.points)
                ? item.points
                : item.description
                ? [item.description]
                : [];
              return (
                <View key={i} style={{ marginTop: i > 0 ? 5 : 0 }}>
                  <View style={pdfStyles.experienceContent}>
                    <Text style={pdfStyles.projectName}>
                      {name}
                      {org ? <Text style={{ fontWeight: "normal" }}>{` | ${org}`}</Text> : null}
                      {link ? (
                        <Text style={{ fontWeight: "normal" }}>
                          {" | "}<Link src={link} style={pdfStyles.link}>Link</Link>
                        </Text>
                      ) : null}
                    </Text>
                    {duration ? <Text>{duration}</Text> : null}
                  </View>
                  {points.map((p: string, j: number) => p && <BulletPoint key={j} text={p} />)}
                </View>
              );
            })}
          </View>
        )}

        {/* Achievements & Awards — only if present */}
        {hasAchievements && (
          <View style={pdfStyles.section}>
            <SectionHeader title="ACHIEVEMENTS & AWARDS" />
            {achievementsList.map((ach: any, i: number) => {
              if (typeof ach === "string") {
                return <BulletPoint key={i} text={ach} />;
              }
              const title = ach.title || ach.name || ach.award;
              const issuer = ach.issuer || ach.organization || ach.competition;
              const year = ach.year || ach.date;
              const points = Array.isArray(ach.points)
                ? ach.points
                : ach.description
                ? [ach.description]
                : [];
              return (
                <View key={i} style={{ marginTop: i > 0 ? 5 : 0 }}>
                  <View style={pdfStyles.experienceContent}>
                    <Text style={pdfStyles.projectName}>
                      {title}
                      {issuer ? <Text style={{ fontWeight: "normal" }}>{` | ${issuer}`}</Text> : null}
                    </Text>
                    {year ? <Text>{year}</Text> : null}
                  </View>
                  {points.map((p: string, j: number) => p && <BulletPoint key={j} text={p} />)}
                </View>
              );
            })}
          </View>
        )}

        {/* Languages — only if present */}
        {hasLanguages && (
          <View style={pdfStyles.section}>
            <SectionHeader title="LANGUAGES" />
            {languagesList.map((lang: any, i: number) => {
              if (typeof lang === "string") {
                return (
                  <Text key={i} style={pdfStyles.skillsContent}>
                    {lang}
                  </Text>
                );
              }
              const name = lang.language || lang.name || "";
              const level = lang.proficiency || lang.level || "";
              return (
                <Text key={i} style={pdfStyles.skillsContent}>
                  {name}{level ? <Text>: <Text style={pdfStyles.listOfSkills}>{level}</Text></Text> : ""}
                </Text>
              );
            })}
          </View>
        )}

        {/* Professional Links — only if present */}
        {hasProfessionalLinks && (
          <View style={pdfStyles.section}>
            <SectionHeader title="PROFESSIONAL LINKS" />
            {professionalLinksList.map((item: any, i: number) => {
              const name = item.name || item.label || "Link";
              const url = item.url || item.link;
              return (
                <Text key={i} style={pdfStyles.skillsContent}>
                  {name}: {url ? <Link src={url} style={pdfStyles.link}>{url}</Link> : ""}
                </Text>
              );
            })}
          </View>
        )}
      </Page>
    </Document>
  );
};

// ============================================================
// STORAGE KEY
// ============================================================
const WELCOME_SEEN_KEY = "resume_maker_welcome_seen";

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function Home() {
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(INITIAL_RESUME_DATA, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Hidden sections in PDF resume (hide and show)
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  // Active/highlighted section
  const [activeSection, setActiveSection] = useState<string>("header");
  // Active line in code mode
  const [activeLine, setActiveLine] = useState<number>(1);
  // Copied state
  const [copied, setCopied] = useState<boolean>(false);
  // Highlight pulse animation trigger
  const [highlightPulse, setHighlightPulse] = useState<string | null>(null);

  // References
  const fullTextareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => jsonInput.split("\n"), [jsonInput]);

  const sectionLineRanges = useMemo(() => {
    const allLines = jsonInput.split("\n");
    const ranges: Record<string, { start: number; end: number }> = {};
    const keys = Object.keys(SECTION_CONFIG);
    let currentKey: string | null = null;
    let currentStart = 0;

    for (let i = 0; i < allLines.length; i++) {
      const line = allLines[i];
      for (const key of keys) {
        const regex = new RegExp(`^\\s*"${key}"\\s*:`);
        if (regex.test(line)) {
          if (currentKey) {
            ranges[currentKey] = { start: currentStart, end: i - 1 };
          }
          currentKey = key;
          currentStart = i;
          break;
        }
      }
    }
    if (currentKey) {
      ranges[currentKey] = { start: currentStart, end: allLines.length - 1 };
    }
    return ranges;
  }, [jsonInput]);

  const getSectionForLine = useCallback(
    (lineIdx: number): string | null => {
      for (const [key, range] of Object.entries(sectionLineRanges) as [string, { start: number; end: number }][]) {
        if (lineIdx >= range.start && lineIdx <= range.end) {
          return key;
        }
      }
      return null;
    },
    [sectionLineRanges]
  );

  const toggleSectionVisibility = (key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setHiddenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonInput(formatted);
      setResumeData(parsed);
      setJsonError(null);
    } catch {
      // Keep existing if invalid
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToSection = (key: string) => {
    setActiveSection(key);
    setHighlightPulse(key);
    setTimeout(() => setHighlightPulse(null), 1600);

    const range = sectionLineRanges[key];
    if (range && fullTextareaRef.current) {
      fullTextareaRef.current.scrollTop = Math.max(0, range.start * 20);
      if (gutterRef.current) {
        gutterRef.current.scrollTop = Math.max(0, range.start * 20);
      }
    }
  };

  // Welcome modal
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [pdfReady, setPdfReady] = useState(false);

  // Ask AI modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStep, setAiStep] = useState<"idle" | "reading" | "generating" | "done">("idle");
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── First-time welcome ──────────────────────────────────
  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!seen) {
      setShowWelcome(true);
    } else {
      setPdfReady(true);
    }
  }, []);

  // ── Progress bar ────────────────────────────────────────
  useEffect(() => {
    if (!showWelcome) return;
    const duration = 5000;
    const step = 50;
    let elapsed = 0;
    const id = setInterval(() => {
      elapsed += step;
      setWelcomeProgress(Math.min((elapsed / duration) * 100, 100));
      if (elapsed >= duration) {
        clearInterval(id);
        closeWelcome();
      }
    }, step);
    return () => clearInterval(id);
  }, [showWelcome]);

  const closeWelcome = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, "1");
    setShowWelcome(false);
    setPdfReady(true);
  };

  // ── Page unload guards ──────────────────────────────────
  useEffect(() => {
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Unsaved changes will be lost — are you sure?";
      return e.returnValue;
    };
    const pageHideHandler = () => localStorage.removeItem(WELCOME_SEEN_KEY);
    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("pagehide", pageHideHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("pagehide", pageHideHandler);
    };
  }, []);

  // ── Mobile detection ────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── JSON editor ─────────────────────────────────────────
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setJsonInput(val);
    try {
      setResumeData(JSON.parse(val));
      setJsonError(null);
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  // ── PDF to base64 ────────────────────────────────────────
  const pdfToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // result is like "data:application/pdf;base64,XXXXXX"
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = () => reject(new Error("Failed to read PDF file."));
      reader.readAsDataURL(file);
    });
  }, []);

  // ── Ask AI ───────────────────────────────────────────────
  const handleAskAi = async () => {
    if (!geminiApiKey.trim()) { setAiError("Please enter your Gemini API key."); return; }
    if (!pdfFile) { setAiError("Please upload your resume PDF."); return; }
    if (!jobDescription.trim()) { setAiError("Please enter the job description."); return; }
    setAiError(null);
    setAiLoading(true);
    setAiStep("reading");
    try {
      const pdfBase64 = await pdfToBase64(pdfFile);
      setAiStep("generating");
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey.trim(),
          pdfBase64,
          jobDescription,
          existingJson: jsonInput,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
      setAiStep("done");
      const parsed = JSON.parse(data.result);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setResumeData(parsed);
      setTimeout(() => {
        setShowAiModal(false);
        setPdfFile(null);
        setJobDescription("");
        setAiStep("idle");
      }, 600);
    } catch (err) {
      setAiError((err as Error).message || "Something went wrong.");
      setAiStep("idle");
    } finally {
      setAiLoading(false);
    }
  };

  const closeAiModal = () => {
    setShowAiModal(false);
    setAiError(null);
    setAiStep("idle");
  };

  // ── Mobile gate ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090F] p-6 text-center">
        <div className="max-w-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-linear-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-violet-900/60">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Desktop Only</h1>
          <p className="text-neutral-400 text-sm">
            This app is optimised for desktop. Please open it on a larger screen.
          </p>
        </div>
      </div>
    );
  }

  const stepLabel = aiStep === "reading"
    ? "Reading PDF…"
    : aiStep === "generating"
      ? "Generating with AI…"
      : aiStep === "done"
        ? "Done! Applying…"
        : "Generate with AI";

  // ─────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#09090F] overflow-hidden font-sans">

      {/* ══════════ WELCOME MODAL ═══════════════════════════ */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
          <div
            className="relative rounded-3xl overflow-hidden max-w-sm w-full mx-4 text-center"
            style={{ animation: "modalIn .4s cubic-bezier(.16,1,.3,1)" }}
          >
            {/* Glass card */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1a1030]/95 via-[#12101e]/95 to-[#0f0c1e]/95 border border-violet-500/20 rounded-3xl backdrop-blur-xl" />
            {/* Glow blobs */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-8">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-linear-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-900/60">
                <Zap className="w-8 h-8 text-white" />
              </div>

              <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-1">Developed by</p>
              <h2 className="text-2xl font-bold text-white mb-0.5">Eswar</h2>
              <p className="text-sm text-neutral-400 mb-1">Full Stack &amp; AI Developer</p>
              <a
                href="https://eswarb.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors"
              >
                eswarb.vercel.app <ExternalLink className="w-3 h-3" />
              </a>

              <div className="mt-4 px-4 py-2.5 bg-violet-900/30 rounded-xl border border-violet-500/20">
                <p className="text-violet-300 text-xs font-semibold">✨ AI-Powered Resume Builder</p>
                <p className="text-neutral-500 text-xs mt-0.5">Powered by Gemini 2.0 Flash</p>
              </div>

              {/* Progress */}
              <div className="mt-5 w-full bg-white/5 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-violet-500 to-purple-500 rounded-full"
                  style={{ width: `${welcomeProgress}%`, transition: "width 50ms linear" }}
                />
              </div>
              <p className="text-neutral-600 text-xs mt-1.5">Closes automatically…</p>

              <button
                onClick={closeWelcome}
                className="mt-3 text-neutral-500 hover:text-neutral-300 text-xs underline transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ ASK AI MODAL ════════════════════════════ */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xl">
          <div
            className="relative max-w-lg w-full mx-4 rounded-3xl overflow-hidden"
            style={{ animation: "modalIn .35s cubic-bezier(.16,1,.3,1)" }}
          >
            {/* Glass card */}
            <div className="absolute inset-0 bg-linear-to-br from-[#1a1030]/97 via-[#12101e]/97 to-[#0f0c1e]/97 border border-violet-500/20 rounded-3xl backdrop-blur-xl" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-900/60 flex-shrink:0">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white leading-tight">Ask AI</h2>
                    <p className="text-neutral-500 text-xs">Gemini tailors your resume to the job</p>
                  </div>
                </div>
                <button
                  onClick={closeAiModal}
                  className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Step 1 — API Key + Model */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">
                  <Key className="w-3.5 h-3.5" /> Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                    placeholder="AIza…"
                    className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 placeholder-neutral-600 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-neutral-600 mt-1.5">
                  Your key is sent directly to Gemini and never stored.
                </p>
              </div>

              {/* Step 2 — PDF Upload */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" /> Existing Resume (PDF)
                </label>
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => pdfInputRef.current?.click()}
                  className={cn(
                    "w-full border-2 border-dashed rounded-2xl p-4 text-center transition-all",
                    pdfFile
                      ? "border-emerald-500/50 bg-emerald-900/20"
                      : "border-violet-500/20 hover:border-violet-500/40 bg-white/3 hover:bg-white/5"
                  )}
                >
                  {pdfFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink:0" />
                      <span className="text-sm text-emerald-400 font-medium truncate max-w-xs">{pdfFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5">
                      <Upload className="w-7 h-7 text-violet-500/50" />
                      <p className="text-sm text-neutral-400">Click to upload your PDF resume</p>
                      <p className="text-xs text-neutral-600">PDF files only · sent as base64 to Gemini</p>
                    </div>
                  )}
                </button>
              </div>

              {/* Step 3 — Job Description */}
              <div className="mb-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-400 mb-2 uppercase tracking-wider">
                  <Briefcase className="w-3.5 h-3.5" /> Job Description
                </label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl p-3.5 h-28 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 placeholder-neutral-600 transition-all"
                  placeholder="Paste the full job description here…"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              {/* Error */}
              {aiError && (
                <div className="mb-4 flex flex-col gap-1.5 p-3 bg-red-900/20 border border-red-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink:0 mt-0.5" />
                    <p className="text-red-400 text-xs leading-relaxed">{aiError}</p>
                  </div>
                  {(aiError.toLowerCase().includes("quota") || aiError.toLowerCase().includes("rate")) && (
                    <p className="text-xs text-amber-400/80 pl-6">
                      💡 Tip: Switch to <strong>gemini-1.5-flash</strong> or <strong>gemini-2.0-flash-lite</strong> in the model selector above — they have separate quotas.
                    </p>
                  )}
                </div>
              )}

              {/* Info */}
              <div className="mb-5 flex items-start gap-2 p-3 bg-violet-900/20 border border-violet-500/20 rounded-xl">
                <Info className="w-4 h-4 text-violet-400 flex-shrink:0 mt-0.5" />
                <p className="text-violet-300 text-xs leading-relaxed">
                  Your PDF is read directly by <strong>Gemini 2.5 Flash</strong> (base64) for maximum accuracy. The existing JSON structure is preserved.
                </p>
              </div>

              {/* Progress steps */}
              {aiLoading && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-violet-900/30 rounded-xl border border-violet-500/20">
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink:0" />
                  <span className="text-violet-300 text-xs font-medium">{stepLabel}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={closeAiModal}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-xl text-sm font-medium transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAskAi}
                  disabled={aiLoading}
                  className="flex-1 px-4 py-2.5 bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xl shadow-violet-900/50"
                >
                  {aiLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>{stepLabel}</span></>
                  ) : (
                    <><Zap className="w-4 h-4" /><span>Generate with AI</span></>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ NAVBAR ════════════════════════════════ */}
      <header className="flex-shrink:0 bg-[#0D0B1A]/90 backdrop-blur-xl border-b border-violet-500/10 px-6 py-3.5 flex items-center justify-between z-10 shadow-lg shadow-black/40">
        <div className="flex items-center gap-3">
          {/* Logo icon */}
          <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/60">
            <FileText className="w-4.5 h-4.5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/20 to-transparent" />
          </div>
          <div>
            <span className="font-bold text-white text-sm leading-none bg-linear-to-r from-violet-300 to-purple-300 bg-clip-text">
              Resume Maker
            </span>
            <span className="block text-violet-500 text-[10px] leading-none mt-0.5 font-medium">
              AI-Powered Builder
            </span>
          </div>
        </div>

        <a
          href="https://eswarb.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-violet-400 font-medium transition-colors"
        >
          By Eswar <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      {/* ══════════ MAIN LAYOUT ═══════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Panel: Full Code JSON Editor ── */}
        <div className="w-1/2 flex flex-col bg-[#0D0B1A] border-r border-violet-500/10 overflow-hidden">
          {/* Panel header */}
          <div className="flex-shrink:0 flex items-center justify-between px-5 py-3 border-b border-violet-500/10 bg-linear-to-r from-violet-900/25 via-[#110D24] to-purple-900/15">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-sm font-bold text-white tracking-wide">
                JSON Editor
              </span>

              {jsonError ? (
                <span className="flex items-center gap-1 text-[11px] text-red-400 bg-red-950/50 border border-red-500/30 px-2.5 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Syntax Error
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Valid
                </span>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Format JSON */}
              <button
                type="button"
                onClick={handleFormatJson}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium transition-all border border-white/5 cursor-pointer"
                title="Format / Prettify JSON"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Format</span>
              </button>

              {/* Copy JSON */}
              <button
                type="button"
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-medium transition-all border border-white/5 cursor-pointer"
                title="Copy entire JSON to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-xs">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Ask AI Button */}
              <button
                type="button"
                onClick={() => {
                  setShowAiModal(true);
                  setAiError(null);
                }}
                className="group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold overflow-hidden shadow-lg shadow-violet-900/50 transition-all hover:shadow-violet-700/50 active:scale-95 cursor-pointer"
              >
                <div className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 transition-opacity" />
                <div className="absolute inset-0 bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Zap className="relative w-3.5 h-3.5" />
                <span className="relative">Ask AI</span>
              </button>
            </div>
          </div>

          {/* ── Section Highlighter & Navigation Ribbon ── */}
          <div className="flex-shrink:0 px-3 py-2 border-b border-violet-500/10 bg-[#0A0817] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider px-1 shrink-0">
              Sections:
            </span>
            {Object.entries(SECTION_CONFIG).map(([key, cfg]) => {
              const isAct = activeSection === key;
              const isHidden = hiddenSections.includes(key);
              const count = getSectionCount(resumeData, key);

              return (
                <div
                  key={key}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all shrink-0 border",
                    isAct
                      ? "bg-violet-900/40 text-white shadow-sm"
                      : "bg-white/3 text-neutral-400 hover:text-neutral-200 hover:bg-white/6",
                    isHidden && "opacity-50 line-through"
                  )}
                  style={{
                    borderColor: isAct ? cfg.color : "rgba(255,255,255,0.06)",
                  }}
                  onClick={() => scrollToSection(key)}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cfg.color }}
                  />
                  <span>{cfg.label}</span>
                  {count && (
                    <span className="text-[10px] text-neutral-500">({count})</span>
                  )}

                  {/* Eye Hide/Show toggle button */}
                  <button
                    type="button"
                    onClick={(e) => toggleSectionVisibility(key, e)}
                    title={
                      isHidden
                        ? "Hidden in PDF - click to show"
                        : "Visible in PDF - click to hide"
                    }
                    className={cn(
                      "ml-0.5 p-0.5 rounded hover:bg-white/10 transition-colors cursor-pointer",
                      isHidden ? "text-amber-400" : "text-neutral-500 hover:text-white"
                    )}
                  >
                    {isHidden ? (
                      <EyeOff className="w-3 h-3" />
                    ) : (
                      <Eye className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* ── Active section info banner ── */}
          <div className="flex-shrink:0 px-4 py-1.5 bg-[#090715] border-b border-violet-500/10 flex items-center justify-between text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              {SECTION_CONFIG[activeSection] && (
                <>
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: SECTION_CONFIG[activeSection].color }}
                  />
                  <span className="font-semibold text-white">
                    {SECTION_CONFIG[activeSection].label} Section
                  </span>
                  {sectionLineRanges[activeSection] && (
                    <span className="text-[11px] text-violet-400 font-mono bg-violet-950/60 px-1.5 py-0.5 rounded border border-violet-800/40">
                      Lines {sectionLineRanges[activeSection].start + 1}–
                      {sectionLineRanges[activeSection].end + 1}
                    </span>
                  )}
                  <span className="text-[11px] text-neutral-500">
                    ({getSectionCount(resumeData, activeSection)})
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-neutral-500 font-mono">
              Line {activeLine} of {lines.length}
            </div>
          </div>

          {/* ── Full Code Editor with Synchronized Line Numbers ── */}
          <div className="flex-1 flex overflow-hidden">
            {/* Line numbers gutter */}
            <div
              ref={gutterRef}
              className="w-13 select-none overflow-hidden font-mono text-[11px] leading-5 text-neutral-600 bg-[#070510] py-4 pr-2 text-right border-r border-violet-500/10 shrink-0"
            >
              {lines.map((_: string, idx: number) => {
                const lineNum = idx + 1;
                const secKey = getSectionForLine(idx);
                const config = secKey ? SECTION_CONFIG[secKey] : null;

                return (
                  <div
                    key={idx}
                    className="relative flex items-center justify-end h-5 group"
                  >
                    {/* Section color bar on left */}
                    {config && (
                      <span
                        className="absolute left-1 w-1 h-3.5 rounded-full transition-all"
                        style={{
                          backgroundColor: config.color,
                          opacity: activeSection === secKey ? 1 : 0.4,
                        }}
                        title={config.label}
                      />
                    )}
                    <span
                      className={cn(
                        "transition-colors pr-1 font-mono",
                        activeLine === lineNum
                          ? "text-violet-300 font-bold"
                          : "text-neutral-600 group-hover:text-neutral-400"
                      )}
                    >
                      {lineNum}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Textarea */}
            <textarea
              ref={fullTextareaRef}
              value={jsonInput}
              onChange={handleJsonChange}
              onScroll={() => {
                if (fullTextareaRef.current && gutterRef.current) {
                  gutterRef.current.scrollTop = fullTextareaRef.current.scrollTop;
                }
                if (fullTextareaRef.current) {
                  const lineIdx = Math.floor(fullTextareaRef.current.scrollTop / 20);
                  const curSec = getSectionForLine(lineIdx);
                  if (curSec) setActiveSection(curSec);
                }
              }}
              onKeyUp={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const currentPos = target.selectionStart;
                const lineNum = target.value.substring(0, currentPos).split("\n").length;
                setActiveLine(lineNum);
                const sec = getSectionForLine(lineNum - 1);
                if (sec) setActiveSection(sec);
              }}
              onClick={(e) => {
                const target = e.target as HTMLTextAreaElement;
                const currentPos = target.selectionStart;
                const lineNum = target.value.substring(0, currentPos).split("\n").length;
                setActiveLine(lineNum);
                const sec = getSectionForLine(lineNum - 1);
                if (sec) setActiveSection(sec);
              }}
              className="flex-1 w-full px-4 py-4 font-mono text-xs leading-5 bg-[#0B0918] text-violet-100/90 outline-none resize-none placeholder-neutral-700 selection:bg-violet-900/60 caret-violet-400 overflow-y-auto whitespace-pre font-normal"
              spellCheck={false}
            />
          </div>

          {/* Footer hint */}
          <div className="flex-shrink:0 px-5 py-2 border-t border-violet-500/10 bg-violet-900/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-neutral-500 text-xs font-mono">
                {lines.length} lines · {Object.keys(SECTION_CONFIG).length} sections
              </span>
              {hiddenSections.length > 0 && (
                <span className="text-[11px] text-amber-400 font-medium">
                  {hiddenSections.length} section{hiddenSections.length === 1 ? "" : "s"} hidden from PDF
                </span>
              )}
            </div>
            {!jsonError ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Live Sync Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                <AlertCircle className="w-3 h-3" /> Syntax Error
              </span>
            )}
          </div>
        </div>

        {/* ── Right Panel: PDF Preview ── */}
        <div className="w-1/2 flex flex-col bg-[#0A0814]">
          <div className="flex-shrink:0 flex items-center gap-2.5 px-5 py-3 border-b border-violet-500/10 bg-linear-to-r from-purple-900/20 to-indigo-900/10">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-sm font-semibold text-neutral-300">PDF Preview</span>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-neutral-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {pdfReady ? (
              <PDFViewer className="w-full h-full">
                <ResumeDocument data={resumeData} hiddenSections={hiddenSections} />
              </PDFViewer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-violet-900">
                <FileText className="w-10 h-10" />
                <p className="text-sm text-neutral-600">PDF preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ GLOBAL STYLES ═════════════════════════ */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        * { box-sizing: border-box; }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #09090F; }
        ::-webkit-scrollbar-thumb { background: #3b1e7a; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #5b2ea8; }

        /* Subtle grid overlay on body */
        body {
          background-color: #09090F;
          background-image: radial-gradient(circle at 25% 25%, #1a0d3b22 0%, transparent 60%),
                            radial-gradient(circle at 75% 75%, #0d1a3b22 0%, transparent 60%);
        }

        /* Textarea caret & selection */
        textarea { caret-color: #a78bfa; }
        textarea::selection { background: rgba(139,92,246,0.25); }

        /* Input & textarea placeholder */
        input::placeholder, textarea::placeholder { color: #374151; }
      `}</style>
    </div>
  );
}
