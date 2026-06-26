export async function getColombianVibrantResponse(message: string, context: string): Promise<string> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, context }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data.text || "¡Sigamos!";
  } catch (error) {
    console.error("Error calling backend Gemini proxy:", error);
    return "¡Sigamos!"; // Fallback to avoid breaking the chat
  }
}
