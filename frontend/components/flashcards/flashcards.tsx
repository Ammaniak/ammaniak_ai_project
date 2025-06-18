import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { logFlashcardInteraction } from "@/service/flashcardsService"; // ✅ use service

interface Flashcard {
  id: number;
  front: string;
  back: string;
}

interface Props {
  flashcards: Flashcard[];
}

const FlashcardViewer: React.FC<Props> = ({ flashcards }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [flipCount, setFlipCount] = useState(0);

  useEffect(() => {
    setStartTime(new Date());
    setFlipCount(0);
  }, [current]);

  if (!flashcards || flashcards.length === 0) return null;

  const currentCard = flashcards[current];

  const handleRateAndNext = async (difficulty: number) => {
    const userId = localStorage.getItem("user_id");

    if (!startTime || !userId) return;

    const timeSpentSeconds = Math.floor(
      (new Date().getTime() - startTime.getTime()) / 1000
    );

    try {
      await logFlashcardInteraction({
        flashcard_id: currentCard.id,
        user_id: userId,
        time_spent_seconds: timeSpentSeconds,
        difficulty_rating: difficulty,
        flips: flipCount,
        start_time: startTime.toISOString(),
      });
    } catch (error) {
      console.error("Interaction logging failed:", error);
    }
    console.log("Sending interaction:", {
      flashcard_id: currentCard.id,
      user_id: userId,
      time_spent_seconds: timeSpentSeconds,
      difficulty_rating: difficulty,
      flips: flipCount,
      start_time: startTime.toISOString(),
    });
    setCurrent((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrent((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-6 text-center perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={current + (flipped ? "-back" : "-front")}
          initial={{ rotateY: flipped ? -180 : 180, opacity: 0 }}
          animate={{ rotateY: 0, opacity: 1 }}
          exit={{ rotateY: flipped ? 180 : -180, opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ transformStyle: "preserve-3d" }}
          className="w-full h-64 flex items-center justify-center rounded-xl 
                     shadow-lg bg-white cursor-pointer text-xl p-8 
                     border-2 border-mustard hover:border-lightBlue 
                     transition-colors duration-300"
          onClick={() => {
            setFlipped(!flipped);
            setFlipCount((prev) => {
              const updated = prev + 1;
              console.log("Flips updated to:", updated); // ✅ DEBUG
              return updated;
            });
          }}
        >
          <div className="w-full text-center">
            <p className="font-medium text-gray-800">
              {flipped ? currentCard.back : currentCard.front}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-between items-center">
        <button
          onClick={prevCard}
          className="bg-mustard hover:bg-lightBlue text-gray-800 hover:text-white 
                     px-6 py-2 rounded-lg transition-colors duration-300 
                     font-medium shadow-md"
        >
          ← Previous
        </button>
        <span className="text-gray-600">
          Card {current + 1} of {flashcards.length}
        </span>
      </div>

      <div className="mt-4 flex justify-center gap-2 bg-black">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRateAndNext(rating)}
            className="bg-lightBlue text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
          >
            {rating}
          </button>
        ))}
      </div>

      <p className="mt-2 text-sm text-gray-500">
        Click card to flip. Rate difficulty 1–5 to move on.
      </p>
    </div>
  );
};

export default FlashcardViewer;
