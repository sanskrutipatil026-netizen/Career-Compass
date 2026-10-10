export function evaluateAnswer(topic: string, answer: string) {
  const keywords: Record<string, string[]> = {
    HTML: ["tag", "element", "browser", "structure"],
    CSS: ["style", "selector", "flexbox", "grid"],
    JavaScript: ["function", "variable", "object", "array", "promise"],
    React: ["component", "state", "props", "hooks", "jsx"],
    "Node.js": ["server", "runtime", "event", "npm"],
    Express: ["middleware", "route", "request", "response"],
    MongoDB: ["collection", "document", "database"],
    SQL: ["table", "query", "select", "join"],
  };

  const topicKeywords = keywords[topic] || [];

  let score = 0;

  topicKeywords.forEach((word) => {
    if (answer.toLowerCase().includes(word.toLowerCase())) {
      score++;
    }
  });

  if (score >= 3) {
    return "good";
  }

  if (score >= 1) {
    return "average";
  }

  return "poor";
}