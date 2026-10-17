"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";

type ResumeFile = {
  id: string;
  name: string;
  size: number;
  text: string;
  status: string;
};

const SKILL_CATALOG = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Kotlin",
  "Swift",
  "React",
  "Next.js",
  "Vue",
  "Angular",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "HTML",
  "CSS",
  "Sass",
  "Tailwind",
  "Redux",
  "GraphQL",
  "REST",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  "Git",
  "Linux",
  "Machine Learning",
  "Deep Learning",
  "NLP",
  "Data Analysis",
  "Pandas",
  "NumPy",
  "TensorFlow",
  "PyTorch",
  "Tableau",
  "Power BI",
  "Excel",
  "Figma",
  "UI/UX",
  "Product Management",
  "Communication",
  "Leadership",
  "Agile",
  "Scrum",
  "System Design",
  "Microservices",
  "Testing",
  "Jest",
  "Cypress",
  "Selenium",
  "API Design",
  "Security",
  "DevOps",
  "Terraform",
  "Kafka",
  "Spark",
  "Hadoop",
  "Snowflake",
  "dbt",
  "Airflow",
  "Salesforce",
  "SAP",
  "Android",
  "iOS",
  "Flutter",
  "React Native",
  "PHP",
  "Laravel",
  "Ruby",
  "Rails",
  "Scala",
  "Elasticsearch",
  "Prometheus",
  "Grafana",
  "Nginx",
  "Webpack",
  "Vite",
  "Storybook",
];

const ROLE_SKILLS: Record<string, string[]> = {
  frontend: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "HTML",
    "CSS",
    "Tailwind",
    "Redux",
    "Figma",
    "Testing",
    "Git",
  ],

  backend: [
    "Python",
    "Java",
    "Node.js",
    "SQL",
    "PostgreSQL",
    "REST",
    "API Design",
    "Docker",
    "Microservices",
    "System Design",
    "Git",
  ],

  fullstack: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "SQL",
    "REST",
    "Docker",
    "Git",
    "System Design",
    "AWS",
  ],

  data: [
    "Python",
    "SQL",
    "Pandas",
    "NumPy",
    "Data Analysis",
    "Machine Learning",
    "Tableau",
    "Power BI",
    "Spark",
  ],

  ml: [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "TensorFlow",
    "PyTorch",
    "NLP",
    "NumPy",
    "Pandas",
    "SQL",
  ],

  devops: [
    "Docker",
    "Kubernetes",
    "CI/CD",
    "AWS",
    "Linux",
    "Terraform",
    "Prometheus",
    "Grafana",
    "Git",
  ],

  product: [
    "Product Management",
    "Communication",
    "Agile",
    "Scrum",
    "Figma",
    "UI/UX",
    "Leadership",
    "Excel",
  ],

  mobile: [
    "Kotlin",
    "Swift",
    "Android",
    "iOS",
    "Flutter",
    "React Native",
    "REST",
    "Git",
  ],

  default: [
    "Communication",
    "Problem Solving",
    "Git",
    "Agile",
    "Leadership",
    "System Design",
  ],
};

export default function Page() {
  const [files, setFiles] = useState<ResumeFile[]>([]);
  const [interviews, setInterviews] = useState<string[]>([]);
  const [interviewInput, setInterviewInput] = useState("");
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [analyzed, setAnalyzed] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const detectSkills = (text: string) => {
    const haystack = ` ${text.toLowerCase()} `;

    return SKILL_CATALOG.filter((skill) => {
      const escaped = skill
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const pattern = new RegExp(
        `(^|[^a-z0-9+#./])${escaped}([^a-z0-9+#./]|$)`,
        "i"
      );

      return pattern.test(haystack);
    });
  };

  const roleKeyForInterview = (label: string) => {
    const t = label.toLowerCase();

    if (/front\s*end|frontend|ui engineer|react|vue|angular/.test(t)) {
      return "frontend";
    }

    if (/back\s*end|backend|api|server/.test(t)) {
      return "backend";
    }

    if (/full\s*stack|fullstack/.test(t)) {
      return "fullstack";
    }

    if (
      /data scientist|data analyst|analytics|bi /.test(t) ||
      /\bbi\b/.test(t)
    ) {
      return "data";
    }

    if (/machine learning|ml engineer|ai engineer|deep learning/.test(t)) {
      return "ml";
    }

    if (/devops|sre|platform|infrastructure|cloud engineer/.test(t)) {
      return "devops";
    }

    if (/product manager|pm\b|product owner/.test(t)) {
      return "product";
    }

    if (/mobile|android|ios|flutter/.test(t)) {
      return "mobile";
    }

    return "default";
  };

  const readFile = async (file: File): Promise<string> => {
    const name = file.name.toLowerCase();

    // TXT files work directly in this page.tsx
    if (name.endsWith(".txt") || file.type.startsWith("text/")) {
      return await file.text();
    }

    // For PDF and DOCX, connect your existing backend API
    if (name.endsWith(".pdf") || name.endsWith(".docx")) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch(
          "https://career-compass-backend-v8sv.onrender.com/api/extract-resume",
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error("Could not extract file");
        }

        const data = await response.json();

        return data.text || "";
      } catch {
        return "";
      }
    }

    throw new Error("Unsupported file type");
  };

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList) return;

    const incoming = Array.from(fileList);

    for (const file of incoming) {
      const id = crypto.randomUUID();

      const newFile: ResumeFile = {
        id,
        name: file.name,
        size: file.size,
        text: "",
        status: "Reading...",
      };

      setFiles((prev) => [...prev, newFile]);

      try {
        const text = await readFile(file);

        setFiles((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  text,
                  status: text.trim() ? "Ready" : "No text found",
                }
              : item
          )
        );
      } catch {
        setFiles((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: "Failed" }
              : item
          )
        );
      }
    }
  };

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    await addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    await addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const addInterview = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = interviewInput.trim();

    if (!value) return;

    if (!interviews.includes(value)) {
      setInterviews((prev) => [...prev, value]);
    }

    setInterviewInput("");
  };

  const removeInterview = (index: number) => {
    setInterviews((prev) => prev.filter((_, i) => i !== index));
  };

  const analyze = () => {
    setStatusMsg("Analyzing...");

    const combinedText = files
      .map((file) => file.text)
      .join("\n");

    const detected = detectSkills(combinedText);

    setAllSkills(detected);
    setAnalyzed(true);

    setStatusMsg(
      `Found ${detected.length} skills across ${files.length} resume${
        files.length === 1 ? "" : "s"
      }.`
    );
  };

  const canAnalyze =
    files.some((file) => file.text.trim()) &&
    interviews.length > 0;

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#FEF3C7] via-[#F9EBB8] to-[#F3E0A8] px-4 py-10 text-[#3D2E22] sm:px-8">
      <div className="mx-auto w-full max-w-6xl">

        {/* HERO */}
        <section className="mb-12 text-center">
          <p className="mb-4 inline-block rounded-full bg-[#A67B5B]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#8B6448]">
            Career clarity, gently
          </p>

          <h1 className="font-serif text-5xl font-semibold tracking-tight sm:text-7xl">
            Resume & Interview Studio
          </h1>

          <div className="mx-auto mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-[#A67B5B] to-transparent" />

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#5C4635] sm:text-lg">
            Upload your resumes, add the interviews you want, and see the
            skills that surface — cleanly matched to each role.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">

          {/* RESUME FILES */}
          <section className="rounded-3xl border border-[#EBD9A0] bg-[#FFFBF0]/90 p-6 shadow-xl shadow-[#3D2E22]/5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E8D4B8] px-2 text-xs font-bold tracking-wider text-[#8B6448]">
                01
              </span>

              <h2 className="font-serif text-3xl font-semibold">
               Certifications
              </h2>
            </div>

            <p className="mb-5 text-sm text-[#8A7058]">
              PDF, DOCX, or TXT — drop one or more files.
            </p>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragging(false);
              }}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition ${
                dragging
                  ? "border-[#A67B5B] bg-[#E8D4B8]/50"
                  : "border-[#D9C48A] bg-[#FEF3C7]/50 hover:border-[#A67B5B]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#E8D4B8] text-2xl text-[#8B6448]">
                ↑
              </div>

              <p className="text-base">
                <strong>Click to upload</strong> or drag files here
              </p>

              <span className="text-sm text-[#8A7058]">
                Multiple resumes welcome
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 rounded-full border border-[#EBD9A0] bg-[#FEF3C7] px-4 py-2 text-sm"
                >
                  <div>
                    <p className="max-w-[120px] truncate font-medium">
                      {file.name}
                    </p>

                    <p className="text-xs text-[#8A7058]">
                      {formatBytes(file.size)} · {file.status}
                    </p>
                  </div>

                  <button
                    onClick={() => removeFile(file.id)}
                    className="text-lg text-[#8A7058] hover:text-[#8B6448]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* WANTED INTERVIEWS */}
          <section className="rounded-3xl border border-[#EBD9A0] bg-[#FFFBF0]/90 p-6 shadow-xl shadow-[#3D2E22]/5 backdrop-blur-sm">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E8D4B8] px-2 text-xs font-bold tracking-wider text-[#8B6448]">
                02
              </span>

              <h2 className="font-serif text-3xl font-semibold">
                Wanted interviews
              </h2>
            </div>

            <p className="mb-5 text-sm text-[#8A7058]">
              Add roles or companies you are aiming for.
            </p>

            <form
              onSubmit={addInterview}
              className="grid gap-3 sm:grid-cols-[1fr_auto]"
            >
              <input
                value={interviewInput}
                onChange={(e) => setInterviewInput(e.target.value)}
                type="text"
                placeholder="e.g. Frontend Engineer at Stripe"
                className="w-full rounded-2xl border border-[#D9C48A] bg-[#FEF3C7] px-4 py-3 outline-none transition focus:border-[#A67B5B] focus:ring-4 focus:ring-[#A67B5B]/15"
              />

              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-br from-[#B88968] to-[#A67B5B] px-6 py-3 font-semibold text-[#FFFBF0] shadow-lg shadow-[#A67B5B]/20 transition hover:-translate-y-0.5"
              >
                Add
              </button>
            </form>

            <div className="mt-5 flex flex-wrap gap-2">
              {interviews.map((interview, index) => (
                <div
                  key={`${interview}-${index}`}
                  className="flex items-center gap-2 rounded-full border border-[#EBD9A0] bg-[#FEF3C7] px-4 py-2 text-sm"
                >
                  <span>{interview}</span>

                  <button
                    onClick={() => removeInterview(index)}
                    className="text-lg text-[#8A7058] hover:text-[#8B6448]"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* SKILLS */}
          <section className="rounded-3xl border border-[#EBD9A0] bg-[#FFFBF0]/90 p-6 shadow-xl shadow-[#3D2E22]/5 backdrop-blur-sm lg:col-span-2">
            <div className="mb-2 flex items-center gap-3">
              <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-[#E8D4B8] px-2 text-xs font-bold tracking-wider text-[#8B6448]">
                03
              </span>

              <h2 className="font-serif text-3xl font-semibold">
                Skills detected
              </h2>
            </div>

            <p className="mb-5 text-sm text-[#8A7058]">
              Extracted from your resumes and aligned to each interview.
            </p>

            <div className="mb-6 flex flex-wrap items-center gap-4">
              <button
                onClick={analyze}
                disabled={!canAnalyze}
                className="rounded-2xl border border-[#E8D4B8] bg-[#FEF3C7] px-6 py-3 font-semibold text-[#8B6448] shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Analyze resumes
              </button>

              <p className="text-sm text-[#8A7058]">
                {statusMsg}
              </p>
            </div>

            {!analyzed ? (
              <div className="rounded-2xl border border-dashed border-[#D9C48A] bg-[#FEF3C7]/60 px-6 py-10 text-center text-[#8A7058]">
                <div className="mx-auto mb-4 h-14 w-14 animate-pulse rounded-full bg-[#E8D4B8]" />

                <p>
                  Upload a resume and add interviews, then analyze to see
                  skills here.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">

                {/* ALL SKILLS */}
                <div className="rounded-2xl border border-[#EBD9A0] bg-[#FEF3C7]/50 p-5">
                  <h3 className="mb-4 font-serif text-2xl font-semibold">
                    All skills from resumes
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {allSkills.length > 0 ? (
                      allSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-[#E8D4B8] bg-[#FFFBF0] px-4 py-2 text-sm font-medium text-[#8B6448]"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-[#8A7058]">
                        No skills detected yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* SKILLS BY INTERVIEW */}
                <div className="rounded-2xl border border-[#EBD9A0] bg-[#FEF3C7]/50 p-5">
                  <h3 className="mb-5 font-serif text-2xl font-semibold">
                    Skills by interview
                  </h3>

                  <div className="space-y-6">
                    {interviews.map((interview) => {
                      const role = roleKeyForInterview(interview);

                      const wanted =
                        ROLE_SKILLS[role] || ROLE_SKILLS.default;

                      const matched = wanted.filter((skill) =>
                        allSkills.includes(skill)
                      );

                      const gaps = wanted.filter(
                        (skill) => !allSkills.includes(skill)
                      );

                      return (
                        <div
                          key={interview}
                          className="border-t border-[#EBD9A0] pt-5 first:border-t-0 first:pt-0"
                        >
                          <h4 className="text-lg font-semibold">
                            {interview}
                          </h4>

                          <p className="mb-4 text-sm text-[#8A7058]">
                            Suggested focus: {role} · {matched.length}/
                            {wanted.length} aligned
                          </p>

                          <div className="grid gap-5 md:grid-cols-2">

                            {/* MATCHED */}
                            <div>
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8A7058]">
                                On your resume
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {matched.length > 0 ? (
                                  matched.map((skill) => (
                                    <span
                                      key={skill}
                                      className="rounded-full border border-[#A67B5B] bg-[#A67B5B]/15 px-3 py-1.5 text-sm text-[#8B6448]"
                                    >
                                      {skill}
                                    </span>
                                  ))
                                ) : (
                                  <p className="text-sm text-[#8A7058]">
                                    No matching skills yet.
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* GAPS */}
                            <div>
                              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#8A7058]">
                                Worth highlighting / building
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {gaps.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full border border-[#D9C48A] bg-[#E8D4B8]/70 px-3 py-1.5 text-sm text-[#5C4635]"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}