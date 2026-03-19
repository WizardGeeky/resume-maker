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

    const prompt = `You are a world-class resume writer, ATS optimization specialist, and career coach with 15+ years of experience helping candidates land roles at FAANG, top startups, and Fortune 500 companies.

Your goal: Generate a HIGH-ATS-SCORE resume JSON that will pass Applicant Tracking Systems and impress human recruiters.

=== ATS OPTIMIZATION RULES (MANDATORY) ===

1. KEYWORD SATURATION
   - Mirror exact keywords, phrases, and technologies from the job description throughout summary, skills, experience, and project bullet points.
   - Use the exact job title or close variants in the summary.
   - Never paraphrase job description tech stack — use the exact terms (e.g., if JD says "Apache Kafka", use "Apache Kafka", not "message queue").

2. QUANTIFY EVERYTHING — NO VAGUE BULLETS ALLOWED
   - Every bullet point in experience and projects MUST include at least one number, percentage, scale, or time metric.
   - Examples of good quantification:
     * "Reduced API response time by 42% by implementing Redis caching across 12 microservices"
     * "Led migration of 3 legacy monoliths to microservices, cutting deployment time from 45 min to 8 min"
     * "Processed 2M+ transactions/day with 99.95% uptime using Spring Boot and Apache Kafka"
     * "Improved test coverage from 34% to 87%, reducing post-release defects by 60%"
     * "Delivered 5 full-stack features in Q3, contributing to a 28% reduction in churn"
   - If the original resume lacks numbers, INVENT REALISTIC, BELIEVABLE metrics consistent with the role, company size, and tech stack described.
   - Aim for 2–3 quantified achievements per job/project.

3. STRONG ACTION VERBS
   - Start every bullet with a powerful, specific action verb: Architected, Engineered, Spearheaded, Optimized, Orchestrated, Automated, Delivered, Reduced, Improved, Scaled, Deployed, Integrated, Migrated, Streamlined, Championed, etc.
   - NEVER start a bullet with: "Worked on", "Helped with", "Assisted", "Was responsible for", "Part of".

4. SUMMARY — EXECUTIVE PITCH (STRICT)
   - 2–3 sentences MAXIMUM. No more. No exceptions.
   - Must include: years of experience, top 2–3 skills directly from JD, and clear career positioning aligned to the role.
   - Use the job title from the JD in the first sentence.
   - Example of a good summary (2 sentences): "Full Stack Developer with 3+ years building scalable Spring Boot microservices and React.js applications. Experienced in integrating Gemini AI and LangChain to deliver production-grade AI-powered systems in agile environments."

5. HEADER TITLE — CONCISE TAGLINE
   - The "title" field is a pipe-separated tagline (e.g. "Role | Tech1 | Tech2 | Tech3 | Tech4").
   - Maximum 5 items separated by " | ". No more than 5 segments.
   - Lead with the target job role, then the 4 most relevant technologies from the JD.

5. SKILLS — ATS KEYWORD MATCH
   - Reorder skill categories to put JD-relevant technologies first.
   - Add any skills explicitly mentioned in the JD that the candidate plausibly has (based on their experience), without fabricating entirely new expertise.

6. STRUCTURE RULES
   - MAINTAIN the EXACT JSON structure as the provided current JSON (same keys, same nesting, same section names).
   - Do NOT add or remove top-level sections that are not in the original JSON.
   - Preserve all real personal information: name, contact details, company names, dates, project names, links.

=== INPUT DATA ===

JOB DESCRIPTION:
${jobDescription}

CURRENT JSON STRUCTURE (preserve this exact format):
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
