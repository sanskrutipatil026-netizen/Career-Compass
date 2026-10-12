"use client";

/*
 * Career Campass — fillable resume page with the chatbot popup.
 * Everything the student types is saved in their browser (localStorage)
 * and shared with the chat guide, so answers reference their real resume.
 *
 * Use it on any page, e.g. app/page.tsx:
 *   import { ResumePage } from "@/components/resume-page";
 *   export default function Page() { return <ResumePage />; }
 *
 * Requires the styles in styles/career-campass.css and lucide-react.
 */

import { useEffect, useState } from "react";
import { Plus, Printer, Trash2, UserRound } from "lucide-react";
import { CareerChatWidget } from "./career-chat-widget";
import "../styles/career-campass.css";
/* Fillable resume template. Data is saved in this browser and shared with the chat guide. */
type Project = { title: string; description: string };
type Resume = {
  name: string;
  email: string;
  phone: string;
  location: string;
  degree: string;
  college: string;
  graduationYear: string;
  cgpa: string;
  summary: string;
  skills: string;
  projects: Project[];
  experience: string;
  certifications: string;
  achievements: string;
  aptitude: string;
  coding: string;
  communication: string;
};

const empty: Resume = {
  name: "", email: "", phone: "", location: "", degree: "", college: "", graduationYear: "", cgpa: "",
  summary: "", skills: "", projects: [{ title: "", description: "" }], experience: "", certifications: "", achievements: "",
  aptitude: "", coding: "", communication: "",
};
const STORAGE_KEY = "career-campass-resume";

export function ResumePage() {
  const [r, setR] = useState<Resume>(empty);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setR({ ...empty, ...JSON.parse(saved) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
  }, [r, loaded]);

  const set = (k: keyof Resume) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setR({ ...r, [k]: e.target.value });
  const setProject = (i: number, k: keyof Project, v: string) => setR({ ...r, projects: r.projects.map((p, j) => (j === i ? { ...p, [k]: v } : p)) });
  const skills = r.skills.split(",").map((s) => s.trim()).filter(Boolean);
  const lines = (t: string) => t.split("\n").map((s) => s.trim()).filter(Boolean);

  const initials = r.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "ME";

  const field = (label: string, k: keyof Resume, placeholder = "", area = false) => (
    <label className="rf-field">
      <span>{label}</span>
      {area ? <textarea rows={3} value={r[k] as string} onChange={set(k)} placeholder={placeholder} />
        : <input value={r[k] as string} onChange={set(k)} placeholder={placeholder} />}
    </label>
  );

  return (
    <main className="resume-page">
      <nav className="site-nav">
        <a href="/" className="wordmark"><span>C</span>areer Campass</a>
        <div><span className="avatar">{initials}</span></div>
      </nav>
      <section className="resume-shell">
        <div className="resume-heading">
          <div>
            <p className="eyebrow">MY PROFILE</p>
            <h1>Build your resume</h1>
            <p>Fill in your details — the preview updates live and is saved on this device.</p>
          </div>
          <button type="button" className="edit-resume" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button>
        </div>
        <div className="resume-grid rf-grid">
          <form className="resume-document rf-form" onSubmit={(e) => e.preventDefault()}>
            <h3>Personal details</h3>
            {field("Full name", "name", "e.g. Priya Verma")}
            {field("Email", "email", "you@example.com")}
            {field("Phone", "phone", "+91 ...")}
            {field("City, State", "location", "e.g. Indore, MP")}
            <h3>Education</h3>
            {field("Degree & branch", "degree", "e.g. B.Tech Computer Science")}
            {field("College", "college")}
            {field("Graduation year", "graduationYear", "2027")}
            {field("CGPA / %", "cgpa", "8.1")}
            <h3>About you</h3>
            {field("Profile summary", "summary", "2-3 lines about your goals and strengths", true)}
            {field("Skills (comma separated)", "skills", "Python, SQL, Excel")}
            <h3>Projects</h3>
            {r.projects.map((p, i) => (
              <div key={i} className="rf-project">
                <input value={p.title} onChange={(e) => setProject(i, "title", e.target.value)} placeholder="Project title" />
                <textarea rows={2} value={p.description} onChange={(e) => setProject(i, "description", e.target.value)} placeholder="What you built and the result" />
                {r.projects.length > 1 && <button type="button" className="rf-link" onClick={() => setR({ ...r, projects: r.projects.filter((_, j) => j !== i) })}><Trash2 size={14} /> Remove</button>}
              </div>
            ))}
            <button type="button" className="rf-link" onClick={() => setR({ ...r, projects: [...r.projects, { title: "", description: "" }] })}><Plus size={14} /> Add project</button>
            <h3>More</h3>
            {field("Experience / internships (one per line)", "experience", "", true)}
            {field("Certifications (one per line)", "certifications", "", true)}
            {field("Achievements (one per line)", "achievements", "", true)}
            <h3>Test results (out of 100)</h3>
            {field("Aptitude score", "aptitude", "e.g. 78")}
            {field("Coding score", "coding", "e.g. 64")}
            {field("Communication score", "communication", "e.g. 81")}
            <button type="button" className="rf-link" onClick={() => confirm("Clear all fields?") && setR(empty)}><Trash2 size={14} /> Clear all</button>
          </form>

          <article className="resume-document rf-preview">
            <div className="candidate">
              <div className="candidate-icon"><UserRound /></div>
              <div>
                <h2>{r.name || "Your Name"}</h2>
                <p>{[r.degree, r.graduationYear && `Class of ${r.graduationYear}`].filter(Boolean).join(" · ") || "Degree · Class of year"}</p>
                <p>{[r.email, r.phone, r.location].filter(Boolean).join(" · ") || "email · phone · city"}</p>
              </div>
            </div>
            {r.summary && <div className="resume-section"><h3>Profile summary</h3><p>{r.summary}</p></div>}
            {(r.college || r.cgpa) && <div className="resume-section"><h3>Education</h3><p>{r.degree}{r.college && ` — ${r.college}`}{r.cgpa && ` · CGPA ${r.cgpa}`}</p></div>}
            {skills.length > 0 && <div className="resume-section"><h3>Skills</h3><div className="skill-list">{skills.map((s) => <span key={s}>{s}</span>)}</div></div>}
            {r.projects.some((p) => p.title) && (
              <div className="resume-section"><h3>Projects</h3>{r.projects.filter((p) => p.title).map((p, i) => <div key={i}><h4>{p.title}</h4><p>{p.description}</p></div>)}</div>
            )}
            {([["Experience", r.experience], ["Certifications", r.certifications], ["Achievements", r.achievements]] as const).map(([t, v]) => lines(v).length > 0 &&
              <div key={t} className="resume-section"><h3>{t}</h3><ul>{lines(v).map((l) => <li key={l}>{l}</li>)}</ul></div>)}
          </article>
        </div>
      </section>
      <CareerChatWidget
        studentProfile={{ name: r.name, degree: r.degree, college: r.college, graduationYear: r.graduationYear, cgpa: r.cgpa, location: r.location }}
        resumeSummary={{ summary: r.summary, skills, projects: r.projects.filter((p) => p.title), experience: lines(r.experience), certifications: lines(r.certifications), achievements: lines(r.achievements) }}
        assessmentResults={r.aptitude || r.coding || r.communication ? { aptitude: r.aptitude || "not taken", coding: r.coding || "not taken", communication: r.communication || "not taken" } : { note: "No assessment taken yet" }}
        courseCatalog={[]} internshipCatalog={[]} currentPage="resume" />
    </main>
  );
}