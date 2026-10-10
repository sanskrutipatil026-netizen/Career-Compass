import { NextResponse } from "next/server";

import Groq from "groq-sdk";  //FIRST COMMENT

import mammoth from "mammoth";

const pdf = require("pdf-parse-debugging-disabled");

export const runtime = "nodejs";

const groq = new Groq({

apiKey: process.env.GROQ_API_KEY,

});

export async function POST(req: Request) {

try {

const formData = await req.formData();

const file = formData.get("resume") as File | null;

if (!file) {

return NextResponse.json(

{ error: "No file uploaded" },



{ status: 400 }

);

}

const buffer = Buffer.from(await file.arrayBuffer());

let resumeText = "";

// PDF

if (file.name.toLowerCase().endsWith(".pdf")) {

const data = await pdf(buffer);

resumeText = data.text;

}

// DOCX

else if (file.name.toLowerCase().endsWith(".docx")) {

const data = await mammoth.extractRawText({ buffer });

resumeText = data.value;

}

// TXT

else if (file.name.toLowerCase().endsWith(".txt")) {

resumeText = buffer.toString("utf-8");

}

// Unsupported

else {

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

{ error: "Could not extract text from the resume." },



{ status: 400 }

);

}

const prompt = `

Analyze the following resume.

Return ONLY valid JSON in exactly this structure:

{
  "summary": "",
  "skills": [],
  "strengths": [],
  "weaknesses": [],
  "overallScore": 0,
  "experienceLevel": "",
  "communicationGaps": [],
  "missingIndustrySkills": [],
  "roadmap": [],

  "contactInfo": {
    "name": {
      "present": false,
      "value": "",
      "suggestion": ""
    },
    "email": {
      "present": false,
      "value": "",
      "suggestion": ""
    },
    "phone": {
      "present": false,
      "value": "",
      "suggestion": ""
    },
    "linkedin": {
      "present": false,
      "value": "",
      "suggestion": ""
    },
    "github": {
      "present": false,
      "value": "",
      "suggestion": ""
    },
    "portfolio": {
      "present": false,
      "value": "",
      "suggestion": ""
    }
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

  "hobbies": {
    "present": false,
    "items": [],
    "suggestion": ""
  },

  "languages": {
    "present": false,
    "items": [],
    "suggestion": ""
  },

  "extracurricularActivities": {
    "present": false,
    "items": [],
    "suggestion": ""
  },

  "certifications": {
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

  "resumeImprovements": [
    {
      "section": "",
      "issue": "",
      "whatToAdd": "",
      "suggestion": "",
      "priority": ""
    }
  ],

  "domains": [
    {
      "name": "",
      "score": 0
    }
  ]
}

Instructions:

Identify the candidate's strengths and weaknesses.

Identify communication gaps in the resume, such as lack of clear communication skills, presentation skills, teamwork, leadership, or professional communication.

Return these findings in "communicationGaps".

Do not invent communication gaps if there is sufficient evidence that the candidate demonstrates strong communication skills.


CONTACT INFORMATION CHECK:

Check for:
- Full Name
- Professional Email
- Phone Number
- LinkedIn Profile
- GitHub Profile
- Portfolio Website

For every contact field:
- Set "present" to true if found.
- Set "present" to false if missing.
- Put the actual value in "value" only if it exists in the resume.
- Do not invent any value.
- Give a suggestion if the field is missing or needs improvement.


EDUCATION CHECK:

Check for:
- Degree
- College or University
- Branch or Specialization
- Graduation year
- CGPA or Percentage

Do not invent education details.


EXPERIENCE CHECK:

Check for:
- Internships
- Jobs
- Freelance work
- Training
- Open-source contributions

If experience is missing:
- Do not invent experience.
- Suggest gaining genuine practical experience through internships, hackathons, open-source contributions, or substantial projects.


PROJECT CHECK:

For projects, check whether the resume includes:
- Project name
- Clear description
- Technologies used
- Main features
- Problem solved
- Candidate's contribution
- GitHub link or demo link

If any important information is missing, explain exactly what should be added.


HOBBIES CHECK:

Extract only hobbies genuinely mentioned in the resume.

If hobbies are missing:
- Do not invent hobbies.
- Suggest adding genuine hobbies and interests.
- Mention that this section is optional.


LANGUAGES CHECK:

Extract only languages genuinely mentioned in the resume.

Include proficiency only if it is mentioned.

Do not invent languages or proficiency.

If missing, suggest adding languages the candidate genuinely knows.


EXTRACURRICULAR ACTIVITIES CHECK:

Check for:
- Hackathons
- Workshops
- College clubs
- Competitions
- Volunteering
- Leadership roles
- Sports
- Cultural activities
- Seminars
- Technical events

Extract only genuinely mentioned activities.

Do not invent activities.


CERTIFICATIONS AND ACHIEVEMENTS CHECK:

Extract only certifications and achievements genuinely mentioned.

Never invent certifications, awards, ranks, or achievements.


MISSING SECTIONS CHECK:

Identify missing sections such as:
- Name
- Email
- Phone
- Education
- Skills
- Projects
- Experience
- Professional Summary
- LinkedIn
- GitHub
- Portfolio
- Certifications
- Achievements
- Languages
- Hobbies
- Extracurricular Activities


RESUME IMPROVEMENTS:

For every important improvement, provide:
- section
- issue
- whatToAdd
- suggestion
- priority

Priority must be one of:
- high
- medium
- low

Clearly explain exactly what the candidate should add or improve.

Never suggest adding fake experience, fake achievements, fake certifications, or fake skills.


Calculate "overallScore" using this fixed rubric:

Skills and technical knowledge: 30 points
Projects: 20 points
Education: 15 points
Experience/internships: 15 points
Certifications: 10 points
Resume quality and completeness: 10 points
Total: 100 points

Give points only when the resume provides evidence for the category.

Keep the scoring consistent. Do not randomly change the score between analyses of the same resume.

Determine their experience level.

Identify important industry skills that are missing from their resume.

Do not list a skill as missing if it is already clearly present in the resume.

Consider the candidate's experience level and technical domain when identifying missing industry skills.

Create a personalized "roadmap" based on the candidate's:
- Experience level
- Weaknesses
- Missing industry skills
- Missing resume sections
- Domains

For Entry Level candidates:
Focus on programming fundamentals, DSA, core CS concepts, projects, Git/GitHub, and basic interview preparation.

For Internship Seeker candidates:
Focus on practical technical skills, projects, Git/GitHub, APIs, industry tools, and internship interview preparation.

For Junior candidates:
Focus on improving technical depth, real-world projects, industry technologies, and technical interviews.

For Mid Level candidates:
Focus on advanced technologies, system design, scalable projects, and advanced interview topics.

For Senior candidates:
Focus on system design, architecture, leadership, advanced technologies, and role-specific interview preparation.

Include:
- Technologies to learn
- Projects to build
- Certifications to consider
- Interview topics to practice
- Resume improvements to make

IMPORTANT:
- Never invent information.
- Never invent name, email, phone number, GitHub, LinkedIn, or portfolio links.
- Never invent hobbies or languages.
- Never invent experience or internships.
- Never invent certifications or achievements.
- Clearly distinguish what is PRESENT from what is MISSING.
- Clearly explain WHAT TO ADD to improve the resume.
- Return ONLY valid JSON.

Resume:

${resumeText}

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

const result = completion.choices[0]?.message?.content;

if (!result) {

return NextResponse.json(

{ error: "AI returned an empty result." },



{ status: 500 }

);

}
let analysis;

try {
  analysis = JSON.parse(result);
} catch (error) {
  return NextResponse.json(
    { error: "AI returned invalid JSON." },
    { status: 500 }
  );
}

return NextResponse.json(analysis);

} catch (error) {

console.error("RESUME ANALYSIS ERROR:", error);

return NextResponse.json(

{

error:



  error instanceof Error



    ? error.message



    : "Resume analysis failed.",

},

{ status: 500 }

);

}

}