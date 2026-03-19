"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  bullet: { width: 10, fontSize: 12, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 12 },
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
  link: { color: "#0000FF", textDecoration: "underline" },
});

// ============================================================
// INITIAL DATA
// ============================================================
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
    { label: "Databases", value: "MySQL, MongoDB, Firebase, Supabase, Vector DB" },
    {
      label: "Tools",
      value:
        "Git, GitHub, Docker, Kubernetes, STS, Postman, VS Code, IntelliJ IDEA, Eclipse, Antigravity",
    },
    { label: "AI/ML", value: "OpenAI API, Gemini API, LangChain, LlamaIndex, Ollama" },
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

const ResumeDocument = ({ data }: { data: any }) => {
  const hasSummary = !!data.summary?.trim();
  const hasSkills = Array.isArray(data.skills) && data.skills.length > 0;
  const hasExperience = Array.isArray(data.experience) && data.experience.length > 0;
  const hasProjects = Array.isArray(data.projects) && data.projects.length > 0;
  const hasEducation =
    data.education &&
    (data.education.college || data.education.degree || data.education.duration);

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {/* Header — always shown */}
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
                    {exp.link && <Text style={{ fontWeight: "normal" }}>{" | "}<Link src={exp.link} style={pdfStyles.link}>Link</Link></Text>}
                  </Text>
                  <Text>{exp.duration}</Text>
                </View>
                {exp.points?.map((p: string, j: number) => <BulletPoint key={j} text={p} />)}
                <Text style={pdfStyles.techStack}>Tech Stack: {exp.techStack}</Text>
              </View>
            ))}
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
                    {proj.link && <Text style={{ fontWeight: "normal" }}>{" | "}<Link src={proj.link} style={pdfStyles.link}>Link</Link></Text>}
                  </Text>
                  <Text>{proj.duration}</Text>
                </View>
                {proj.points?.map((p: string, j: number) => <BulletPoint key={j} text={p} />)}
                <Text style={pdfStyles.techStack}>Tech Stack: {proj.techStack}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education — only if present */}
        {hasEducation && (
          <View style={pdfStyles.section}>
            <SectionHeader title="EDUCATION" />
            <View style={pdfStyles.experienceContent}>
              <Text>{data.education?.college}</Text>
              <Text style={pdfStyles.educationDegree}>{data.education?.degree}</Text>
              <Text>{data.education?.duration}</Text>
            </View>
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
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-violet-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-900/60 flex-shrink-0">
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
            <span className="font-bold text-white text-sm leading-none bg-linear-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">
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

        {/* ── Left Panel: JSON Editor ── */}
        <div className="w-1/2 flex flex-col bg-[#0D0B1A] border-r border-violet-500/10">
          {/* Panel header */}
          <div className="flex-shrink:0 flex items-center justify-between px-5 py-3 border-b border-violet-500/10 bg-linear-to-r from-violet-900/20 to-purple-900/10">
            <div className="flex items-center gap-2.5">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-sm font-semibold text-neutral-300">JSON Data</span>
              {jsonError && (
                <span className="flex items-center gap-1 text-xs text-red-400 bg-red-900/30 border border-red-500/20 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Invalid JSON
                </span>
              )}
            </div>

            {/* Ask AI Button */}
            <button
              onClick={() => { setShowAiModal(true); setAiError(null); }}
              className="group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-white text-xs font-semibold overflow-hidden shadow-lg shadow-violet-900/50 transition-all hover:shadow-violet-700/50 active:scale-95"
            >
              <div className="absolute inset-0 bg-linear-to-r from-violet-600 via-purple-600 to-indigo-600 transition-opacity" />
              <div className="absolute inset-0 bg-linear-to-r from-violet-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Zap className="relative w-3.5 h-3.5" />
              <span className="relative">Ask AI</span>
            </button>
          </div>

          {/* Textarea */}
          <textarea
            className="flex-1 w-full px-5 py-4 font-mono text-xs leading-relaxed bg-[#0B0918] text-violet-100/80 outline-none resize-none placeholder-neutral-700 selection:bg-violet-900/60 caret-violet-400"
            value={jsonInput}
            onChange={handleJsonChange}
            spellCheck={false}
          />

          {/* Footer hint */}
          <div className="flex-shrink:0 px-5 py-2 border-t border-violet-500/10 bg-violet-900/10 flex items-center justify-between">
            <span className="text-neutral-600 text-xs">Edit JSON → resume updates live</span>
            {!jsonError ? (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                <AlertCircle className="w-3 h-3" /> Error
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
                <ResumeDocument data={resumeData} />
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
