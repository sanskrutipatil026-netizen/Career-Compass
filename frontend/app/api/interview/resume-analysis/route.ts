
import { NextResponse } from "next/server";
import { createHash } from "crypto";
import Groq from "groq-sdk";
import mammoth from "mammoth";
import { CanvasFactory } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BACKEND_URL = (
  process.env.BACKEND_URL ||
  "https://career-compass-backend-v8sv.onrender.com"
).replace(/\/+$/, "");

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const resumeAnalysisCache = new Map<string, any>();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const EXCLUDED_SECTIONS = [
  "communication gaps",
  "communication gap",
  "communication skills",
  "languages",
  "language",
  "hobbies",
  "hobby",
  "interests",
  "interest",
];

function isExcludedSection(value: unknown): boolean {
  if (typeof value !== "string") return false;

  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return EXCLUDED_SECTIONS.some(
    (section) =>
      normalized === section ||
      normalized.startsWith(`${section} `) ||
      normalized.endsWith(` ${section}`)
  );
}

function containsExcludedContent(value: unknown): boolean {
  if (typeof value !== "string") return false;

  return (
    isExcludedSection(value) ||
    /\b(extracurricular|co-curricular|co curricular)\b/i.test(value)
  );
}

function cleanResumeAnalysis(analysis: any) {
  if (
    !analysis ||
    typeof analysis !== "object" ||
    Array.isArray(analysis)
  ) {
    throw new Error("Invalid resume analysis returned by AI.");
  }

  const excludedFields = [
    "communicationGaps",
    "communicationGap",
    "communication",
    "languages",
    "language",
    "hobbies",
    "hobby",
    "interests",
    "interest",
    "extracurricularActivities",
    "extracurricularActivity",
  ];

  for (const field of excludedFields) {
    delete analysis[field];
  }

  if (Array.isArray(analysis.missingSections)) {
    analysis.missingSections = analysis.missingSections.filter(
      (section: unknown) =>
        typeof section === "string" &&
        !containsExcludedContent(section)
    );
  }

  if (Array.isArray(analysis.resumeImprovements)) {
    analysis.resumeImprovements = analysis.resumeImprovements.filter(
      (item: any) => {
        if (!item || typeof item !== "object") return false;

        return ![
          item.section,
          item.issue,
          item.whatToAdd,
          item.suggestion,
        ].some(containsExcludedContent);
      }
    );
  }

  return analysis;
}

/**
 * Extract readable text from a PDF buffer using pdfjs-dist.
 * Note: scanned PDFs containing only images require OCR.
 */
async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
    CanvasFactory,
  });

  try {
    const result = await parser.getText();
    const text = result.text?.trim() || "";

    if (!text) {
      throw new Error(
        "No text could be extracted from this PDF. Try uploading a text-based PDF."
      );
    }

    return text;
  } finally {
    await parser.destroy();
  }
}


function normalizeUrl(rawUrl: string): string {
  if (typeof rawUrl !== "string") return "";

  let value = rawUrl.trim();

  value = value.replace(/^[("<\[]+/, "");
  value = value.replace(/[),.;\]">]+$/g, "");

  if (!value) return "";

  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value}`;
  }

  try {
    const parsed = new URL(value);

    if (!["http:", "https:"].includes(parsed.protocol)) return "";
    if (!parsed.hostname.includes(".")) return "";
    if (parsed.username || parsed.password) return "";

    return parsed.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function extractResumeLinks(text: string): string[] {
  const urlPattern =
    /(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s<>"']*)?/gi;

  const matches = text.matchAll(urlPattern);
  const unique = new Map<string, string>();

  for (const match of matches) {
    const start = match.index ?? 0;

    if (start > 0 && text[start - 1] === "@") continue;

    const normalized = normalizeUrl(match[0]);

    if (!normalized) continue;

    try {
      const parsed = new URL(normalized);
      const host = parsed.hostname.toLowerCase().replace(/^www\./i, "");

      if (host.includes("example.com") || host === "localhost") {
        continue;
      }

      const key = normalized.replace(/\/$/, "").toLowerCase();

      if (!unique.has(key)) {
        unique.set(key, normalized);
      }
    } catch {
      // Ignore malformed URL-like strings.
    }
  }

  return [...unique.values()];
}

function classifyResumeLinks(
  links: string[],
  resumeText: string
): {
  linkedin?: string;
  github?: string;
  portfolio?: string;
} {
  const result: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  } = {};

  for (const link of links) {
    let parsed: URL;

    try {
      parsed = new URL(link);
    } catch {
      continue;
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./i, "");
    const path = parsed.pathname.replace(/\/+$/, "");

    if (
      !result.linkedin &&
      (host === "linkedin.com" || host.endsWith(".linkedin.com")) &&
      /\/(in|pub|profile)\//i.test(path)
    ) {
      result.linkedin = link;
      continue;
    }

    if (
      !result.github &&
      (host === "github.com" || host.endsWith(".github.com")) &&
      path.split("/").filter(Boolean).length >= 1 &&
      !/^\/(features|topics|settings|login|signup|orgs|marketplace|collections|sponsors)(\/|$)/i.test(
        path
      )
    ) {
      result.github = link;
      continue;
    }

    const isCommonSocialOrCodeHost =
      host === "linkedin.com" ||
      host.endsWith(".linkedin.com") ||
      host === "github.com" ||
      host.endsWith(".github.com") ||
      host === "gitlab.com" ||
      host.endsWith(".gitlab.com") ||
      host === "bitbucket.org" ||
      host.endsWith(".bitbucket.org") ||
      host === "twitter.com" ||
      host === "x.com" ||
      host === "instagram.com" ||
      host === "facebook.com" ||
      host === "youtube.com" ||
      host === "youtu.be" ||
      host === "medium.com" ||
      host === "leetcode.com" ||
      host === "hackerrank.com" ||
      host === "geeksforgeeks.org";

    const isPortfolioHost =
      /\.(vercel\.app|netlify\.app|github\.io|web\.app|pages\.dev|gitlab\.io)$/i.test(
        host
      ) || /portfolio|personal|developer/i.test(host + path);

    const linkForSearch = link.replace(
      /^https?:\/\/(?:www\.)?/i,
      ""
    );

    const linkIndex = resumeText
      .toLowerCase()
      .indexOf(linkForSearch.toLowerCase());

    const nearbyText =
      linkIndex >= 0
        ? resumeText.slice(
            Math.max(0, linkIndex - 80),
            Math.min(
              resumeText.length,
              linkIndex + linkForSearch.length + 80
            )
          )
        : "";

    const explicitlyLabeledPortfolio =
      /portfolio|personal website|website|web site|live demo|project demo/i.test(
        nearbyText
      );

    if (
      !result.portfolio &&
      !isCommonSocialOrCodeHost &&
      (isPortfolioHost || explicitlyLabeledPortfolio)
    ) {
      result.portfolio = link;
    }
  }

  return result;
}

function applyDetectedLinks(
  analysis: any,
  links: string[],
  resumeText: string
) {
  if (
    !analysis.contactInfo ||
    typeof analysis.contactInfo !== "object" ||
    Array.isArray(analysis.contactInfo)
  ) {
    analysis.contactInfo = {};
  }

  const detected = classifyResumeLinks(links, resumeText);
  const fields = ["linkedin", "github", "portfolio"] as const;

  for (const field of fields) {
    if (
      !analysis.contactInfo[field] ||
      typeof analysis.contactInfo[field] !== "object"
    ) {
      analysis.contactInfo[field] = {
        present: false,
        value: "",
        suggestion: "",
      };
    }

    const current = analysis.contactInfo[field];
    const detectedValue = detected[field];

    if (detectedValue) {
      current.present = true;
      current.value = detectedValue;
      current.suggestion = "";
    } else if (
      typeof current.value === "string" &&
      current.value.trim()
    ) {
      current.present = true;
    } else {
      current.present = false;
      current.value = "";
    }
  }

  analysis.detectedLinks = links;

  return analysis;
}

function normalizeContactInfo(analysis: any) {
  if (
    !analysis.contactInfo ||
    typeof analysis.contactInfo !== "object" ||
    Array.isArray(analysis.contactInfo)
  ) {
    analysis.contactInfo = {};
  }

  const fields = [
    "name",
    "email",
    "phone",
    "linkedin",
    "github",
    "portfolio",
  ];

  for (const field of fields) {
    const item = analysis.contactInfo[field];

    if (!item || typeof item !== "object" || Array.isArray(item)) {
      analysis.contactInfo[field] = {
        present: false,
        value: "",
        suggestion: "",
      };
      continue;
    }

    item.present = Boolean(item.present);

    item.value =
      typeof item.value === "string" ||
      typeof item.value === "number"
        ? String(item.value)
        : "";

    item.suggestion =
      typeof item.suggestion === "string"
        ? item.suggestion
        : "";
  }
}

function normalizeEducation(analysis: any) {
  if (
    !analysis.education ||
    typeof analysis.education !== "object" ||
    Array.isArray(analysis.education)
  ) {
    analysis.education = {
      present: false,
      items: [],
      suggestion: "No education details were identified.",
    };
  }

  if (!Array.isArray(analysis.education.items)) {
    analysis.education.items = [];
  }

  analysis.education.items = analysis.education.items
    .map((item: any) => {
      if (typeof item === "string") {
        return item.trim() || null;
      }

      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const normalized = {
        degree: typeof item.degree === "string" ? item.degree.trim() : "",
        field: typeof item.field === "string" ? item.field.trim() : "",
        institution:
          typeof item.institution === "string"
            ? item.institution.trim()
            : "",
        duration:
          typeof item.duration === "string" ? item.duration.trim() : "",
        cgpa:
          typeof item.cgpa === "string" ||
          typeof item.cgpa === "number"
            ? item.cgpa
            : "",
      };

      const hasInformation = Boolean(
        normalized.degree ||
          normalized.field ||
          normalized.institution ||
          normalized.duration ||
          String(normalized.cgpa).trim()
      );

      return hasInformation ? normalized : null;
    })
    .filter((item: any) => item !== null);

  analysis.education.present = analysis.education.items.length > 0;

  if (typeof analysis.education.suggestion !== "string") {
    analysis.education.suggestion = "";
  }

  if (!analysis.education.present && !analysis.education.suggestion) {
    analysis.education.suggestion =
      "No education details were identified.";
  }
}

function normalizeExperience(analysis: any) {
  if (
    !analysis.experience ||
    typeof analysis.experience !== "object" ||
    Array.isArray(analysis.experience)
  ) {
    analysis.experience = {
      present: false,
      items: [],
      suggestion: "No experience details were identified.",
    };
  }

  if (!Array.isArray(analysis.experience.items)) {
    analysis.experience.items = [];
  }

  analysis.experience.items = analysis.experience.items
    .filter(
      (item: any) =>
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
    )
    .map((item: any) => ({
      title: typeof item.title === "string" ? item.title : "",
      organization:
        typeof item.organization === "string" ? item.organization : "",
      duration:
        typeof item.duration === "string" ? item.duration : "",
      description:
        typeof item.description === "string" ? item.description : "",
    }))
    .filter(
      (item: any) =>
        item.title ||
        item.organization ||
        item.duration ||
        item.description
    );

  analysis.experience.present = analysis.experience.items.length > 0;

  if (typeof analysis.experience.suggestion !== "string") {
    analysis.experience.suggestion = "";
  }
}

function normalizeStringArray(
  value: unknown,
  filterExcluded = true
): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.length > 0 &&
        (!filterExcluded || !containsExcludedContent(item))
    );
}

function normalizeResumeSections(analysis: any) {
  for (const sectionName of ["projects", "achievements"]) {
    const section = analysis[sectionName];

    if (
      !section ||
      typeof section !== "object" ||
      Array.isArray(section)
    ) {
      analysis[sectionName] = {
        present: false,
        items: [],
        suggestion: "",
      };
      continue;
    }

    section.items = normalizeStringArray(section.items);
    section.present = section.items.length > 0;

    if (typeof section.suggestion !== "string") {
      section.suggestion = "";
    }
  }
}

function normalizeRoadmap(analysis: any) {
  if (!Array.isArray(analysis.roadmap)) {
    analysis.roadmap = [];
  }

  analysis.roadmap = analysis.roadmap
    .filter(
      (step: any) =>
        step &&
        typeof step === "object" &&
        typeof step.stage === "string" &&
        !containsExcludedContent(step.stage)
    )
    .map((step: any) => ({
      stage: step.stage.trim(),
      keywords: normalizeStringArray(step.keywords),
    }))
    .filter((step: any) => step.stage && step.keywords.length > 0)
    .slice(0, 5);
}

function normalizeDomains(analysis: any) {
  if (!Array.isArray(analysis.domains)) {
    analysis.domains = [];
  }

  analysis.domains = analysis.domains
    .filter(
      (domain: any) =>
        domain &&
        typeof domain.name === "string" &&
        domain.name.trim().length > 0
    )
    .map((domain: any) => ({
      name: domain.name.trim(),
      score: Math.max(
        0,
        Math.min(100, Math.round(Number(domain.score) || 0))
      ),
    }));
}

function normalizeAnalysis(analysis: any) {
  analysis = cleanResumeAnalysis(analysis);

  normalizeContactInfo(analysis);
  normalizeEducation(analysis);
  normalizeExperience(analysis);
  normalizeResumeSections(analysis);

  analysis.skills = normalizeStringArray(analysis.skills);
  analysis.strengths = normalizeStringArray(analysis.strengths);
  analysis.weaknesses = normalizeStringArray(analysis.weaknesses);

  analysis.missingIndustrySkills = normalizeStringArray(
    analysis.missingIndustrySkills
  );

  analysis.missingSections = normalizeStringArray(
    analysis.missingSections
  );

  analysis.summary =
    typeof analysis.summary === "string" ? analysis.summary : "";

  analysis.experienceLevel =
    typeof analysis.experienceLevel === "string"
      ? analysis.experienceLevel
      : "Not determined";

  analysis.resumeImprovements = Array.isArray(
    analysis.resumeImprovements
  )
    ? analysis.resumeImprovements
        .filter(
          (item: any) =>
            item &&
            typeof item === "object" &&
            !Array.isArray(item)
        )
        .filter(
          (item: any) =>
            ![
              item.section,
              item.issue,
              item.whatToAdd,
              item.suggestion,
            ].some(containsExcludedContent)
        )
        .map((item: any) => ({
          section:
            typeof item.section === "string" ? item.section : "",
          issue: typeof item.issue === "string" ? item.issue : "",
          whatToAdd:
            typeof item.whatToAdd === "string" ? item.whatToAdd : "",
          suggestion:
            typeof item.suggestion === "string"
              ? item.suggestion
              : "",
          priority: ["high", "medium", "low"].includes(
            String(item.priority).toLowerCase()
          )
            ? String(item.priority).toLowerCase()
            : "medium",
        }))
    : [];

  normalizeRoadmap(analysis);
  normalizeDomains(analysis);

  analysis.overallScore = Math.max(
    0,
    Math.min(100, Math.round(Number(analysis.overallScore) || 0))
  );

  delete analysis.communicationGaps;
  delete analysis.communicationGap;
  delete analysis.communication;
  delete analysis.extracurricularActivities;
  delete analysis.extracurricularActivity;
  delete analysis.languages;
  delete analysis.language;
  delete analysis.hobbies;
  delete analysis.hobby;
  delete analysis.interests;
  delete analysis.interest;

  return analysis;
}

async function findExistingAnalysis(resumeHash: string) {
  const url = `${BACKEND_URL}/api/resume-analysis/by-hash/${encodeURIComponent(resumeHash)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
  } catch (error) {
    console.error("Backend connection failed:", error);
    throw new Error(
      `Could not connect to Express backend at ${url}`
    );
  }

  const responseText = await response.text();

  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Backend returned non-JSON. HTTP ${response.status}: ${responseText.slice(0, 300)}`
    );
  }

  console.log("Resume lookup status:", response.status);
  console.log("Resume lookup response:", data);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Resume lookup failed. HTTP ${response.status}: ${
        data?.message || data?.error || responseText.slice(0, 300)
      }`
    );
  }

  if (data?.success === false) {
    return null;
  }

  return (
    data?.resumeAnalysis?.analysis ??
    data?.analysis ??
    data?.resumeAnalysis ??
    null
  );
}

export async function POST(req: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;

    if (!file || typeof file.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "The uploaded resume is empty." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Resume file must be less than 5 MB." },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let resumeText = "";
    const hyperlinkTargets: string[] = [];

    // PDF extraction: use pdfjs-dist instead of pdf(buffer).
    if (fileName.endsWith(".pdf")) {
      resumeText = await extractPdfText(buffer);
    } else if (fileName.endsWith(".docx")) {
      const [rawData, htmlData] = await Promise.all([
        mammoth.extractRawText({ buffer }),
        mammoth.convertToHtml({ buffer }),
      ]);

      resumeText = rawData.value || "";

      const html = htmlData.value || "";
      const hrefPattern = /href\s*=\s*["']([^"']+)["']/gi;

      let hrefMatch: RegExpExecArray | null;

      while ((hrefMatch = hrefPattern.exec(html)) !== null) {
        const normalized = normalizeUrl(hrefMatch[1]);

        if (normalized) {
          hyperlinkTargets.push(normalized);
        }
      }
    } else if (fileName.endsWith(".txt")) {
      resumeText = buffer.toString("utf-8");
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload PDF, DOCX, or TXT.",
        },
        { status: 400 }
      );
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        {
          error:
            "Could not extract text from the resume. If this is a scanned PDF, OCR may be required.",
        },
        { status: 400 }
      );
    }

    const detectedLinks = [
      ...new Map(
        [...extractResumeLinks(resumeText), ...hyperlinkTargets].map(
          (url) => [url.replace(/\/$/, "").toLowerCase(), url]
        )
      ).values(),
    ];

    const resumeTextForAnalysis = detectedLinks.length
      ? `${resumeText}\n\nExtracted hyperlink targets (preserve exact URLs):\n${detectedLinks.join(
          "\n"
        )}`
      : resumeText;

    const normalizedResumeText = resumeTextForAnalysis
      .replace(/\s+/g, " ")
      .trim();

    const resumeHash = createHash("sha256")
      .update(normalizedResumeText, "utf8")
      .digest("hex");

    // 1. Check the in-memory cache.
    const cachedAnalysis = resumeAnalysisCache.get(resumeHash);

    if (cachedAnalysis) {
      console.log("Returning cached resume analysis:", resumeHash);
      return NextResponse.json(cachedAnalysis);
    }

    // 2. Check MongoDB for a previously saved analysis.
    let existingAnalysis: any;

    try {
      existingAnalysis = await findExistingAnalysis(resumeHash);
    } catch (error) {
      console.error("EXISTING ANALYSIS LOOKUP FAILED:", error);

      return NextResponse.json(
        {
          error:
            "Could not check MongoDB for a previous analysis. Verify your Express backend and the by-hash endpoint.",
        },
        { status: 503 }
      );
    }

    if (
      existingAnalysis &&
      typeof existingAnalysis === "object" &&
      !Array.isArray(existingAnalysis)
    ) {
      const cleanExistingAnalysis = normalizeAnalysis(
        structuredClone(existingAnalysis)
      );

      resumeAnalysisCache.set(resumeHash, cleanExistingAnalysis);

      console.log(
        "Returning previously saved MongoDB analysis:",
        resumeHash
      );

      return NextResponse.json(cleanExistingAnalysis);
    }

    // 3. Analyze the resume only if it has not been analyzed before.
    const prompt = `
Analyze the following resume and return ONLY valid JSON.

Do not invent information. Use only evidence from the resume.

Return this structure:

{
  "summary": "",
  "skills": [],
  "strengths": [],
  "weaknesses": [],
  "overallScore": 0,
  "experienceLevel": "",
  "missingIndustrySkills": [],
  "roadmap": [
    {
      "stage": "",
      "keywords": []
    }
  ],
  "contactInfo": {
    "name": {"present": false, "value": "", "suggestion": ""},
    "email": {"present": false, "value": "", "suggestion": ""},
    "phone": {"present": false, "value": "", "suggestion": ""},
    "linkedin": {"present": false, "value": "", "suggestion": ""},
    "github": {"present": false, "value": "", "suggestion": ""},
    "portfolio": {"present": false, "value": "", "suggestion": ""}
  },
  "education": {
    "present": false,
    "items": [],
    "suggestion": ""
  },
  "experience": {
    "present": false,
    "items": [],
    "suggestion": ""
  },
  "projects": {
    "present": false,
    "items": [],
    "suggestion": ""
  },
  "achievements": {
    "present": false,
    "items": [],
    "suggestion": ""
  },
  "missingSections": [],
  "resumeImprovements": [],
  "domains": []
}

GENERAL RULES:
- Analyze strengths and weaknesses using evidence from the resume.
- Do not return communicationGaps or communicationGap.
- Do not analyze communication gaps.
- Do not return extracurricularActivities or extracurricularActivity.
- Do not analyze extracurricular or co-curricular activities.
- Do not return languages, hobbies, or interests fields.
- Do not create recommendations about communication gaps, extracurricular activities, languages, hobbies, or interests.

CONTACT INFORMATION:
Check full name, professional email, phone, LinkedIn, GitHub, and portfolio.
Set present to true only when supported by the resume.
Never invent contact information.
Preserve complete URLs and their paths.
Use extracted hyperlink targets as evidence.
Do not assume a GitHub repository is the candidate's personal profile.

EDUCATION:
Return education.items as objects with these fields:
{
  "degree": "",
  "field": "",
  "institution": "",
  "duration": "",
  "cgpa": ""
}
Extract only information supported by the resume.
Use empty strings for unavailable fields.
Do not invent a CGPA, percentage, institution, or graduation year.

EXPERIENCE:
Return experience.items as objects with:
{
  "title": "",
  "organization": "",
  "duration": "",
  "description": ""
}
Include genuine internships, employment, freelance work, training, or open-source contributions when documented.
Never invent experience.

PROJECTS:
Return projects.items as an array of strings.
Describe genuine projects and their available technologies, features, contributions, and links.
Do not invent project details.

CERTIFICATIONS AND ACHIEVEMENTS:
Return achievements.items as an array of strings.
Only include genuine information mentioned in the resume.
Never invent awards, certifications, ranks, or achievements.

MISSING SECTIONS:
Check relevant resume sections, including:
Name, Email, Phone, Education, Skills, Projects, Experience,
Professional Summary, LinkedIn, GitHub, Portfolio,
Certifications, and Achievements.
Do not include communication gaps, extracurricular activities,
languages, hobbies, or interests in missingSections.

RESUME IMPROVEMENTS:
Each improvement must contain:
{
  "section": "",
  "issue": "",
  "whatToAdd": "",
  "suggestion": "",
  "priority": "high"
}
Priority must be high, medium, or low.
Give practical, specific recommendations based on evidence.
Never recommend fake skills, experience, certifications, or achievements.
Do not create improvements about excluded sections.

OVERALL SCORE:
Use this fixed rubric:
Skills and technical knowledge: 30 points.
Projects: 20 points.
Education: 15 points.
Experience/internships: 15 points.
Certifications: 10 points.
Resume quality and completeness: 10 points.
Total: 100 points.
Score each category independently based on evidence.
Add the six category scores.
Return an integer from 0 to 100.
Do not invent information or award unsupported points.
Do not change the rubric.

EXPERIENCE LEVEL:
Estimate the candidate's level using documented experience only.

INDUSTRY SKILLS:
Identify relevant industry skills that are not already demonstrated.
Consider the candidate's technical domain and experience level.

ROADMAP:
Return exactly 3 to 5 stages in logical order.
Each stage must have a short name and 2 to 5 keywords.
Do not return paragraphs.
Show progression toward placement readiness.

DOMAINS:
Return domains as objects:
{
  "name": "",
  "score": 0
}
Scores must be integers from 0 to 100 and represent estimated resume evidence, not measured test results.

CONSISTENCY:
Use the fixed rubric above.
Do not introduce random score variation.
The same substantive resume information must be scored consistently.
Return only valid JSON without markdown.

RESUME:
${resumeTextForAnalysis}
`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      temperature: 0,
      response_format: {
        type: "json_object",
      },
      messages: [
        {
          role: "system",
          content:
            "You are a strict resume analyzer. Return only valid JSON. Follow the supplied schema, never invent resume information, and do not include excluded sections.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const result = completion.choices[0]?.message?.content;

    if (!result) {
      return NextResponse.json(
        { error: "AI returned an empty result." },
        { status: 500 }
      );
    }

    let analysis: any;

    try {
      analysis = JSON.parse(result);
    } catch (error) {
      console.error("AI JSON PARSE ERROR:", error);

      return NextResponse.json(
        { error: "AI returned invalid JSON." },
        { status: 500 }
      );
    }

    // Normalize and remove all excluded sections.
    analysis = normalizeAnalysis(analysis);

    // Apply verified links detected in the resume.
    analysis = applyDetectedLinks(
      analysis,
      detectedLinks,
      resumeTextForAnalysis
    );

    analysis = normalizeAnalysis(analysis);

    // Save the analysis and hash in MongoDB.
    const mongoResponse = await fetch(
      `${BACKEND_URL}/api/resume-analysis/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type || "unknown",
          fileSize: file.size,
          extractedText: resumeTextForAnalysis,
          resumeHash,
          analysis,
        }),
        cache: "no-store",
      }
    );

    const responseText = await mongoResponse.text();
    let mongoData: any;

    try {
      mongoData = JSON.parse(responseText);
    } catch {
      console.error("MongoDB returned non-JSON:", responseText);

      return NextResponse.json(
        {
          error:
            "MongoDB returned an invalid response while saving the analysis.",
        },
        { status: 500 }
      );
    }

    if (!mongoResponse.ok || mongoData?.success === false) {
      console.error("MONGODB SAVE FAILED:", mongoData);

      return NextResponse.json(
        {
          error:
            mongoData?.error ||
            mongoData?.message ||
            "MongoDB save failed.",
        },
        { status: 500 }
      );
    }

    // Cache only after a successful save.
    resumeAnalysisCache.set(resumeHash, analysis);

    console.log("Resume analysis saved:", resumeHash);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("RESUME ANALYSIS ERROR:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Something went wrong while analyzing the resume.",
      },
      { status: 500 }
    );
  }
}

