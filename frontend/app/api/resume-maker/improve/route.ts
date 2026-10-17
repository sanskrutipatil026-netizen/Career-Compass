
import Groq from "groq-sdk";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GROQ_API_KEY is not configured in .env.local." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const summary = String(body.summary || "").trim();
    const skills = String(body.skills || "").trim();
    const projects = String(body.projects || "").trim();
    const degree = String(body.degree || "").trim();
    const branch = String(body.branch || "").trim();

    if (!summary) {
      return Response.json(
        { error: "Please enter a professional summary first." },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `
You are an expert professional resume writer and career coach.

Improve resume content for students, fresh graduates, internship applicants,
and entry-level software engineering candidates.

Rules:
1. Use only the facts supplied by the user.
2. Never invent qualifications, CGPA, skills, projects, or experience.
3. Use clear, professional, ATS-friendly language.
4. Highlight relevant technical skills and genuine accomplishments.
5. Avoid generic claims, unnecessary adjectives, and first-person pronouns.
6. Keep the summary concise, usually 3 to 5 sentences.
7. Return only the improved professional summary, without headings,
   markdown, explanations, or quotation marks.
          `.trim(),
        },
        {
          role: "user",
          content: `
Improve this candidate's professional resume summary.

Current summary:
${summary}

Degree:
${degree}

Branch:
${branch}

Technical skills:
${skills}

Projects:
${projects}

Create a polished, truthful, professional summary suitable for internships
and entry-level jobs. Do not add unsupported facts.
          `.trim(),
        },
      ],
    });

    const improvedSummary =
      completion.choices[0]?.message?.content?.trim();

    if (!improvedSummary) {
      return Response.json(
        { error: "Groq did not return an improved summary." },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      summary: improvedSummary,
    });
  } catch (error) {
    console.error("Resume Maker Groq API error:", error);

    return Response.json(
      { error: "Failed to improve the resume. Please try again." },
      { status: 500 }
    );
  }
}