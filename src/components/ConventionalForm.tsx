import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Send, 
  LayoutDashboard, 
  MessageSquare,
  AlertCircle,
  Loader2,
  Sparkles,
  ClipboardList,
  ShieldCheck,
  Trophy
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, serverTimestamp, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { QUESTIONS, Question } from '../constants/questions';
import { Link, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { BADGES, calculateLevel, Badge } from '../types/gamification';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default function ConventionalForm() {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Gamification
  const [points, setPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [showBadgePopup, setShowBadgePopup] = useState<Badge | null>(null);

  // Group questions by section
  const sections = Array.from(new Set(QUESTIONS.map(q => q.section)));
  
  useEffect(() => {
    const init = async () => {
      try {
        if (!auth.currentUser) {
          const userCred = await signInAnonymously(auth);
          const profileDoc = await getDoc(doc(db, 'profiles', userCred.user.uid));
          if (profileDoc.exists()) {
            const data = profileDoc.data();
            setPoints(data.points || 0);
            setEarnedBadges(data.badges || []);
          } else {
            await setDoc(doc(db, 'profiles', userCred.user.uid), {
              points: 0,
              badges: [],
              createdAt: serverTimestamp()
            });
          }
        }
      } catch (err: any) {
        console.error("Auth error:", err);
      }
    };
    init();
  }, []);

  const currentSection = sections[currentStepIndex];
  const questionsInCurrentSection = QUESTIONS.filter(q => q.section === currentSection);
  
  // Filter questions that meet their condition based on current answers
  const visibleQuestions = questionsInCurrentSection.filter(q => {
    if (!q.condition) return true;
    return q.condition(answers);
  });

  const handleUpdateAnswer = (variable: string, val: any) => {
    setAnswers(prev => ({ ...prev, [variable]: val }));
    if (variable === 'email') setEmailError(null);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const nextStep = () => {
    // Check if required fields in current visible questions are filled
    // (Informally required for better UX)
    const emailQuestion = visibleQuestions.find(q => q.variable === 'email');
    if (emailQuestion && answers.email) {
      if (!validateEmail(answers.email)) {
        setEmailError("Por favor, ingresa un correo electrónico válido.");
        return;
      }
    }

    // Award section badge if not earned
    const sectionToBadgeMap: Record<string, string> = {
      'Información básica': 'perfil_creado',
      'Educación y situación actual': 'explorador_digital',
      'Intereses': 'rumbo_digital',
      'Empleabilidad digital': 'talento_digital',
      'Emprendimiento digital': 'constructor_ideas',
      'Política pública digital': 'voz_ciudadana'
    };

    const bid = sectionToBadgeMap[currentSection];
    if (bid && !earnedBadges.includes(bid)) {
      const badge = BADGES.find(b => b.id === bid);
      if (badge) {
        awardBadge(badge);
      }
    }

    if (currentStepIndex < sections.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const awardBadge = async (badge: Badge) => {
    const pointsAwarded = badge.points;
    setPoints(prev => prev + pointsAwarded);
    setEarnedBadges(prev => [...prev, badge.id]);
    setShowBadgePopup(badge);

    if (auth.currentUser) {
      try {
        await updateDoc(doc(db, 'profiles', auth.currentUser.uid), {
          points: increment(pointsAwarded),
          badges: arrayUnion(badge.id)
        });
      } catch (err) {
        console.error("Profile update error", err);
      }
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    const path = 'submissions';

    try {
      if (!auth.currentUser) throw new Error("User not authenticated.");

      const submissionId = typeof crypto.randomUUID === 'function' 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2) + Date.now().toString(36);
        
      const payload: any = {
        ...answers,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        interfaceType: 'standard_form'
      };

      if (!payload.nombre || !payload.email) {
        // Fallback validation if something went wrong
        const basicSectionIdx = sections.findIndex(s => s.toLowerCase().includes('información básica'));
        if (basicSectionIdx !== -1) {
          setCurrentStepIndex(basicSectionIdx);
          setError("Por favor completa los campos obligatorios (Nombre y Email) en la sección de Información Básica.");
          setIsSubmitting(false);
          return;
        }
      }

      try {
        await setDoc(doc(db, path, submissionId), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `${path}/${submissionId}`);
      }

      // Final Badge
      if (!earnedBadges.includes('agente_transformacion')) {
        const finalBadge = BADGES.find(b => b.id === 'agente_transformacion');
        if (finalBadge) await awardBadge(finalBadge);
      }

      setIsComplete(true);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error("Submission error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Huy, tuvimos un problema al guardar. Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl p-12 text-center space-y-8 border border-slate-100"
        >
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">¡Muchas gracias por participar!</h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Tu participación es muy importante para fortalecer iniciativas de transformación digital en Colombia. 
              La información que compartiste será tratada de forma confidencial por la OIT y el UNFPA.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => navigate('/')} 
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Volver al Inicio
            </button>
            <button 
              onClick={() => navigate('/stats')} 
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
            >
              Ver Estadísticas
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 tracking-tight leading-none">Formulario Convencional</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Caracterización Digital</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-black text-slate-700">{points} pts</span>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all">
            <MessageSquare className="w-4 h-4" />
            Chatbot
          </Link>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
          <motion.div 
            className="h-full bg-blue-600"
            animate={{ width: `${((currentStepIndex + 1) / sections.length) * 100}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-12 space-y-12">
        {/* Intro */}
        {currentStepIndex === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-600 p-8 rounded-[2rem] text-white space-y-4 shadow-xl shadow-blue-100"
          >
            <div className="flex items-center gap-3">
               <ShieldCheck className="w-8 h-8 opacity-50" />
               <h2 className="text-2xl font-bold">Bienvenido a la caracterización</h2>
            </div>
            <p className="text-blue-50/90 leading-relaxed text-sm">
               Este es un formulario convencional. Puedes navegar entre secciones usando los botones al final de cada página. 
               Tu progreso se guarda automáticamente por sección.
            </p>
          </motion.div>
        )}

        {/* Section Title */}
        <div className="space-y-2">
           <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Sección {currentStepIndex + 1} de {sections.length}</span>
           <h2 className="text-4xl font-black text-slate-900 tracking-tight">{currentSection}</h2>
        </div>

        {/* Form Questions */}
        <div className="space-y-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {visibleQuestions.map((q) => (
                <div key={q.id} className="space-y-4">
                  <label className="block text-lg font-bold text-slate-800 leading-snug">
                    {q.text}
                  </label>
                  
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <FormInput 
                      question={q} 
                      value={answers[q.variable]} 
                      onChange={(val) => handleUpdateAnswer(q.variable, val)}
                      error={q.variable === 'email' ? emailError : null}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="pt-12 flex items-center justify-between gap-6">
          <button
            onClick={prevStep}
            disabled={currentStepIndex === 0}
            className={cn(
              "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-2 transition-all",
              currentStepIndex === 0 ? "opacity-0 invisible" : "bg-white text-slate-400 border border-slate-200 hover:text-slate-900"
            )}
          >
            <ArrowLeft className="w-5 h-5" />
            Anterior
          </button>
          
          <button
            onClick={nextStep}
            disabled={isSubmitting}
            className="flex-1 max-w-xs px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : currentStepIndex === sections.length - 1 ? (
              <>
                <Send className="w-5 h-5" />
                Finalizar y Enviar
              </>
            ) : (
              <>
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </main>

      {/* Badge Popup */}
      <AnimatePresence>
        {showBadgePopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center space-y-6 border border-blue-100"
            >
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">
                {showBadgePopup.icon}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-blue-600 uppercase tracking-widest">¡Insignia Desbloqueada!</p>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{showBadgePopup.name}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{showBadgePopup.description}</p>
                <div className="inline-block mt-4 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-xl font-bold text-sm">
                  +{showBadgePopup.points} puntos
                </div>
              </div>
              <button 
                onClick={() => setShowBadgePopup(null)}
                className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-100"
              >
                ¡Excelente!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ question, value, onChange, error }: any) {
  const selectedOptions = Array.isArray(value) ? value : (value ? value.split(', ').filter(Boolean) : []);

  const toggleOption = (opt: string) => {
    const newOptions = selectedOptions.includes(opt)
      ? selectedOptions.filter((o: string) => o !== opt)
      : [...selectedOptions, opt];
    onChange(newOptions);
  };

  if (question.type === 'select') {
    return (
      <div className="p-2 space-y-1">
        {question.options?.map((opt: string) => (
          <label 
            key={opt} 
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border",
              value === opt ? "bg-blue-50 border-blue-200 text-blue-900" : "border-transparent hover:bg-slate-50 text-slate-600"
            )}
          >
            <input 
              type="radio" 
              name={question.id} 
              checked={value === opt} 
              onChange={() => onChange(opt)}
              className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span className="text-sm font-semibold">{opt}</span>
            {value === opt && <Check className="w-4 h-4 ml-auto text-blue-600" />}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'multi-select') {
    return (
      <div className="p-2 space-y-1">
        {question.options?.map((opt: string) => {
          const isSelected = selectedOptions.includes(opt);
          return (
            <label 
              key={opt} 
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border",
                isSelected ? "bg-blue-50 border-blue-200 text-blue-900" : "border-transparent hover:bg-slate-50 text-slate-600"
              )}
            >
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => toggleOption(opt)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-semibold">{opt}</span>
              {isSelected && <Check className="w-4 h-4 ml-auto text-blue-600" />}
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'scale') {
    return (
      <div className="p-8 space-y-6">
        <div className="flex justify-between w-full text-[10px] text-slate-400 font-bold uppercase tracking-widest px-2">
          <span>{question.labels?.[0] || 'Mínimo'}</span>
          <span>{question.labels?.[1] || 'Máximo'}</span>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => onChange(num.toString())}
              className={cn(
                "flex-1 aspect-square rounded-2xl border-2 font-black text-xl transition-all",
                value === num.toString() 
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                  : "border-slate-100 text-slate-300 hover:border-slate-300 hover:text-slate-500"
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <input
        type={question.type === 'date' ? 'date' : question.type === 'number' ? 'number' : 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Tu respuesta..."}
        className={cn(
          "w-full px-5 py-4 rounded-xl border transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 text-slate-900 font-medium",
          error ? "border-red-300 bg-red-50" : "border-slate-100 bg-slate-50 focus:border-blue-500 focus:bg-white"
        )}
      />
      {error && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-wider">{error}</p>}
    </div>
  );
}
