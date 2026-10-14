export type Platform = {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
};

export const categories: string[] = [
  "All",
  "Internships",
  "Jobs",
  "Government Opportunities",
  "Hackathons",
  "Projects & Open Source",
  "Learning & Certifications",
  "Fellowships & Developer Programs",
];

export const platforms: Platform[] = [
  // =====================================================
  // 1. INTERNSHIPS
  // =====================================================

  {
    id: "internshala",
    name: "Internshala",
    category: "Internships",
    description:
      "Find internships in software development, web development, data science, and other fields.",
    url: "https://internshala.com/",
  },
  {
    id: "linkedin-internships",
    name: "LinkedIn Internships",
    category: "Internships",
    description:
      "Discover internship opportunities and connect with recruiters and professionals.",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "wellfound-internships",
    name: "Wellfound",
    category: "Internships",
    description:
      "Explore startup opportunities, including internships and early-career technology roles.",
    url: "https://wellfound.com/",
  },
  {
    id: "indeed-internships",
    name: "Indeed",
    category: "Internships",
    description:
      "Search for internships across software engineering, analytics, and other industries.",
    url: "https://in.indeed.com/",
  },
  {
    id: "lets-intern",
    name: "LetsIntern",
    category: "Internships",
    description:
      "Explore internship listings and opportunities to gain practical work experience.",
    url: "https://www.letsintern.com/",
  },
  {
    id: "unstop-internships",
    name: "Unstop",
    category: "Internships",
    description:
      "Discover internships, student competitions, challenges, and early-career opportunities.",
    url: "https://unstop.com/",
  },
  {
    id: "ai-internships",
    name: "AICTE Internship Portal",
    category: "Internships",
    description:
      "Explore internship opportunities associated with India's technical education ecosystem.",
    url: "https://internship.aicte-india.org/",
  },

  // =====================================================
  // 2. JOBS
  // =====================================================

  {
    id: "linkedin-jobs",
    name: "LinkedIn Jobs",
    category: "Jobs",
    description:
      "Search for entry-level software engineering, frontend, backend, and data roles.",
    url: "https://www.linkedin.com/jobs/",
  },
  {
    id: "naukri",
    name: "Naukri.com",
    category: "Jobs",
    description:
      "Search for technology jobs, fresher positions, and entry-level engineering roles in India.",
    url: "https://www.naukri.com/",
  },
  {
    id: "indeed-jobs",
    name: "Indeed Jobs",
    category: "Jobs",
    description:
      "Explore job listings across companies, industries, and experience levels.",
    url: "https://in.indeed.com/",
  },
  {
    id: "wellfound-jobs",
    name: "Wellfound Jobs",
    category: "Jobs",
    description:
      "Discover startup jobs in software development, product engineering, and technology.",
    url: "https://wellfound.com/jobs",
  },
  {
    id: "foundit",
    name: "Foundit",
    category: "Jobs",
    description:
      "Search for fresher opportunities, technology jobs, and early-career positions.",
    url: "https://www.foundit.in/",
  },
  {
    id: "glassdoor",
    name: "Glassdoor",
    category: "Jobs",
    description:
      "Research companies, explore job listings, and learn about interview experiences.",
    url: "https://www.glassdoor.co.in/",
  },
  {
    id: "google-careers",
    name: "Google Careers",
    category: "Jobs",
    description:
      "Explore Google's official career opportunities, including eligible student and graduate roles.",
    url: "https://www.google.com/about/careers/applications/",
  },

  // =====================================================
  // 3. GOVERNMENT OPPORTUNITIES
  // =====================================================

  {
    id: "ncs",
    name: "National Career Service",
    category: "Government Opportunities",
    description:
      "Explore career services, employment opportunities, and career-related resources in India.",
    url: "https://www.ncs.gov.in/",
  },
  {
    id: "upsc",
    name: "UPSC",
    category: "Government Opportunities",
    description:
      "Check official recruitment notifications and eligibility for Union Public Service Commission examinations.",
    url: "https://upsc.gov.in/",
  },
  {
    id: "ssc",
    name: "Staff Selection Commission",
    category: "Government Opportunities",
    description:
      "Explore official recruitment notifications and examinations conducted by SSC.",
    url: "https://ssc.gov.in/",
  },
  {
    id: "ibps",
    name: "IBPS",
    category: "Government Opportunities",
    description:
      "Review official recruitment opportunities and examinations conducted through IBPS.",
    url: "https://www.ibps.in/",
  },
  {
    id: "isro-careers",
    name: "ISRO Careers",
    category: "Government Opportunities",
    description:
      "Check official recruitment information for eligible technical and scientific positions.",
    url: "https://www.isro.gov.in/",
  },
  {
    id: "drdo-careers",
    name: "DRDO Careers",
    category: "Government Opportunities",
    description:
      "Explore official defence research recruitment and eligible technical opportunities.",
    url: "https://www.drdo.gov.in/",
  },
  {
    id: "nats",
    name: "National Apprenticeship Training Scheme",
    category: "Government Opportunities",
    description:
      "Explore apprenticeship training opportunities for eligible students and graduates.",
    url: "https://nats.education.gov.in/",
  },

  // =====================================================
  // 4. HACKATHONS
  // =====================================================

  {
    id: "devpost",
    name: "Devpost",
    category: "Hackathons",
    description:
      "Discover hackathons, build projects, collaborate with developers, and showcase your work.",
    url: "https://devpost.com/",
  },
  {
    id: "unstop-hackathons",
    name: "Unstop Hackathons",
    category: "Hackathons",
    description:
      "Explore student hackathons, coding competitions, innovation challenges, and technology events.",
    url: "https://unstop.com/",
  },
  {
    id: "mlh",
    name: "Major League Hacking",
    category: "Hackathons",
    description:
      "Discover student hackathons and opportunities to collaborate on technology projects.",
    url: "https://mlh.io/",
  },
  {
    id: "hack2skill",
    name: "Hack2skill",
    category: "Hackathons",
    description:
      "Explore hackathons, innovation challenges, and technology-focused competitions.",
    url: "https://hack2skill.com/",
  },
  {
    id: "devfolio",
    name: "Devfolio",
    category: "Hackathons",
    description:
      "Find hackathons and showcase projects developed during innovation challenges.",
    url: "https://devfolio.co/",
  },
  {
    id: "codechef",
    name: "CodeChef",
    category: "Hackathons",
    description:
      "Practice competitive programming and participate in coding contests.",
    url: "https://www.codechef.com/",
  },
  {
    id: "leetcode-contests",
    name: "LeetCode",
    category: "Hackathons",
    description:
      "Improve algorithmic problem-solving skills through coding problems and contests.",
    url: "https://leetcode.com/",
  },

  // =====================================================
  // 5. PROJECTS & OPEN SOURCE
  // =====================================================

  {
    id: "github",
    name: "GitHub",
    category: "Projects & Open Source",
    description:
      "Publish projects, collaborate with developers, contribute to repositories, and build a portfolio.",
    url: "https://github.com/",
  },
  {
    id: "gitlab",
    name: "GitLab",
    category: "Projects & Open Source",
    description:
      "Host repositories, collaborate on software projects, and explore version control and CI/CD.",
    url: "https://gitlab.com/",
  },
  {
    id: "goodfirstissue",
    name: "Good First Issue",
    category: "Projects & Open Source",
    description:
      "Discover beginner-friendly open-source issues and contribute to real projects.",
    url: "https://goodfirstissue.dev/",
  },
  {
    id: "firsttimersonly",
    name: "First Timers Only",
    category: "Projects & Open Source",
    description:
      "Learn how to make your first open-source contribution.",
    url: "https://www.firsttimersonly.com/",
  },
  {
    id: "up-for-grabs",
    name: "Up For Grabs",
    category: "Projects & Open Source",
    description:
      "Find open-source projects with tasks suitable for new contributors.",
    url: "https://up-for-grabs.net/",
  },
  {
    id: "opensource-guides",
    name: "Open Source Guides",
    category: "Projects & Open Source",
    description:
      "Learn how open-source communities work and how to contribute effectively.",
    url: "https://opensource.guide/",
  },
  {
    id: "github-skills",
    name: "GitHub Skills",
    category: "Projects & Open Source",
    description:
      "Build practical GitHub skills through interactive, repository-based learning exercises.",
    url: "https://skills.github.com/",
  },

  // =====================================================
  // 6. LEARNING & CERTIFICATIONS
  // =====================================================

  {
    id: "coursera",
    name: "Coursera",
    category: "Learning & Certifications",
    description:
      "Explore courses and professional learning programs in software development, AI, and data science.",
    url: "https://www.coursera.org/",
  },
  {
    id: "nptel",
    name: "NPTEL",
    category: "Learning & Certifications",
    description:
      "Study engineering and computer science courses offered through India's NPTEL initiative.",
    url: "https://nptel.ac.in/",
  },
  {
    id: "swayam",
    name: "SWAYAM",
    category: "Learning & Certifications",
    description:
      "Access online courses across computer science, engineering, and other academic subjects.",
    url: "https://swayam.gov.in/",
  },
  {
    id: "freecodecamp",
    name: "freeCodeCamp",
    category: "Learning & Certifications",
    description:
      "Learn web development, JavaScript, Python, databases, and other programming skills through practice.",
    url: "https://www.freecodecamp.org/",
  },
  {
    id: "roadmap-sh",
    name: "roadmap.sh",
    category: "Learning & Certifications",
    description:
      "Follow structured learning roadmaps for frontend, backend, full-stack development, and other technical roles.",
    url: "https://roadmap.sh/",
  },
  {
    id: "kaggle",
    name: "Kaggle",
    category: "Learning & Certifications",
    description:
      "Practice data science and machine learning using datasets, notebooks, and competitions.",
    url: "https://www.kaggle.com/",
  },
  {
    id: "aws-skill-builder",
    name: "AWS Skill Builder",
    category: "Learning & Certifications",
    description:
      "Learn cloud computing concepts and prepare for relevant AWS certifications.",
    url: "https://skillbuilder.aws/",
  },

  // =====================================================
  // 7. FELLOWSHIPS & DEVELOPER PROGRAMS
  // =====================================================

  {
    id: "gsoc",
    name: "Google Summer of Code",
    category: "Fellowships & Developer Programs",
    description:
      "Explore a global open-source program connecting eligible contributors with open-source organizations.",
    url: "https://summerofcode.withgoogle.com/",
  },
  {
    id: "outreachy",
    name: "Outreachy",
    category: "Fellowships & Developer Programs",
    description:
      "Explore paid remote internships contributing to open-source and open science projects, subject to eligibility.",
    url: "https://www.outreachy.org/",
  },
  {
    id: "microsoft-student",
    name: "Microsoft Learn Student Ambassadors",
    category: "Fellowships & Developer Programs",
    description:
      "Explore Microsoft learning resources and student-focused developer community opportunities.",
    url: "https://studentambassadors.microsoft.com/",
  },
  {
    id: "github-campus",
    name: "GitHub Education",
    category: "Fellowships & Developer Programs",
    description:
      "Explore GitHub education resources and student developer benefits for eligible students.",
    url: "https://education.github.com/",
  },
  {
    id: "mlh-fellowship",
    name: "MLH Fellowship",
    category: "Fellowships & Developer Programs",
    description:
      "Explore collaborative software engineering experiences and open-source development programs.",
    url: "https://fellowship.mlh.io/",
  },
  {
    id: "google-developer",
    name: "Google for Developers",
    category: "Fellowships & Developer Programs",
    description:
      "Explore developer technologies, technical learning resources, and developer community programs.",
    url: "https://developers.google.com/",
  },
  {
    id: "hacktoberfest",
    name: "Hacktoberfest",
    category: "Fellowships & Developer Programs",
    description:
      "Discover an annual open-source participation event and learn how to contribute to public repositories.",
    url: "https://hacktoberfest.com/",
  },
];