import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { pdfText, jobDescription, existingJson } = await request.json();

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
    }

    const prompt = `You are an expert resume writer and ATS optimization specialist.

I have an existing resume and a job description. Your task is to generate an optimized resume JSON that:
1. Keeps the person's real information (name, contact, actual experience, education, projects)
2. Tailors the summary, skills emphasis, and bullet points to match the job description keywords
3. Maintains the EXACT same JSON structure/layout as shown below

EXISTING RESUME DATA (extracted from PDF):
${pdfText}

JOB DESCRIPTION:
${jobDescription}

CURRENT JSON STRUCTURE (follow this exact format):
${existingJson}

Generate an updated resume JSON that is tailored for this job description. 
- Keep all real personal information intact (name, contact, company names, dates)
- Optimize the summary to highlight relevant skills for this job
- Reorder or emphasize skills that match the job description
- Tailor bullet points in experience/projects to highlight relevant achievements
- Use strong action verbs and quantifiable results where possible
- Ensure ATS compatibility

Return ONLY valid JSON, no markdown, no explanation, no code blocks. Just the raw JSON object.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Something went wrong." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up the response - remove markdown code blocks if present
    let cleanedJson = generatedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Validate JSON
    JSON.parse(cleanedJson); // Will throw if invalid

    return NextResponse.json({ result: cleanedJson });
  } catch (error) {
    console.error("Generate resume error:", error);
    return NextResponse.json(
        { error: "Something went wrong." },
        { status: 500 }
      );
  }
}
