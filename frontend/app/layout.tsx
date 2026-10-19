
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MultilingualAssistant from "./components/MultilingualAssistant";
import { LanguageProvider } from "./context/LanguageContext";
import SessionWrapper from "./SessionWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Career Compass - AI Career & Interview Preparation",
  description:
    "AI-powered mock interviews, resume analysis, skill evaluation, and career guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionWrapper>
          <LanguageProvider>
            {children}
            <MultilingualAssistant />
          </LanguageProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}

