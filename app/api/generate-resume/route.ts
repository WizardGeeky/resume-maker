import { NextRequest, NextResponse } from "next/server";

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
   - You MUST return a JSON object with this EXACT top-level structure: "header", "summary", "skills", "experience", "projects", "education".
   - "header": Must contain "name", "title", "contact", and a "links" object ("linkedin", "github", "portfolio").
   - "summary": A single string (max 3 lines).
   - "skills": An array of objects: { "label": string, "value": string }.
   - "experience": An array of objects: { "company": string, "role": string, "duration": string, "link": string, "points": string[], "techStack": string }.
   - "projects": An array of objects: { "name": string, "role": string, "duration": string, "link": string, "points": string[], "techStack": string }.
   - "education": A single OBJECT (not an array): { "college": string, "degree": string, "duration": string }.

2. DATA CLEANING & HYGIENE
   - NO NEWLINES: DO NOT include newline characters (\n) or any other escape characters inside any JSON string values.
   - NO "N/A" or "NA": If information is missing, use an empty string ("") or null.
   - BULLET LIMIT: In Experience and Projects, provide EXACTLY 2-3 high-impact, single-line bullet points. Do NOT provide more than 3.

3. STRICT GROUNDING & NO HALLUCINATIONS (CRITICAL)
   - ONLY extract projects and experience explicitly listed under their respective headings in the source PDF. 
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
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
            temperature: 0.65,
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

    // Strip markdown fences if Gemini wraps its output
    const cleanedJson = generatedText
      .replace(/```json\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    // Validate before returning
    JSON.parse(cleanedJson);

    return NextResponse.json({ result: cleanedJson });
  } catch (error: unknown) {
    console.error("Generate resume error:", error);
    const msg =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
