import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { QUESTIONS } from '../constants/questions';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { 
  LayoutDashboard, Users, Globe, BookOpen, Brain, Zap, ArrowLeft, 
  ShieldCheck, AlertTriangle, Monitor, Target, Heart, Search, HelpCircle, GraduationCap,
  Calendar, Download
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E'];

const ALLOWED_EMAILS = [
  'conectividadsignificativa@gmail.com',
  'nicolsg40@gmail.com'
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthChecking(false);
      
      if (firebaseUser && firebaseUser.email) {
        const emailLower = firebaseUser.email.toLowerCase();
        if (ALLOWED_EMAILS.map(e => e.toLowerCase()).includes(emailLower)) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthorized) {
      setData([]);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        setData(querySnapshot.docs.map(doc => doc.data()));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthorized]);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Google sign in error", err);
      const detailedMessage = err?.code ? `[${err.code}] ${err.message}` : (err?.message || String(err));
      setAuthError(`No se pudo iniciar sesión con Google (${detailedMessage}).`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const getChartData = (field: string) => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      const val = item[field];
      if (val) {
        const values = Array.isArray(val) 
          ? val 
          : (typeof val === 'string' && val.includes(',') ? val.split(',').map(s => s.trim()) : [val]);
        
        values.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    if (!data.length) return null;

    const total = data.length;
    
    // Bloque 1: Perfil General
    const ageDist = getChartData('rango_edad');
    const zoneDist = getChartData('zona');
    const groupsDist = getChartData('grupos').filter(v => v.label !== 'Ninguna de las anteriores');
    const generoDist = getChartData('genero');

    // Bloque 2: Educación y Trabajo
    const nivelEstudios = getChartData('nivel_estudios');
    const situacionActual = getChartData('situacion_actual');
    const interesTrabajo = getChartData('interes_trabajo_digital');

    // Bloque 3: Intereses
    const lineasInteres = getChartData('lineas_interes');

    // Bloque 4: Empleabilidad Digital
    const areasCertificacion = getChartData('areas_certificacion').filter(v => v.label !== 'No tengo ninguna certificación');

    // Bloque 5: Emprendimiento Digital
    const tieneEmprendimientoSi = data.filter(d => d.tiene_emprendimiento === 'Sí').length;
    const tieneEmprendimientoNo = data.filter(d => d.tiene_emprendimiento === 'No').length;
    const tieneEmprendimientoDist = [
      { label: 'Sí', value: tieneEmprendimientoSi },
      { label: 'No', value: tieneEmprendimientoNo }
    ].filter(v => v.value > 0);
    const temaEmprendimiento = getChartData('tema_emprendimiento');
    const etapaEmprendimiento = getChartData('etapa_emprendimiento');
    const alcanceEmprendimiento = getChartData('alcance_emprendimiento');
    const barrerasEmprendimiento = getChartData('barreras_emprendimiento');

    // Bloque 6: Política Pública Digital
    const participacionPreviaSi = data.filter(d => d.participacion_previa === 'Sí').length;
    const participacionPreviaNo = data.filter(d => d.participacion_previa === 'No').length;
    const participacionPreviaDist = [
      { label: 'Sí', value: participacionPreviaSi },
      { label: 'No', value: participacionPreviaNo }
    ].filter(v => v.value > 0);
    const perteneceRedDist = getChartData('pertenece_red');
    const temasPolitica = getChartData('temas_politica');
    const formaParticipar = getChartData('forma_participar');

    // Actividad Diaria
    const dailyCounts: Record<string, number> = {};
    data.forEach(item => {
      if (item.createdAt) {
        // Handle Firestore Timestamp or Date
        const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt.seconds * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      }
    });
    const dailyActivity = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return {
      total,
      ageDist, zoneDist, groupsDist, generoDist,
      nivelEstudios, situacionActual, interesTrabajo,
      lineasInteres,
      areasCertificacion,
      tieneEmprendimientoDist, temaEmprendimiento, etapaEmprendimiento, alcanceEmprendimiento, barrerasEmprendimiento,
      participacionPreviaDist, perteneceRedDist, temasPolitica, formaParticipar,
      dailyActivity
    };
  }, [data]);

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      // 1. Create mapping from variable name to actual question text
      const fieldMapping = QUESTIONS.reduce((acc, q) => {
        acc[q.variable] = q.text;
        return acc;
      }, {} as Record<string, string>);

      // 2. Prepare data for Excel
      const excelData = data.map(submission => {
        const row: Record<string, any> = {};
        
        // Add timestamp as the first column
        if (submission.createdAt) {
          const date = submission.createdAt.toDate ? submission.createdAt.toDate() : new Date(submission.createdAt.seconds * 1000);
          row['Fecha de Envío'] = date.toLocaleString();
        }

        // Add each question using its human-readable text as header
        Object.keys(submission).forEach(key => {
          if (key === 'createdAt' || key === 'userId') return; // Skip internal fields
          
          const header = fieldMapping[key] || key;
          let value = submission[key];
          
          // Format arrays (multi-select) as comma-separated strings
          if (Array.isArray(value)) {
            value = value.join(', ');
          }
          
          row[header] = value;
        });

        return row;
      });

      // 3. Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Caracterización");
      
      // 4. Trigger download
      const fileName = `Caracterizacion_Digital_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export error:", error);
      alert("Hubo un error al generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-sm text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin animate-duration-1000"></div>
          <p className="text-slate-600 font-bold">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-md w-full text-center relative z-10 space-y-6"
        >
          <div className="flex justify-center flex-col items-center gap-4">
             <div className="flex items-center gap-4 justify-center mb-1">
               <img 
                 src="https://drive.google.com/uc?export=view&id=174vtmcqrDB0haU8p_G9CVfWZxAn3fOvn"
                 alt="OIT & UNFPA"
                 className="h-9 object-contain referrerPolicy"
                 referrerPolicy="no-referrer"
               />
             </div>
             <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center ring-4 ring-blue-50/50">
               <ShieldCheck className="w-7 h-7" />
             </div>
             <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">Acceso Administrativo</h2>
             <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs">
               Este panel de administración y estadísticas contiene información protegida. Inicia sesión con una cuenta de Google autorizada.
             </p>
          </div>

          {/* Iframe detection / instruction banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left space-y-2">
            <span className="text-xs font-black text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              ¿El botón de Google no responde?
            </span>
            <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
              Si estás viendo esta aplicación dentro de la vista previa de <strong>AI Studio</strong>, los navegadores bloquean las ventanas emergentes (popups) de Google Login debido a reglas de seguridad de iframes. 
            </p>
            <p className="text-[11px] font-medium text-amber-700 leading-relaxed">
              Haz clic en <strong>"Abrir en nueva pestaña"</strong> a continuación para autenticarte sin restricciones.
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer text-sm"
            >
              <Monitor className="w-4 h-4" />
              <span>Abrir en nueva pestaña</span>
            </a>

            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 font-bold px-6 py-3.5 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98] cursor-pointer text-sm"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.111C18.29 1.94 15.42 1 12.24 1 5.922 1 .8 6.122.8 12.4s5.122 11.4 11.44 11.4c6.6 0 11.01-4.637 11.01-11.22 0-.755-.08-1.33-.178-1.895H12.24z"
                />
              </svg>
              <span>Acceder con Google</span>
            </button>

            {authError && (
              <div className="space-y-4">
                <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-left whitespace-pre-wrap break-all">
                  {authError}
                </p>

                {authError.toLowerCase().includes('unauthorized-domain') && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-left space-y-3">
                    <h3 className="text-xs font-black text-blue-900 tracking-wider uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      ¿Cómo solucionar este error?
                    </h3>
                    <p className="text-[11px] font-medium text-blue-700 leading-relaxed">
                      El dominio actual de la aplicación no está autorizado en tu proyecto de Firebase. Sigue estos sencillos pasos para habilitarlo:
                    </p>
                    <ol className="text-[11px] font-semibold text-blue-800 list-decimal pl-4 space-y-1">
                      <li>
                        Abre la consola de Firebase en:{' '}
                        <a 
                          href="https://console.firebase.google.com/project/gen-lang-client-0263538171/authentication/settings" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline text-blue-600 hover:text-blue-800 font-extrabold break-all"
                        >
                          Configuración de Firebase Auth
                        </a>
                      </li>
                      <li>
                        Ve a la pestaña de <strong>Ajustes (Settings)</strong> y debajo busca la sección de <strong>Dominios autorizados (Authorized domains)</strong>.
                      </li>
                      <li>
                        Haz clic en <strong>Añadir dominio (Add domain)</strong>.
                      </li>
                      <li>
                        Agrega el dominio de desarrollo y el dominio público/compartido para que funcione en ambos entornos:
                        <div className="mt-1.5 p-2 bg-white rounded-xl border border-blue-100 font-mono text-[9px] text-blue-900 space-y-1">
                          <div className="flex justify-between items-center bg-blue-50/50 p-1 rounded">
                            <span>ais-dev-xbzjmdscrgnx4a7w3qzx5i-676483839924.us-east1.run.app</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('ais-dev-xbzjmdscrgnx4a7w3qzx5i-676483839924.us-east1.run.app');
                                alert('Dominio de desarrollo copiado');
                              }}
                              className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded hover:bg-blue-700 font-sans font-bold"
                            >
                              Copiar
                            </button>
                          </div>
                          <div className="flex justify-between items-center bg-blue-50/50 p-1 rounded">
                            <span>ais-pre-xbzjmdscrgnx4a7w3qzx5i-676483839924.us-east1.run.app</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText('ais-pre-xbzjmdscrgnx4a7w3qzx5i-676483839924.us-east1.run.app');
                                alert('Dominio compartido copiado');
                              }}
                              className="text-[9px] bg-blue-600 text-white px-1.5 py-0.5 rounded hover:bg-blue-700 font-sans font-bold"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </li>
                    </ol>
                    <p className="text-[10px] text-blue-600 italic">
                      * Una vez agregados en Firebase, vuelve aquí y haz clic en "Acceder con Google" de nuevo y funcionará perfectamente.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
             <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
               <ArrowLeft className="w-3.5 h-3.5" />
               Volver al chatbot
             </Link>
             <span>Encriptado SSL — OIT & UNFPA</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-12 rounded-[3.5rem] shadow-xl border border-slate-100 max-w-md w-full text-center relative z-10 space-y-6"
        >
          <div className="flex justify-center flex-col items-center gap-4">
             <div className="w-16 h-16 bg-red-50 text-red-600 rounded-[1.5rem] flex items-center justify-center ring-4 ring-red-50/50">
               <AlertTriangle className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Acceso No Autorizado</h2>
             <p className="text-sm font-semibold text-slate-500 leading-relaxed">
               La cuenta de Google <span className="text-red-600 font-extrabold break-all">{user.email}</span> no se encuentra en la lista de administradores permitidos para este proyecto.
             </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold p-4 rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Cerrar Sesión / Usar otro correo
            </button>
            <Link 
              to="/" 
              className="w-full inline-block bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-4 rounded-2xl transition-all"
            >
              Ir al Chatbot
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-bold">Procesando datos territoriales...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6 font-sans">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No hay datos aún</h2>
          <p className="text-slate-500 max-w-xs text-sm">Comienza la caracterización para ver los indicadores en tiempo real.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-center">Ir al Chatbot</Link>
            <button onClick={handleSignOut} className="text-xs font-bold text-slate-400 hover:text-slate-600">Cerrar Sesión ({user.email})</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto p-4 md:p-10 space-y-12">
        
        {/* Header Dashboard */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-200 ring-4 ring-blue-50">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Indicadores</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                <Globe className="w-4 h-4 text-blue-500" />
                Caracterización Digital: Jóvenes del Caribe y Pacífico
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 relative z-10">
            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Caracterizados</span>
              <span className="text-2xl font-black text-blue-600">{stats.total}</span>
            </div>

            <div className="hidden lg:flex flex-col text-right justify-center bg-slate-50 border border-slate-200 px-5 py-2.5 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Administrador</span>
              <span className="text-xs font-black text-slate-700 block truncate max-w-[200px]">{user?.email}</span>
            </div>

            <button 
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 cursor-pointer"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Exportar Excel
            </button>

            <button 
              onClick={handleSignOut}
              className="px-4 py-3 text-sm font-bold bg-slate-100 text-slate-700 rounded-2xl hover:bg-slate-200 transition-all cursor-pointer"
              title="Cerrar Sesión"
            >
              Cerrar Sesión
            </button>

            <Link to="/" className="px-6 py-3 text-sm font-bold bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg">
              Volver
            </Link>
          </div>
        </header>

        {/* 1. PERFIL GENERAL */}
        <SectionHeader title="BLOQUE 1: Perfil General" icon={<Users />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartCard title="Rango de Edad">
            <SimpleBarChart data={stats.ageDist} />
          </ChartCard>
          <ChartCard title="Distribución por Zona">
            <PieChartUI data={stats.zoneDist} colors={['#3B82F6', '#10B981']} />
          </ChartCard>
          <ChartCard title="Grupos Priorizados">
            <HorizontalBarChart data={stats.groupsDist} color="#8B5CF6" />
          </ChartCard>
          <ChartCard title="Identificación de Género">
            <HorizontalBarChart data={stats.generoDist} color="#06B6D4" />
          </ChartCard>
        </div>

        {/* 2. EDUCACIÓN Y TRABAJO */}
        <SectionHeader title="BLOQUE 2: Educación y Trabajo" icon={<BookOpen />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Nivel de Estudios">
            <HorizontalBarChart data={stats.nivelEstudios} color="#F59E0B" />
          </ChartCard>
          <ChartCard title="Situación Actual">
            <HorizontalBarChart data={stats.situacionActual} color="#10B981" />
          </ChartCard>
          <ChartCard title="Interés en Trabajar en Tecnología">
            <SimpleBarChart data={stats.interesTrabajo} color="#3B82F6" />
          </ChartCard>
        </div>

        {/* 3. LÍNEAS DE INTERÉS */}
        <SectionHeader title="BLOQUE 3: Líneas de Interés Escogidas" icon={<Target />} />
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Distribución por Líneas de Interés (Selección Múltiple)">
            <HorizontalBarChart data={stats.lineasInteres} color="#EC4899" />
          </ChartCard>
        </div>

        {/* 4. EMPLEABILIDAD DIGITAL */}
        <SectionHeader title="BLOQUE 4: Empleabilidad Digital" icon={<GraduationCap />} />
        <div className="grid grid-cols-1 gap-6">
          <ChartCard title="Áreas con Certificaciones Técnicas / Tecnológicas">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.areasCertificacion} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="label" 
                    interval={0}
                    angle={-15} 
                    textAnchor="end"
                    tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
                    height={80}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                    {stats.areasCertificacion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* 5. EMPRENDIMIENTO DIGITAL */}
        <SectionHeader title="BLOQUE 5: Emprendimiento Digital" icon={<Zap />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Desarrolla Emprendimiento">
            <PieChartUI data={stats.tieneEmprendimientoDist} colors={['#10B981', '#EF4444']} hole innerRadius={40} />
          </ChartCard>
          <ChartCard title="Temáticas de Emprendimiento">
            <HorizontalBarChart data={stats.temaEmprendimiento} color="#8B5CF6" />
          </ChartCard>
          <ChartCard title="Etapa de la Iniciativa">
            <SimpleBarChart data={stats.etapaEmprendimiento} color="#F59E0B" />
          </ChartCard>
          <ChartCard title="Alcance Territorial">
            <PieChartUI data={stats.alcanceEmprendimiento} colors={['#3B82F6', '#06B6D4', '#8B5CF6']} />
          </ChartCard>
          <ChartCard title="Barreras Enfrentadas (Multiselección)" className="lg:col-span-2">
            <HorizontalBarChart data={stats.barrerasEmprendimiento} color="#EF4444" />
          </ChartCard>
        </div>

        {/* 6. POLÍTICA PÚBLICA DIGITAL */}
        <SectionHeader title="BLOQUE 6: Política Pública Digital" icon={<ShieldCheck />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Participación Ciudadana Previa">
            <PieChartUI data={stats.participacionPreviaDist} colors={['#10B981', '#EF4444']} hole innerRadius={45} />
          </ChartCard>
          <ChartCard title="Pertenencia a Organizaciones / Redes">
            <PieChartUI data={stats.perteneceRedDist} colors={['#3B82F6', '#F59E0B']} />
          </ChartCard>
          <ChartCard title="Temáticas de Interés de Política Pública">
            <HorizontalBarChart data={stats.temasPolitica} color="#06B6D4" />
          </ChartCard>
          <ChartCard title="Cómo les gustaría contribuir o participar (Multiselección)" className="lg:col-span-3">
            <HorizontalBarChart data={stats.formaParticipar} color="#8B5CF6" />
          </ChartCard>
        </div>

        {/* 6. ACTIVIDAD DIARIA */}
        <SectionHeader title="BLOQUE 6: Actividad Diaria" icon={<Calendar />} />
        <div className="grid grid-cols-1 gap-6">
           <ChartCard title="Histórico de Encuestas por Día">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-slate-400">Fecha</th>
                      <th className="py-4 px-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Cantidad de Encuestas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.dailyActivity.map((day: any) => (
                      <tr key={day.date} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-sm font-bold text-slate-700">{day.date}</td>
                        <td className="py-4 px-4 text-sm font-black text-blue-600 text-right">{day.count}</td>
                      </tr>
                    ))}
                    {stats.dailyActivity.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-slate-400 italic text-sm">No hay actividad registrada</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
           </ChartCard>
        </div>

        <footer className="pt-10 text-center text-slate-400 text-sm border-t border-slate-100 flex flex-col items-center gap-4">
          <img 
            src="https://drive.google.com/uc?export=view&id=174vtmcqrDB0haU8p_G9CVfWZxAn3fOvn" 
            alt="OIT & UNFPA"
            className="h-10 grayscale opacity-50"
          />
          <p>© 2024 Observatorio de Caracterización Digital - OIT & UNFPA Colombia</p>
        </footer>

      </div>
    </div>
  );
}

// UI Mini Components
function SectionHeader({ title, icon }: any) {
  return (
    <div className="flex items-center gap-3 pt-6">
      <div className="p-2 bg-slate-200 text-slate-600 rounded-lg">
        {icon}
      </div>
      <h2 className="text-xl font-bold uppercase tracking-wider text-slate-500">{title}</h2>
    </div>
  );
}

function ChartCard({ title, children, className }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col", className)}
    >
      <h3 className="text-lg font-black text-slate-800 mb-8 border-l-4 border-blue-600 pl-4 leading-tight">{title}</h3>
      <div className="flex-1 w-full min-h-[200px]">
        {children}
      </div>
    </motion.div>
  );
}

function KPICard({ label, value, sublabel, color, icon }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className={cn("p-8 rounded-[2.5rem] flex flex-col gap-3 relative overflow-hidden", color)}
    >
      <div className="absolute top-0 right-0 p-4 opacity-10">
        {icon && <div className="w-20 h-20">{icon}</div>}
      </div>
      <p className="text-sm font-bold uppercase tracking-widest opacity-80">{label}</p>
      <p className="text-5xl font-black">{value}</p>
      <p className="text-xs font-semibold opacity-70 leading-relaxed max-w-[200px]">{sublabel}</p>
    </motion.div>
  );
}

function StatusMiniCard({ label, percent, desc }: any) {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
        <span className="text-xs font-bold text-blue-600">{percent}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          whileInView={{ width: `${percent}%` }}
          className="h-full bg-blue-600"
        />
      </div>
      <p className="text-[9px] font-medium text-slate-500 italic">{desc}</p>
    </div>
  );
}

// Chart Abstractions
function SimpleBarChart({ data, color = '#3B82F6' }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: 'none' }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} barSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChart({ data, color = '#3B82F6' }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data.slice(0, 8)} 
        layout="vertical" 
        margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
      >
        <Tooltip 
           cursor={{ fill: 'transparent' }}
           contentStyle={{ borderRadius: '1rem', border: 'none' }}
        />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="label" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fontWeight: 500, fill: '#64748b' }}
          width={100}
        />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartUI({ data, colors = COLORS, hole = false, innerRadius = 0 }: any) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={80}
          paddingAngle={hole ? 5 : 0}
          dataKey="value"
          nameKey="label"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
        <Legend 
           verticalAlign="bottom" 
           iconType="circle" 
           formatter={(value) => <span className="text-[10px] font-bold text-slate-500 uppercase">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
