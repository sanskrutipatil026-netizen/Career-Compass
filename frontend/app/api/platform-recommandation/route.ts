import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { platforms } from "@/lib/platforms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = (
  process.env.BACKEND_URL || "http://localhost:5000"
).replace(/\/+$/, "");

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getErrorMessage(data: unknown, fallback: string): string {
  if (isObject(data)) {
    if (typeof data.error === "string") return data.error;
    if (typeof data.message === "string") return data.message;
  }

  return fallback;
}

function extractResumeAnalysis(data: unknown): JsonObject | null {
  if (!isObject(data)) return null;

  if (isObject(data.resumeAnalysis)) {
    const saved = data.resumeAnalysis;

    if (isObject(saved.analysis)) {
      return saved.analysis;
    }

    if (isObject(saved.resumeAnalysis)) {
      const nested = saved.resumeAnalysis;

      if (isObject(nested.analysis)) {
        return nested.analysis;
      }
    }
  }

  if (isObject(data.analysis)) {
    return data.analysis;
  }

  if (isObject(data.data)) {
    return extractResumeAnalysis(data.data);
  }

  return null;
}

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "GROQ_API_KEY is missing from the frontend .env.local file.",
        },
        { status: 500 }
      );
    }

    if (!Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No platforms are configured in lib/platforms.ts.",
        },
        { status: 500 }
      );
    }

    let backendResponse: Response;

    try {
      backendResponse = await fetch(
        `${BACKEND_URL}/api/resume-analysis/latest`,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
          signal: AbortSignal.timeout(15000),
        }
      );
    } catch (error) {
      console.error("Resume backend connection failed:", error);

      return NextResponse.json(
        {
          success: false,
          error:
            "Cannot connect to Express. Check that your backend is running and BACKEND_URL is correct.",
        },
        { status: 503 }
      );
    }

    const backendText = await backendResponse.text();

    let backendData: unknown;

    try {
      backendData = JSON.parse(backendText);
    } catch {
      console.error(
        "Invalid backend response:",
        backendResponse.status,
        backendText.slice(0, 500)
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "The Express backend returned a non-JSON response. Check its endpoint and terminal.",
        },
        { status: 502 }
      );
    }

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: getErrorMessage(
            backendData,
            `Resume backend returned HTTP ${backendResponse.status}.`
          ),
        },
        { status: 502 }
      );
    }

    const resumeAnalysis = extractResumeAnalysis(backendData);

    if (!resumeAnalysis || Object.keys(resumeAnalysis).length === 0) {
      console.error(
        "Unexpected resume-analysis response structure:",
        JSON.stringify(backendData).slice(0, 1000)
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "No saved resume analysis was found in the backend response.",
        },
        { status: 404 }
      );
    }

    const availablePlatforms = platforms.map((platform) => ({
      id: platform.id,
      name: platform.name,
      category: platform.category,
      description: platform.description,
      url: platform.url,
    }));

    const groq = new Groq({ apiKey });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You are the AI career advisor for Career Compass.

Use the candidate's saved resume analysis to recommend 6 to 7 relevant platforms.

Consider education, experience, skills, projects, resume score, experience level,
missing industry skills, improvement areas, and career interests.

Rules:
- Use only IDs from the supplied platform directory.
- Never invent job vacancies, deadlines, salaries, URLs, or eligibility.
- Explain why each platform is relevant.
- Explain what the candidate should explore.
- Priority must be High, Medium, or Low.
- Do not duplicate platform IDs.
- Return a valid JSON object.

Required structure:
{
  "profileSummary": "Candidate profile summary",
  "careerDirection": "Recommended career direction",
  "recommendations": [
    {
      "platformId": "github",
      "reason": "Why this platform matches the candidate",
      "opportunity": "What to explore",
      "priority": "High"
    }
  ]
}
          `,
        },
        {
          role: "user",
          content: JSON.stringify({
            savedResumeAnalysis: resumeAnalysis,
            availablePlatforms,
          }),
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    let aiResult: JsonObject;

    try {
      const parsed: unknown = JSON.parse(content);

      if (!isObject(parsed)) {
        throw new Error("Expected a JSON object.");
      }

      aiResult = parsed;
    } catch {
      throw new Error("Groq returned invalid JSON.");
    }

    const validIds = new Set(platforms.map((platform) => platform.id));
    const seenIds = new Set<string>();

    const recommendations: {
      platformId: string;
      reason: string;
      opportunity: string;
      priority: "High" | "Medium" | "Low";
    }[] = [];

    if (Array.isArray(aiResult.recommendations)) {
      for (const entry of aiResult.recommendations) {
        if (!isObject(entry)) continue;

        const platformId = entry.platformId;

        if (
          typeof platformId !== "string" ||
          !validIds.has(platformId) ||
          seenIds.has(platformId)
        ) {
          continue;
        }

        seenIds.add(platformId);

        const priority: "High" | "Medium" | "Low" =
          entry.priority === "High" ||
          entry.priority === "Medium" ||
          entry.priority === "Low"
            ? entry.priority
            : "Medium";

        recommendations.push({
          platformId,
          reason:
            typeof entry.reason === "string"
              ? entry.reason
              : "Explore this platform based on your resume.",
          opportunity:
            typeof entry.opportunity === "string"
              ? entry.opportunity
              : "Explore relevant opportunities on this platform.",
          priority,
        });

        if (recommendations.length >= 7) break;
      }
    }

    if (recommendations.length === 0) {
      throw new Error(
        "No valid recommendations were generated. Check the platform IDs."
      );
    }

    return NextResponse.json({
      success: true,
      profileSummary:
        typeof aiResult.profileSummary === "string"
          ? aiResult.profileSummary
          : "Your saved resume analysis was reviewed.",
      careerDirection:
        typeof aiResult.careerDirection === "string"
          ? aiResult.careerDirection
          : "Explore opportunities aligned with your profile.",
      recommendations,
    });
  } catch (error) {
    console.error("Platform recommendation API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate platform recommendations.",
      },
      { status: 500 }
    );
  }
}