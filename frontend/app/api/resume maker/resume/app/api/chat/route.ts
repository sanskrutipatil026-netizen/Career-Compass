/*
 * POST /api/chat — Career Campass Guide backend for Next.js (App Router).
 *
 * The AI key lives only here, in a server environment variable — never in
 * frontend code. Set it in `.env.local`:
 *   OPENAI_API_KEY=sk-...
 *   # optional:
 *   OPENAI_MODEL=gpt-4o-mini        (defaults to gpt-4o-mini)
 *
 * The frontend sends the whole conversation every time, plus the student's
 * resume data, assessment results, and course/internship catalogs.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

const SYSTEM_PROMPT = `You are the Career Campass Guide, a friendly career guide for Career Campass helping Tier 2 and Tier 3 college students in India get internships and close skill gaps. Be a supportive senior mentor: warm, honest, and practical. Use simple English, and reply in Hinglish if the student does. Keep replies short (3–6 lines) because this is a popup. Ask only one follow-up question at a time. Help with resumes, internship guidance, skill gaps, assessment results, and course or internship recommendations. Use the student's supplied data and never ask for information already provided. Only recommend entries from the supplied course and internship catalogs; never invent names, companies, links, stipends, or selection guarantees. Never help fake experience or certificates. Never collect Aadhaar numbers, passwords, or OTPs. Stay on career topics. If a student seems very distressed, respond with empathy first. For account, payment, or application-status issues, direct them to the platform support team.`;

type ChatBody = {
  messages?: UIMessage[];
  threadId?: string;
  studentProfile?: unknown;
  resumeSummary?: unknown;
  assessmentResults?: unknown;
  currentPage?: string;
  courseCatalog?: unknown;
  internshipCatalog?: unknown;
};

function textOf(message: UIMessage) {
  return message.parts.filter((part) => part.type === "text").map((part) => part.text).join("");
}

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response("Chat is not configured yet. Set OPENAI_API_KEY in .env.local.", { status: 500 });

  const body = (await request.json()) as ChatBody;
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("The conversation request is incomplete.", { status: 400 });
  }

  const last = body.messages.at(-1);
  if (!last || last.role !== "user") return new Response("Please send a student message.", { status: 400 });
  const userText = textOf(last).trim();
  if (!userText) return new Response("Please enter a message.", { status: 400 });

  // Inject the student's live data into the system prompt on every request.
  const context = `CURRENT STUDENT CONTEXT\nProfile: ${JSON.stringify(body.studentProfile ?? {})}\nResume summary: ${JSON.stringify(body.resumeSummary ?? {})}\nAssessment results: ${JSON.stringify(body.assessmentResults ?? {})}\nCurrent page: ${body.currentPage ?? "resume"}\nCourse catalog: ${JSON.stringify(body.courseCatalog ?? [])}\nInternship catalog: ${JSON.stringify(body.internshipCatalog ?? [])}`;

  const provider = createOpenAI({ apiKey });
  const result = streamText({
    model: provider.chat(process.env.OPENAI_MODEL ?? "gpt-4o-mini"),
    system: `${SYSTEM_PROMPT}\n\n${context}`,
    messages: await convertToModelMessages(body.messages),
    abortSignal: request.signal,
    maxRetries: 2,
  });

  // Streams the reply straight back to the chat popup.
  return result.toUIMessageStreamResponse();
}
