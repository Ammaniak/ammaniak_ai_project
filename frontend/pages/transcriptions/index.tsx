// pages/transcripts.tsx
import Header from "@/components/header";
import TranscriptGrid from "@/components/transcripts/TranscriptGrid";
import React from "react";

const TranscriptsPage: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">
            My Transcripts
          </h1>
          <TranscriptGrid />
        </div>
      </div>
    </>
  );
};

export default TranscriptsPage;
