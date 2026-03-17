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
} from "lucide-react";

// ============================================================
// PDF VIEWER — lazy-loaded, client-only
// ============================================================
const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false, loading: () => <PDFLoadingPlaceholder /> },
);

const PDFLoadingPlaceholder = () => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-neutral-800">
    <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
    <span className="text-neutral-400 text-sm">Loading PDF viewer…</span>
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
// PDF DOCUMENT COMPONENT
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

const ResumeDocument = ({ data }: { data: any }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
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

      <View style={pdfStyles.section}>
        <SectionHeader title="SUMMARY" />
        <Text style={pdfStyles.summaryContent}>{data.summary || "Summary goes here..."}</Text>
      </View>

      <View style={pdfStyles.section}>
        <SectionHeader title="SKILLS" />
        {data.skills?.map((skill: any, i: number) => (
          <Text key={i} style={pdfStyles.skillsContent}>
            {skill.label}: <Text style={pdfStyles.listOfSkills}>{skill.value}</Text>
          </Text>
        ))}
      </View>

      <View style={pdfStyles.section}>
        <SectionHeader title="EXPERIENCE" />
        {data.experience?.map((exp: any, i: number) => (
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

      <View style={pdfStyles.section}>
        <SectionHeader title="PROJECTS" />
        {data.projects?.map((proj: any, i: number) => (
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

      <View style={pdfStyles.section}>
        <SectionHeader title="EDUCATION" />
        <View style={pdfStyles.experienceContent}>
          <Text>{data.education?.college}</Text>
          <Text style={pdfStyles.educationDegree}>{data.education?.degree}</Text>
          <Text>{data.education?.duration}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

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

  // Welcome modal — only visible on very first visit
  const [showWelcome, setShowWelcome] = useState(false); // starts false, set in effect
  const [welcomeProgress, setWelcomeProgress] = useState(0);
  const [pdfReady, setPdfReady] = useState(false); // PDFViewer mounts only after modal gone

  // Ask AI modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // ── First-time welcome only ──────────────────────────────
  useEffect(() => {
    const seen = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!seen) {
      setShowWelcome(true);
    } else {
      setPdfReady(true); // no modal → PDF loads straight away
    }
  }, []);

  // ── Progress bar + auto-close ────────────────────────────
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
    setPdfReady(true); // now mount the PDF viewer
  };

  // ── Refresh guard + clear localStorage on tab close ─────
  useEffect(() => {
    // Warn before refresh / navigation
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Unsaved changes will be lost — are you sure?";
      return e.returnValue;
    };
    // Clear welcome flag when tab/window is actually closed
    const pageHideHandler = () => {
      localStorage.removeItem(WELCOME_SEEN_KEY);
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    window.addEventListener("pagehide", pageHideHandler);
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
      window.removeEventListener("pagehide", pageHideHandler);
    };
  }, []);

  // ── Mobile detection ─────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── JSON editor ──────────────────────────────────────────
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

  // ── PDF text extraction ──────────────────────────────────
  const extractPdfText = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const decoder = new TextDecoder("utf-8", { fatal: false });
          const raw = decoder.decode(e.target?.result as ArrayBuffer);
          const btBlocks = raw.match(/BT[\s\S]*?ET/g) || [];
          let text = btBlocks
            .flatMap((b) => (b.match(/\(([^)]+)\)/g) || []).map((s) => s.slice(1, -1)))
            .join(" ");
          if (text.trim().length < 50) {
            text = raw
              .split("")
              .filter((c) => c.charCodeAt(0) >= 32 && c.charCodeAt(0) < 127)
              .join("")
              .replace(/\s+/g, " ")
              .trim();
          }
          resolve(text.slice(0, 8000));
        } catch {
          resolve("Could not extract PDF text.");
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, []);

  // ── Ask AI ───────────────────────────────────────────────
  const handleAskAi = async () => {
    if (!pdfFile) { setAiError("Please upload your resume PDF."); return; }
    if (!jobDescription.trim()) { setAiError("Please enter the job description."); return; }
    setAiError(null);
    setAiLoading(true);
    try {
      const pdfText = await extractPdfText(pdfFile);
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfText, jobDescription, existingJson: jsonInput }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Generation failed");
      const parsed = JSON.parse(data.result);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setResumeData(parsed);
      setShowAiModal(false);
      setPdfFile(null);
      setJobDescription("");
    } catch (err) {
      setAiError((err as Error).message || "Something went wrong.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Mobile gate ──────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-rose-50 p-6 text-center">
        <div className="max-w-sm space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Desktop Only</h1>
          <p className="text-slate-500 text-sm">
            This app is optimised for desktop. Please open it on a larger screen.
          </p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col bg-[#F7F5FF] overflow-hidden font-sans">

      {/* ═══════════════ WELCOME MODAL ═══════════════════ */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40 backdrop-blur-md">
          <div
            className="relative bg-white border border-violet-100 rounded-3xl shadow-2xl shadow-violet-200/60 p-8 max-w-sm w-full mx-4 text-center overflow-hidden"
            style={{ animation: "modalIn .35s cubic-bezier(.16,1,.3,1)" }}
          >
            {/* Pastel blobs */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-violet-100 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-rose-100 rounded-full blur-3xl pointer-events-none" />

            <div className="relative">
              {/* Avatar icon */}
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-300/60">
                <Zap className="w-8 h-8 text-white" />
              </div>

              <p className="text-violet-400 text-xs font-semibold uppercase tracking-widest mb-1">Developed by</p>
              <h2 className="text-2xl font-bold text-slate-800 mb-0.5">Eswararao Beta</h2>
              <p className="text-sm text-slate-500 mb-1">Full Stack &amp; AI Developer</p>
              <a
                href="https://eswarb.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-violet-500 hover:text-violet-700 text-xs font-medium transition-colors"
              >
                eswarb.vercel.app <ExternalLink className="w-3 h-3" />
              </a>

              <div className="mt-4 px-4 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                <p className="text-violet-700 text-xs font-semibold">✨ AI-Powered Resume Builder</p>
                <p className="text-slate-400 text-xs mt-0.5">Powered by Gemini 2.0 Flash</p>
              </div>

              {/* Progress */}
              <div className="mt-5 w-full bg-violet-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
                  style={{ width: `${welcomeProgress}%`, transition: "width 50ms linear" }}
                />
              </div>
              <p className="text-slate-400 text-xs mt-1.5">Closes automatically…</p>

              <button
                onClick={closeWelcome}
                className="mt-3 text-slate-400 hover:text-slate-600 text-xs underline transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ ASK AI MODAL ════════════════════ */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-violet-950/40 backdrop-blur-md">
          <div
            className="relative bg-white border border-violet-100 rounded-3xl shadow-2xl shadow-violet-200/50 p-6 max-w-lg w-full mx-4 overflow-hidden"
            style={{ animation: "modalIn .3s cubic-bezier(.16,1,.3,1)" }}
          >
            {/* Pastel blobs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-100 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-rose-100 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-300/50 flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800 leading-tight">Ask AI</h2>
                  <p className="text-slate-400 text-xs">Gemini generates a tailored resume JSON</p>
                </div>
              </div>
              <button
                onClick={() => { setShowAiModal(false); setAiError(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-violet-50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PDF Upload */}
            <div className="relative mb-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 mb-2 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5" /> Existing Resume (PDF)
              </label>
              <input ref={pdfInputRef} type="file" accept=".pdf" className="hidden"
                onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              <button
                onClick={() => pdfInputRef.current?.click()}
                className={cn(
                  "w-full border-2 border-dashed rounded-2xl p-5 text-center transition-all",
                  pdfFile
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-violet-200 hover:border-violet-400 bg-violet-50/50 hover:bg-violet-50"
                )}
              >
                {pdfFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm text-emerald-600 font-medium truncate max-w-xs">{pdfFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload className="w-7 h-7 text-violet-300" />
                    <p className="text-sm text-slate-500">Click to upload your PDF resume</p>
                    <p className="text-xs text-slate-400">PDF files only</p>
                  </div>
                )}
              </button>
            </div>

            {/* Job Description */}
            <div className="relative mb-4">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 mb-2 uppercase tracking-wide">
                <Briefcase className="w-3.5 h-3.5" /> Job Description
              </label>
              <textarea
                className="w-full bg-violet-50/60 border border-violet-200 text-slate-700 text-sm rounded-2xl p-3.5 h-36 resize-none focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent placeholder-slate-300 transition-all"
                placeholder="Paste the full job description here — required skills, responsibilities, qualifications…"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>

            {/* Error */}
            {aiError && (
              <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-500 text-xs leading-relaxed">{aiError}</p>
              </div>
            )}

            {/* Info */}
            <div className="relative mb-5 flex items-start gap-2 p-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl">
              <Info className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <p className="text-violet-600 text-xs leading-relaxed">
                Gemini will analyse your PDF and the job description to generate an ATS-optimised resume in the existing JSON layout.
              </p>
            </div>

            {/* Actions */}
            <div className="relative flex gap-3">
              <button
                onClick={() => { setShowAiModal(false); setAiError(null); }}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-medium transition-all border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAskAi}
                disabled={aiLoading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 hover:from-violet-500 hover:via-purple-500 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-300/50"
              >
                {aiLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>Generating…</span></>
                ) : (
                  <><Zap className="w-4 h-4" /><span>Generate with AI</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ NAVBAR ══════════════════════════ */}
      <header className="flex-shrink-0 bg-white/90 backdrop-blur-xl border-b border-violet-100 px-6 py-3 flex items-center justify-between shadow-sm shadow-violet-100/60 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-300/50">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-slate-800 text-sm leading-none">Resume Maker</span>
            <span className="block text-violet-400 text-[10px] leading-none mt-0.5 font-medium">AI-Powered Builder</span>
          </div>
        </div>

        <a
          href="https://eswarb.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-violet-600 font-medium transition-colors"
        >
          By Eswararao Beta <ExternalLink className="w-3 h-3" />
        </a>
      </header>

      {/* ═══════════════ MAIN LAYOUT ═════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Panel: JSON Editor ── */}
        <div className="w-1/2 flex flex-col bg-white border-r border-violet-100">
          {/* Panel header */}
          <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 border-b border-violet-100 bg-gradient-to-r from-violet-50 to-purple-50/50">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-sm font-semibold text-slate-700">JSON Data</span>
              {jsonError && (
                <span className="flex items-center gap-1 text-xs text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" /> Invalid JSON
                </span>
              )}
            </div>

            {/* Ask AI Button */}
            <button
              onClick={() => { setShowAiModal(true); setAiError(null); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-violet-600 via-purple-600 to-rose-500 hover:from-violet-500 hover:via-purple-500 hover:to-rose-400 text-white text-xs font-semibold rounded-lg shadow-md shadow-violet-300/60 transition-all hover:shadow-violet-400/50 hover:shadow-lg active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              Ask AI
            </button>
          </div>

          {/* Textarea */}
          <textarea
            className="flex-1 w-full px-5 py-4 font-mono text-xs leading-relaxed bg-[#FDFCFF] text-slate-700 outline-none resize-none placeholder-slate-300 selection:bg-violet-200"
            value={jsonInput}
            onChange={handleJsonChange}
            spellCheck={false}
          />

          {/* Footer hint */}
          <div className="flex-shrink-0 px-5 py-2 border-t border-violet-100 bg-violet-50/40 flex items-center justify-between">
            <span className="text-slate-400 text-xs">Edit JSON to update the resume live</span>
            {!jsonError && (
              <span className="flex items-center gap-1 text-xs text-emerald-500 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Valid
              </span>
            )}
          </div>
        </div>

        {/* ── Right Panel: PDF Preview ── */}
        <div className="w-1/2 flex flex-col bg-slate-100">
          <div className="flex-shrink-0 flex items-center gap-2 px-5 py-3 border-b border-violet-100 bg-gradient-to-r from-purple-50 to-rose-50/50">
            <div className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-sm font-semibold text-slate-700">PDF Preview</span>
          </div>

          <div className="flex-1 overflow-hidden">
            {pdfReady ? (
              <PDFViewer className="w-full h-full">
                <ResumeDocument data={resumeData} />
              </PDFViewer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-violet-300">
                <FileText className="w-10 h-10" />
                <p className="text-sm text-slate-400">PDF preview will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════ GLOBAL STYLES ═══════════════════ */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #F5F3FF; }
        ::-webkit-scrollbar-thumb { background: #C4B5FD; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #A78BFA; }
      `}</style>
    </div>
  );
}
