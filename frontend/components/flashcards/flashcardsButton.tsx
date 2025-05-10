import { createFlashcards } from "@/service/flashcardsService";
import { useState } from "react";

type Props = {
  transcript: string;
  onFlashcardsGenerated: (
    flashcards: { front: string; back: string }[]
  ) => void;
};

const GenerateFlashcardsButton = ({
  transcript,
  onFlashcardsGenerated,
}: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      const flashcards = await createFlashcards(transcript);
      onFlashcardsGenerated(flashcards);
    } catch (error) {
      console.error("Error generating flashcards:", error);
      setError("Error generating flashcards");
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
      {loading ? "Generating..." : "Generate Flashcards"}
      {error && <p className="text-red-500">{error}</p>}
    </button>
  );
};
export default GenerateFlashcardsButton;
