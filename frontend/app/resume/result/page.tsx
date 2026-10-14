"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

/* =====================================================
   TYPES
===================================================== */

type Domain = {
  name: string;
  score: number;
};

type ContactItem = {
  present: boolean;
  value: string;
  suggestion: string;
};

type EducationItem = {
  degree?: string;
  field?: string;
  institution?: string;
  duration?: string;
  cgpa?: string | number;
};

type ExperienceItem = {
  title?: string;
  organization?: string;
  duration?: string;
  description?: string;
};

type ResumeSection = {
  present: boolean;
  items: string[];
  suggestion: string;
};

type EducationSection = {
  present: boolean;
  items: (string | EducationItem)[];
  suggestion: string;
};

type Improvement = {
  section: string;
  issue: string;
  whatToAdd: string;
  suggestion: string;
  priority: string;
};

type RoadmapStep = {
  stage: string;
  keywords: string[];
};

type ResumeAnalysis = {
  summary: string;
  skills: string[];
  strengths: string[];
  weaknesses: string[];
  overallScore: number;
  experienceLevel: string;
  communicationGaps?: string[];
  missingIndustrySkills: string[];
  roadmap: RoadmapStep[];

  contactInfo?: {
    name?: ContactItem;
    email?: ContactItem;
    phone?: ContactItem;
    linkedin?: ContactItem;
    github?: ContactItem;
    portfolio?: ContactItem;
  };

  education?: EducationSection;

  experience?: {
    present: boolean;
    items: ExperienceItem[];
    suggestion: string;
  };

  projects?: ResumeSection;

  // Certifications may still exist in the API response,
  // but this page intentionally does not display them.

  achievements?: ResumeSection;
  extracurricularActivities?: ResumeSection;
  missingSections?: string[];
  resumeImprovements?: Improvement[];
  domains: Domain[];
  detectedLinks?: string[];
};

/* =====================================================
   HELPER FUNCTIONS
===================================================== */

const EXCLUDED_TERMS = [
  "communication gap",
  "communication gaps",
  "communication skills",
  "language",
  "languages",
  "hobby",
  "hobbies",
  "interest",
  "interests",
];

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isExcluded(value: string): boolean {
  const normalized = value
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .trim();

  return EXCLUDED_TERMS.some(
    (term) =>
      normalized === term ||
      normalized.startsWith(`${term}:`) ||
      normalized.startsWith(`${term} `)
  );
}

function filterItems(items?: string[]): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !isExcluded(item));
}

function getSafeExternalUrl(value: string): string | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (
    !trimmed ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  ) {
    return null;
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);

    if (
      !["http:", "https:"].includes(parsed.protocol) ||
      !parsed.hostname.includes(".")
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

function getUniqueDetectedLinks(links?: string[]): string[] {
  const unique = new Map<string, string>();

  for (const link of links || []) {
    if (typeof link !== "string") {
      continue;
    }

    const safeUrl = getSafeExternalUrl(link);

    if (!safeUrl) {
      continue;
    }

    const key = safeUrl.replace(/\/+$/, "").toLowerCase();

    if (!unique.has(key)) {
      unique.set(key, safeUrl);
    }
  }

  return [...unique.values()];
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent progress";
  if (score >= 60) return "Good foundation";
  if (score >= 40) return "Room to improve";

  return "Your improvement journey starts here";
}

function getPriorityClasses(priority: string): string {
  const value = priority.toLowerCase();

  if (value.includes("high") || value.includes("urgent")) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (value.includes("medium")) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-[#dce2cf] bg-[#f0f3e9] text-[#5f6b46]";
}

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasExperienceData(item: ExperienceItem): boolean {
  return Boolean(
    hasText(item.title) ||
      hasText(item.organization) ||
      hasText(item.duration) ||
      hasText(item.description)
  );
}

function hasEducationData(
  item: string | EducationItem
): boolean {
  if (typeof item === "string") {
    return item.trim().length > 0;
  }

  return Boolean(
    hasText(item.degree) ||
      hasText(item.field) ||
      hasText(item.institution) ||
      hasText(item.duration) ||
      (item.cgpa !== undefined &&
        item.cgpa !== null &&
        String(item.cgpa).trim() !== "")
  );
}

/* =====================================================
   REUSABLE UI COMPONENTS
===================================================== */

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f0e7da] text-lg text-[#826647]">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-extrabold tracking-tight text-[#49382a] sm:text-lg">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-[#968573]">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`min-w-0 rounded-2xl border border-[#e9dfd0] bg-white p-4 shadow-[0_4px_20px_rgba(96,76,56,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(96,76,56,0.08)] sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

function SkillPills({
  items,
  color = "brown",
}: {
  items: string[];
  color?: "brown" | "olive" | "orange";
}) {
  const colorClasses = {
    brown: "border-[#e6d8c5] bg-[#f8f2e9] text-[#70563b]",
    olive: "border-[#dce2cf] bg-[#f0f3e9] text-[#5f6b46]",
    orange: "border-[#f0dec8] bg-[#fcf2e5] text-[#9a6936]",
  };

  if (!items.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition hover:-translate-y-0.5 ${colorClasses[color]}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

/* =====================================================
   MAIN RESUME RESULT PAGE
===================================================== */

export default function ResumeResultPage() {
  const router = useRouter();

  const [analysis, setAnalysis] =
    useState<ResumeAnalysis | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* =====================================================
     FETCH RESUME ANALYSIS
  ===================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadResumeAnalysis() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/resume-analysis/latest",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const responseText = await response.text();

        let data: {
          success?: boolean;
          message?: string;
          error?: string;
          resumeAnalysis?: {
            analysis?: ResumeAnalysis;
          };
        };

        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(
            "The backend returned an invalid response. Check that Express is running on port 5000."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              data.error ||
              "Unable to load resume analysis."
          );
        }

        if (!data.resumeAnalysis?.analysis) {
          throw new Error(
            "No resume analysis was found. Please analyse your resume first."
          );
        }

        if (!cancelled) {
          setAnalysis(data.resumeAnalysis.analysis);
        }
      } catch (err) {
        console.error("Resume analysis loading error:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load resume analysis."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResumeAnalysis();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =====================================================
     LOADING SCREEN
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-100 p-5">
        <div className="w-full max-w-md rounded-3xl border border-[#e9dfd0] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e7da] text-3xl">
            ✧
          </div>

          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[#e9dfd0] border-t-[#A67B5B]" />

          <h2 className="text-xl font-extrabold text-[#49382a]">
            Preparing Your Career Dashboard
          </h2>

          <p className="mt-2 text-sm text-[#968573]">
            Loading your personalised resume insights...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR SCREEN
  ===================================================== */

  if (!analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-100 p-5">
        <div className="w-full max-w-lg rounded-3xl border border-[#e9dfd0] bg-white p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0e7da] text-3xl">
            📄
          </div>

          <h2 className="mt-5 text-2xl font-extrabold text-[#49382a]">
            Unable to Load Resume
          </h2>

          <p className="mt-3 break-words text-sm leading-6 text-[#968573]">
            {error || "Please analyse your resume first."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push("/resume")}
              className="rounded-xl bg-[#A67B5B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#826647]"
            >
              Analyse Resume →
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl border border-[#e9dfd0] px-6 py-3 text-sm font-bold text-[#604c38] transition hover:bg-[#fcfaf6]"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PREPARE DASHBOARD DATA
  ===================================================== */

  const score = Math.max(
    0,
    Math.min(100, Number(analysis.overallScore) || 0)
  );

  const skills = filterItems(analysis.skills);
  const strengths = filterItems(analysis.strengths);
  const weaknesses = filterItems(analysis.weaknesses);

  const missingSkills = filterItems(
    analysis.missingIndustrySkills
  );

  const missingSections = filterItems(
    analysis.missingSections
  );

  const roadmap = (analysis.roadmap || []).filter(
    (step) =>
      step &&
      typeof step.stage === "string" &&
      step.stage.trim().length > 0 &&
      !isExcluded(step.stage)
  );

  const improvements = (
    analysis.resumeImprovements || []
  ).filter((item) => {
    if (!item) return false;

    const hasUsefulContent = [
      item.section,
      item.issue,
      item.whatToAdd,
      item.suggestion,
    ].some((value) => hasText(value));

    const excluded = [
      item.section,
      item.issue,
      item.whatToAdd,
      item.suggestion,
    ].some(
      (value) =>
        typeof value === "string" && isExcluded(value)
    );

    return hasUsefulContent && !excluded;
  });

  const domains = (analysis.domains || []).filter(
    (domain) =>
      domain &&
      typeof domain.name === "string" &&
      domain.name.trim().length > 0
  );

  const detectedLinks = getUniqueDetectedLinks(
    analysis.detectedLinks
  );

  const contactFields = [
    {
      label: "Full Name",
      icon: "♙",
      item: analysis.contactInfo?.name,
      isLink: false,
    },
    {
      label: "Email Address",
      icon: "✉",
      item: analysis.contactInfo?.email,
      isLink: false,
    },
    {
      label: "Phone Number",
      icon: "⌕",
      item: analysis.contactInfo?.phone,
      isLink: false,
    },
    {
      label: "LinkedIn",
      icon: "in",
      item: analysis.contactInfo?.linkedin,
      isLink: true,
    },
    {
      label: "GitHub",
      icon: "⌘",
      item: analysis.contactInfo?.github,
      isLink: true,
    },
    {
      label: "Portfolio",
      icon: "↗",
      item: analysis.contactInfo?.portfolio,
      isLink: true,
    },
  ].filter(
    ({ item }) =>
      item?.present && hasText(item.value)
  );

  const experienceItems = (
    analysis.experience?.items || []
  ).filter(hasExperienceData);

  const educationItems = (
    analysis.education?.items || []
  ).filter(hasEducationData);

  const projectItems = filterItems(
    analysis.projects?.items
  );

  const achievementItems = filterItems(
    analysis.achievements?.items
  );

  const extracurricularItems = filterItems(
    analysis.extracurricularActivities?.items
  );

  const summary = cleanText(analysis.summary);
  const experienceLevel = cleanText(
    analysis.experienceLevel
  );

  /* =====================================================
     MAIN DASHBOARD UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-amber-100 text-[#49382a]">
      {/* NAVBAR */}

      <nav className="sticky top-0 z-50 flex flex-col justify-between gap-3 bg-[#A67B5B] px-4 py-3 shadow-md sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-3 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg font-extrabold text-[#A67B5B] shadow-sm">
            AI
          </div>

          <div>
            <h1 className="text-lg font-extrabold tracking-wide text-amber-100">
              Career Compass
            </h1>

            <p className="text-[10px] font-semibold tracking-[0.2em] text-[#F5EBDD]">
              AI POWERED CAREER GUIDANCE
            </p>
          </div>
        </button>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-amber-100/15 px-3 py-2 text-amber-100 transition hover:bg-amber-100/25"
          >
            ⚡ Dashboard
          </button>

          <button
            onClick={() => router.push("/interview")}
            className="rounded-xl px-3 py-2 text-[#FFF8ED] transition hover:bg-amber-100/15"
          >
            🎯 Practice
          </button>

          <button
            onClick={() => router.push("/history")}
            className="rounded-xl px-3 py-2 text-[#FFF8ED] transition hover:bg-amber-100/15"
          >
            📊 My Sessions
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-extrabold text-[#A67B5B]">
            U
          </div>

          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-amber-100/40 bg-amber-100 px-4 py-2 text-sm font-bold text-[#604C38] shadow-sm transition hover:bg-[#F1E4D1]"
          >
            Logout ↗
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT */}

      <main className="mx-auto max-w-[1600px] space-y-4 px-3 py-5 sm:px-5 lg:px-7">
        {/* PAGE HEADER */}

        <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dce2cf] bg-white px-3 py-1.5 text-xs font-bold text-[#68744e] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#849365]" />
              AI ANALYSIS COMPLETE
            </div>

            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#49382a] sm:text-4xl">
              Your Resume{" "}
              <span className="text-[#A67B5B]">
                Insights
              </span>
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#8b7a67]">
              Understand your strengths, discover skill gaps,
              and follow a personalised roadmap towards your
              career goals.
            </p>
          </div>

          <button
            onClick={() => router.push("/resume")}
            className="w-fit rounded-xl border border-[#d8c7b1] bg-white px-4 py-2.5 text-sm font-bold text-[#826647] shadow-sm transition hover:bg-[#f8f2e9]"
          >
            ↻ Analyse Another Resume
          </button>
        </section>

        {/* OVERVIEW GRID */}

        <section
          className={`grid grid-cols-1 gap-3 sm:grid-cols-2 ${
            skills.length > 0 || experienceLevel
              ? "xl:grid-cols-4"
              : "xl:grid-cols-3"
          }`}
        >
          {/* RESUME SCORE */}

          <div className="relative overflow-hidden rounded-2xl bg-[#604C38] p-5 text-white shadow-lg sm:col-span-2">
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full border-[24px] border-white/5" />

            <div className="relative flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-[#E7D7C1]">
                  YOUR RESUME SCORE
                </span>

                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-tight">
                    {score}
                  </span>

                  <span className="text-base text-[#D8C5AC]">
                    /100
                  </span>
                </div>

                <p className="mt-2 text-sm font-semibold text-[#E7D7C1]">
                  {getScoreLabel(score)}
                </p>
              </div>

              <div
                className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full sm:h-28 sm:w-28"
                style={{
                  background: `conic-gradient(#D6C19E ${score}%, #796852 ${score}% 100%)`,
                }}
              >
                <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#604C38] text-xl font-extrabold sm:h-[92px] sm:w-[92px]">
                  {score}%
                </div>
              </div>
            </div>

            <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-[#D6C19E] transition-all duration-700"
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="relative mt-2 text-xs text-[#E7D7C1]">
              Use your personalised recommendations to
              strengthen your resume.
            </p>
          </div>

          {/* SKILLS COUNT */}

          {skills.length > 0 && (
            <div className="rounded-2xl border border-[#e9dfd0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#8b7a67]">
                  Skills Identified
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0e7da] text-lg">
                  ◇
                </span>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-[#604C38]">
                {skills.length}
              </p>

              <p className="mt-1 text-xs text-[#968573]">
                Skills detected in your resume
              </p>
            </div>
          )}

          {/* EXPERIENCE LEVEL */}

          {experienceLevel && (
            <div className="rounded-2xl border border-[#e9dfd0] bg-white p-4 shadow-sm transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-[#8b7a67]">
                  Experience Level
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f0f3e9] text-lg">
                  ✧
                </span>
              </div>

              <p className="mt-4 break-words text-xl font-extrabold text-[#604C38]">
                {experienceLevel}
              </p>

              <p className="mt-1 text-xs text-[#968573]">
                Your current professional profile
              </p>
            </div>
          )}
        </section>

        {/* PROFESSIONAL SUMMARY */}

        {summary && (
          <DashboardCard className="bg-gradient-to-br from-white to-[#f8f1e6]">
            <SectionHeading
              icon="✧"
              title="Professional Summary"
              description="An overview of your resume and career profile"
            />

            <p className="text-sm leading-7 text-[#6f6050]">
              {summary}
            </p>
          </DashboardCard>
        )}

        {/* SKILLS AND STRENGTHS */}

        {(skills.length > 0 || strengths.length > 0) && (
          <section
            className={`grid grid-cols-1 gap-4 ${
              skills.length > 0 && strengths.length > 0
                ? "lg:grid-cols-2"
                : "lg:grid-cols-1"
            }`}
          >
            {skills.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="◇"
                  title="Skills Identified"
                  description={`${skills.length} skills found in your resume`}
                />

                <SkillPills items={skills} />
              </DashboardCard>
            )}

            {strengths.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="✦"
                  title="Your Strengths"
                  description="What makes your profile stand out"
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {strengths.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-2 rounded-xl bg-[#f3f5ed] p-3"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#e2e9d7] text-xs font-bold text-[#68744e]">
                        ✓
                      </span>

                      <p className="text-sm leading-5 text-[#6f6050]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            )}
          </section>
        )}

        {/* WEAKNESSES AND SKILL GAPS */}

        {(weaknesses.length > 0 || missingSkills.length > 0) && (
          <section
            className={`grid grid-cols-1 gap-4 ${
              weaknesses.length > 0 && missingSkills.length > 0
                ? "lg:grid-cols-2"
                : "lg:grid-cols-1"
            }`}
          >
            {weaknesses.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="↗"
                  title="Areas to Improve"
                  description="Areas where you can strengthen your profile"
                />

                <div className="space-y-2">
                  {weaknesses.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-[#eee5d8] bg-[#fcfaf6] p-3"
                    >
                      <span className="mt-1 text-[#A67B5B]">
                        ●
                      </span>

                      <p className="text-sm leading-6 text-[#6f6050]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            )}

            {missingSkills.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="◎"
                  title="Missing Industry Skills"
                  description="Skills you could learn for your target career"
                />

                <SkillPills
                  items={missingSkills}
                  color="olive"
                />

                <div className="mt-3 rounded-xl bg-[#f0f3e9] p-3">
                  <p className="text-xs leading-5 text-[#5f6b46]">
                    <strong>Recommended action:</strong>{" "}
                    Prioritise skills relevant to your target
                    role and practise them through projects.
                  </p>
                </div>
              </DashboardCard>
            )}
          </section>
        )}

        {/* INTERVIEW DOMAINS */}

        {domains.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="◉"
              title="Interview Preparation Domains"
              description="Topics recommended for your interview preparation"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {domains.map((domain, index) => {
                const domainScore = Math.max(
                  0,
                  Math.min(100, Number(domain.score) || 0)
                );

                return (
                  <div
                    key={`${domain.name}-${index}`}
                    className="rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#604C38]">
                        {domain.name}
                      </h3>

                      <span className="text-sm font-extrabold text-[#826647]">
                        {domainScore}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#eae4d9]">
                      <div
                        className="h-full rounded-full bg-[#87936b] transition-all duration-700"
                        style={{
                          width: `${domainScore}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
        )}

        {/* CONTACT INFORMATION: DETECTED FIELDS ONLY */}

        {contactFields.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="▤"
              title="Resume Contact Details"
              description="Contact information detected in your resume"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {contactFields.map(
                ({ label, icon, item, isLink }) => {
                  const safeUrl =
                    isLink && item?.value
                      ? getSafeExternalUrl(item.value)
                      : null;

                  return (
                    <div
                      key={label}
                      className="min-w-0 rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#604C38]">
                          {icon} {label}
                        </h3>

                        <span className="rounded-full bg-[#e8eedf] px-2 py-1 text-[10px] font-bold text-[#5e7047]">
                          FOUND
                        </span>
                      </div>

                      <div className="mt-3 break-words text-sm text-[#6f6050]">
                        {safeUrl ? (
                          <a
                            href={safeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all font-semibold text-[#826647] underline decoration-[#cbb79b] underline-offset-4 hover:text-[#604C38]"
                          >
                            {item?.value}
                          </a>
                        ) : (
                          item?.value
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </DashboardCard>
        )}

        {/* DETECTED LINKS */}

        {detectedLinks.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="↗"
              title="Links Detected in Your Resume"
              description="Website and profile links extracted from your resume"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {detectedLinks.map((link, index) => {
                const safeUrl = getSafeExternalUrl(link);

                if (!safeUrl) {
                  return null;
                }

                let hostname = link;

                try {
                  hostname = new URL(
                    safeUrl
                  ).hostname.replace(/^www\./i, "");
                } catch {
                  hostname = link;
                }

                return (
                  <a
                    key={`${link}-${index}`}
                    href={safeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group min-w-0 rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3 transition hover:-translate-y-0.5 hover:border-[#cbb79b] hover:bg-[#f8f1e6]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="break-all text-sm font-bold text-[#826647]">
                        {hostname}
                      </span>

                      <span className="shrink-0 text-[#A67B5B]">
                        ↗
                      </span>
                    </div>

                    <p className="mt-2 break-all text-xs leading-5 text-[#968573]">
                      {link}
                    </p>

                    <p className="mt-2 text-xs font-bold text-[#604C38]">
                      Open link →
                    </p>
                  </a>
                );
              })}
            </div>
          </DashboardCard>
        )}

        {/* EXPERIENCE AND EDUCATION */}

        {(experienceItems.length > 0 ||
          educationItems.length > 0) && (
          <section
            className={`grid grid-cols-1 gap-4 ${
              experienceItems.length > 0 &&
              educationItems.length > 0
                ? "lg:grid-cols-2"
                : "lg:grid-cols-1"
            }`}
          >
            {/* EXPERIENCE */}

            {experienceItems.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="↗"
                  title="Experience"
                  description="Professional and practical experience"
                />

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {experienceItems.map((item, index) => (
                    <article
                      key={`${item.title || "experience"}-${index}`}
                      className="rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0e7da] text-lg text-[#826647]">
                          ▣
                        </div>

                        <div className="min-w-0 flex-1">
                          {item.title && (
                            <h3 className="break-words font-bold text-[#604C38]">
                              {item.title}
                            </h3>
                          )}

                          {item.organization && (
                            <p className="mt-1 text-sm text-[#826647]">
                              {item.organization}
                            </p>
                          )}

                          {item.duration && (
                            <p className="mt-1 text-xs text-[#968573]">
                              {item.duration}
                            </p>
                          )}
                        </div>
                      </div>

                      {item.description && (
                        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#6f6050]">
                          {item.description}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </DashboardCard>
            )}

            {/* EDUCATION */}

            {educationItems.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="▧"
                  title="Education"
                  description="Your academic qualifications"
                />

                <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                  {educationItems.map((item, index) => {
                    if (typeof item === "string") {
                      return (
                        <article
                          key={`education-${index}`}
                          className="rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                        >
                          <p className="whitespace-pre-line text-sm leading-6 text-[#6f6050]">
                            {item}
                          </p>
                        </article>
                      );
                    }

                    const details = [
                      {
                        label: "Degree",
                        value: item.degree,
                      },
                      {
                        label: "Branch / Specialization",
                        value: item.field,
                      },
                      {
                        label: "Institution",
                        value: item.institution,
                      },
                      {
                        label: "Duration",
                        value: item.duration,
                      },
                      {
                        label: "CGPA / Percentage",
                        value: item.cgpa,
                      },
                    ].filter(
                      (detail) =>
                        detail.value !== undefined &&
                        detail.value !== null &&
                        String(detail.value).trim() !== ""
                    );

                    if (!details.length) {
                      return null;
                    }

                    return (
                      <article
                        key={`education-${index}`}
                        className="rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0e7da] text-lg text-[#826647]">
                            ▧
                          </div>

                          <h3 className="break-words text-sm font-bold text-[#604C38]">
                            {item.degree ||
                              "Academic Qualification"}
                          </h3>
                        </div>

                        <div className="space-y-2">
                          {details
                            .filter(
                              (detail) =>
                                detail.label !== "Degree"
                            )
                            .map((detail) => (
                              <div
                                key={detail.label}
                                className="grid grid-cols-1 gap-1 border-t border-[#eee5d8] pt-2 sm:grid-cols-[135px_minmax(0,1fr)] sm:gap-3"
                              >
                                <span className="text-xs font-semibold text-[#968573]">
                                  {detail.label}
                                </span>

                                <span className="break-words text-sm leading-5 text-[#604C38]">
                                  {String(detail.value)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </DashboardCard>
            )}
          </section>
        )}

        {/* PROJECTS AND ACHIEVEMENTS - NO CERTIFICATIONS */}

        {(projectItems.length > 0 ||
          achievementItems.length > 0) && (
          <section
            className={`grid grid-cols-1 gap-4 ${
              projectItems.length > 0 &&
              achievementItems.length > 0
                ? "lg:grid-cols-2"
                : "lg:grid-cols-1"
            }`}
          >
            {/* PROJECTS */}

            {projectItems.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="⌘"
                  title="Projects"
                  description="Practical work demonstrating your skills"
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-1">
                  {projectItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                    >
                      <div className="flex items-start gap-2">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f0e7da] text-xs font-bold text-[#826647]">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <p className="text-sm leading-5 text-[#6f6050]">
                          {item}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            )}

            {/* ACHIEVEMENTS */}

            {achievementItems.length > 0 && (
              <DashboardCard>
                <SectionHeading
                  icon="♜"
                  title="Achievements"
                  description="Your milestones and accomplishments"
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {achievementItems.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-2 rounded-xl bg-[#f0f3e9] p-3"
                    >
                      <span className="mt-0.5 text-[#68744e]">
                        ✓
                      </span>

                      <p className="text-sm leading-6 text-[#6f6050]">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </DashboardCard>
            )}
          </section>
        )}

        {/* EXTRACURRICULAR ACTIVITIES */}

        {extracurricularItems.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="✦"
              title="Extracurricular Activities"
              description="Additional activities identified in your resume"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {extracurricularItems.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-3"
                >
                  <p className="text-sm leading-6 text-[#6f6050]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>
        )}

        {/* PERSONALIZED CAREER ROADMAP */}

        {roadmap.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="➜"
              title="Personalised Career Roadmap"
              description="Your recommended learning journey, organised into stages"
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {roadmap.map((step, index) => {
                const keywords = filterItems(step.keywords);

                return (
                  <article
                    key={`${step.stage}-${index}`}
                    className="group relative min-w-0 overflow-hidden rounded-xl border border-[#e6dac8] bg-[#fcfaf6] p-3 transition duration-300 hover:-translate-y-0.5 hover:border-[#cbb79b] hover:shadow-md"
                  >
                    <div className="absolute right-0 top-0 h-16 w-16 translate-x-7 -translate-y-7 rounded-full bg-[#f0e7da] transition group-hover:scale-125" />

                    <div className="relative">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#826647] text-sm font-extrabold text-white shadow-sm">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="text-[10px] font-extrabold tracking-widest text-[#b09a7b]">
                          STEP {index + 1}
                        </span>
                      </div>

                      <h3 className="text-sm font-extrabold leading-5 text-[#604C38]">
                        {step.stage}
                      </h3>

                      {keywords.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {keywords.map(
                            (keyword, keywordIndex) => (
                              <span
                                key={`${keyword}-${keywordIndex}`}
                                className="rounded-md bg-[#eee5d7] px-2 py-1 text-[10px] font-semibold text-[#70563b]"
                              >
                                {keyword}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </DashboardCard>
        )}

        {/* MISSING RESUME SECTIONS */}

        {missingSections.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="＋"
              title="Potential Sections to Add"
              description="Sections you may want to include when relevant"
            />

            <SkillPills
              items={missingSections}
              color="orange"
            />
          </DashboardCard>
        )}

        {/* RESUME IMPROVEMENTS */}

        {improvements.length > 0 && (
          <DashboardCard>
            <SectionHeading
              icon="✎"
              title="How to Improve Your Resume"
              description="Actionable recommendations from your resume analysis"
            />

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
              {improvements.map((item, index) => (
                <article
                  key={`${item.section}-${index}`}
                  className="min-w-0 rounded-xl border border-[#e9dfd0] bg-[#fcfaf6] p-4 transition hover:border-[#cbb79b]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 items-start gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0e7da] text-xs font-extrabold text-[#826647]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h3 className="pt-1 text-sm font-extrabold text-[#604C38]">
                        {item.section || "Resume Improvement"}
                      </h3>
                    </div>

                    {hasText(item.priority) && (
                      <span
                        className={`rounded-full border px-2 py-1 text-[10px] font-bold ${getPriorityClasses(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    )}
                  </div>

                  {hasText(item.issue) && (
                    <div className="mt-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#A67B5B]">
                        Problem identified
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[#6f6050]">
                        {item.issue}
                      </p>
                    </div>
                  )}

                  {hasText(item.whatToAdd) && (
                    <div className="mt-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#A67B5B]">
                        What to add
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[#6f6050]">
                        {item.whatToAdd}
                      </p>
                    </div>
                  )}

                  {hasText(item.suggestion) && (
                    <div className="mt-3 rounded-lg bg-[#f0f3e9] p-3">
                      <p className="text-[10px] font-extrabold text-[#5f6b46]">
                        RECOMMENDED ACTION
                      </p>

                      <p className="mt-1 text-sm leading-5 text-[#5f6b46]">
                        {item.suggestion}
                      </p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </DashboardCard>
        )}

        {/* FINAL ACTION SECTION */}

        <section className="relative overflow-hidden rounded-2xl bg-[#604C38] p-5 text-white shadow-lg sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[30px] border-white/5" />

          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-[#A67B5B]/20 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.15em] text-[#E7D7C1]">
              YOUR NEXT MOVE
            </span>

            <h2 className="mt-3 max-w-2xl text-2xl font-extrabold leading-tight sm:text-3xl">
              Turn your insights into career progress.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#E7D7C1]">
              Practise interviews, assess your skills, and
              strengthen your placement readiness with Career
              Compass.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => router.push("/interview")}
                className="rounded-xl bg-amber-100 px-4 py-3 text-sm font-extrabold text-[#604C38] transition hover:-translate-y-0.5 hover:bg-[#F1E4D1]"
              >
                🎯 Start Interview Practice →
              </button>

              <button
                onClick={() => router.push("/placement")}
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                ◈ Placement Readiness
              </button>

              <button
                onClick={() => router.push("/skills")}
                className="rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                ✧ Skills Assessment
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="flex flex-col items-center justify-between gap-2 border-t border-[#dfd2c0] py-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-extrabold text-[#826647]">
              Career Compass
            </p>

            <p className="mt-1 text-xs text-[#968573]">
              AI-powered career guidance.
            </p>
          </div>

          <p className="text-xs text-[#968573]">
            Navigate your next career opportunity.
          </p>
        </footer>
      </main>
    </div>
  );
}