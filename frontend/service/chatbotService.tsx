const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

const sendQuestion = async (transcript: string, question: string) => {
  try {
    const response = await fetch(`${API_URL}/chatbot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, question }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error("Chatbot response failed");
    }
    console.log("Received chatbot response:", data);
    return data.answer;
  } catch (error) {
    console.error("Error sending question:", error);
    throw error;
  }
};
export { sendQuestion };
