const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
console.log("Attempting to connect to:", API_URL); // Debug log

const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData,
      mode: "cors",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data.transcription;
  } catch (error) {
    console.error("Error details:", {
      error,
    });
    throw error;
  }
};

export { uploadFile };
