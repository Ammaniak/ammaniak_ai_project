import { getTranscripts } from "@/service/transcriptionService";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Transcript = {
  id: number;
  content: string;
  created_at: string;
};

const TranscriptGrid: React.FC = () => {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTranscripts = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("No user ID found.");
        setLoading(false);
        return;
      }

      try {
        const data = await getTranscripts(userId);
        setTranscripts(data);
      } catch (error) {
        console.error("Failed to fetch transcripts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscripts();
  }, []);

  if (loading)
    return <p className="text-center mt-10">Loading transcripts...</p>;

  if (transcripts.length === 0)
    return <p className="text-center mt-10">No transcripts found.</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Your Transcripts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transcripts.map((t) => (
          <Link key={t.id} href={`/transcriptions/${t.id}`}>
            <div className="p-4 border rounded-lg shadow bg-white hover:shadow-md transition cursor-pointer">
              <p className="text-sm text-gray-500 mb-2">
                {new Date(t.created_at).toLocaleString()}
              </p>
              <p className="text-gray-800 text-sm line-clamp-5">{t.content}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TranscriptGrid;
