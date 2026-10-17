"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type Language = {
  code: string;
  name: string;
};

type LanguageContextType = {
  currentLang: Language;
  setLanguage: (code: string) => void;
};

const languages: Language[] = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "te", name: "Telugu" },
  { code: "ta", name: "Tamil" },
  { code: "gu", name: "Gujarati" },
  { code: "kn", name: "Kannada" },
];

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [currentLang, setCurrentLang] = useState<Language>(
    languages[0]
  );

  const setLanguage = (code: string) => {
    const selectedLanguage = languages.find(
      (language) => language.code === code
    );

    if (selectedLanguage) {
      setCurrentLang(selectedLanguage);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ currentLang, setLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}