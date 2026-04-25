import { GoogleGenAI } from "@google/genai";

const getApiKey = () => {
  try {
    return (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : null) || "";
  } catch {
    return "";
  }
};

const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function getColombianVibrantResponse(message: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: `
          Eres un asistente conversacional de la OIT y el UNFPA en Colombia. 
          Tu única función es realizar una caracterización de jóvenes interesados en transformación digital. 
          Eres amigable, cercano y usas lenguaje coloquial colombiano moderado.
          
          REGLAS:
          1. Sé BREVE y DIRECTO. Máximo 1-2 frases antes de la siguiente pregunta.
          2. No repitas "¡Bacano!" en cada turno.
          3. Valida la respuesta del usuario de forma natural.
          
          Contexto del Formulario: ${context}
        `,
      }
    });
    
    return response.text || "¡Sigamos!";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return ""; // Return empty to skip if failed
  }
}

