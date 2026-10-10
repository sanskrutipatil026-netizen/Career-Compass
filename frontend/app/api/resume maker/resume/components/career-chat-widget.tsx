"use client";

/*
 * Career Campass Guide — floating chatbot popup.
 *
 * Drop-in for any Next.js (App Router) page:
 *   import { CareerChatWidget } from "@/components/career-chat-widget";
 *   <CareerChatWidget studentProfile={...} resumeSummary={...} ... />
 *
 * Requires: `npm install ai @ai-sdk/react @ai-sdk/openai lucide-react`
 * The backend it calls lives at app/api/chat/route.ts in this package.
 */

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Bot, ChevronLeft, History, MessageCircle, Plus, Send, Square, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Thread = { id: string; title: string; updated_at: string };

type Props = {
  /** Resume data and page context handed to the guide with every message. */
  studentProfile?: unknown;
  resumeSummary?: unknown;
  assessmentResults?: unknown;
  courseCatalog?: unknown;
  internshipCatalog?: unknown;
  currentPage?: string;
};

const quickReplies = [
  "Review my resume",
  "Which internship suits me?",
  "What skills am I missing?",
  "Explain my test result",
];

const welcome: UIMessage = {
  id: "welcome",
  role: "assistant",
  parts: [{ type: "text", text: "Hi! I’m the Career Campass Guide. What would you like help with today?" }],
};

const THREADS_KEY = "career-campass-chat-threads";
const threadKey = (id: string) => `career-campass-chat-${id}`;

/** All chat history is kept in this browser — no account needed. */
function loadThreads(): Thread[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(THREADS_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as Thread[]) : [];
  } catch {
    return [];
  }
}

function loadMessages(threadId: string): UIMessage[] | undefined {
  try {
    const parsed = JSON.parse(localStorage.getItem(threadKey(threadId)) ?? "null");
    return Array.isArray(parsed) && parsed.length ? (parsed as UIMessage[]) : undefined;
  } catch {
    return undefined;
  }
}

function messageText(message: UIMessage) {
  return message.parts.filter((part) => part.type === "text").map((part) => part.text).join("");
}

function saveThread(threadId: string, messages: UIMessage[]) {
  if (messages.length <= 1) return; // nothing beyond the welcome message yet
  const firstUser = messages.find((m) => m.role === "user");
  const title = firstUser ? messageText(firstUser).slice(0, 42) || "New conversation" : "New conversation";
  const threads = loadThreads().filter((t) => t.id !== threadId);
  threads.unshift({ id: threadId, title, updated_at: new Date().toISOString() });
  localStorage.setItem(THREADS_KEY, JSON.stringify(threads.slice(0, 30)));
  localStorage.setItem(threadKey(threadId), JSON.stringify(messages));
}

export function CareerChatWidget(props: Props) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string>();
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([welcome]);
  const [draft, setDraft] = useState("");
  const [ready, setReady] = useState(false); // wait for localStorage (avoids SSR mismatch)
  const messagesRef = useRef<UIMessage[]>([]);

  // Restore saved conversations on mount.
  useEffect(() => {
    setThreads(loadThreads());
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Returns the conversation id for this chat, creating one if needed.
  const ensureThread = useCallback((): string => {
    if (activeId) return activeId;
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}`;
    setActiveId(id);
    setThreads(loadThreads());
    return id;
  }, [activeId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport<UIMessage>({
        api: "/api/chat",
        prepareSendMessagesRequest: async ({ messages }) => ({
          body: {
            messages,
            threadId: ensureThread(),
            studentProfile: props.studentProfile,
            resumeSummary: props.resumeSummary,
            assessmentResults: props.assessmentResults,
            currentPage: props.currentPage ?? "resume",
            courseCatalog: props.courseCatalog,
            internshipCatalog: props.internshipCatalog,
          },
        }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ensureThread],
  );

  const { messages, sendMessage, status, stop, error, setMessages } = useChat({
    id: activeId ?? "new",
    messages: initialMessages,
    transport,
    onFinish: () => {
      if (activeId) saveThread(activeId, messagesRef.current);
      setThreads(loadThreads());
      inputRef.current?.focus();
    },
  });
  messagesRef.current = messages;
  const busy = status === "submitted" || status === "streaming";

  // When the active conversation changes, load its saved history.
  useEffect(() => {
    if (activeId) {
      const saved = loadMessages(activeId);
      if (saved && saved.length) setMessages(saved);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Keep chat history saved even if the user closes the window mid-reply.
  useEffect(() => {
    if (ready && activeId) saveThread(activeId, messages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, activeId, ready]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    const el = transcriptRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  // Focus the input whenever the popup opens.
  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 120);
  }, [open, showThreads]);

  function openThread(thread: Thread) {
    setShowThreads(false);
    setActiveId(thread.id);
  }

  function newConversation() {
    setShowThreads(false);
    setActiveId(undefined);
    setMessages([welcome]);
  }

  async function submit(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setDraft("");
    await sendMessage({ text: clean });
  }

  return (
    <div className="career-chat" aria-live="polite">
      {open && (
        <section className="chat-window" aria-label="Career Campass Guide chat">
          <header className="chat-header">
            <div className="bot-mark" aria-hidden="true">
              <Bot />
            </div>
            <div className="chat-title">
              <h2>Career Campass Guide</h2>
              <p>Your internship &amp; resume guide</p>
            </div>
            <button type="button" className="header-icon" onClick={() => setShowThreads(!showThreads)} aria-label="Conversation history">
              <History size={18} />
            </button>
            <button type="button" className="header-icon" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </header>

          {showThreads ? (
            <div className="thread-panel">
              <div className="thread-toolbar">
                <button type="button" className="header-icon back" onClick={() => setShowThreads(false)} aria-label="Back to chat">
                  <ChevronLeft size={18} />
                </button>
                <strong>Conversations</strong>
                <button type="button" className="new-chat" onClick={newConversation}>
                  <Plus size={14} /> New
                </button>
              </div>
              <div className="thread-list">
                {threads.length === 0 && <p className="thread-empty">No conversations yet.</p>}
                {threads.map((thread) => (
                  <button type="button" key={thread.id} className={thread.id === activeId ? "thread-item active" : "thread-item"} onClick={() => openThread(thread)}>
                    <span>{thread.title}</span>
                    <small>{new Date(thread.updated_at).toLocaleDateString()}</small>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="chat-transcript" ref={transcriptRef}>
                {messages.map((message) => (
                  <div key={message.id} className={`chat-row ${message.role === "user" ? "user" : "assistant"}`}>
                    <div className={message.role === "assistant" ? "assistant-bubble" : "student-bubble"}>
                      {messageText(message)}
                    </div>
                  </div>
                ))}
                {messages.length === 1 && ready && (
                  <div className="quick-replies">
                    {quickReplies.map((reply) => (
                      <button type="button" key={reply} onClick={() => void submit(reply)}>
                        {reply}
                      </button>
                    ))}
                  </div>
                )}
                {status === "submitted" && (
                  <div className="typing">
                    <span className="bot-dot" aria-hidden="true">
                      <Bot />
                    </span>
                    <span className="typing-dots" aria-label="Typing">
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                )}
                {error && <p className="chat-error">Something went wrong. Please try again.</p>}
              </div>

              <div className="composer">
                <form
                  className="composer-box"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submit(draft);
                  }}
                >
                  <textarea
                    ref={inputRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void submit(draft);
                      }
                    }}
                    disabled={busy}
                    placeholder="Ask about your resume or career..."
                    rows={1}
                    aria-label="Message the Career Campass Guide"
                  />
                  {busy ? (
                    <button type="button" className="send-control" onClick={stop} aria-label="Stop generating">
                      <Square size={16} />
                    </button>
                  ) : (
                    <button type="submit" className="send-control" disabled={!draft.trim()} aria-label="Send message">
                      <Send size={16} />
                    </button>
                  )}
                </form>
                <p>Enter to send · Shift + Enter for a new line</p>
              </div>
            </>
          )}
        </section>
      )}
      {!open && (
        <button type="button" className="chat-launcher" onClick={() => setOpen(true)} aria-label="Open Career Campass Guide">
          <MessageCircle size={25} />
        </button>
      )}
    </div>
  );
}