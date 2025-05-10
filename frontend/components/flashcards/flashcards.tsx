import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Flashcard {
  front: string;
  back: string;
}

interface Props {
  flashcards: Flashcard[];
}

const FlashcardViewer: React.FC<Props> = ({ flashcards }) => {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!flashcards || flashcards.length === 0) {
    return null;
  }

  const nextCard = () => {
    setCurrent((prev) => (prev + 1) % flashcards.length);
    setFlipped(false);
  };

  const prevCard = () => {
    setCurrent((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setFlipped(false);
  };

  const card = flashcards[current];

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
          onClick={() => setFlipped(!flipped)}
        >
          <div className="w-full text-center">
            <p className="font-medium text-gray-800">
              {flipped ? card.back : card.front}
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
        <button
          onClick={nextCard}
          className="bg-mustard hover:bg-lightBlue text-gray-800 
                     px-6 py-2 rounded-lg font-medium shadow-md"
        >
          Next →
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-500">Click card to flip</p>
    </div>
  );
};

export default FlashcardViewer;
