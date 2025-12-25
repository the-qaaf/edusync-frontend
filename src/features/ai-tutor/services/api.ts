const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000/api";

export const askAiTutor = async (question: string): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/ai-tutor/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (data.success) {
      return data.data.answer;
    }
    throw new Error(data.message || "Failed to get answer");
  } catch (error) {
    console.error("AI Tutor API Error:", error);
    throw error;
  }
};
