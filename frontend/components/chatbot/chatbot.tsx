import { sendQuestion } from "@/service/chatbotService";
import { useState } from "react";

interface Props {
  transcript: string;
}

const ChatbotWindow = ({ transcript }: Props) => {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: "user" | "bot"; message: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setChatHistory((prev) => [...prev, { role: "user", message: question }]);
    setLoading(true);
    setError("");

    try {
      const answer = await sendQuestion(transcript, question);
      setChatHistory((prev) => [...prev, { role: "bot", message: answer }]);
    } catch (err) {
      setError("Failed to get response.");
    } finally {
      setQuestion("");
      setLoading(false);
    }
  };
  return (
    <div className="w-full max-w-2xl p-6 bg-white rounded-xl shadow border">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Ask the AI Chatbot
      </h2>

      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-gray-100 text-right"
                : "bg-black text-left text-white"
            }`}
          >
            <p>{msg.message}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          className="flex-grow border rounded px-4 py-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about the transcript..."
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded font-medium"
        >
          {loading ? "Asking..." : "Ask"}
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ChatbotWindow;
