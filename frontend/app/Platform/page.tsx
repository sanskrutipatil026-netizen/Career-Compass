"use client";

import { useEffect, useMemo, useState } from "react";

type ResumeAnalysis = {
  skills?: string[];
  experienceLevel?: string;
  missingIndustrySkills?: string[];
};

type Internship = {
  id?: string;
  title: string;
  company?: string;
  location?: string;
  work_type?: string;
  stipend?: string | number;
  salary?: string | number;
  compensation?: string;
  is_paid?: boolean;
  paid?: boolean;
  unpaid?: boolean;
  description?: string;
  apply_url?: string;
  matchedSkills?: string[];
  matchPercentage?: number;
};

const categories = [
  "All Opportunities",
  "Engineering & Tech",
  "Data & AI",
  "UI/UX Design",
  "Product & Growth",
];

const platforms = [
  {
    name: "LinkedIn Internships",
    subtitle: "Professional Network",
    description: "Search internship roles using skills detected in your resume.",
    icon: "in",
    url: "https://www.linkedin.com/jobs/search/",
  },
  {
    name: "Internshala",
    subtitle: "Student Internship Portal",
    description: "Explore internships for students and recent graduates.",
    icon: "IS",
    url: "https://internshala.com/internships/",
  },
  {
    name: "Wellfound",
    subtitle: "Startup Careers",
    description: "Find early-stage startup roles related to your interests.",
    icon: "W",
    url: "https://wellfound.com/jobs",
  },
  {
    name: "AICTE Internship Portal",
    subtitle: "Government Internship Portal",
    description: "Browse opportunities from the AICTE internship portal.",
    icon: "A",
    url: "https://internship.aicte-india.org/",
  },
];

const programs = [
  {
    name: "SWAYAM Courses",
    provider: "SWAYAM",
    description: "Build skills with courses from universities and industry.",
    icon: "≡ƒÄô",
    url: "https://swayam.gov.in/",
    keywords: ["python", "java", "data", "ai", "machine learning", "cloud"],
  },
  {
    name: "MLH Fellowships",
    provider: "Major League Hacking",
    description: "Gain practical experience through collaborative projects.",
    icon: "≡ƒÆ╗",
    url: "https://fellowship.mlh.io/",
    keywords: ["software", "developer", "engineering", "web", "github"],
  },
  {
    name: "Kaggle",
    provider: "Kaggle",
    description: "Practice data science and machine learning with projects.",
    icon: "≡ƒôè",
    url: "https://www.kaggle.com/",
    keywords: ["data", "python", "machine learning", "ai", "analytics"],
  },
];

function getPayStatus(internship: Internship) {
  if (internship.unpaid === true) return "Unpaid";
  if (internship.is_paid === false || internship.paid === false) return "Unpaid";
  if (internship.is_paid === true || internship.paid === true) return "Paid";

  const raw = String(
    internship.stipend ?? internship.salary ?? internship.compensation ?? ""
  ).trim();
  const value = raw.toLowerCase();

  if (!value || /not listed|not specified|n\/a|unknown/.test(value)) {
    return "Pay not listed";
  }

  if (/unpaid|no stipend|not paid|volunteer/.test(value)) {
    return "Unpaid";
  }

  const amount = Number(value.replace(/[^\d.-]/g, ""));
  if (!Number.isNaN(amount)) return amount > 0 ? "Paid" : "Unpaid";

  return "Paid";
}

function getPlatformUrl(url: string, skills: string[]) {
  const query = [...skills.slice(0, 4), "internship"].join(" ");
  return `${url}?keywords=${encodeURIComponent(query)}`;
}

export default function PlatformPage() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Opportunities");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadInternships(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      const savedAnalysis = localStorage.getItem("resumeAnalysis");

      if (!savedAnalysis) {
        setError("Upload and analyze your resume to get personalized results.");
        setInternships([]);
        return;
      }

      const resume: ResumeAnalysis = JSON.parse(savedAnalysis);
      setAnalysis(resume);

      const response = await fetch("/api/internships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          skills: resume.skills ?? [],
          missingIndustrySkills: resume.missingIndustrySkills ?? [],
          experienceLevel: resume.experienceLevel ?? "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not load internship listings.");
      }

      setInternships(Array.isArray(data.internships) ? data.internships : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load internship listings."
      );
      setInternships([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadInternships();
  }, []);

  const filteredInternships = useMemo(() => {
    const query = search.trim().toLowerCase();

    return internships.filter((internship) => {
      const text = [
        internship.title,
        internship.company,
        internship.location,
        internship.work_type,
        internship.description,
        ...(internship.matchedSkills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || text.includes(query);

      let matchesCategory = true;
      if (category === "Engineering & Tech") {
        matchesCategory =
          /software|developer|engineering|backend|frontend|web|mobile|cloud|devops|computer|technology|react|node|java|python|javascript/.test(
            text
          );
      } else if (category === "Data & AI") {
        matchesCategory =
          /data|machine learning|artificial intelligence|\bai\b|analytics|python|sql|tensorflow|pytorch/.test(
            text
          );
      } else if (category === "UI/UX Design") {
        matchesCategory = /ui|ux|design|figma|product design|user experience/.test(text);
      } else if (category === "Product & Growth") {
        matchesCategory = /product|marketing|growth|business|sales|management/.test(text);
      }

      return matchesSearch && matchesCategory;
    });
  }, [internships, search, category]);

  const recommendedPrograms = useMemo(() => {
    const skills = [
      ...(analysis?.skills ?? []),
      ...(analysis?.missingIndustrySkills ?? []),
    ].map((skill) => skill.toLowerCase());

    return [...programs].sort((a, b) => {
      const score = (keywords: string[]) =>
        skills.filter((skill) =>
          keywords.some((keyword) => skill.includes(keyword))
        ).length;

      return score(b.keywords) - score(a.keywords);
    });
  }, [analysis]);

  return (
    <main className="min-h-screen bg-[#FBF7F0] text-[#3F3026]">
      <header className="px-5 pb-6 pt-10 text-center md:px-10">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
          Navigate Your{" "}
          <span className="text-[#A67B5B]">
            Internship &amp; Career Opportunities
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[#7A6B5D] md:text-base">
          Explore internship platforms, resume-matched offers, and suggestions
          based on your skills.
        </p>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 pb-10 md:px-8">
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#E5D8C9] bg-white p-4 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search internships, platforms, or courses..."
            className="min-w-0 flex-1 rounded-xl border border-[#E5D8C9] px-4 py-3 text-sm outline-none focus:border-[#A67B5B]"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                  category === item
                    ? "bg-[#A67B5B] text-white"
                    : "border border-[#E5D8C9] bg-white text-[#5F5044] hover:bg-[#F6EBDD]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-3">
          {/* Internship platforms */}
          <section>
            <div className="mb-3 border-t-4 border-[#A67B5B] pt-4">
              <h2 className="text-lg font-bold">≡ƒîÉ Internship Platforms</h2>
              <p className="text-xs text-[#8B7A6B]">
                Search portals using your resume skills
              </p>
            </div>

            <div className="space-y-4">
              {platforms.map((platform) => (
                <article
                  key={platform.name}
                  className="flex min-h-52 flex-col rounded-2xl border border-[#E5D8C9] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F2E4D3] font-bold text-[#A67B5B]">
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-bold">{platform.name}</h3>
                      <p className="text-xs text-[#927F70]">{platform.subtitle}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-6 text-[#75675D]">
                    {platform.description}
                  </p>
                  <a
                    href={getPlatformUrl(platform.url, analysis?.skills ?? [])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 self-start rounded-xl bg-[#F0D6B5] px-4 py-2 text-xs font-bold text-[#754D32] hover:bg-[#E5C49D]"
                  >
                    Search platform Γåù
                  </a>
                </article>
              ))}
            </div>
          </section>

          {/* Live matched internships */}
          <section>
            <div className="mb-3 flex items-center justify-between border-t-4 border-[#A67B5B] pt-4">
              <div>
                <h2 className="text-lg font-bold">≡ƒÆ╝ Internship Offers</h2>
                <p className="text-xs text-[#8B7A6B]">
                  Live listings matched to your resume
                </p>
              </div>
              <span className="rounded-full bg-[#F0E0CD] px-3 py-1 text-xs font-semibold text-[#825A3B]">
                {loading ? "LoadingΓÇª" : `${filteredInternships.length} Offers`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => void loadInternships(true)}
              disabled={loading || refreshing}
              className="mb-4 rounded-lg border border-[#D8C8B8] bg-white px-3 py-2 text-xs font-semibold text-[#754D32] hover:bg-[#F6EBDD] disabled:opacity-60"
            >
              {refreshing ? "RefreshingΓÇª" : "Refresh offers"}
            </button>

            {loading ? (
              <div className="rounded-2xl border border-[#E5D8C9] bg-white p-8 text-center text-sm text-[#75675D]">
                Finding internships that match your resumeΓÇª
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-amber-200 bg-white p-6 text-sm text-amber-800">
                {error}
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="rounded-2xl border border-[#E5D8C9] bg-white p-8 text-center">
                <h3 className="font-bold">No internship listings received</h3>
                <p className="mt-2 text-sm text-[#75675D]">
                  Try refreshing. If this continues, check the `/api/internships`
                  route and its external API response.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInternships.map((internship, index) => (
                  <article
                    key={
                      internship.id ??
                      `${internship.title}-${internship.company ?? "company"}-${index}`
                    }
                    className="rounded-2xl border border-[#E5D8C9] bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F2E2CF] font-bold text-[#A67B5B]">
                          {internship.company?.charAt(0).toUpperCase() ?? "I"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold">{internship.title}</h3>
                          {internship.company && (
                            <p className="mt-1 text-xs text-[#8A7565]">
                              {internship.company}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-[#F0E0CD] px-2.5 py-1 text-xs font-bold text-[#825A3B]">
                        {internship.matchPercentage ?? 0}% match
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {internship.location && (
                        <span className="rounded-full bg-[#F1E8DE] px-3 py-1">
                          ≡ƒôì {internship.location}
                        </span>
                      )}
                      {internship.work_type && (
                        <span className="rounded-full bg-[#F1E8DE] px-3 py-1">
                          {internship.work_type}
                        </span>
                      )}
                      <span className="rounded-full bg-[#F5DFC3] px-3 py-1 text-[#795333]">
                        {getPayStatus(internship)}
                        {(internship.stipend ?? internship.salary) != null &&
                          ` ┬╖ ${internship.stipend ?? internship.salary}`}
                      </span>
                    </div>

                    {internship.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#75675D]">
                        {internship.description}
                      </p>
                    )}

                    {!!internship.matchedSkills?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {internship.matchedSkills.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-[#EFE0CC] px-3 py-1 text-xs text-[#765034]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between border-t border-[#EEE3D7] pt-3">
                      <span className="text-xs text-[#857366]">Resume match</span>
                      {internship.apply_url ? (
                        <a
                          href={internship.apply_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl bg-[#A67B5B] px-4 py-2 text-xs font-bold text-white hover:bg-[#8E674A]"
                        >
                          Apply now Γåù
                        </a>
                      ) : (
                        <span className="text-xs text-[#9B8979]">
                          Apply link unavailable
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          {/* Growth suggestions */}
          <section>
            <div className="mb-3 border-t-4 border-[#A67B5B] pt-4">
              <h2 className="text-lg font-bold">≡ƒÆí Extra Suggestions</h2>
              <p className="text-xs text-[#8B7A6B]">
                Programs related to your skills and focus areas
              </p>
            </div>

            {analysis?.missingIndustrySkills?.length ? (
              <div className="mb-4 rounded-2xl border border-[#E6D7C5] bg-[#F8F0E4] p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#98704F]">
                  Resume focus areas
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {analysis.missingIndustrySkills.slice(0, 6).map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full bg-[#EBD7BF] px-3 py-1 text-xs text-[#754D32]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="space-y-4">
              {recommendedPrograms.map((program) => (
                <article
                  key={program.name}
                  className="flex min-h-52 flex-col rounded-2xl border border-[#E5D8C9] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F3E3CF] text-xl">
                      {program.icon}
                    </div>
                    <div>
                      <h3 className="font-bold">{program.name}</h3>
                      <p className="text-xs text-[#927F70]">{program.provider}</p>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-6 text-[#75675D]">
                    {program.description}
                  </p>
                  <a
                    href={program.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 self-start rounded-xl bg-[#A67B5B] px-4 py-2 text-xs font-bold text-white hover:bg-[#8E674A]"
                  >
                    Explore Γåù
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      {/* =====================================================
          FINAL FEEDBACK
      ===================================================== */}

      <section className="max-w-[1500px] mx-auto px-6 md:px-8 py-10">

        <div className="bg-white rounded-[28px] border border-[#e7ddcf] shadow-sm p-8 md:p-10 text-center">

          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#fff0c8] flex items-center justify-center text-2xl">
            💬
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold mt-5">
            Finished Exploring Career Opportunities?
          </h2>

          <p className="text-[#756b62] mt-3 max-w-2xl mx-auto leading-relaxed">
            We would love to hear about your Career Compass experience.
            Share your feedback and help us make the platform better.
          </p>

          <button
            onClick={() => {
              window.location.href = "/feedback";
            }}
            className="mt-6 bg-[#ae7859] hover:bg-[#966247] text-white px-7 py-3 rounded-xl text-sm font-extrabold shadow-sm transition"
          >
            Give Feedback →
          </button>

        </div>

      </section>

    </main>
    
  );
}
