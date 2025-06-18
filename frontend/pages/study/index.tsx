import Header from "@/components/header";
import DueCards from "@/components/revision/dueCards";
import TranscriptGrid from "@/components/transcripts/TranscriptGrid";
import React from "react";

const Study: React.FC = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-center">Study Room</h1>
          <DueCards />
        </div>
      </div>
    </>
  );
};

export default Study;
