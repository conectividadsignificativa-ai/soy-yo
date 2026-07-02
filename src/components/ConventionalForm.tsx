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
import { getReferralCode } from '../utils/referral';

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
      // Capture and persist referral code on landing
      getReferralCode();
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
        interfaceType: 'standard_form',
        referencia: getReferralCode() || 'Directo'
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-6 md:p-12 text-center space-y-8 border border-slate-100 dark:border-slate-800"
        >
          <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">¡Muchas gracias por participar!</h1>
            <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg leading-relaxed">
              Tu participación es muy importante para fortalecer iniciativas de transformación digital en Colombia. 
              La información que compartiste será tratada de forma confidencial por la OIT y el UNFPA.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <button 
              onClick={() => navigate('/')} 
              className="px-8 py-4 bg-blue-600 dark:bg-blue-700 text-white rounded-2xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-200 dark:shadow-none cursor-pointer"
            >
              Volver al Inicio
            </button>
            <button 
              onClick={() => navigate('/stats')} 
              className="px-8 py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-bold hover:bg-black dark:hover:bg-slate-950 transition-all shadow-lg cursor-pointer"
            >
              Ver Estadísticas
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 dark:bg-blue-700 p-2 rounded-xl">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 dark:text-white tracking-tight leading-none">Formulario Convencional</h1>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Caracterización Digital</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{points} pts</span>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-800 rounded-xl hover:bg-blue-100 dark:hover:bg-slate-700 transition-all">
            <MessageSquare className="w-4 h-4" />
            Chatbot
          </Link>
        </div>
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-850">
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
            className="bg-blue-600 p-8 rounded-[2rem] text-white space-y-6 shadow-xl shadow-blue-100"
          >
            <div className="flex items-center gap-3">
               <span className="text-3xl">👋</span>
               <h2 className="text-2xl font-black">¡Hola! Nos alegra que estés aquí.</h2>
            </div>
            <div className="space-y-4 text-blue-50/95 leading-relaxed text-sm">
              <p>
                Sabemos que te apasiona la transformación digital, y queremos invitarte a ser parte de algo importante. Desde la Organización Internacional del Trabajo (OIT) y el Fondo de Población de las Naciones Unidas (UNFPA), agencias de la ONU en Colombia, estamos construyendo un banco de datos de jóvenes del Caribe y el Pacífico que lideran o desean sumarse a procesos de transformación digital en sus territorios.
              </p>
              <p className="font-bold border-l-4 border-blue-300 pl-3 bg-blue-700/30 py-2 rounded-r-xl">
                ¿Trabajas por un mundo más digital? Entendemos la transformación digital como el proceso mediante el cual adoptamos tecnologías digitales para mejorar procesos, servicios y cómo relacionarnos con las personas.
              </p>
              <p>
                Buscamos jóvenes con interés en continuar su trayectoria en temas digitales, así como perfiles interesados en futuras oportunidades en tres líneas clave:
              </p>
              <div className="pl-4 space-y-1.5 font-bold text-white bg-blue-700/20 p-3 rounded-xl border border-blue-500/30">
                <div>💼  Empleabilidad digital</div>
                <div>🚀  Emprendimiento digital</div>
                <div>🗳️  Participación en política pública digital</div>
              </div>
              <p>
                Tu respuesta nos ayudará a fortalecer esta red y a diseñar convocatorias enfocadas en juventudes comprometidas con el desarrollo digital del país.
              </p>
              <hr className="border-blue-400/50" />
              <p className="text-xs opacity-90 italic">
                Al diligenciar este formulario, autorizas el envío de información relacionada exclusivamente con el proceso de Conectividad Significativa a través de los datos de contacto suministrados 
              </p>
              <div className="flex items-center gap-1.5 text-xs font-black bg-blue-700 text-yellow-300 px-3 py-2 rounded-lg w-fit">
                <span>⏱️</span>
                <span>Completar este formulario toma menos de 5 minutos.</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Title */}
        <div className="space-y-2">
           <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">Sección {currentStepIndex + 1} de {sections.length}</span>
           <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{currentSection}</h2>
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
                  <label className="block text-lg font-bold text-slate-800 dark:text-slate-200 leading-snug">
                    {q.text}
                  </label>
                  
                  <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
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
          <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-sm font-bold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
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
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 max-w-sm w-full text-center space-y-6 border border-blue-100 dark:border-slate-800"
            >
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-950/50 rounded-full flex items-center justify-center text-5xl mx-auto shadow-inner">
                {showBadgePopup.icon}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">¡Insignia Desbloqueada!</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{showBadgePopup.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{showBadgePopup.description}</p>
                <div className="inline-block mt-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-950 text-yellow-750 dark:text-yellow-400 rounded-xl font-bold text-sm">
                  +{showBadgePopup.points} puntos
                </div>
              </div>
              <button 
                onClick={() => setShowBadgePopup(null)}
                className="w-full bg-blue-600 dark:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-100 dark:shadow-none cursor-pointer"
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
      <div className="p-2 space-y-1 bg-white dark:bg-slate-900">
        {question.options?.map((opt: string) => (
          <label 
            key={opt} 
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border",
              value === opt 
                ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold" 
                : "border-transparent dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            )}
          >
            <input 
              type="radio" 
              name={question.id} 
              checked={value === opt} 
              onChange={() => onChange(opt)}
              className="w-5 h-5 text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-sm font-semibold flex-1 break-words">{opt}</span>
            {value === opt && <Check className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          </label>
        ))}
      </div>
    );
  }

  if (question.type === 'multi-select') {
    return (
      <div className="p-2 space-y-1 bg-white dark:bg-slate-900">
        {question.options?.map((opt: string) => {
          const isSelected = selectedOptions.includes(opt);
          return (
            <label 
              key={opt} 
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all border",
                isSelected 
                  ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 font-semibold" 
                  : "border-transparent dark:border-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              )}
            >
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => toggleOption(opt)}
                className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-sm font-semibold flex-1 break-words">{opt}</span>
              {isSelected && <Check className="w-4 h-4 ml-auto text-blue-600 dark:text-blue-400 flex-shrink-0" />}
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === 'scale') {
    return (
      <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
        <div className="flex justify-between w-full text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest px-2">
          <span>{question.labels?.[0] || 'Mínimo'}</span>
          <span>{question.labels?.[1] || 'Máximo'}</span>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onChange(num.toString())}
              className={cn(
                "flex-1 aspect-square rounded-2xl border-2 font-black text-xl transition-all cursor-pointer",
                value === num.toString() 
                  ? "bg-blue-600 dark:bg-blue-700 border-blue-600 dark:border-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none" 
                  : "border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-650 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
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
    <div className="p-6 bg-white dark:bg-slate-900">
      <input
        type={question.type === 'date' ? 'date' : question.type === 'number' ? 'number' : 'text'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || "Tu respuesta..."}
        className={cn(
          "w-full px-5 py-4 rounded-xl border transition-all focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-900 dark:text-white font-medium",
          error 
            ? "border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/25 text-red-500 dark:text-red-400" 
            : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100"
        )}
      />
      {error && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-wider">{error}</p>}
    </div>
  );
}
