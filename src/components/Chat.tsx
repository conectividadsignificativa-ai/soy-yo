import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, Loader2, Sparkles, AlertCircle, LayoutDashboard, Trophy, Star, Target, Award } from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { QUESTIONS, Question } from '../constants/questions';
import { getColombianVibrantResponse } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Link } from 'react-router-dom';
import { BADGES, calculateLevel, Badge } from '../types/gamification';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  timestamp: Date;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Gamification State
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [showBadgePopup, setShowBadgePopup] = useState<Badge | null>(null);

  useEffect(() => {
    const container = document.querySelector('main');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const welcome = async () => {
      setIsTyping(true);
      
      try {
        if (!auth.currentUser) {
          const userCred = await signInAnonymously(auth);
          // Load user profile if exists
          const profileDoc = await getDoc(doc(db, 'profiles', userCred.user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setPoints(data.points || 0);
            setLevel(calculateLevel(data.points || 0));
            setEarnedBadges(data.badges || []);
          } else {
            // New profile
            await setDoc(doc(db, 'profiles', userCred.user.uid), {
              points: 0,
              badges: [],
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (err: any) {
        console.warn("Auth hint: Anonymous auth might be disabled.", err);
        if (err.code === 'auth/admin-restricted-operation') {
          setError("Error de configuración: El inicio de sesión anónimo está desactivado en Firebase. Por favor actívalo en la consola de Firebase (Authentication > Sign-in method).");
        }
      }
      
      const welcomeMsg = `Hola. Gracias por participar. Te haré algunas preguntas para conocer tu acceso, uso y necesidades en transformación digital. Empezamos.`;
      
      setMessages([
        { id: '1', text: welcomeMsg, sender: 'bot', timestamp: new Date() }
      ]);
      setIsTyping(false);
      setCurrentQuestionIndex(-1); // -1 means waiting for confirmation
    };
    welcome();
  }, []);

  const getNextApplicableQuestionIndex = (startIndex: number, currentAnswers: Record<string, any>) => {
    let nextIndex = startIndex;
    while (nextIndex < QUESTIONS.length) {
      const q = QUESTIONS[nextIndex];
      // Note: we check the condition using the variables stored in currentAnswers
      if (!q.condition || q.condition(currentAnswers)) {
        return nextIndex;
      }
      nextIndex++;
    }
    return nextIndex;
  };

  const handleSend = async (val?: string) => {
    const text = val || inputValue;
    if (!text.trim()) return;

    const messageId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setMessages(prev => [...prev, { id: messageId, text, sender: 'user', timestamp: new Date() }]);
    setInputValue('');

    // If waiting for confirmation
    if (currentQuestionIndex === -1) {
      const firstIdx = getNextApplicableQuestionIndex(0, {});
      setCurrentQuestionIndex(firstIdx);
      const q = QUESTIONS[firstIdx];
      setMessages(prev => [...prev, { id: `bot-${Date.now()}`, text: q.text, sender: 'bot', timestamp: new Date() }]);
      return;
    }

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    
    // Validate email if it's p3
    if (currentQuestion.variable === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(text)) {
        setMessages(prev => [...prev, { id: `err-${Date.now()}`, text: "Por favor, ingresa un correo electrónico válido.", sender: 'bot', timestamp: new Date() }]);
        return;
      }
    }

    const newAnswers = { ...answers, [currentQuestion.variable]: text };
    setAnswers(newAnswers);
    
    setIsTyping(true);
    
    try {
      const nextIdx = getNextApplicableQuestionIndex(currentQuestionIndex + 1, newAnswers);
      const isLast = nextIdx >= QUESTIONS.length;
      
      const currentSection = currentQuestion.section;
      const nextSection = isLast ? null : QUESTIONS[nextIdx].section;
      const sectionChanged = nextSection && nextSection !== currentSection;

      // Award points and badges based on section completion
      let pointsAwarded = 0;
      let badgeToAward: Badge | null = null;

      if (sectionChanged || isLast) {
        const sectionToBadgeMap: Record<string, string> = {
          'Información Básica': 'perfil_creado',
          'Uso de Internet': 'explorador_digital',
          'Habilidades Digitales': 'aprendiz_digital',
          'Acceso y Conectividad': 'conectado',
          'Riesgos Digitales': 'navegante_consciente',
          'Áreas de Interés': 'rumbo_digital',
          'Empleabilidad Digital': 'talento_digital',
          'Emprendimiento Digital': 'constructor_ideas',
          'Política Digital': 'voz_ciudadana'
        };

        const bid = sectionToBadgeMap[currentSection];
        if (bid && !earnedBadges.includes(bid)) {
          badgeToAward = BADGES.find(b => b.id === bid) || null;
        }

        // Special case for IA after P25
        if (currentQuestion.variable === 'uso_ia' || currentQuestion.variable === 'uso_ia_para') {
          if (newAnswers.uso_ia === 'si' && !earnedBadges.includes('explorador_ia')) {
            badgeToAward = BADGES.find(b => b.id === 'explorador_ia') || null;
          }
        }

        if (isLast && !earnedBadges.includes('agente_transformacion')) {
          badgeToAward = BADGES.find(b => b.id === 'agente_transformacion') || null;
        }
      }

      if (badgeToAward) {
        pointsAwarded = badgeToAward.points;
        const newPoints = points + pointsAwarded;
        setPoints(newPoints);
        setLevel(calculateLevel(newPoints));
        setEarnedBadges(prev => [...prev, badgeToAward!.id]);
        setShowBadgePopup(badgeToAward);

        const badgeMsg = `${badgeToAward.description}\n\n**+${pointsAwarded} puntos**\nSigues avanzando 💪\nVamos muy bien 🚀`;
        setMessages(prev => [...prev, { id: `badge-msg-${Date.now()}`, text: badgeMsg, sender: 'bot', timestamp: new Date() }]);

        if (auth.currentUser) {
          updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
            points: increment(pointsAwarded),
            badges: arrayUnion(badgeToAward.id)
          }).catch(console.error);
        }
      } else {
        // Base points per question
        const basePoints = 5;
        const newPoints = points + basePoints;
        setPoints(newPoints);
        setLevel(calculateLevel(newPoints));
        if (auth.currentUser) {
          updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
            points: increment(basePoints)
          }).catch(console.error);
        }
      }

      // Get AI's version of the question or transition
      let prompt = `El usuario respondió: "${text}" a la pregunta "${currentQuestion.text}".`;
      
      if (!isLast) {
        const nextQ = QUESTIONS[nextIdx];
        prompt += ` La siguiente pregunta es: "${nextQ.text}" de la sección "${nextQ.section}".`;
      } else {
        prompt += " Ya terminamos todas las preguntas. Despídete amablemente diciendo: “Gracias por completar la encuesta. Tu participación es muy importante para fortalecer iniciativas de transformación digital.”";
      }

      const vibeResponse = await getColombianVibrantResponse(prompt, `Sección actual: ${currentQuestion.section}. Preguntas totales: ${QUESTIONS.length}`);
      
      if (!isLast) {
        const nextQ = QUESTIONS[nextIdx];
        // Combine vibe with question to reduce bubble noise
        const combinedText = vibeResponse 
          ? `${vibeResponse}\n\n**${nextQ.text}**`
          : nextQ.text;
          
        setMessages(prev => [...prev, { 
          id: `bot-${nextIdx}-${Date.now()}`, 
          text: combinedText, 
          sender: 'bot', 
          timestamp: new Date() 
        }]);
        setCurrentQuestionIndex(nextIdx);
      } else {
        if (vibeResponse) {
          setMessages(prev => [...prev, { 
            id: `bot-final-vibe-${Date.now()}`, 
            text: vibeResponse, 
            sender: 'bot', 
            timestamp: new Date() 
          }]);
        } else {
          setMessages(prev => [...prev, { 
            id: `bot-final-def-${Date.now()}`, 
            text: "Gracias por completar la encuesta. Tu participación es muy importante para fortalecer iniciativas de transformación digital.", 
            sender: 'bot', 
            timestamp: new Date() 
          }]);
        }
        setCurrentQuestionIndex(QUESTIONS.length);
        handleComplete(newAnswers);
      }
    } catch (err) {
      console.warn("AI logic error, falling back", err);
      // Fallback: manual next question
      const nextIdx = getNextApplicableQuestionIndex(currentQuestionIndex + 1, newAnswers);
      if (nextIdx < QUESTIONS.length) {
        setMessages(prev => [...prev, { 
          id: `bot-fallback-${nextIdx}-${Date.now()}`, 
          text: QUESTIONS[nextIdx].text, 
          sender: 'bot', 
          timestamp: new Date() 
        }]);
        setCurrentQuestionIndex(nextIdx);
      } else {
        setCurrentQuestionIndex(QUESTIONS.length);
        handleComplete(newAnswers);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleComplete = async (finalAnswers: Record<string, any>) => {
    setIsTyping(true);
    try {
      const submissionId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
        
      await setDoc(doc(db, 'submissions', submissionId), {
        ...finalAnswers,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || 'anonymous'
      });
      
      // Build summary
      let summaryText = "✅ ¡Listo! Tu participación es muy importante para fortalecer iniciativas de transformación digital. Aquí está el resumen de lo que registré:\n\n";
      
      const sections = Array.from(new Set(QUESTIONS.map(q => q.section)));
      sections.forEach(section => {
        const qInSection = QUESTIONS.filter(q => q.section === section && finalAnswers[q.variable]);
        if (qInSection.length > 0) {
          summaryText += `**${section.toUpperCase()}**\n`;
          qInSection.forEach(q => {
            summaryText += `- ${q.text.split('?')[0]}?: ${finalAnswers[q.variable]}\n`;
          });
          summaryText += "\n";
        }
      });

      summaryText += "\nLa información que compartiste será tratada de forma confidencial por la OIT y el UNFPA, conforme a la Política de Privacidad de las Naciones Unidas: https://www.un.org/es/about-us/privacy-notice";

      setMessages(prev => [...prev, { id: 'end', text: summaryText, sender: 'bot', timestamp: new Date() }]);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Huy, tuvimos un pequeño problema al guardar tus datos. ¿Podrías intentarlo de nuevo?");
    }
    setIsTyping(false);
  };

  const handleReset = () => {
    setMessages([{ id: '1', text: "Hola. Gracias por participar. Te haré algunas preguntas para conocer tu acceso, uso y necesidades en transformación digital. Empezamos.", sender: 'bot', timestamp: new Date() }]);
    setCurrentQuestionIndex(-1);
    setAnswers({});
    setInputValue('');
    setIsComplete(false);
    setPoints(0);
    setLevel(1);
    setEarnedBadges([]);
    setShowBadgePopup(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex md:w-[25%] lg:w-[20%] flex-col bg-white border-r border-slate-200 overflow-y-auto">
        <div className="p-8 flex flex-col items-center text-center gap-6">
          <div className="w-32 h-32 bg-slate-50 rounded-3xl flex items-center justify-center p-4 shadow-inner ring-1 ring-slate-100">
            <img 
              src="logo.png" 
              alt="Logo"
              className="w-full h-full object-contain"
              onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Red de Jóvenes</h2>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Conectividad Significativa</p>
          </div>
          
          <div className="w-full h-px bg-slate-100 my-2" />
          
          <div className="text-left space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Acerca de</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Iniciativa de la OIT y el UNFPA para fortalecer las habilidades y oportunidades digitales de las juventudes en el Caribe y el Pacífico colombiano.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <h3 className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-1">Aviso de Privacidad</h3>
              <p className="text-[10px] text-blue-700 leading-relaxed">
                Tus datos son privados y se usarán únicamente para fines estadísticos y de conexión con oportunidades de formación.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-auto p-6 border-t border-slate-100 italic text-[10px] text-gray-400 text-center">
          © 2024 OIT & UNFPA Colombia
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="md:hidden bg-slate-50 p-1.5 rounded-xl border border-slate-100">
              <img 
                src="logo.png" 
                alt="Logo"
                className="w-6 h-6 object-contain"
                onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
              />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Caracterización Digital</h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Nivel {level}</span>
                <div className="w-20 bg-slate-100 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-yellow-400 h-full" 
                    initial={{ width: 0 }}
                    animate={{ width: `${points % 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-xs font-black text-slate-700">{points} pts</span>
            </div>
            <Link to="/stats" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Ver Estadísticas">
                <LayoutDashboard className="w-5 h-5" />
            </Link>
          </div>

          {/* Progress Bar Fixed at bottom of header */}
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-50">
            <motion.div 
              className="bg-blue-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(0, (currentQuestionIndex / QUESTIONS.length) * 100)}%` }}
            />
          </div>

          <AnimatePresence>
            {showBadgePopup && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="absolute top-20 right-6 z-50 bg-white rounded-2xl shadow-2xl p-4 border border-blue-100 flex flex-col items-center gap-3 w-64 text-center ring-4 ring-blue-50"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl shadow-inner">
                  {showBadgePopup.icon}
                </div>
                <div>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">NUEVA INSIGNIA</p>
                  <h4 className="text-gray-900 font-bold">{showBadgePopup.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{showBadgePopup.description}</p>
                </div>
                <button 
                  onClick={() => setShowBadgePopup(null)}
                  className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-xl"
                >
                  ¡Genial!
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Badges Bar */}
        <div className="px-6 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-3 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Tus Logros:</span>
          {earnedBadges.length === 0 && <span className="text-[10px] text-slate-300 italic">Comienza a responder para ganar...</span>}
          {earnedBadges.map(bid => {
            const b = BADGES.find(x => x.id === bid);
            return (
              <motion.div 
                key={bid}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 flex items-center gap-1.5 px-3"
                title={b?.description}
              >
                <span className="text-sm">{b?.icon}</span>
                <span className="text-[10px] font-bold text-slate-600 whitespace-nowrap">{b?.name}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Message Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full space-y-8">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex gap-4",
                  msg.sender === 'bot' ? "mr-auto w-full max-w-3xl" : "ml-auto flex-row-reverse"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border",
                  msg.sender === 'bot' ? "bg-white border-slate-200" : "bg-blue-700 border-blue-800"
                )}>
                  {msg.sender === 'bot' ? (
                    <img 
                      src="logo.png" 
                      alt="Bot"
                      className="w-7 h-7 object-contain"
                      onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className={cn(
                  "px-5 py-4 rounded-3xl text-sm leading-relaxed shadow-sm",
                  msg.sender === 'bot' 
                    ? "bg-slate-50 text-gray-800 rounded-tl-none border border-slate-100" 
                    : "bg-blue-600 text-white rounded-tr-none"
                )}>
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <div className="flex gap-4 mr-auto w-full max-w-2xl">
                <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img 
                    src="logo.png" 
                    alt="Typing"
                    className="w-7 h-7 object-contain animate-pulse"
                    onError={(e) => (e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png")}
                  />
                </div>
                <div className="bg-slate-50 px-5 py-4 rounded-3xl rounded-tl-none border border-slate-100 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-xs text-gray-400 font-medium italic uppercase tracking-wider">Escribiendo...</span>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Action Area */}
        <footer className="p-6 md:p-10 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto w-full shadow-2xl shadow-blue-900/5 rounded-3xl ring-1 ring-slate-100">
            {!isComplete && currentQuestionIndex === -1 && (
              <div className="p-4 flex gap-2">
                <button 
                  onClick={() => handleSend("¡Sí, listo!")}
                  disabled={isTyping}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  ¡Empezar encuesta!
                </button>
              </div>
            )}

            {!isComplete && currentQuestionIndex >= 0 && currentQuestionIndex < QUESTIONS.length && (
              <div className="p-4">
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
              <div className="p-4 flex flex-col gap-4">
                <div className="p-8 text-center text-emerald-600 font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-emerald-50/50 rounded-3xl">
                  <Sparkles className="w-6 h-6" />
                  ¡Formulario Enviado!
                </div>
                <button 
                  onClick={handleReset}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                >
                  Nueva Encuesta
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="max-w-4xl mx-auto mt-4 p-4 bg-red-50 text-red-700 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500" />
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
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Sync internal state for multi-select
  useEffect(() => {
    if (question.type === 'multi-select') {
      setSelectedOptions(value ? value.split(', ') : []);
    }
  }, [question, value]);

  const toggleOption = (opt: string) => {
    const newOptions = selectedOptions.includes(opt)
      ? selectedOptions.filter(o => o !== opt)
      : [...selectedOptions, opt];
    setSelectedOptions(newOptions);
    onChange(newOptions.join(', '));
  };

  if (question.type === 'select') {
    return (
      <div className="grid grid-cols-1 gap-2 max-h-[40vh] overflow-y-auto pr-1 custom-scrollbar">
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

  if (question.type === 'multi-select') {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-2 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar">
          {question.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => toggleOption(opt)}
              disabled={disabled}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border transition-all text-sm flex items-center justify-between",
                selectedOptions.includes(opt) 
                  ? "border-blue-500 bg-blue-50 text-blue-700" 
                  : "border-slate-200 text-gray-700 hover:border-blue-300"
              )}
            >
              {opt}
              <div className={cn(
                "w-5 h-5 rounded border flex items-center justify-center",
                selectedOptions.includes(opt) ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300"
              )}>
                {selectedOptions.includes(opt) && <Send className="w-3 h-3" />}
              </div>
            </button>
          ))}
        </div>
        <button
          onClick={() => onSend()}
          disabled={disabled || selectedOptions.length === 0}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          Confirmar selección ({selectedOptions.length})
        </button>
      </div>
    );
  }

  if (question.type === 'scale') {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="flex justify-between w-full text-[10px] text-gray-400 font-medium px-1 uppercase tracking-wider">
          <span>{question.variable === 'acceso_diario' ? 'Nunca' : 'Mínimo'}</span>
          <span>{question.variable === 'acceso_diario' ? 'Siempre' : 'Máximo'}</span>
        </div>
        <div className="flex justify-between w-full gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onSend(num.toString())}
              disabled={disabled}
              className="flex-1 aspect-square rounded-2xl border-2 border-slate-200 flex items-center justify-center text-lg font-bold text-slate-400 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
            >
              {num}
            </button>
          ))}
        </div>
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
