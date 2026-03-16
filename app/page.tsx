"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  Font,
  Link,
} from "@react-pdf/renderer";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading...</p>,
  },
);

// Register Font
Font.register({
  family: "Times-Roman",
  src: "http://fonts.gstatic.com/s/tinos/v15/rr0ijBVAkixDK-Nuba7zP20.ttf",
});

// Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  section: {
    marginTop: 3,
    marginBottom: 5,
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
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
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    textAlign: "center",
    color: "#000000",
    textTransform: "capitalize",
  },
  headerContactText: {
    marginTop: 3,
    marginBottom: 2,
    fontSize: 12,
    fontFamily: "Times-Roman",
    textAlign: "center",
    color: "#303030",
    textTransform: "lowercase",
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
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#303030",
    textAlign: "justify",
  },
  skillsTitle: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#000000",
    textTransform: "uppercase",
  },
  skillsContent: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#303030",
    textTransform: "capitalize",
  },
  listOfSkills: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#303030",
    textTransform: "capitalize",
    fontWeight: "normal",
  },
  experienceTitle: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#000000",
    textTransform: "uppercase",
  },
  experienceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#303030",
  },
  bulletPoint: {
    flexDirection: "row",
    marginTop: 3,
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#303030",
    textAlign: "justify",
  },
  bullet: {
    width: 10,
    fontSize: 12,
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
  },
  techStack: {
    marginTop: 3,
    fontSize: 12,
    fontStyle: "italic",
    color: "#303030",
    fontFamily: "Times-Roman",
  },
  educationDegree: {
    marginTop: 2,
    fontSize: 12,
    fontFamily: "Times-Roman",
    color: "#303030",
  },
  projectName: {
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Times-Roman",
    color: "#303030",
  },
  link: {
    color: "#0000FF",
    textDecoration: "underline",
  },
});

// Resume Data Initial State
const INITIAL_RESUME_DATA = {
  header: {
    name: "ESWARARAO BETA",
    title:
      "Full Stack Developer | Spring Boot | Microservices | React | Next.js | Nest.js | AI Agents",
    contact:
      "Hyderabad, India | Phone: +91 7036285961 | Email: eswar.crypto.tech@gmail.com",
    links: {
      linkedin: "https://linkedin.com/in/eswararaobeta",
      github: "https://github.com/eswararaobeta",
      portfolio: "https://eswarb.vercel.app",
    },
  },
  summary:
    "Full Stack Developer with 2+ years of experience building scalable, secure systems using Spring Boot, NestJS, and microservices. Experienced in integrating AI-powered solutions using modern AI/LLM APIs. Proficient in React.js, Next.js, and Tailwind CSS to deliver production-ready full-stack applications in agile environments.",
  skills: [
    { label: "Programming", value: "Java, TypeScript" },
    {
      label: "Frameworks",
      value:
        "Spring Boot, Nest.js, React, Next.js, Tailwind CSS, ShadCN, Magic UI, Nodemailer, Aceternity UI, Apache Kafka",
    },
    {
      label: "Databases",
      value: "MySQL, MongoDB, Firebase, Supabase, Vector DB",
    },
    {
      label: "Tools",
      value:
        "Git, GitHub, Docker, Kubernetes, STS, Postman, VS Code, IntelliJ IDEA, Eclipse, Antigravity",
    },
    {
      label: "AI/ML",
      value: "OpenAI API, Gemini API, LangChain, LlamaIndex, Ollama",
    },
  ],
  experience: [
    {
      company: "Toucan Payments LLC",
      role: "Software Engineer",
      duration: "2023 - Present",
      link: "https://toucanpayments.com",
      points: [
        "Developed scalable microservices using Spring Boot for core Payments and Card Management systems, improving modularity and system design.",
        "Implemented secure API gateways using Spring Security and Spring Cloud Gateway, ensuring robust authentication, authorization.",
        "Led the development and support of the Card Management System, covering key functionalities such as card issuance, activation, and status tracking.",
        // "Created and optimized Spring Batch jobs for high-volume card transaction processing and automated backend operations.",
      ],
      techStack:
        "Spring Boot, Spring Cloud Gateway, Spring Security, Microservices, MongoDB, Docker",
    },
  ],
  projects: [
    {
      name: "Resume Maker",
      role: "Next.js Project",
      duration: "Feb 2026 - Present",
      link: "https://github.com/eswararaobeta/resume-maker",
      points: [
        "Built a real-time resume builder with live PDF preview using React-PDF and Next.js.",
        "Implemented dynamic layouts and custom styling options for enhanced user customization.",
        "Designed a responsive UI with a split-screen editor and preview to streamline the resume creation process.",
        "Optimized PDF generation performance, reducing render time by 40% for complex templates.",
      ],
      techStack: "Next.js, React-PDF, Tailwind CSS, TypeScript",
    },
    {
      name: "AI-Powered Chat Application",
      role: "React Native Project",
      duration: "Jan 2025 - Feb 2026",
      link: "https://github.com/eswararaobeta/ai-chat-app",
      points: [
        "Developed a cross-platform mobile chat application with real-time messaging using WebSocket and Firebase.",
        "Integrated OpenAI API for smart replies and AI-driven content moderation to enhance user safety.",
        "Implemented push notifications using Firebase Cloud Messaging to ensure timely delivery of messages.",
        // "Designed a dark mode interface with accessibility support to improve user experience in low-light environments.",
      ],
      techStack: "React Native, Firebase, Node.js, OpenAI API",
    },
    {
      name: "E-Commerce Platform",
      role: "Spring Boot Project",
      duration: "Aug 2024 - Dec 2024",
      link: "https://github.com/eswararaobeta/ecommerce-platform",
      points: [
        "Built a scalable e-commerce backend with microservices architecture.",
        "Implemented secure payment processing using Stripe API.",
        // "Designed a user-friendly frontend with product filtering and search.",
        "Deployed the application on AWS using Docker and Kubernetes.",
      ],
      techStack: "Spring Boot, React, MySQL, Docker, AWS",
    },
  ],
  education: {
    college: "JNTUGV",
    degree: "B.Tech in Information Technology",
    duration: "2020-2023",
  },
};

// Helper Components
const Separator = () => <View style={styles.separator} />;

const BulletPoint = ({ text }: { text: string }) => (
  <View style={styles.bulletPoint}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Separator />
  </>
);

import { useState, useEffect } from "react";

const ResumeDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.nameText}>{data.header?.name || "Your Name"}</Text>
        <Separator />
        <Text style={styles.skillsText}>
          {data.header?.title || "Your Title"}
        </Text>
        <Text style={styles.headerContactText}>
          {data.header?.contact || "Contact Info"}
          {data.header?.links?.linkedin && (
            <Text>
              {" | "}
              <Link src={data.header.links.linkedin} style={styles.link}>
                LinkedIn
              </Link>
            </Text>
          )}
          {data.header?.links?.github && (
            <Text>
              {" | "}
              <Link src={data.header.links.github} style={styles.link}>
                GitHub
              </Link>
            </Text>
          )}
          {data.header?.links?.portfolio && (
            <Text>
              {" | "}
              <Link src={data.header.links.portfolio} style={styles.link}>
                Portfolio
              </Link>
            </Text>
          )}
        </Text>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <SectionHeader title="SUMMARY" />
        <Text style={styles.summaryContent}>
          {data.summary || "Summary goes here..."}
        </Text>
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <SectionHeader title="SKILLS" />
        {data.skills?.map((skill: any, index: number) => (
          <Text key={index} style={styles.skillsContent}>
            {skill.label}:{" "}
            <Text style={styles.listOfSkills}>{skill.value}</Text>
          </Text>
        ))}
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <SectionHeader title="EXPERIENCE" />
        {data.experience?.map((exp: any, index: number) => (
          <View key={index}>
            <View style={styles.experienceContent}>
              <Text>
                {exp.role} | {exp.company}
                {exp.link && (
                  <Text>
                    {" | "}
                    <Link src={exp.link} style={styles.link}>
                      Link
                    </Link>
                  </Text>
                )}
              </Text>
              <Text>{exp.duration}</Text>
            </View>
            {exp.points?.map((point: string, i: number) => (
              <BulletPoint key={i} text={point} />
            ))}
            <Text style={styles.techStack}>Tech Stack: {exp.techStack}</Text>
          </View>
        ))}
      </View>

      {/* Projects */}
      <View style={styles.section}>
        <SectionHeader title="PROJECTS" />
        {data.projects?.map((project: any, index: number) => (
          <View key={index} style={{ marginTop: index > 0 ? 5 : 0 }}>
            <View style={styles.experienceContent}>
              <Text style={styles.projectName}>
                {project.name} | {project.role}
                {project.link && (
                  <Text style={{ fontWeight: "normal" }}>
                    {" | "}
                    <Link src={project.link} style={styles.link}>
                      Link
                    </Link>
                  </Text>
                )}
              </Text>
              <Text>{project.duration}</Text>
            </View>
            {project.points?.map((point: string, i: number) => (
              <BulletPoint key={i} text={point} />
            ))}
            <Text style={styles.techStack}>
              Tech Stack: {project.techStack}
            </Text>
          </View>
        ))}
      </View>

      {/* Education */}
      <View style={styles.section}>
        <SectionHeader title="EDUCATION" />
        <View style={styles.experienceContent}>
          <Text>{data.education?.college}</Text>
          <Text style={styles.educationDegree}>{data.education?.degree}</Text>
          <Text>{data.education?.duration}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function Home() {
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [jsonInput, setJsonInput] = useState(
    JSON.stringify(INITIAL_RESUME_DATA, null, 2),
  );
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024); // lg breakpoint in Tailwind is 1024px
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVal = e.target.value;
    setJsonInput(newVal);
    try {
      const parsed = JSON.parse(newVal);
      setResumeData(parsed);
      setJsonError(null);
    } catch (err) {
      // Don't update resumeData if JSON is invalid, just let user type
      setJsonError((err as Error).message);
    }
  };

  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white p-4 text-center">
        <div className="max-w-md">
          <h1 className="text-2xl font-bold mb-4">Mobile Not Supported</h1>
          <p className="text-gray-300">
            This application is optimized for desktop use. Please open it on a
            desktop or laptop computer to create your resume.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white p-4 shadow-md flex items-center justify-between">
        <h1 className="text-xl font-bold">Resume Maker</h1>
        <a href="https://eswarb.vercel.app" className="text-sm text-gray-400">
          Developer Info
        </a>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel: JSON Editor */}
        <div className="w-full lg:w-1/2 p-4 flex flex-col border-r border-gray-300 bg-white">
          <label className="mb-2 font-semibold text-gray-700 flex justify-between">
            <span>JSON Data</span>
            {jsonError && (
              <span className="text-red-500 text-xs">{jsonError}</span>
            )}
          </label>
          <textarea
            className="flex-1 w-full p-4 font-mono text-sm bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-gray-800"
            value={jsonInput}
            onChange={handleJsonChange}
            spellCheck={false}
          />
        </div>

        {/* Right Panel: PDF Preview */}
        <div className="w-full lg:w-1/2 bg-gray-500 flex items-center justify-center">
          <PDFViewer className="w-full h-full">
            <ResumeDocument data={resumeData} />
          </PDFViewer>
        </div>
      </div>
    </div>
  );
}
