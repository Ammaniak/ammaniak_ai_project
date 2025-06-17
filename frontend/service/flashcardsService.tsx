const createFlashcards = async (transcript: string) => {
  console.log("Sending transcript:", transcript);
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    console.error("User ID not found in localStorage.");
    throw new Error("User not logged in.");
  }

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/flashcards",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript, user_id: userId }),
      }
    );

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

const createSummary = async (transcript: string) => {
  console.log("Sending transcript:", transcript);

  try {
    const response = await fetch(
      process.env.NEXT_PUBLIC_API_URL + "/summarise",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transcript }),
      }
    );

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
export { createFlashcards, createSummary };
