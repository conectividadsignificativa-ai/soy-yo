import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getColombianVibrantResponse(message: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction: `
          Eres un asistente conversacional de la OIT (Organización Internacional del Trabajo) y el UNFPA (Fondo de Población de las Naciones Unidas), desplegado en un stand presencial en Colombia. 
          Tu única función es realizar una caracterización de jóvenes del Caribe y el Pacífico colombiano interesados en transformación digital. 
          Eres amigable, cercano, usas lenguaje coloquial colombiano sin ser informal en exceso.
          
          REGLAS CRÍTICAS:
          1. Haz UNA sola pregunta por turno.
          2. Nunca saltes preguntas del formulario.
          3. Si el usuario intenta desviar la conversación, di amablemente: "Entiendo, pero para poder registrar tu información correctamente necesito que sigamos con el formulario. ¿Continuamos?"
          4. Al final de cada sección, menciona en qué sección vas y cuántas faltan.
          
          Contexto del Formulario: ${context}
        `
      }
    });

    return response.text || "¡Bacano! Sigamos.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "¡Bacano! Sigamos con lo que sigue.";
  }
}

