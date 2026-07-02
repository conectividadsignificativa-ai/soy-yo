import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for body parsing
  app.use(express.json());

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // API Route: Secure server-side Gemini API call
  app.post("/api/gemini", async (req, res) => {
    const { message, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      console.error("Missing GEMINI_API_KEY environment variable.");
      return res.status(500).json({ error: "Configuración del servidor incompleta (Falta API Key)" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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

      res.json({ text: response.text || "¡Sigamos!" });
    } catch (error: any) {
      console.error("Error in server-side Gemini call:", error);
      res.status(500).json({ error: "Error al llamar a Gemini: " + error.message });
    }
  });

  // Vite integration as a middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Using Vite middleware in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static files from dist/ in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
