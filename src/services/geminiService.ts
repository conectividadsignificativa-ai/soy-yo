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
        
        Responde con un comentario súper corto (máximo 10 palabras), animado y colombiano. No repitas la pregunta ni digas nada innecesario. Solo una frase de transición bacana.
      `,
    });

    return response.text || "¡Bacano! Sigamos con lo que sigue.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "¡Bacano! Sigamos con lo que sigue.";
  }
}

