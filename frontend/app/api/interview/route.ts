
import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:5000";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const history = Array.isArray(body.history)
      ? body.history
      : [];

    const answer =
      typeof body.answer === "string"
        ? body.answer
        : "";

    const difficulty = body.difficulty || "Medium";

    const askedQuestions = Array.isArray(
      body.askedQuestions
    )
      ? body.askedQuestions
      : [];

    // Fetch the latest resume analysis from MongoDB
    const resumeResponse = await fetch(
      `${BACKEND_URL}/api/resume-analysis/latest`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    if (!resumeResponse.ok) {
      return NextResponse.json(
        {
          error:
            "Unable to retrieve your resume from MongoDB. Please analyze your resume first.",
        },
        { status: 400 }
      );
    }

    const resumeData = await resumeResponse.json();

    const savedResume = resumeData.resumeAnalysis;

    if (!savedResume) {
      return NextResponse.json(
        {
          error: "No saved resume analysis was found.",
        },
        { status: 404 }
      );
    }

    const extractedText =
      savedResume.resume?.extractedText || "";

    const analysis = savedResume.analysis || {};

    if (
      !extractedText.trim() &&
      Object.keys(analysis).length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "The saved resume does not contain usable information.",
        },
        { status: 400 }
      );
    }

    const resumeContext = JSON.stringify({
      fileName: savedResume.resume?.fileName || "",
      extractedText: extractedText.slice(0, 12000),
      analysis,
    }).slice(0, 18000);

    const isFirstQuestion =
      history.length === 0 &&
      (answer === "continue" || answer === "");

    const prompt = `
You are an expert AI technical interviewer for Career Compass.

CANDIDATE RESUME:
${resumeContext}

CURRENT DIFFICULTY:
${difficulty}

QUESTIONS ALREADY ASKED:
${JSON.stringify(askedQuestions)}

PREVIOUS INTERVIEW HISTORY:
${JSON.stringify(history)}

CANDIDATE'S LATEST ANSWER:
${answer}

YOUR TASK:

Conduct a personalized interview using the candidate's resume.

QUESTION REQUIREMENTS:

1. Ask questions based on the candidate's actual resume.
2. Focus on projects, technical skills, technologies,
   internships, and experience that are actually mentioned.
3. Ask about project implementation, architecture,
   technology choices, challenges, and problem-solving.
4. Ask technical questions relevant to the technologies
   mentioned in the resume.
5. Do not assume the candidate used tools or technologies
   that are not supported by the resume.
6. Never invent project details or claim the candidate
   implemented something that the resume does not establish.
7. Ask exactly one new question per response.
8. Never repeat an earlier question.
9. Avoid asking the same concept in different words.
10. Adapt difficulty according to the candidate's answers.
11. Keep questions clear and appropriate for the candidate's
    stated experience level.

EVALUATION REQUIREMENTS:

1. Score the latest answer from 0 to 10.
2. Give short, useful feedback specific to the answer.
3. Increase, decrease, or maintain the difficulty.
4. If the answer is "Skipped", give a score of 0 and
   explain that the candidate skipped the question.
5. For the first question, return score 0 and feedback
   "Interview started." Do not evaluate an answer.

Return ONLY valid JSON using this structure:

{
  "score": 0,
  "difficulty": "Medium",
  "feedback": "Interview started.",
  "nextQuestion": "A question based on the candidate's resume."
}
`;

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0.3,
        response_format: {
          type: "json_object",
        },
        messages: [
          {
            role: "system",
            content:
              "You are a resume-based technical interviewer. Use the provided resume as the source of truth. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        {
          error: "AI returned an empty response.",
        },
        { status: 500 }
      );
    }

    let result;

    try {
      result = JSON.parse(content);
    } catch {
      return NextResponse.json(
        {
          error: "AI returned invalid JSON.",
        },
        { status: 500 }
      );
    }

    if (
      typeof result.score !== "number" ||
      !result.difficulty ||
      !result.feedback ||
      typeof result.nextQuestion !== "string" ||
      !result.nextQuestion.trim()
    ) {
      return NextResponse.json(
        {
          error: "AI returned incomplete interview results.",
        },
        { status: 500 }
      );
    }

    const repeatedQuestion = askedQuestions.some(
      (question: string) =>
        typeof question === "string" &&
        question.trim().toLowerCase() ===
          result.nextQuestion.trim().toLowerCase()
    );

    if (repeatedQuestion) {
      return NextResponse.json(
        {
          error:
            "AI generated a repeated question. Please retry.",
        },
        { status: 500 }
      );
    }

    result.score = Math.max(
      0,
      Math.min(10, result.score)
    );

    return NextResponse.json({
      result,
    });
  } catch (error: unknown) {
    console.error("INTERVIEW API ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate the interview question.",
      },
      { status: 500 }
    );
  }
}

