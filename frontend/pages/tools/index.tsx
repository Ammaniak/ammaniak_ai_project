import GenerateChatbotButton from "@/components/chatbot/chatbotButton";
import FlashcardViewer from "@/components/flashcards/flashcards";
import GenerateFlashcardsButton from "@/components/flashcards/flashcardsButton";
import Header from "@/components/header";
import TranscriptSummary from "@/components/summarise/summarisationButton";
import UploadWindow from "@/components/upload/UploadWindow";
import { uploadFile } from "@/service/transcriptionService";
import Head from "next/head";
import { useState } from "react";
interface SummaryResponse {
  summary: string;
}

const Home = () => {
  const [transcript, setTranscript] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [flashcards, setFlashcards] = useState<
    Array<{ front: string; back: string }>
  >([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);

  const handleFileUpload = async (file: File) => {
    console.log("File uploaded:", file);
    try {
      setIsLoading(true);
      setError("");
      const transcription = await uploadFile(file);
      setTranscript(transcription);
      localStorage.setItem("transcript", transcription);
      setIsLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Error uploading file");
    }
  };

  const handleFlashcardGeneration = (
    cards: Array<{ front: string; back: string }>
  ) => {
    console.log("Flashcards received:", cards);
    setFlashcards(cards);
  };

  const handleSummaryGeneration = (summary: string) => {
    console.log("Summary received:", summary);
    setSummary({ summary });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white">
        <Head>
          <title>Audio Transcription App</title>
          <meta name="description" content="Convert your audio to text" />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="flex flex-col items-center gap-8 p-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome to Audio Transcriber
          </h1>

          {error && <p className="text-red-500">{error}</p>}
          {isLoading && (
            <p className="text-gray-600">
              Processing your file, this might take a few minutes...
            </p>
          )}

          <div className="w-full max-w-2xl">
            <UploadWindow onFileUpload={handleFileUpload} />
          </div>

          {transcript && (
            <div className="w-full max-w-3xl">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Transcription
              </h2>
              <p className="text-gray-600 mb-4">{transcript}</p>

              <div className="flex gap-4 mb-8">
                <GenerateFlashcardsButton
                  transcript={transcript}
                  onFlashcardsGenerated={handleFlashcardGeneration}
                />
                <TranscriptSummary
                  transcript={transcript}
                  OnSummaryGenerated={handleSummaryGeneration}
                />
                <GenerateChatbotButton transcript={transcript} />
              </div>

              {summary && (
                <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-mustard">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Summary
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {summary.summary}
                  </p>
                </div>
              )}

              {flashcards.length > 0 && (
                <div className="mt-8 w-full max-w-3xl">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Flashcards
                  </h3>
                  <FlashcardViewer flashcards={flashcards} />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default Home;
