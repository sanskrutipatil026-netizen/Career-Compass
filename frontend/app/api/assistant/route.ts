import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = process.env.GROQ_API_KEY
    ? new Groq({
        apiKey: process.env.GROQ_API_KEY,
    })
    : null;

/* -------------------------------------------------------
   BASIC RATE LIMITING
   ------------------------------------------------------- */

const requestLog = new Map<string, number[]>();

const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();

    const requests = requestLog.get(ip) || [];

    const recentRequests = requests.filter(
        (time) => now - time < RATE_WINDOW
    );

    if (recentRequests.length >= RATE_LIMIT) {
        requestLog.set(ip, recentRequests);
        return false;
    }

    recentRequests.push(now);
    requestLog.set(ip, recentRequests);

    return true;
}

/* -------------------------------------------------------
   FALLBACK RESPONSES
   ------------------------------------------------------- */

const fallbackResponses: Record<string, string> = {
    en: "I'm having trouble connecting to the AI service right now. Please try again in a moment. You can ask me about interviews, resumes, coding, skills, courses, or career guidance.",

    hi: "अभी AI सेवा से कनेक्शन में समस्या आ रही है। कृपया थोड़ी देर बाद फिर प्रयास करें। आप मुझसे इंटरव्यू, रिज्यूमे, कोडिंग, स्किल्स, कोर्स या करियर मार्गदर्शन के बारे में पूछ सकते हैं।",

    mr: "सध्या AI सेवेशी कनेक्ट होण्यात अडचण येत आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा. तुम्ही मला मुलाखत, रेझ्युमे, कोडिंग, कौशल्ये, कोर्स किंवा करिअर मार्गदर्शनाबद्दल विचारू शकता.",

    bn: "এই মুহূর্তে AI পরিষেবার সাথে সংযোগ করতে সমস্যা হচ্ছে। অনুগ্রহ করে কিছুক্ষণ পরে আবার চেষ্টা করুন। আপনি ইন্টারভিউ, রেজিউমে, কোডিং, দক্ষতা, কোর্স বা ক্যারিয়ার সম্পর্কে জিজ্ঞাসা করতে পারেন।",

    te: "ప్రస్తుతం AI సేవకు కనెక్ట్ అవ్వడంలో సమస్య ఉంది. దయచేసి కొంత సమయం తర్వాత మళ్లీ ప్రయత్నించండి. మీరు ఇంటర్వ్యూలు, రెజ్యూమ్, కోడింగ్, నైపుణ్యాలు, కోర్సులు లేదా కెరీర్ గురించి అడగవచ్చు.",

    ta: "தற்போது AI சேவையுடன் இணைப்பதில் சிக்கல் உள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும். நேர்காணல், ரெஸ்யூம், கோடிங், திறன்கள், படிப்புகள் அல்லது தொழில் வழிகாட்டுதல் பற்றி கேட்கலாம்.",

    gu: "હાલમાં AI સેવા સાથે કનેક્ટ થવામાં સમસ્યા આવી રહી છે. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો. તમે ઇન્ટરવ્યુ, રેઝ્યૂમે, કોડિંગ, કૌશલ્યો, કોર્સ અથવા કરિયર માર્ગદર્શન વિશે પૂછી શકો છો.",

    kn: "ಪ್ರಸ್ತುತ AI ಸೇವೆಗೆ ಸಂಪರ್ಕಿಸಲು ಸಮಸ್ಯೆ ಉಂಟಾಗಿದೆ. ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಸಮಯದ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. ನೀವು ಸಂದರ್ಶನ, ರೆಸ್ಯೂಮ್, ಕೋಡಿಂಗ್, ಕೌಶಲ್ಯಗಳು, ಕೋರ್ಸ್‌ಗಳು ಅಥವಾ ಕರಿಯರ್ ಮಾರ್ಗದರ್ಶನದ ಬಗ್ಗೆ ಕೇಳಬಹುದು.",
};

/* -------------------------------------------------------
   LANGUAGE NORMALIZATION
   ------------------------------------------------------- */

const supportedLanguages: Record<string, string> = {
    en: "English",
    hi: "Hindi",
    mr: "Marathi",
    bn: "Bengali",
    te: "Telugu",
    ta: "Tamil",
    gu: "Gujarati",
    kn: "Kannada",
};

function normalizeLanguage(
    language: string,
    languageCode: string
): {
    name: string;
    code: string;
} {
    const code = languageCode?.toLowerCase();

    if (supportedLanguages[code]) {
        return {
            name: supportedLanguages[code],
            code,
        };
    }

    const matchingCode = Object.entries(supportedLanguages).find(
        ([, name]) => name.toLowerCase() === language?.toLowerCase()
    )?.[0];

    if (matchingCode) {
        return {
            name: supportedLanguages[matchingCode],
            code: matchingCode,
        };
    }

    return {
        name: "English",
        code: "en",
    };
}

/* -------------------------------------------------------
   CLEAN AI RESPONSE
   ------------------------------------------------------- */

function cleanAssistantResponse(text: string): string {
    if (!text) return "";

    return text
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/^(\s*)[*-]\s+/gm, "$1• ")
        .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
        .replace(/\*/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

/* -------------------------------------------------------
   SAFE HISTORY
   ------------------------------------------------------- */

function cleanHistory(history: unknown) {
    if (!Array.isArray(history)) {
        return [];
    }

    return history
        .filter(
            (item: any) =>
                item &&
                (item.sender === "user" ||
                    item.sender === "assistant") &&
                typeof item.text === "string"
        )
        .slice(-12)
        .map((item: any) => ({
            role:
                item.sender === "user"
                    ? ("user" as const)
                    : ("assistant" as const),
            content: item.text.slice(0, 5000),
        }));
}

/* -------------------------------------------------------
   POST
   ------------------------------------------------------- */

export async function POST(req: Request) {
    try {
        /* -----------------------------------------------
           RATE LIMIT
           ----------------------------------------------- */

        const forwardedFor = req.headers.get("x-forwarded-for");

        const ip =
            forwardedFor?.split(",")[0]?.trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                {
                    error:
                        "Too many requests. Please wait a moment and try again.",
                },
                { status: 429 }
            );
        }

        /* -----------------------------------------------
           READ REQUEST
           ----------------------------------------------- */

        const body = await req.json();

        const {
            message,
            language = "English",
            languageCode = "en",
            history = [],
            userContext = null,
        } = body;

        /* -----------------------------------------------
           VALIDATE MESSAGE
           ----------------------------------------------- */

        if (!message || typeof message !== "string") {
            return NextResponse.json(
                {
                    error: "Message is required.",
                },
                { status: 400 }
            );
        }

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return NextResponse.json(
                {
                    error: "Message cannot be empty.",
                },
                { status: 400 }
            );
        }

        if (trimmedMessage.length > 4000) {
            return NextResponse.json(
                {
                    error:
                        "Message is too long. Please keep it under 4000 characters.",
                },
                { status: 400 }
            );
        }

        /* -----------------------------------------------
           LANGUAGE
           ----------------------------------------------- */

        const selectedLanguage = normalizeLanguage(
            language,
            languageCode
        );

        /* -----------------------------------------------
           HISTORY
           ----------------------------------------------- */

        const formattedHistory = cleanHistory(history);

        /* -----------------------------------------------
           FALLBACK IF API IS NOT CONFIGURED
           ----------------------------------------------- */

        if (!groq) {
            return NextResponse.json({
                reply:
                    fallbackResponses[selectedLanguage.code] ||
                    fallbackResponses.en,
            });
        }

        /* -----------------------------------------------
           USER CONTEXT
           ----------------------------------------------- */

        let safeUserContext = "";

        if (
            userContext &&
            typeof userContext === "object"
        ) {
            try {
                safeUserContext = JSON.stringify(
                    userContext
                ).slice(0, 6000);
            } catch {
                safeUserContext = "";
            }
        }

        /* -----------------------------------------------
           SYSTEM PROMPT
           ----------------------------------------------- */

        const systemPrompt = `
You are Compass Mitra, the AI Career Assistant inside Career Compass.

Your purpose is to help students with:
• Career guidance
• Technical interviews
• Mock interview preparation
• Resume improvement
• ATS concepts
• Coding and programming
• Data structures and algorithms
• Skill development
• Skill-gap guidance
• SWAYAM course guidance
• Placement preparation
• General academic-to-career questions

LANGUAGE:
Always answer in ${selectedLanguage.name}.
Language code: ${selectedLanguage.code}.

Do not switch languages unless the user explicitly asks you to.

PERSONALIZATION:
If student information is provided in USER CONTEXT, use it to personalize your answer.
Do not invent information that is not present in USER CONTEXT.

USER CONTEXT:
${safeUserContext || "No user-specific information is available."}

CONVERSATION:
Use the previous conversation when relevant.
Do not repeat questions that the user has already answered.

ANSWER QUALITY:
• Give direct and useful answers.
• Do not unnecessarily repeat the user's question.
• Explain technical concepts in simple language when appropriate.
• Give examples when they improve understanding.
• If the user asks for code, provide working code and explain only what is necessary.
• If the user asks for interview preparation, give practical steps.
• If the user asks about resumes, focus on measurable improvements.
• If the user asks about Career Compass features, describe only the features that are known:
  - AI Mock Interviews
  - Resume ATS Analysis
  - Skill Self-Rating and Gap Identification
  - SWAYAM Course Recommendations
  - Placement and Salary Insights

IMPORTANT:
Do not pretend that you can see a user's resume, profile, database records, application status, or placement information unless that information is included in USER CONTEXT.

If you do not have enough information to answer a user-specific question, say so clearly and tell the user what information is needed.

Do not invent statistics, job openings, salary figures, course availability, or personal information.

STYLE:
• Friendly
• Professional
• Helpful
• Concise
• Suitable for a chatbot window

Keep most answers under 300 words unless the user specifically asks for a detailed explanation.

FORMATTING:
Never use * or **.
Do not use Markdown headings with #.
Use normal text headings and • bullet points.
Use numbered steps when appropriate.
Keep spacing clean.
`;

        /* -----------------------------------------------
           BUILD MESSAGES
           ----------------------------------------------- */

        const messages: Array<{
            role: "system" | "user" | "assistant";
            content: string;
        }> = [
                {
                    role: "system",
                    content: systemPrompt,
                },
                ...formattedHistory,
                {
                    role: "user",
                    content: trimmedMessage,
                },
            ];

        /* -----------------------------------------------
           FIRST MODEL
           ----------------------------------------------- */

        let reply: string | null = null;

        try {
            const completion =
                await groq.chat.completions.create({
                    model: "openai/gpt-oss-120b",
                    temperature: 0.5,
                    max_tokens: 800,
                    messages,
                });

            reply =
                completion.choices[0]?.message?.content ||
                null;
        } catch (primaryError) {
            console.warn(
                "120B model failed. Trying fallback model.",
                primaryError
            );
        }

        /* -----------------------------------------------
           SECOND MODEL
           ----------------------------------------------- */

        if (!reply) {
            try {
                const fallbackCompletion =
                    await groq.chat.completions.create({
                        model: "openai/gpt-oss-20b",
                        temperature: 0.5,
                        max_tokens: 800,
                        messages,
                    });

                reply =
                    fallbackCompletion.choices[0]?.message
                        ?.content || null;
            } catch (fallbackError) {
                console.error(
                    "Both Groq models failed.",
                    fallbackError
                );
            }
        }

        /* -----------------------------------------------
           FINAL RESPONSE
           ----------------------------------------------- */

        if (reply && reply.trim()) {
            return NextResponse.json({
                reply: cleanAssistantResponse(reply),
            });
        }

        /* -----------------------------------------------
           AI FAILED → LANGUAGE FALLBACK
           ----------------------------------------------- */

        return NextResponse.json({
            reply:
                fallbackResponses[selectedLanguage.code] ||
                fallbackResponses.en,
        });
    } catch (error: any) {
        console.error(
            "Assistant API error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    "Failed to process your message. Please try again.",
            },
            { status: 500 }
        );
    }
}