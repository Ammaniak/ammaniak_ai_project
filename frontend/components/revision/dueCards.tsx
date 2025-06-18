import { getDueFlashcardsForUser } from "@/service/flashcardsService";
import { useEffect, useState } from "react";
import FlashcardViewer from "../flashcards/flashcards";

const DueCards: React.FC = () => {
  const [dueCards, setDueFlashcards] = useState<
    Array<{ id: number; front: string; back: string }>
  >([]);
  const [cardsAmount, setCardsAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDueFlashcards = async () => {
      setLoading(true);
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        console.error("No user ID found.");
        return;
      }

      try {
        const data = await getDueFlashcardsForUser(userId);

        setDueFlashcards(data);
        setCardsAmount(data.length);
      } catch (error) {
        console.error("Failed to fetch due flashcards", error);
      }
      setLoading(false);
    };
    fetchDueFlashcards();
  }, []);
  if (loading) return <p>Loading your flashcards...</p>;
  if (dueCards.length === 0)
    return <p>🎉 You're all caught up! No flashcards due right now.</p>;

  return (
    <>
      <div>{dueCards && <p>{cardsAmount} cards to study </p>}</div>
      <FlashcardViewer flashcards={dueCards} />
    </>
  );
};

export default DueCards;
