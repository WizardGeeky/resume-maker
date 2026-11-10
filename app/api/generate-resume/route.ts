import { NextRequest, NextResponse } from "next/server";

// ============================================================
// ROBUST JSON REPAIR & SANITIZATION HELPER
// ============================================================
function sanitizeJsonString(str: string): string {
  let result = "";
  let inString = false;
  let isEscaped = false;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (inString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
      } else if (char === "\\") {
        result += char;
        isEscaped = true;
      } else if (char === '"') {
        inString = false;
        result += char;
      } else if (char === "\n") {
        result += "\\n";
      } else if (char === "\r") {
        result += "\\r";
      } else if (char === "\t") {
        result += "\\t";
      } else if (char.charCodeAt(0) < 32) {
        result += "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0");
      } else {
        result += char;
      }
    } else {
      if (char === '"') {
        inString = true;
      }
      result += char;
    }
  }

  // If output cut off while still inside a string, close the quote
  if (inString) {
    result += '"';
  }

  return result;
}

function cleanAndParseJson(rawText: string): any {
  let text = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // Extract from first { to last }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.substring(firstBrace, lastBrace + 1);
  }

  // 1. Direct parse attempt
  try {
    return JSON.parse(text);
  } catch {
    // 2. Sanitize control chars & unescaped newlines inside strings
    let sanitized = sanitizeJsonString(text);
    // Remove trailing commas before } or ]
    sanitized = sanitized.replace(/,\s*([}\]])/g, "$1");

    try {
      return JSON.parse(sanitized);
    } catch {
      // 3. Balance unclosed brackets & braces if model reached token cutoff
      let fixed = sanitized;
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;

      for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
      for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}";
      fixed = fixed.replace(/,\s*([}\]])/g, "$1");

      return JSON.parse(fixed);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey, pdfBase64, jobDescription, existingJson } =
      await request.json();

    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json(
        { error: "Gemini API key is required." },
        { status: 400 }
      );
    }
    if (!pdfBase64) {
      return NextResponse.json(
        { error: "Resume PDF is required." },
        { status: 400 }
      );
    }
    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Job description is required." },
        { status: 400 }
      );
    }

    const prompt = `You are a world-class resume writer and ATS optimization specialist.
Your goal: Transform the user's existing resume into a HIGH-ATS-SCORE resume JSON based ONLY on the provided Job Description (JD) and the user's source resume.

=== CRITICAL CONSTRAINTS (MANDATORY) ===

1. JSON STRUCTURE (STRICT MANDATORY)
   - You MUST return a JSON object with this EXACT top-level structure: "header", "summary", "skills", "experience", "internships", "projects", "education", "certifications", "training", "achievements", "languages", "professionalLinks".
   - "header": Must contain "name", "title", "contact", and a "links" object ("linkedin", "github", "portfolio").
   - "summary": A single string (max 3 lines).
   - "skills": An array of objects: { "label": string, "value": string }.
   - "experience": An array of objects: { "company": string, "role": string, "duration": string, "link": string, "points": string[], "techStack": string }.
   - "internships": An array of objects: { "company": string, "role": string, "duration": string, "link": string, "points": string[], "techStack": string }.
   - "projects": An array of objects: { "name": string, "role": string, "duration": string, "link": string, "points": string[], "techStack": string }.
   - "education": An array of objects: { "college": string, "degree": string, "duration": string }.
   - "certifications": An array of objects: { "name": string, "issuer": string, "date": string, "link": string }.
   - "training": An array of objects: { "name": string, "organization": string, "duration": string, "points": string[] }.
   - "achievements": An array of objects: { "title": string, "issuer": string, "year": string, "points": string[] }.
   - "languages": An array of objects: { "language": string, "proficiency": string }.
   - "professionalLinks": An array of objects: { "name": string, "url": string }.

2. DATA CLEANING & HYGIENE
   - NO NEWLINES: DO NOT include newline characters (\n) or any other escape characters inside any JSON string values.
   - NO UNESCAPED DOUBLE QUOTES: If you need to include quotation marks inside a string value, escape them with a backslash (\") or use single quotes ('').
   - SINGLE LINE STRINGS: Every JSON string value must be on a single continuous line with no literal newlines.
   - NO "N/A" or "NA": If information is missing, use an empty string ("") or null.
   - BULLET LIMIT: In Experience, Internships, Projects, Training, and Achievements, provide EXACTLY 2-3 high-impact, single-line bullet points. Do NOT provide more than 3.

3. STRICT GROUNDING & NO HALLUCINATIONS (CRITICAL)
   - ONLY extract projects, experience, internships, certifications, training, achievements, and languages explicitly listed under their respective headings in the source PDF. 
   - DO NOT rename, replace, or substitute projects. If the source says "Resume Maker", the output must say "Resume Maker". 
   - DO NOT pull project names from your internal knowledge or from keywords in the summary/header. 
   - ZERO TOLERANCE for hallucinations: "Agent Wizard", "Card Management System", and "AI OCR" are NOT in the source and MUST NOT appear in the output unless they are explicitly in the PROJECTS section.

4. HYPERLINK EXTRACTION (CRITICAL)
   - You are processing a PDF. For words like "Link", "LinkedIn", "GitHub", and "Portfolio", you MUST extract the underlying embedded URL from the PDF's link/annotation layer.
   - If a URL is found in the text (e.g., https://...), use it.
   - If a word is hyperlinked in the PDF, you MUST capture that URL.
   - Ensure these URLs are mapped to the correct "link" or "links" fields in the JSON.
 
5. NO EXAMPLE DATA LEAKAGE
   - Ignore all placeholder values (e.g., "Toucan Payments", "Resume Maker") in the template. ONLY use user data from the PDF.

6. ATS OPTIMIZATION & EXECUTIVE APPEAL
   - Write like a top-tier career coach. Mirror JD keywords. 
   - HEADER TITLE: Create a pipe-separated tagline with at least 4 relevant roles/skills from the JD.
   - QUANTIFY everything with realistic, believable metrics.
   - Start every bullet with a powerful action verb.

7. NO MARKDOWN FORMATTING
   - All JSON string values must be plain text. No bolding (**), no italics, no markdown syntax.
   - All text must be plain text only.

=== INPUT DATA ===

JOB DESCRIPTION:
${jobDescription}

JSON TEMPLATE (preserve this structure, ignore example values):
${existingJson}

=== OUTPUT INSTRUCTIONS ===
Return ONLY a valid JSON object. No markdown fences, no explanations, no comments. Just the raw JSON.
The output must be parseable by JSON.parse() with no modifications.`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey.trim()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType: "application/pdf",
                    data: pdfBase64,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.25,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errData = await geminiResponse.json().catch(() => ({}));
      const msg =
        errData?.error?.message ||
        "Gemini API call failed. Check your API key.";
      return NextResponse.json(
        { error: msg },
        { status: geminiResponse.status }
      );
    }

    const data = await geminiResponse.json();
    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!generatedText) {
      throw new Error("Gemini returned an empty response.");
    }

    // Clean, repair, and validate using our robust parser
    const parsedObj = cleanAndParseJson(generatedText);
    const validJsonString = JSON.stringify(parsedObj, null, 2);

    return NextResponse.json({ result: validJsonString });
  } catch (error: unknown) {
    console.error("Generate resume error:", error);
    const msg =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
