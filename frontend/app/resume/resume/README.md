# Career Campass — chatbot popup + resume page for Next.js

Drop-in files for a Next.js (App Router) project. No Tailwind or shadcn needed —
the CSS file is self-contained.

## What's inside

```
app/api/chat/route.ts              → AI backend for the chat (keeps your API key server-side)
components/career-chat-widget.tsx  → the floating chatbot popup
components/resume-page.tsx         → the fillable resume page (imports the popup)
styles/career-campass.css          → all styling (amber/beige theme, responsive, print)
```

## Setup (one time)

1. Install the packages:

   ```
   npm install ai @ai-sdk/react @ai-sdk/openai lucide-react
   ```

2. Add your AI key to `.env.local` in your project root (create the file if it
   doesn't exist):

   ```
   OPENAI_API_KEY=sk-...your-key...
   # optional — pick any OpenAI chat model:
   OPENAI_MODEL=gpt-4o-mini
   ```

3. Copy the four files above into your project at the same paths
   (`app/api/chat/route.ts`, `components/...`, `styles/...`).

4. Import the stylesheet once, in `app/layout.tsx`:

   ```tsx
   import "@/styles/career-campass.css";
   ```

5. Show the page on your homepage (`app/page.tsx`):

   ```tsx
   import { ResumePage } from "@/components/resume-page";

   export default function Page() {
     return <ResumePage />;
   }
   ```

## Using the popup on your own existing page

If you already have your own resume page, skip `resume-page.tsx` and just mount
the widget inside it, passing the student's data:

```tsx
import { CareerChatWidget } from "@/components/career-chat-widget";

<CareerChatWidget
  studentProfile={{ name, degree, college, cgpa }}
  resumeSummary={{ summary, skills, projects }}
  assessmentResults={{ aptitude: 78, coding: 64, communication: 81 }}
  courseCatalog={[]}        // add your real courses here
  internshipCatalog={[]}    // add your real internships here
  currentPage="resume"
/>
```

## Notes

- **No sign-in needed** — anyone can chat. Conversation history is saved in the
  student's own browser, so it survives refreshes on the same device.
- The bot only recommends what you put in `courseCatalog` / `internshipCatalog`.
  Send me your real lists and I'll wire them in.
- To change the bot name or greeting, edit the strings in
  `components/career-chat-widget.tsx` (search "Career Campass Guide").
- The chat API is at `/api/chat`. If your site runs under a sub-path, adjust the
  `api: "/api/chat"` line in the widget.
