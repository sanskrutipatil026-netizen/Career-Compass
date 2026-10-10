import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const history = body.history || [];
    const answer = body.answer || "";
    const difficulty = body.difficulty || "Medium";
    const askedQuestions = body.askedQuestions || [];

    const prompt = `
You are an AI Technical Interviewer.

Current Difficulty:
${difficulty}

Questions already asked:
${askedQuestions.join("\n")}

Previous Interview History:
${JSON.stringify(history)}
Candidate's Latest Answer:
${answer}

If the candidate's answer is "Skipped":
- Give a score of 0.
- Feedback must say the question was skipped.
- Still generate one completely new technical question.

IMPORTANT RULES:
1. Evaluate the candidate's latest answer.
2. Give a score from 0 to 10.
3. Give short feedback.
4. Increase, decrease, or maintain the difficulty.
5. Generate ONE completely NEW technical question.
6. Never repeat any question from the Questions Already Asked list.
7. Do not generate a question that tests exactly the same concept.
8. Return ONLY valid JSON.

Return exactly this structure:

{
  "score": 8,
  "difficulty": "Medium",
  "feedback": "Good explanation.",
  "nextQuestion": "Explain React useMemo."
}
`;

   const completion = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  temperature: 0.3,
  response_format: {
    type: "json_object",
  },
  messages: [
    {
      role: "system",
      content:
        "You are an AI interviewer. Always return ONLY valid JSON.",
    },
    {
      role: "user",
      content: prompt,
    },
  ],
}); 

    const content =
      completion.choices[0]?.message?.content;

    console.log("GROQ RAW RESPONSE:", content);

    if (!content) {
      return NextResponse.json(
        {
          error: "AI returned an empty response",
        },
        { status: 500 }
      );
    }

    // Convert AI JSON string into an actual JavaScript object
    let result;

    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error(
        "Failed to parse Groq response:",
        content
      );

      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
        },
        { status: 500 }
      );
    }

    // Check required fields
    if (
      typeof result.score !== "number" ||
      !result.difficulty ||
      !result.feedback ||
      !result.nextQuestion
    ) {
      console.error(
        "Incomplete AI result:",
        result
      );

      return NextResponse.json(
        {
          error: "AI returned incomplete interview result",
        },
        { status: 500 }
      );
    }

    console.log("FINAL AI RESULT:", result);

    // IMPORTANT:
    // result is now an OBJECT, not a JSON string
    return NextResponse.json({
      result: result,
    });

  } catch (error: any) {
  console.error("INTERVIEW API ERROR:", error);

  return NextResponse.json(
    {
      error:
        error?.message ||
        error?.error?.message ||
        "Failed to generate interview result.",
    },
    { status: 500 }
  );
}
}