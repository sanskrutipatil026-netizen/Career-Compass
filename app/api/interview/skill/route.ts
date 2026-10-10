import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const skills = body.skills;
    const experienceLevel =
      body.experienceLevel || "Fresher";

    if (
      !skills ||
      !Array.isArray(skills) ||
      skills.length === 0
    ) {
      return NextResponse.json(
        { error: "No skills found" },
        { status: 400 }
      );
    }

    const prompt = `
You are an AI technical assessment generator.

Generate exactly 10 multiple-choice questions based ONLY on the candidate's skills.

Candidate experience level:
${experienceLevel}

Candidate skills:
${skills.join(", ")}

IMPORTANT RULES:

1. Generate exactly 10 questions.
2. Each question must have exactly 4 options.
3. Only ONE option can be correct.
4. The "answer" MUST be EXACTLY the same text as one of the four options.
5. Do not put extra spaces before or after the answer.
6. Do not change capitalization between the option and answer.
7. Questions must be related to the candidate's skills.
8. Cover different candidate skills where possible.
9. Difficulty should match the candidate's experience level.
10. Include the skill being tested.
11. Return ONLY valid JSON.

Example:

{
  "questions": [
    {
      "question": "Which language is used for styling web pages?",
      "options": [
        "HTML",
        "CSS",
        "JavaScript",
        "Python"
      ],
      "answer": "CSS",
      "skill": "Web Development"
    }
  ]
}

The answer "CSS" is exactly the same as one of the options.

Return this exact structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A",
      "skill": "Skill name"
    }
  ]
}
`;

    const completion =
  await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    temperature: 0.2,
    response_format: {
      type: "json_object",
    },
    messages: [
      {
        role: "system",
        content:
          "You are an AI technical assessment generator. Return ONLY valid JSON. The answer field must exactly match one of the options.",
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
          error:
            "AI did not return questions",
        },
        { status: 500 }
      );
    }

    const result = JSON.parse(content);

    // Check that questions exist
    if (
      !result.questions ||
      !Array.isArray(result.questions)
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned invalid question format",
        },
        { status: 500 }
      );
    }

    // Validate every question
    const validQuestions =
      result.questions.filter((q: any) => {
        if (
          !q.question ||
          !Array.isArray(q.options) ||
          q.options.length !== 4 ||
          !q.answer ||
          !q.skill
        ) {
          return false;
        }

        // Answer must match one option
        return q.options.some(
          (option: string) =>
            option.trim().toLowerCase() ===
            q.answer.trim().toLowerCase()
        );
      });

    if (validQuestions.length === 0) {
      return NextResponse.json(
        {
          error:
            "AI generated questions with invalid answers.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: validQuestions,
    });

  } catch (error) {
    console.error(
      "Skill assessment generation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate assessment",
      },
      { status: 500 }
    );
  }
}