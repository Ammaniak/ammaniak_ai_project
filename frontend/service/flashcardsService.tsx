const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

const createFlashcards = async (transcript: string) => {
  console.log("Sending transcript:", transcript);
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    console.error("User ID not found in localStorage.");
    throw new Error("User not logged in.");
  }

  try {
    const response = await fetch(API_URL + "/flashcards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript, user_id: userId }),
    });

    if (!response.ok) {
      throw new Error("Flashcard generation failed");
    }

    const data = await response.json();
    console.log("Received flashcards:", data.flashcards); // 👈 Log here
    return data.flashcards;
  } catch (error) {
    console.error("Error getting flashcards:", error);
    throw error;
  }
};

const getFlashcardsForTranscript = async (transcript_id: string) => {
  const response = await fetch(`${API_URL}/flashcards/${transcript_id}`);
  if (!response.ok) {
    throw new Error("Flashcard fetch failed");
  }
  const data = await response.json();
  console.log("Received flashcards: ", data);
  return data;
};

const getDueFlashcardsForUser = async (userId: string) => {
  try {
    const response = await fetch(API_URL + `/study/${userId}`);
    if (!response.ok) {
      throw new Error("Flashcard fetch failed");
    }
    const data = await response.json();
    console.log("Received flashcards: ", data);
    return data;
  } catch (error) {
    console.error("Error getting due flashcards:", error);
  }
};

const createSummary = async (transcript: string) => {
  console.log("Sending transcript:", transcript);

  try {
    const response = await fetch(API_URL + "/summarise", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      throw new Error("Summary generation failed");
    }

    const data = await response.json();
    console.log("Received summary:", data);
    return data;
  } catch (error) {
    console.error("Error getting summary:", error);
    throw error;
  }
};

const logFlashcardInteraction = async ({
  flashcard_id,
  user_id,
  time_spent_seconds,
  flips,
  difficulty_rating,
  start_time,
}: {
  flashcard_id: number;
  user_id: string;
  time_spent_seconds: number;
  flips?: number;
  difficulty_rating: number;
  start_time: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/flashcard_interactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        flashcard_id,
        user_id,
        time_spent_seconds,
        flips,
        difficulty_rating,
        start_time,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to log flashcard interaction");
    }

    console.log("Interaction logged:", {
      flashcard_id,
      time_spent_seconds,
      difficulty_rating,
    });
  } catch (error) {
    console.error("Error logging interaction:", error);
    throw error;
  }
};

export {
  createFlashcards,
  createSummary,
  getFlashcardsForTranscript,
  logFlashcardInteraction,
  getDueFlashcardsForUser,
};
