// pages/transcriptions/[id].tsx
import FlashcardViewer from "@/components/flashcards/flashcards";
import GenerateFlashcardsButton from "@/components/flashcards/flashcardsButton";
import TranscriptSummary from "@/components/summarise/summarisationButton";
import { getFlashcardsForTranscript } from "@/service/flashcardsService";
import { getTranscriptById } from "@/service/transcriptionService";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface Transcript {
  id: number;
  content: string;
  created_at: string;
}
interface SummaryResponse {
  summary: string;
}

const TranscriptPage = () => {
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [loading, setLoading] = useState(true);
  const [flashcards, setFlashcards] = useState<
    Array<{ id: number; front: string; back: string }>
  >([]);
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!id) return;
      try {
        const data = await getTranscriptById(id as string);
        setTranscript(data);

        const flashcardData = await getFlashcardsForTranscript(id as string);

        setFlashcards(flashcardData);
      } catch (error) {
        console.error("Error fetching transcript:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [id]);

  const handleFlashcardGeneration = (
    cards: Array<{ id: number; front: string; back: string }>
  ) => {
    console.log("Flashcards received:", cards);
    setFlashcards(cards);
  };
  const handleSummaryGeneration = (summary: string) => {
    console.log("Summary received:", summary);
    setSummary({ summary });
  };

  if (loading) return <p>Loading...</p>;
  if (!transcript) return <p>Transcript not found.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Transcript Details</h1>
      <p className="text-sm text-gray-500 mb-6">
        Uploaded on: {new Date(transcript.created_at).toLocaleString("en-GB")}
      </p>
      <div className="bg-white border rounded-lg shadow p-4 whitespace-pre-wrap">
        {transcript.content}
      </div>
      <div className="flex gap-4 mb-8 py-10">
        {Array.isArray(flashcards) && flashcards.length === 0 && (
          <GenerateFlashcardsButton
            transcript={transcript.content}
            onFlashcardsGenerated={handleFlashcardGeneration}
          />
        )}
        {!summary && (
          <TranscriptSummary
            transcript={transcript.content}
            OnSummaryGenerated={handleSummaryGeneration}
          />
        )}
      </div>
      {summary && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-mustard">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Summary</h3>
          <p className="text-gray-600 leading-relaxed">{summary.summary}</p>
        </div>
      )}
      {Array.isArray(flashcards) && flashcards.length > 0 && (
        <div className="mt-8 w-full max-w-3xl">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">
            Flashcards
          </h3>
          <FlashcardViewer flashcards={flashcards} />
          <Link
            className="bg-black text-white font-bold py-2 px-4 rounded"
            href="/study"
          >
            Study Flashcards
          </Link>
        </div>
      )}
    </div>
  );
};

export default TranscriptPage;
