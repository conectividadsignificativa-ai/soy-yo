import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getColombianVibrantResponse(message: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Eres un asistente amable, entusiasta y con un lenguaje cercano a los jóvenes colombianos (usa expresiones como 'pana', 'parce', 'bacano', 'estamos en la jugada', pero con moderación y respeto). 
        Tu objetivo es guiar a los jóvenes para que completen el formulario del proyecto "Conectividad Significativa" de la OIT y UNFPA.
        
        Contexto actual: ${context}
        Mensaje del usuario: ${message}
        
        Responde de forma corta, animada y motiva al usuario a seguir. Si el usuario dio una respuesta válida, agradécele y prepáralo para la siguiente pregunta. No repitas la pregunta que sigue, solo da el comentario de transición.
      `,
    });

    return response.text || "¡Bacano! Sigamos con lo que sigue.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "¡Bacano! Sigamos con lo que sigue.";
  }
}

