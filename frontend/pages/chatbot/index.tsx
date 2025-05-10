import Head from "next/head";
import { useEffect, useState } from "react";
import ChatbotWindow from "@/components/chatbot/chatbot";

const Chatbot: React.FC = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const savedTranscript = localStorage.getItem("transcript");
    if (savedTranscript) {
      setTranscript(savedTranscript);
    } else {
      setError("No transcript found. Please upload a file first.");
    }
    setIsLoading(false);
  }, []);

  return (
    <>
      <Head>
        <title>Chatbot</title>
      </Head>

      <main className="flex flex-col items-center justify-center min-h-screen p-4">
        {error && <p className="text-red-500">{error}</p>}
        {isLoading ? (
          <p>Loading transcript...</p>
        ) : (
          <section className="w-full max-w-3xl">
            <ChatbotWindow transcript={transcript} />
          </section>
        )}
      </main>
    </>
  );
};

export default Chatbot;
