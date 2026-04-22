# Chatbot Conectividad Significativa 🚀

Este es un chatbot conversacional diseñado para identificar y focalizar beneficiarios del proyecto "Conectividad Significativa" en Colombia (OIT/UNFPA).

## Características
- **Interfaz Amigable**: Diseñada para jóvenes con un lenguaje cercano y vibrante.
- **IA Generativa**: Utiliza Google Gemini para guiar la conversación de forma inteligente.
- **Base de Datos**: Integrado con Firebase Firestore para almacenamiento seguro de respuestas.
- **Responsive**: Funciona perfectamente en dispositivos móviles y escritorio.

## Despliegue en GitHub Pages (Automático)

Este proyecto está configurado para desplegarse automáticamente usando **GitHub Actions**. No necesitas instalar nada en tu computador.

### Pasos para activar la web:
1. **Exportar**: Usa el menú *Settings > Export to GitHub* en AI Studio.
2. **Subir el Logo**: 
   - En tu repositorio de GitHub, haz clic en **Add file > Upload files**.
   - Sube la imagen de tu logo y cámbiale el nombre a `logo.png` (debe quedar en la raíz del repositorio).
3. **Configurar GitHub Pages**:
   - En tu repo de GitHub, ve a **Settings > Pages**.
   - En *Build and deployment > Source*, selecciona **GitHub Actions**.
3. **Agregar API Key**:
   - Ve a **Settings > Secrets and variables > Actions**.
   - Crea un **New repository secret** llamado `GEMINI_API_KEY` con tu llave de Google AI.
4. **Ver tu sitio**: 
   - Ve a la pestaña **Actions** en tu repo. Verás un proceso llamado "Deploy to GitHub Pages".
   - Cuando termine (se ponga en verde), tu sitio estará vivo en `https://tu-usuario.github.io/tu-repo/`.

## Software Libre
Este proyecto utiliza tecnologías 100% de código abierto:
- **React 19**
- **Vite**
- **Tailwind CSS**
- **Lucide Icons**
- **Motion**
