
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { jsPDF } from "jspdf";

type ResumeData = {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  college: string;
  degree: string;
  branch: string;
  cgpa: string;
  graduationYear: string;
  summary: string;
  skills: string;
  projects: string;
  experience: string;
  certifications: string;
  achievements: string;
};

const initialData: ResumeData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  college: "",
  degree: "B.Tech",
  branch: "Computer Engineering",
  cgpa: "",
  graduationYear: "",
  summary: "",
  skills: "",
  projects: "",
  experience: "",
  certifications: "",
  achievements: "",
};

type FieldProps = {
  label: string;
  field: keyof ResumeData;
  value: string;
  onChange: (field: keyof ResumeData, value: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

function Field({
  label,
  field,
  value,
  onChange,
  placeholder = "",
  multiline = false,
}: FieldProps) {
  const inputClass =
    "w-full rounded-xl border border-[#d6c1ad] bg-white px-3.5 py-3 text-sm text-[#49382a] placeholder:text-[#a18b77] outline-none transition focus:border-[#A67B5B] focus:ring-2 focus:ring-[#A67B5B]/20";

  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-[#49382a]">
        {label}
      </span>

      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
    </label>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 break-words">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="shrink-0 text-[11px] font-extrabold tracking-[0.18em] text-[#795638]">
          {title.toUpperCase()}
        </h3>

        <div className="h-px flex-1 bg-[#d6c1ad]" />
      </div>

      {children}
    </section>
  );
}

function ResumeText({ value }: { value: string }) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className="space-y-2 text-[11px] leading-[1.8] text-[#49382a]">
      {lines.map((line, index) => {
        const cleanLine = line.replace(/^[-•*]\s*/, "");

        return (
          <div key={`${index}-${line}`} className="flex gap-2">
            {lines.length > 1 && (
              <span className="mt-[1px] font-bold text-[#A67B5B]">
                •
              </span>
            )}

            <span className="break-words">{cleanLine}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ResumeMakerPage() {
  const router = useRouter();

  const [data, setData] = useState<ResumeData>(initialData);
  const [improving, setImproving] = useState(false);
  const [message, setMessage] = useState("");

  function update(field: keyof ResumeData, value: string) {
    setData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function improveSummary() {
    if (!data.summary.trim()) {
      setMessage("Please enter your professional summary first.");
      return;
    }

    setImproving(true);
    setMessage("");

    try {
      const response = await fetch("/api/resume-maker/improve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: data.summary,
          skills: data.skills,
          projects: data.projects,
          degree: data.degree,
          branch: data.branch,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to improve the summary."
        );
      }

      update("summary", result.summary);
      setMessage("Professional summary improved successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setImproving(false);
    }
  }

  function downloadPDF() {
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 13;
    const sidebarWidth = 58;
    const gap = 8;
    const mainX = margin + sidebarWidth + gap;
    const mainWidth = pageWidth - mainX - margin;
    const sidebarX = margin;
    const bottom = pageHeight - 15;

    let mainY = 18;
    let sidebarY = 18;

    const brown: [number, number, number] = [166, 123, 91];
    const dark: [number, number, number] = [73, 56, 42];
    const muted: [number, number, number] = [117, 98, 81];

    function drawSidebarBackground() {
      pdf.setFillColor(248, 242, 235);

      pdf.rect(
        0,
        0,
        sidebarX + sidebarWidth + 4,
        pageHeight,
        "F"
      );

      pdf.setFillColor(...brown);
      pdf.rect(0, 0, 5, pageHeight, "F");
    }

    function nextPage() {
      pdf.addPage();
      drawSidebarBackground();

      mainY = 18;
      sidebarY = 18;
    }

    function addMainText(
      text: string,
      size = 9,
      bold = false
    ) {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...dark);

      const lines = pdf.splitTextToSize(text, mainWidth);
      const lineHeight = size * 0.48;
      const height = lines.length * lineHeight + 2;

      if (mainY + height > bottom) {
        nextPage();
      }

      pdf.text(lines, mainX, mainY);
      mainY += height;
    }

    function addSidebarText(
      text: string,
      size = 8,
      bold = false
    ) {
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...dark);

      const lines = pdf.splitTextToSize(
        text,
        sidebarWidth - 7
      );

      const height = lines.length * size * 0.48 + 2;

      if (sidebarY + height > bottom) {
        nextPage();
      }

      pdf.text(lines, sidebarX + 3, sidebarY);
      sidebarY += height;
    }

    function addMainSection(title: string, content: string) {
      if (!content.trim()) return;

      if (mainY > bottom - 25) {
        nextPage();
      }

      mainY += 3;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.setTextColor(...brown);
      pdf.text(title.toUpperCase(), mainX, mainY);

      mainY += 2;

      pdf.setDrawColor(...brown);
      pdf.line(
        mainX,
        mainY,
        mainX + mainWidth,
        mainY
      );

      mainY += 5;

      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        const cleanLine = line.replace(/^[-•*]\s*/, "");

        const wrapped = pdf.splitTextToSize(
          cleanLine,
          mainWidth - 3
        );

        const lineHeight = 4.5;
        const height = wrapped.length * lineHeight + 2;

        if (mainY + height > bottom) {
          nextPage();
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(...dark);

        if (lines.length > 1) {
          pdf.setFillColor(...brown);
          pdf.circle(mainX + 1, mainY - 1, 0.6, "F");
        }

        pdf.text(wrapped, mainX + 4, mainY);
        mainY += height;
      }
    }

    function addSidebarSection(
      title: string,
      content: string
    ) {
      if (!content.trim()) return;

      sidebarY += 4;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.setTextColor(...brown);
      pdf.text(title.toUpperCase(), sidebarX + 3, sidebarY);

      sidebarY += 2;

      pdf.setDrawColor(210, 188, 165);

      pdf.line(
        sidebarX + 3,
        sidebarY,
        sidebarX + sidebarWidth - 3,
        sidebarY
      );

      sidebarY += 5;

      const lines = content
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      for (const line of lines) {
        const cleanLine = line.replace(/^[-•*]\s*/, "");

        const wrapped = pdf.splitTextToSize(
          cleanLine,
          sidebarWidth - 10
        );

        const height = wrapped.length * 4 + 2;

        if (sidebarY + height > bottom) {
          nextPage();
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(...muted);
        pdf.text(wrapped, sidebarX + 3, sidebarY);

        sidebarY += height;
      }
    }

    drawSidebarBackground();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(21);
    pdf.setTextColor(...dark);

    const nameLines = pdf.splitTextToSize(
      data.name || "Your Name",
      mainWidth
    );

    pdf.text(nameLines, mainX, mainY);
    mainY += nameLines.length * 10 + 2;

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(...brown);

    const role = [data.degree, data.branch]
      .filter(Boolean)
      .join(" | ");

    if (role) {
      pdf.text(
        pdf.splitTextToSize(role, mainWidth),
        mainX,
        mainY
      );

      mainY += 7;
    }

    pdf.setDrawColor(...brown);
    pdf.setLineWidth(0.8);

    pdf.line(
      mainX,
      mainY,
      mainX + mainWidth,
      mainY
    );

    mainY += 6;

    addSidebarSection(
      "Contact",
      [
        data.email,
        data.phone,
        data.location,
        data.linkedin,
        data.github,
      ]
        .filter(Boolean)
        .join("\n")
    );

    addSidebarSection(
      "Education",
      [
        data.degree,
        data.branch,
        data.college,
        data.cgpa ? `CGPA: ${data.cgpa}` : "",
        data.graduationYear
          ? `Graduation: ${data.graduationYear}`
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    );

    addSidebarSection(
      "Technical Skills",
      data.skills
    );

    addSidebarSection(
      "Certifications",
      data.certifications
    );

    addMainSection(
      "Profile",
      data.summary
    );

    addMainSection(
      "Projects",
      data.projects
    );

    addMainSection(
      "Experience & Internships",
      data.experience
    );

    addMainSection(
      "Achievements",
      data.achievements
    );

    const pages = pdf.getNumberOfPages();

    for (let page = 1; page <= pages; page++) {
      pdf.setPage(page);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(145, 125, 106);

      pdf.text(
        "CAREER COMPASS  |  RESUME",
        pageWidth - margin,
        pageHeight - 7,
        {
          align: "right",
        }
      );
    }

    const filename = (
      data.name || "Resume"
    ).replace(/[^a-z0-9_-]/gi, "_");

    pdf.save(`${filename}_Resume.pdf`);
  }

  return (
    <main className="min-h-screen bg-amber-100 text-[#49382a]">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 flex flex-col justify-between gap-3 bg-[#A67B5B] px-4 py-3 shadow-md sm:px-6 lg:flex-row lg:items-center lg:px-8">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 font-bold text-[#A67B5B]">
            AI
          </div>

          <div>
            <h1 className="text-lg font-bold text-amber-100">
              Career Compass
            </h1>

            <p className="text-xs text-gray-200">
              AI POWERED
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 font-medium sm:gap-8">
          <button
            type="button"
            className="text-gray-200 transition-colors hover:text-white"
            onClick={() => router.push("/dashboard")}
          >
            ⚡ Dashboard
          </button>

          <button
            type="button"
            className="text-gray-200 transition-colors hover:text-white"
            onClick={() => router.push("/interview")}
          >
            🎯 Practice
          </button>

          <button
            type="button"
            className="text-gray-200 transition-colors hover:text-white"
            onClick={() => router.push("/history")}
          >
            📊 My Sessions
          </button>
        </div>

        {/* User Profile and Logout */}
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          

          
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 p-4 sm:p-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* RESUME FORM */}
        <section className="min-w-0 rounded-2xl border border-[#d6c1ad] bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#A67B5B]">
              Your career story
            </span>

            <h2 className="mt-2 text-2xl font-bold">
              Resume Details
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#806b58]">
              Add accurate details about your education, skills,
              projects, and achievements.
            </p>
          </div>

          <div className="space-y-6">
            {/* PERSONAL INFORMATION */}
            <div className="space-y-4">
              <h3 className="border-l-4 border-[#A67B5B] pl-3 font-bold">
                Personal Information
              </h3>

              <Field
                label="Full Name"
                field="name"
                value={data.name}
                onChange={update}
                placeholder="Your full name"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Email Address"
                  field="email"
                  value={data.email}
                  onChange={update}
                  placeholder="you@example.com"
                />

                <Field
                  label="Phone Number"
                  field="phone"
                  value={data.phone}
                  onChange={update}
                  placeholder="Phone number"
                />
              </div>

              <Field
                label="Location"
                field="location"
                value={data.location}
                onChange={update}
                placeholder="City, State"
              />

              <Field
                label="LinkedIn URL"
                field="linkedin"
                value={data.linkedin}
                onChange={update}
                placeholder="LinkedIn profile"
              />

              <Field
                label="GitHub URL"
                field="github"
                value={data.github}
                onChange={update}
                placeholder="GitHub profile"
              />
            </div>

            {/* EDUCATION */}
            <div className="space-y-4 border-t border-[#e7d9ca] pt-5">
              <h3 className="border-l-4 border-[#A67B5B] pl-3 font-bold">
                Education
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Degree"
                  field="degree"
                  value={data.degree}
                  onChange={update}
                  placeholder="B.Tech"
                />

                <Field
                  label="Branch"
                  field="branch"
                  value={data.branch}
                  onChange={update}
                  placeholder="Computer Engineering"
                />
              </div>

              <Field
                label="College / University"
                field="college"
                value={data.college}
                onChange={update}
                placeholder="College name"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="CGPA / Percentage"
                  field="cgpa"
                  value={data.cgpa}
                  onChange={update}
                  placeholder="8.5 / 85%"
                />

                <Field
                  label="Graduation Year"
                  field="graduationYear"
                  value={data.graduationYear}
                  onChange={update}
                  placeholder="2028"
                />
              </div>
            </div>

            {/* PROFESSIONAL PROFILE */}
            <div className="space-y-4 border-t border-[#e7d9ca] pt-5">
              <h3 className="border-l-4 border-[#A67B5B] pl-3 font-bold">
                Professional Profile
              </h3>

              <Field
                label="Professional Summary"
                field="summary"
                value={data.summary}
                onChange={update}
                placeholder="Describe your background, strengths, and career goals."
                multiline
              />

              <button
                type="button"
                onClick={improveSummary}
                disabled={improving}
                className="rounded-xl border border-[#d6c1ad] bg-[#f5ede5] px-4 py-3 text-sm font-bold text-[#795638] transition hover:bg-[#ead8c6] disabled:opacity-60"
              >
                {improving
                  ? "Improving with AI..."
                  : "Improve Summary with Groq AI"}
              </button>

              {message && (
                <p
                  role="status"
                  className="rounded-lg bg-amber-50 p-3 text-sm text-[#795638]"
                >
                  {message}
                </p>
              )}

              <Field
                label="Technical Skills"
                field="skills"
                value={data.skills}
                onChange={update}
                placeholder={"React\nJavaScript\nPython\nSQL"}
                multiline
              />

              <Field
                label="Projects"
                field="projects"
                value={data.projects}
                onChange={update}
                placeholder={
                  "Career Compass | Next.js, Node.js\nDescribe what you built and the features you implemented."
                }
                multiline
              />

              <Field
                label="Experience / Internships"
                field="experience"
                value={data.experience}
                onChange={update}
                placeholder="Role, organization, duration, and responsibilities."
                multiline
              />

              <Field
                label="Certifications"
                field="certifications"
                value={data.certifications}
                onChange={update}
                placeholder={"Certification name\nIssuing organization"}
                multiline
              />

              <Field
                label="Achievements"
                field="achievements"
                value={data.achievements}
                onChange={update}
                placeholder="Awards, hackathons, leadership, accomplishments."
                multiline
              />
            </div>
          </div>

          {/* DOWNLOAD PDF */}
          <button
            type="button"
            onClick={downloadPDF}
            className="mt-7 w-full rounded-xl bg-[#A67B5B] px-5 py-4 font-bold text-white shadow-md transition hover:bg-[#8e6548] focus:outline-none focus:ring-2 focus:ring-[#A67B5B] focus:ring-offset-2"
          >
            Download Professional Resume PDF
          </button>

          <p className="mt-3 text-center text-xs leading-5 text-[#806b58]">
            Your resume is generated as a formatted PDF with a
            two-column layout.
          </p>
        </section>

        {/* LIVE RESUME PREVIEW */}
        <section className="min-w-0 xl:sticky xl:top-24">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#A67B5B]">
                Instant preview
              </span>

              <h2 className="mt-1 text-xl font-bold">
                Your Professional Resume
              </h2>
            </div>

            <span className="rounded-full border border-[#d6c1ad] bg-white px-3 py-2 text-xs font-bold text-[#795638]">
              Live Preview
            </span>
          </div>

          <article className="mx-auto min-h-[800px] w-full max-w-[720px] overflow-hidden border border-[#d6c1ad] bg-white shadow-xl">
            <div className="h-2 bg-[#A67B5B]" />

            <div className="grid grid-cols-1 sm:grid-cols-[0.72fr_1.28fr]">
              {/* SIDEBAR */}
              <aside className="bg-[#f8f2eb] px-5 py-7 sm:px-6">
                <div className="mb-6 border-b border-[#d6c1ad] pb-5">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#A67B5B] text-xl font-bold text-white shadow-sm">
                    {(
                      data.name
                        .trim()
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join("")
                    ) || "CV"}
                  </div>

                  <h1 className="break-words text-2xl font-extrabold leading-tight text-[#49382a]">
                    {data.name || "Your Name"}
                  </h1>

                  <p className="mt-2 break-words text-xs font-semibold leading-5 text-[#A67B5B]">
                    {[data.degree, data.branch]
                      .filter(Boolean)
                      .join(" | ") || "Your Professional Title"}
                  </p>
                </div>

                {/* CONTACT */}
                <ResumeSection title="Contact">
                  <div className="space-y-3 text-[11px] leading-5 text-[#49382a]">
                    {[
                      ["EMAIL", data.email],
                      ["PHONE", data.phone],
                      ["LOCATION", data.location],
                      ["LINKEDIN", data.linkedin],
                      ["GITHUB", data.github],
                    ].map(([label, value]) =>
                      value ? (
                        <div key={label} className="min-w-0">
                          <p className="mb-0.5 text-[9px] font-extrabold tracking-wider text-[#A67B5B]">
                            {label}
                          </p>

                          <p className="break-words">{value}</p>
                        </div>
                      ) : null
                    )}

                    {!data.email &&
                      !data.phone &&
                      !data.location &&
                      !data.linkedin &&
                      !data.github && (
                        <p className="text-[#9a8571]">
                          Your contact details will appear here.
                        </p>
                      )}
                  </div>
                </ResumeSection>

                {/* EDUCATION */}
                <ResumeSection title="Education">
                  {data.college ||
                  data.cgpa ||
                  data.graduationYear ? (
                    <div className="space-y-2">
                      <p className="text-xs font-bold leading-5 text-[#49382a]">
                        {[data.degree, data.branch]
                          .filter(Boolean)
                          .join(" ")}
                      </p>

                      {data.college && (
                        <p className="text-[11px] leading-5 text-[#806b58]">
                          {data.college}
                        </p>
                      )}

                      {data.cgpa && (
                        <p className="text-[11px] font-semibold text-[#795638]">
                          CGPA: {data.cgpa}
                        </p>
                      )}

                      {data.graduationYear && (
                        <p className="text-[11px] text-[#806b58]">
                          Graduation: {data.graduationYear}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[11px] leading-5 text-[#9a8571]">
                      Your education details will appear here.
                    </p>
                  )}
                </ResumeSection>

                {/* TECHNICAL SKILLS */}
                <ResumeSection title="Technical Skills">
                  {data.skills ? (
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills
                        .split(/[\n,;]+/)
                        .map((skill) => skill.trim())
                        .filter(Boolean)
                        .map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-md border border-[#d6c1ad] bg-white px-2 py-1 text-[10px] font-medium text-[#795638]"
                          >
                            {skill.replace(/^[-•*]\s*/, "")}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[11px] leading-5 text-[#9a8571]">
                      Add your technical skills to display them here.
                    </p>
                  )}
                </ResumeSection>

                {/* CERTIFICATIONS */}
                {data.certifications && (
                  <ResumeSection title="Certifications">
                    <ResumeText value={data.certifications} />
                  </ResumeSection>
                )}
              </aside>

              {/* MAIN RESUME CONTENT */}
              <div className="min-w-0 px-5 py-7 sm:px-7">
                {/* SUMMARY */}
                <div className="mb-7">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A67B5B]">
                    Professional Profile
                  </p>

                  <h2 className="mt-1 text-lg font-extrabold text-[#49382a]">
                    Career Summary
                  </h2>

                  <div className="mt-3">
                    {data.summary ? (
                      <p className="whitespace-pre-wrap break-words text-[11px] leading-[1.9] text-[#49382a]">
                        {data.summary}
                      </p>
                    ) : (
                      <p className="text-[11px] leading-6 text-[#9a8571]">
                        Your professional summary will appear here.
                        Use the AI assistant to refine your wording.
                      </p>
                    )}
                  </div>
                </div>

                {/* PROJECTS */}
                <ResumeSection title="Projects">
                  {data.projects ? (
                    <ResumeText value={data.projects} />
                  ) : (
                    <p className="text-[11px] leading-6 text-[#9a8571]">
                      Add projects, technologies, and your contributions.
                    </p>
                  )}
                </ResumeSection>

                {/* EXPERIENCE */}
                <ResumeSection title="Experience & Internships">
                  {data.experience ? (
                    <ResumeText value={data.experience} />
                  ) : (
                    <p className="text-[11px] leading-6 text-[#9a8571]">
                      Include relevant internships, work, or practical
                      experience. If you are a fresher, you can leave
                      this section empty.
                    </p>
                  )}
                </ResumeSection>

                {/* ACHIEVEMENTS */}
                {data.achievements && (
                  <ResumeSection title="Achievements">
                    <ResumeText value={data.achievements} />
                  </ResumeSection>
                )}

                {!data.summary &&
                  !data.projects &&
                  !data.experience &&
                  !data.achievements && (
                    <div className="mt-8 rounded-xl border border-dashed border-[#d6c1ad] bg-[#fcfaf7] p-5 text-center">
                      <p className="text-sm font-bold text-[#795638]">
                        Your career highlights go here
                      </p>

                      <p className="mt-2 text-xs leading-6 text-[#806b58]">
                        Fill in the form to build a structured,
                        professional resume with a sidebar and
                        clearly separated sections.
                      </p>
                    </div>
                  )}

                <div className="mt-10 border-t border-[#e7d9ca] pt-3 text-[9px] font-semibold uppercase tracking-widest text-[#a18b77]">
                  Career Compass
                </div>
              </div>
            </div>
          </article>

          <p className="mt-3 text-center text-xs leading-5 text-[#806b58]">
            The preview uses a responsive two-column design. On
            smaller screens, the sidebar appears above the main content.
          </p>
        </section>
      </div>
    </main>
  );
}

