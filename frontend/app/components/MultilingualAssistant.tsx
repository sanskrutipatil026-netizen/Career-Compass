"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";

export interface AssistantLangDetails {
  code: string;
  name: string;
  nativeName: string;
  speechCode: string;
  placeholder: string;
  welcome: string;
  quickPrompts: string[];
}

export const ASSISTANT_LANGUAGES: AssistantLangDetails[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    speechCode: "en-US",
    placeholder: "Ask anything about interviews, resume, careers...",
    welcome: "👋 Hi! I'm Compass Mitra, your AI Career Guide. How can I guide your career journey today?",
    quickPrompts: [
      "🎯 How do I prepare for AI Mock Interviews?",
      "📄 How can I optimize my Resume for ATS?",
      "💡 Give me 5 key tips for technical interviews",
      "🚀 What features does Career Compass offer?",
    ],
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
    speechCode: "hi-IN",
    placeholder: "साक्षात्कार, रिज्यूमे या करियर के बारे में पूछें...",
    welcome: "👋 नमस्ते! मैं कम्पास मित्र (Compass Mitra) हूँ, आपका AI करियर साथी। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    quickPrompts: [
      "🎯 मॉक इंटरव्यू की तैयारी कैसे करें?",
      "📄 रिज्यूमे को बेहतर कैसे बनाएं?",
      "💡 तकनीकी इंटरव्यू के लिए 5 मुख्य सुझाव दें",
      "🚀 करियर कम्पास की प्रमुख विशेषताएं क्या हैं?",
    ],
  },
  {
    code: "mr",
    name: "Marathi",
    nativeName: "मराठी",
    speechCode: "mr-IN",
    placeholder: "मुलाखत, रेझ्युमे किंवा करिअरबद्दल विचारा...",
    welcome: "👋 नमस्कार! मी कंपास मित्र (Compass Mitra), तुमचा AI करिअर मार्गदर्शक. आज मी तुम्हाला कशी मदत करू?",
    quickPrompts: [
      "🎯 मॉक इंटरव्यूची तयारी कशी करावी?",
      "📄 रेझ्युमे अधिक प्रभावी कसा बनवावा?",
      "💡 टेक्निकल इंटरव्ह्यूसाठी ५ महत्त्वाच्या टिप्स द्या",
      "🚀 करिअर कंपासमध्ये कोणती वैशिष्ट्ये आहेत?",
    ],
  },
  {
    code: "bn",
    name: "Bengali",
    nativeName: "বাংলা",
    speechCode: "bn-IN",
    placeholder: "ইন্টারভিউ, জীবনবৃত্তান্ত বা ক্যারিয়ার সম্পর্কে জিজ্ঞাসা করুন...",
    welcome: "👋 নমস্কার! আমি কম্পাস মিত্র (Compass Mitra), আপনার এআই ক্যারিয়ার সহায়ক। আজ কীভাবে সাহায্য করতে পারি?",
    quickPrompts: [
      "🎯 মক ইন্টারভিউয়ের প্রস্তুতি কীভাবে নেব?",
      "📄 কীভাবে জীবনবৃত্তান্ত উন্নত করব?",
      "💡 টেকনিক্যাল ইন্টারভিউয়ের জন্য ৫টি গুরুত্বপূর্ণ টিপস দিন",
      "🚀 ক্যারিয়ার কম্পাসের সুবিধাগুলো কী কী?",
    ],
  },
  {
    code: "te",
    name: "Telugu",
    nativeName: "తెలుగు",
    speechCode: "te-IN",
    placeholder: "ఇంటర్వ్యూ, రెజ్యూమ్ లేదా కెరీర్ గురించి అడగండి...",
    welcome: "👋 నమస్కారం! నేను కంపాస్ మిత్ర (Compass Mitra), మీ AI కెరీర్ సహాయకుడిని. మీకు ఎలా సహాయపడగలను?",
    quickPrompts: [
      "🎯 మాక్ ఇంటర్వ్యూలకు ఎలా సిద్ధం కావాలి?",
      "📄 రెజ్యూమ్‌ను ఎలా ఆప్టిమైజ్ చేయాలి?",
      "💡 టెక్నికల్ ఇంటర్వ్యూ కోసం 5 ముఖ్యమైన చిట్కాలు ఇవ్వండి",
      "🚀 కెరీర్ కంపాస్ ఫీచర్లు ఏమిటి?",
    ],
  },
  {
    code: "ta",
    name: "Tamil",
    nativeName: "தமிழ்",
    speechCode: "ta-IN",
    placeholder: "நேர்காணல், ரெஸ்யூம் பற்றி கேளுங்கள்...",
    welcome: "👋 வணக்கம்! நான் காம்பஸ் மித்ரா (Compass Mitra), உங்கள் AI தொழில் வழிகாட்டி. உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    quickPrompts: [
      "🎯 மாக் நேர்காணலுக்கு எவ்வாறு தயாராவது?",
      "📄 ரெஸ்யூமை எவ்வாறு மேம்படுத்துவது?",
      "💡 தொழில்நுட்ப நேர்காணலுக்கான 5 குறிப்புகள் தாருங்கள்",
      "🚀 கேரியர் காம்பஸின் சிறப்பம்சங்கள் என்ன?",
    ],
  },
  {
    code: "gu",
    name: "Gujarati",
    nativeName: "ગુજરાતી",
    speechCode: "gu-IN",
    placeholder: "ઇન્ટરવ્યુ, રેઝ્યૂમે અથવા કરિયર વિશે પૂછો...",
    welcome: "👋 નમસ્તે! હું કંપાસ મિત્ર (Compass Mitra), તમારો AI કરિયર સાથી. આજે હું તમને કેવી રીતે મદદ કરી શકું?",
    quickPrompts: [
      "🎯 મોક ઇન્ટરવ્યુની તૈયારી કેવી રીતે કરવી?",
      "📄 રેઝ્યૂમે કેવી રીતે સુધારવો?",
      "💡 ટેકનિકલ ઇન્ટરવ્યુ માટે ૫ મહત્વપૂર્ણ ટિપ્સ આપો",
      "🚀 કરિયર કંપાસની સુવિધાઓ શું છે?",
    ],
  },
  {
    code: "kn",
    name: "Kannada",
    nativeName: "ಕನ್ನಡ",
    speechCode: "kn-IN",
    placeholder: "ಸಂದರ್ಶನ, ರೆಸ್ಯೂಮ್ ಬಗ್ಗೆ ಕೇಳಿ...",
    welcome: "👋 ನಮಸ್ಕಾರ! ನಾನು ಕಂಪಾಸ್ ಮಿತ್ರ (Compass Mitra), ನಿಮ್ಮ AI ಕರಿಯರ್ ಸಹಾಯಕ. ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?",
    quickPrompts: [
      "🎯 ಮಾಕ್ ಸಂದರ್ಶನಕ್ಕೆ ಹೇಗೆ ಸಿದ್ಧತೆ ಮಾಡಿಕೊಳ್ಳುವುದು?",
      "📄 ರೆಸ್ಯೂಮ್ ಅನ್ನು ಹೇಗೆ ಉತ್ತಮಗೊಳಿಸುವುದು?",
      "💡 ತಾಂತ್ರಿಕ ಸಂದರ್ಶನಕ್ಕಾಗಿ 5 ಪ್ರಮುಖ ಸಲಹೆಗಳನ್ನು ನೀಡಿ",
      "🚀 ಕರಿಯರ್ ಕಂಪಾಸ್‌ನ ವೈಶಿಷ್ಟ್ಯಗಳೇನು?",
    ],
  },
];

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  time: string;
}

interface Position {
  x: number;
  y: number;
}

export default function MultilingualAssistant() {
  const { currentLang, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  // Position state for floating button and chat modal
  // Default position is elevated (bottom: 100px, right: 24px) leaving space for another icon below it
  const [buttonPos, setButtonPos] = useState<Position | null>(null);
  const [windowPos, setWindowPos] = useState<Position | null>(null);

  const [isDraggingButton, setIsDraggingButton] = useState(false);
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);

  const buttonRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Drag tracking refs for launcher button
  const buttonDragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);
  const buttonHasMovedRef = useRef(false);

  // Drag tracking refs for chat window
  const windowDragStartRef = useRef<{ clientX: number; clientY: number; startX: number; startY: number } | null>(null);

  // Active assistant language matching global platform language
  const activeLangConfig =
    ASSISTANT_LANGUAGES.find((l) => l.code === currentLang.code) || ASSISTANT_LANGUAGES[0];

  // Keep elements within viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setButtonPos((prev) => {
        if (!prev) return null;
        const width = buttonRef.current?.offsetWidth || 60;
        const height = buttonRef.current?.offsetHeight || 60;
        return {
          x: Math.max(12, Math.min(window.innerWidth - width - 12, prev.x)),
          y: Math.max(12, Math.min(window.innerHeight - height - 12, prev.y)),
        };
      });

      setWindowPos((prev) => {
        if (!prev) return null;
        const width = windowRef.current?.offsetWidth || 400;
        const height = windowRef.current?.offsetHeight || 500;
        return {
          x: Math.max(12, Math.min(window.innerWidth - width - 12, prev.x)),
          y: Math.max(12, Math.min(window.innerHeight - height - 12, prev.y)),
        };
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update initial welcome message when language changes
  useEffect(() => {
    setMessages([
      {
        id: "welcome-msg",
        sender: "assistant",
        text: activeLangConfig.welcome,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [activeLangConfig.code]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Handle Speech Recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = activeLangConfig.speechCode;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }
  }, [activeLangConfig.speechCode]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = activeLangConfig.speechCode;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech recognition start error:", err);
      }
    }
  };

  // Text to Speech
  const speakText = (text: string, messageId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanSpeech = text.replace(/[*#_~]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.lang = activeLangConfig.speechCode;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(messageId);
    window.speechSynthesis.speak(utterance);
  };

  const handleLanguageSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    setLanguage(selectedCode);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputValue).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language: activeLangConfig.name,
          languageCode: activeLangConfig.code,
          history: messages,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: data.reply || "Sorry, I could not process your request at this moment.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Assistant query error:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: "⚠️ Connection error. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setMessages([
      {
        id: "welcome-msg",
        sender: "assistant",
        text: activeLangConfig.welcome,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  /* ------------------------------------------------------------------
     DRAG HANDLERS: Floating Action Launcher Button
     ------------------------------------------------------------------ */
  const onButtonPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    buttonDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: rect.left,
      startY: rect.top,
    };
    buttonHasMovedRef.current = false;
    setIsDraggingButton(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const onButtonPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!buttonDragStartRef.current) return;

    const deltaX = e.clientX - buttonDragStartRef.current.clientX;
    const deltaY = e.clientY - buttonDragStartRef.current.clientY;

    if (Math.hypot(deltaX, deltaY) > 5) {
      buttonHasMovedRef.current = true;
    }

    if (buttonHasMovedRef.current) {
      const el = buttonRef.current;
      const width = el ? el.offsetWidth : 60;
      const height = el ? el.offsetHeight : 60;

      const newX = Math.max(12, Math.min(window.innerWidth - width - 12, buttonDragStartRef.current.startX + deltaX));
      const newY = Math.max(12, Math.min(window.innerHeight - height - 12, buttonDragStartRef.current.startY + deltaY));

      setButtonPos({ x: newX, y: newY });
    }
  };

  const onButtonPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!buttonDragStartRef.current) return;
    buttonDragStartRef.current = null;
    setIsDraggingButton(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // If mouse didn't drag, treat it as a click to open assistant!
    if (!buttonHasMovedRef.current) {
      setIsOpen(true);
      setHasUnread(false);
    }
  };

  /* ------------------------------------------------------------------
     DRAG HANDLERS: Chat Window Modal Header
     ------------------------------------------------------------------ */
  const onWindowHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    const el = windowRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    windowDragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startX: rect.left,
      startY: rect.top,
    };
    setIsDraggingWindow(true);

    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const onWindowHeaderPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!windowDragStartRef.current) return;

    const deltaX = e.clientX - windowDragStartRef.current.clientX;
    const deltaY = e.clientY - windowDragStartRef.current.clientY;

    const el = windowRef.current;
    const width = el ? el.offsetWidth : 420;
    const height = el ? el.offsetHeight : 620;

    const newX = Math.max(8, Math.min(window.innerWidth - width - 8, windowDragStartRef.current.startX + deltaX));
    const newY = Math.max(8, Math.min(window.innerHeight - height - 8, windowDragStartRef.current.startY + deltaY));

    setWindowPos({ x: newX, y: newY });
  };

  const onWindowHeaderPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!windowDragStartRef.current) return;
    windowDragStartRef.current = null;
    setIsDraggingWindow(false);

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Reset positions back to default
  const resetPosition = () => {
    setButtonPos(null);
    setWindowPos(null);
  };

  return (
    <>
      {/* =========================================================
          FLOATING ACTION BUTTON (Launcher)
          Positioned elevated by default: bottom: 100px, right: 24px
          Leaves ample space below for another floating icon!
          Draggable with cursor across the entire viewport.
          ========================================================= */}
      {!isOpen && (
        <div
          ref={buttonRef}
          onPointerDown={onButtonPointerDown}
          onPointerMove={onButtonPointerMove}
          onPointerUp={onButtonPointerUp}
          onPointerCancel={onButtonPointerUp}
          style={
            buttonPos
              ? { left: `${buttonPos.x}px`, top: `${buttonPos.y}px`, touchAction: "none" }
              : { bottom: "100px", right: "24px", touchAction: "none" }
          }
          className={`fixed z-50 flex items-center gap-2.5 select-none touch-none ${
            isDraggingButton ? "cursor-grabbing scale-105" : "cursor-grab"
          } transition-transform duration-150`}
        >
          {/* Informative Pill with Drag Grip Hint */}
          <div className="hidden sm:flex items-center gap-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-amber-950 dark:text-amber-100 border border-amber-200/90 dark:border-zinc-700 shadow-xl px-3.5 py-2 rounded-full text-xs font-semibold hover:border-amber-400 transition-all pointer-events-none shadow-amber-900/10">
            <span className="text-zinc-400 text-xs tracking-tighter mr-0.5">⋮⋮</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Compass Mitra ({activeLangConfig.nativeName})</span>
          </div>

          {/* Launcher Circle Button */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Open Compass Mitra AI Assistant (Drag to move)"
            title="Click to open or drag to move anywhere"
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#704828] via-[#8C6239] to-[#A67B5B] text-white shadow-2xl flex items-center justify-center border-2 border-white/60 dark:border-white/30 group hover:shadow-amber-900/30 transition-all"
            style={{ boxShadow: "0 10px 25px -5px rgba(112, 72, 40, 0.45)" }}
          >
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
            )}

            {/* Little Drag Grip Icon Indicator */}
            <span className="absolute -top-1 -left-1 bg-amber-900/80 text-amber-200 border border-amber-300/40 text-[9px] px-1 py-0.2 rounded-full font-mono opacity-0 group-hover:opacity-100 transition-opacity">
              ⠿
            </span>

            <svg
              className="w-7 h-7 transform group-hover:rotate-12 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* =========================================================
          ASSISTANT POPUP MODAL (Chatbot Window)
          Elevated by default (bottom: 100px, right: 24px)
          Draggable by its header bar across the viewport
          ========================================================= */}
      {isOpen && (
        <div
          ref={windowRef}
          style={
            windowPos
              ? {
                  left: `${windowPos.x}px`,
                  top: `${windowPos.y}px`,
                  boxShadow: "0 25px 60px -12px rgba(112, 72, 40, 0.35)",
                }
              : buttonPos
              ? {
                  // If button was dragged, open chat window near the button location
                  left: `${Math.max(12, Math.min(window.innerWidth - 430, buttonPos.x - 360))}px`,
                  top: `${Math.max(12, Math.min(window.innerHeight - 630, buttonPos.y - 560))}px`,
                  boxShadow: "0 25px 60px -12px rgba(112, 72, 40, 0.35)",
                }
              : {
                  bottom: "100px",
                  right: "24px",
                  boxShadow: "0 25px 60px -12px rgba(112, 72, 40, 0.35)",
                }
          }
          className={`fixed z-50 w-[95vw] sm:w-[420px] max-w-[440px] bg-white dark:bg-zinc-900 rounded-3xl border border-amber-200/70 dark:border-zinc-800 overflow-hidden flex flex-col transition-all duration-200 ease-in-out ${
            isMinimized ? "h-[74px]" : "h-[620px] max-h-[85vh]"
          }`}
        >
          {/* Header Bar - Draggable with Cursor */}
          <div
            onPointerDown={onWindowHeaderPointerDown}
            onPointerMove={onWindowHeaderPointerMove}
            onPointerUp={onWindowHeaderPointerUp}
            onPointerCancel={onWindowHeaderPointerUp}
            className={`bg-gradient-to-r from-[#704828] via-[#8C6239] to-[#A67B5B] text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-md select-none ${
              isDraggingWindow ? "cursor-grabbing" : "cursor-grab"
            }`}
            title="Click and drag header to move chatbot anywhere on screen"
          >
            <div className="flex items-center gap-2.5 pointer-events-none">
              {/* Grip Indicator */}
              <div className="text-amber-200/70 font-mono text-xs select-none">
                ⋮⋮
              </div>

              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-amber-100/20 backdrop-blur-sm border border-white/30 flex items-center justify-center font-bold text-amber-200 text-base">
                  🧭
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#704828] rounded-full"></span>
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-1.5">
                  Compass Mitra
                  <span className="text-[10px] font-normal text-amber-200/80 bg-black/20 px-1.5 py-0.5 rounded">
                    AI Guide
                  </span>
                </h3>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  {activeLangConfig.nativeName} • Indian Languages
                </p>
              </div>
            </div>

            {/* Header Controls (Language Selector, Reset, Minimize, Close) */}
            <div
              className="flex items-center gap-1.5"
              onPointerDown={(e) => e.stopPropagation()} // Prevent dragging when clicking controls
            >
              {/* Language Selector */}
              <select
                value={currentLang.code}
                onChange={handleLanguageSelect}
                className="bg-black/30 hover:bg-black/45 border border-white/30 text-white text-xs font-semibold rounded-lg px-2 py-1 outline-none cursor-pointer transition-colors max-w-[100px] truncate"
                title="Change Platform & Assistant Language"
              >
                {ASSISTANT_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="text-zinc-900 bg-white">
                    {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>

              {/* Reset Position Button (if dragged) */}
              {(buttonPos || windowPos) && (
                <button
                  onClick={resetPosition}
                  title="Reset chatbot position to bottom right"
                  aria-label="Reset position"
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}

              {/* Minimize / Expand Button */}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                aria-label={isMinimized ? "Expand Assistant" : "Minimize Assistant"}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
              >
                {isMinimized ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setSpeakingMessageId(null);
                }}
                aria-label="Close Assistant"
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/15 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body Content */}
          {!isMinimized && (
            <>
              {/* Drag Hint Banner */}
              <div className="bg-amber-50/80 dark:bg-zinc-800/40 border-b border-amber-100 dark:border-zinc-800 px-3 py-1 flex items-center justify-between text-[11px] text-amber-800 dark:text-amber-200/80 select-none">
                <span className="flex items-center gap-1.5">
                  <span className="text-amber-600 font-bold">✥</span>
                  Hold & drag the top header bar to move this window
                </span>
                {(buttonPos || windowPos) && (
                  <button
                    onClick={resetPosition}
                    className="underline text-[10px] text-amber-700 hover:text-amber-900 dark:hover:text-amber-100"
                  >
                    Reset pos
                  </button>
                )}
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FDFBF7] dark:bg-zinc-900/90 text-sm">
                {messages.map((msg) => {
                  const isAssistant = msg.sender === "assistant";
                  const isSpeaking = speakingMessageId === msg.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm relative group ${
                          isAssistant
                            ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-amber-100 dark:border-zinc-700 rounded-tl-sm"
                            : "bg-gradient-to-r from-[#A67B5B] to-[#704828] text-white rounded-tr-sm"
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {(() => {
                            if (!msg.text) return null;
                            const parts = msg.text.split(/(\*\*[^*]+\*\*)/g);
                            return parts.map((part, idx) => {
                              if (part.startsWith("**") && part.endsWith("**")) {
                                const boldContent = part.slice(2, -2).replace(/\*/g, "");
                                return (
                                  <strong key={idx} className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {boldContent}
                                  </strong>
                                );
                              }
                              return <span key={idx}>{part.replace(/\*/g, "")}</span>;
                            });
                          })()}
                        </div>

                        <div
                          className={`mt-1.5 flex items-center gap-2 text-[10px] ${
                            isAssistant
                              ? "text-zinc-400 dark:text-zinc-400 justify-between"
                              : "text-amber-200/80 justify-end"
                          }`}
                        >
                          <span>{msg.time}</span>

                          {isAssistant && (
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => speakText(msg.text, msg.id)}
                                title={isSpeaking ? "Stop Speaking" : "Listen (Text to Speech)"}
                                className={`p-1 rounded hover:bg-amber-100 dark:hover:bg-zinc-700 transition-colors ${
                                  isSpeaking ? "text-amber-600 font-bold animate-pulse" : "text-zinc-500 dark:text-zinc-300"
                                }`}
                              >
                                {isSpeaking ? "🔊 Stop" : "🔈 Listen"}
                              </button>

                              <button
                                onClick={() => copyToClipboard(msg.text, msg.id)}
                                title="Copy message"
                                className="p-1 rounded hover:bg-amber-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 transition-colors"
                              >
                                {copiedId === msg.id ? "✓ Copied" : "📋 Copy"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isLoading && (
                  <div className="flex items-center gap-2 text-zinc-400 text-xs py-1">
                    <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-zinc-800 flex items-center justify-center text-xs">
                      🧭
                    </div>
                    <div className="bg-white dark:bg-zinc-800 border border-amber-100 dark:border-zinc-700 px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-sm">
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-amber-600 rounded-full animate-bounce"></span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              {messages.length <= 2 && !isLoading && (
                <div className="px-3 py-2 bg-[#F6F1EA] dark:bg-zinc-800/60 border-t border-amber-100 dark:border-zinc-800 flex flex-wrap gap-1.5">
                  {activeLangConfig.quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] bg-white dark:bg-zinc-800 text-amber-900 dark:text-amber-200 border border-amber-200/70 dark:border-zinc-700 px-2.5 py-1 rounded-full hover:bg-amber-600 hover:text-white transition-all text-left truncate max-w-full shadow-xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-white dark:bg-zinc-900 border-t border-amber-200/50 dark:border-zinc-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <button
                    type="button"
                    onClick={clearChat}
                    title="Clear Chat"
                    className="p-2 text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={activeLangConfig.placeholder}
                    className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#8C6239] border border-transparent placeholder:text-zinc-400"
                  />

                  <button
                    type="button"
                    onClick={toggleListening}
                    title={isListening ? "Listening... Click to stop" : "Speak (Voice input)"}
                    className={`p-2.5 rounded-xl transition-all ${
                      isListening
                        ? "bg-red-500 text-white animate-pulse shadow-md"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-amber-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>

                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-[#8C6239] to-[#704828] hover:opacity-90 disabled:opacity-40 text-white p-2.5 rounded-xl shadow-sm transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 px-1">
                  <span>Career Compass • {activeLangConfig.nativeName}</span>
                  {isListening && (
                    <span className="text-red-500 font-semibold animate-pulse">
                      ● Listening ({activeLangConfig.nativeName})...
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}