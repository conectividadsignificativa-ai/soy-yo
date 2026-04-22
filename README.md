# Chatbot Conectividad Significativa 🚀

Este es un chatbot conversacional diseñado para identificar y focalizar beneficiarios del proyecto "Conectividad Significativa" en Colombia (OIT/UNFPA).

## Características
- **Interfaz Amigable**: Diseñada para jóvenes con un lenguaje cercano y vibrante.
- **IA Generativa**: Utiliza Google Gemini para guiar la conversación de forma inteligente.
- **Base de Datos**: Integrado con Firebase Firestore para almacenamiento seguro de respuestas.
- **Responsive**: Funciona perfectamente en dispositivos móviles y escritorio.

## Cómo desplegar en tu propio sitio web

### 1. Exportar a GitHub
Utiliza la función de exportación en AI Studio para llevar este código a tu cuenta de GitHub.

### 2. Hosting (Vercel / Netlify)
La forma más fácil de ponerlo en vivo es:
1. Ve a [Vercel](https://vercel.com) o [Netlify](https://netlify.com).
2. Conecta tu repositorio de GitHub recién creado.
3. Configura las variables de entorno:
   - `GEMINI_API_KEY`: Tu llave de API de Google AI.
4. ¡Listo! Tendrás una URL pública.

### 3. Embeber en un sitio existente
Para que el chatbot aparezca dentro de otra página web, inserta este código HTML:

```html
<iframe 
  src="TU_URL_DE_DESPLIEGUE" 
  width="100%" 
  height="600px" 
  style="border:none; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"
></iframe>
```

## Requisitos de Desarrollo
- Node.js 18+
- Una cuenta de Firebase (configurada en `firebase-applet-config.json`)
- API Key de Gemini
