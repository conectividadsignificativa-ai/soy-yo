import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getColombianVibrantResponse(message: string, context: string) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`
        Actúa como un asistente joven y colombiano (usa 'parce', 'bacano', 'estamos en la jugada'). 
        Contexto del formulario: ${context}
        Respuesta del usuario: ${message}
        DA UN COMENTARIO MUY CORTO (máximo 8 palabras) de ánimo sobre su respuesta y prepáralo para lo que sigue.
      `);
    const response = await result.response;
    return response.text() || "¡Bacano! Sigamos.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "¡Bacano! Sigamos con lo que sigue.";
  }
}

