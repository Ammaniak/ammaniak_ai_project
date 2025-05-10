import { useRouter } from "next/router";
import { useState } from "react";

type Props = {
  transcript: string;
};

const GenerateChatbotButton = ({ transcript }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5050/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, question: "Hello" }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate chatbot.");
      }
      router.push("/chatbot");
    } catch (err) {
      console.error("Error initiating chatbot:", err);
      setError("Failed to start chatbot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="bg-black text-white font-bold py-2 px-4 rounded"
      disabled={loading}
    >
      {loading ? "Loading..." : "Chat with AI"}
      {error && <p className="text-red-500">{error}</p>}
    </button>
  );
};

export default GenerateChatbotButton;
