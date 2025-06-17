// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import FlashcardViewer from "@/components/flashcards/flashcards";
// import GenerateChatbotButton from "@/components/chatbot/chatbotButton";
// import TranscriptSummary from "@/components/summarise/summarisationButton";
// import { getTranscriptById } from "@/service/transcriptionService";
// import { getFlashcardsByTranscriptId } from "@/service/flashcardsService";

// const TranscriptDetailPage = () => {
//   const router = useRouter();
//   const { id } = router.query;
//   const [transcript, setTranscript] = useState<string>("");
//   const [flashcards, setFlashcards] = useState<
//     Array<{ front: string; back: string }>
//   >([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!id) return;

//       try {
//         const transcriptData = await getTranscriptById(id as string);
//         const flashcardsData = await getFlashcardsByTranscriptId(id as string);
//         setTranscript(transcriptData.content);
//         setFlashcards(flashcardsData.flashcards);
//         setLoading(false);
//       } catch (err) {
//         console.error("Failed to load transcript:", err);
//       }
//     };

//     fetchData();
//   }, [id]);

//   if (loading) return <p>Loading transcript...</p>;

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <h1 className="text-3xl font-bold mb-4">Transcript Details</h1>
//       <p className="mb-6 text-gray-700 whitespace-pre-line">{transcript}</p>

//       <div className="flex gap-4 mb-8">
//         <TranscriptSummary
//           transcript={transcript}
//           OnSummaryGenerated={() => {}}
//         />
//         <GenerateChatbotButton transcript={transcript} />
//       </div>

//       <h2 className="text-2xl font-semibold mt-8 mb-4">Flashcards</h2>
//       <FlashcardViewer flashcards={flashcards} />
//     </div>
//   );
// };

// export default TranscriptDetailPage;
