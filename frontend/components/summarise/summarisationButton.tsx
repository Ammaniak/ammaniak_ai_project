import { createSummary } from "@/service/flashcardsService";
import { useState } from "react";

type Props = {
  transcript: string;
  OnSummaryGenerated: (summary: string) => void;
};

const TranscriptSummary = ({ transcript, OnSummaryGenerated }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleClick = async () => {
    setLoading(true);
    setError("");
    try {
      const { summary } = await createSummary(transcript);
      OnSummaryGenerated(summary);
    } catch (error) {
      console.error("Error generating summary:", error);
      setError("Error generating summary");
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
      {loading ? "Generating..." : "Generate Summary"}
      {error && <p className="text-red-500">{error}</p>}
    </button>
  );
};
export default TranscriptSummary;
