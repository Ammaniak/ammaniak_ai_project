const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
const login = async (username: String, email: String) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email }),
    });
    if (!response.ok) {
      throw new Error("Login failed");
    }
    const data = await response.json();
    const userId = data.user_id;
    localStorage.setItem("user_id", userId);
    return data;
  } catch (error) {
    console.error("Error details:", {
      error,
    });
    throw error;
  }
};

export { login };
