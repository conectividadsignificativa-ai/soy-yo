import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { db, auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { QUESTIONS, Question } from './constants/questions';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useState<HTMLDivElement | null>(null)[0];

  useEffect(() => {
    const container = document.querySelector('main');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);
  useEffect(() => {
    const welcome = async () => {
      setIsTyping(true);
      
      // Try to sign in anonymously if needed, but don't block the welcome message
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.warn("Auth hint: Anonymous auth might be disabled in Firebase console.", err);
      }
      
      const welcomeMsg = "¡Hola! Qué bacano que estés por aquí. Soy el asistente de **Conectividad Significativa**. Estamos buscando jóvenes del Caribe y el Pacífico que quieran transformar sus territorios con tecnología. ¿Te animas a contarnos sobre ti? ¡Prometo que es rápido!";
      
      setMessages([
        { id: '1', text: welcomeMsg, sender: 'bot', timestamp: new Date() }
      ]);
      setIsTyping(false);
      setCurrentQuestionIndex(0);
    };
    welcome();
  }, []);

  useEffect(() => {
    if (currentQuestionIndex >= 0 && currentQuestionIndex < QUESTIONS.length) {
      const question = QUESTIONS[currentQuestionIndex];
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), text: question.text, sender: 'bot', timestamp: new Date() }
      ]);
    } else if (currentQuestionIndex === QUESTIONS.length) {
      handleComplete();
    }
  }, [currentQuestionIndex]);

  const handleComplete = async () => {
    setIsTyping(true);
    try {
      const submissionId = crypto.randomUUID();
      await setDoc(doc(db, 'submissions', submissionId), {
        ...answers,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || 'anonymous'
      });
      
      const finalMsg = "¡Excelente, parce! Ya tenemos toda tu información. Tus datos están guardados de forma segura. Pronto nos pondremos en contacto contigo para seguir construyendo esta red de transformación digital. ¡Estamos en la jugada! 🚀";
      setMessages(prev => [...prev, { id: 'end', text: finalMsg, sender: 'bot', timestamp: new Date() }]);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Huy, tuvimos un pequeño problema al guardar tus datos. ¿Podrías intentarlo de nuevo?");
    }
    setIsTyping(false);
  };

  const handleSend = async (val?: string) => {
    if (isTyping) return; // Prevent spamming while bot is thinking
    
    const text = val || inputValue;
    if (!text.trim()) return;

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    
    // Add user message to UI
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'user', timestamp: new Date() }]);
    setInputValue('');
    
    // Save answer
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: text }));
    
    // Move to next question immediately
    setCurrentQuestionIndex(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
      <div id="chat-container" className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-slate-100">
        
        {/* Header */}
        <header className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl shadow-inner">
                <img 
                  src="logo.png" 
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
                />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Conectividad Significativa</h1>
                <p className="text-blue-100 text-xs">Transformando territorios</p>
              </div>
            </div>
            <Bot className="w-5 h-5 text-blue-200" />
          </div>
          <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              className="bg-yellow-400 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, (currentQuestionIndex / QUESTIONS.length) * 100)}%` }}
            />
          </div>
        </header>


        {/* Message Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-5 scroll-smooth">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.sender === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm overflow-hidden",
                msg.sender === 'bot' ? "bg-white border border-slate-100" : "bg-blue-600 text-white"
              )}>
                {msg.sender === 'bot' ? (
                  <img 
                    src="logo.png" 
                    alt="Bot"
                    className="w-7 h-7 object-contain"
                    onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                msg.sender === 'bot' 
                  ? "bg-slate-100 text-gray-800 rounded-tl-none border border-slate-200 shadow-sm" 
                  : "bg-blue-600 text-white rounded-tr-none shadow-md"
              )}>
                <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-3 mr-auto max-w-[85%]">
              <div className="w-9 h-9 rounded-full bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                <img 
                  src="logo.png" 
                  alt="Typing"
                  className="w-7 h-7 object-contain animate-pulse"
                  onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
                />
              </div>
              <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                <span className="text-xs text-gray-500 italic">Escribiendo...</span>
              </div>
            </div>
          )}
        </main>

        {/* Action Area */}
        <footer className="p-4 bg-white border-t border-slate-100">
          {!isComplete && currentQuestionIndex >= 0 && currentQuestionIndex < QUESTIONS.length && (
            <div className="space-y-3">
              <QuestionInput 
                question={QUESTIONS[currentQuestionIndex]}
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend}
                disabled={isTyping} 
              />
            </div>
          )}
          {isComplete && (
            <div className="text-center py-4 text-green-600 font-medium flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              ¡Proceso terminado con éxito!
            </div>
          )}
          {error && (
            <div className="mt-2 p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}

interface QuestionInputProps {
  question: Question;
  value: string;
  onChange: (val: string) => void;
  onSend: (val?: string) => void;
  disabled: boolean;
}

function QuestionInput({ question, value, onChange, onSend, disabled }: QuestionInputProps) {
  if (question.type === 'select' || question.type === 'multi-select') {
    return (
      <div className="grid grid-cols-1 gap-2">
        {question.options?.map((opt) => (
          <button
            key={opt}
            onClick={() => onSend(opt)}
            disabled={disabled}
            className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm text-gray-700 flex items-center justify-between group"
          >
            {opt}
            <Send className="w-4 h-4 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <input
        type={question.type === 'date' ? 'date' : question.type === 'number' ? 'number' : 'text'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder={question.placeholder || "Escribe tu respuesta aquí..."}
        disabled={disabled}
        className="w-full pl-4 pr-12 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all bg-slate-50 text-sm"
      />
      <button
        onClick={() => onSend()}
        disabled={disabled || !value.trim()}
        className={cn(
          "absolute right-2 p-2 rounded-xl transition-all",
          value.trim() ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "bg-slate-200 text-slate-400 cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

