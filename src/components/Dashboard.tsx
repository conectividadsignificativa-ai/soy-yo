import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { QUESTIONS } from '../constants/questions';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, RadialBarChart, RadialBar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  LayoutDashboard, Users, Globe, BookOpen, Brain, Zap, ArrowLeft, 
  ShieldCheck, AlertTriangle, Monitor, Target, Search, GraduationCap,
  Calendar, Download, FileSpreadsheet, RotateCcw, Link2, ExternalLink, Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { generateMockSubmissions } from './dashboard/mockData';
import TransversalViews from './dashboard/TransversalViews';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E'];

const REFERRAL_LABELS: Record<string, string> = {
  'goyn': 'GOYN',
  'cora': 'CORA',
  'fedesoft': 'Fedesoft',
  'cintel': 'Cintel',
  'oit': 'OIT',
  'biznation': 'BizNation',
  'directo': 'Directo (Estándar)'
};

const ALLOWED_EMAILS = [
  'conectividadsignificativa@gmail.com',
  'nicolsg40@gmail.com',
  'osoriocastillox@gmail.com'
];

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters state
  const [regionFilter, setRegionFilter] = useState<'all' | 'caribe' | 'pacifico'>('all');
  const [useMock, setUseMock] = useState(true); // Default to true if Firestore is initially empty or for exploration, but dynamically disabled if real exist
  const [activeTab, setActiveTab] = useState<'summary' | 'demographics' | 'education' | 'employability' | 'entrepreneurship' | 'policy'>('summary');
  const [searchQuery, setSearchQuery] = useState('');

  // Department definitions
  const CARIBE_DEPTS = ['Atlántico', 'Bolívar', 'Cesar', 'Córdoba', 'La Guajira', 'Magdalena', 'Sucre', 'San Andrés'];
  const PACIFICO_DEPTS = ['Chocó', 'Valle del Cauca', 'Cauca', 'Nariño'];

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

  const [realEntriesExist, setRealEntriesExist] = useState(false);

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
        const docs = querySnapshot.docs.map(doc => doc.data());
        
        if (docs.length > 0) {
          setData(docs);
          setUseMock(false); // Disconnect mock automatically since we have real submissions
          setRealEntriesExist(true);
        } else {
          // If no real surveys, load mock submissions as safe sandbox fallback
          setData(generateMockSubmissions());
          setUseMock(true);
          setRealEntriesExist(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Load mock submissions if Firestore permissions or other transient issues block fetching
        setData(generateMockSubmissions());
        setUseMock(true);
        setRealEntriesExist(false);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthorized]);

  // Handle mock switcher toggle
  const toggleMockData = () => {
    if (useMock) {
      // Switch back to real (if exist, else set empty list)
      setLoading(true);
      const fetchData = async () => {
        try {
          const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const docs = querySnapshot.docs.map(doc => doc.data());
          setData(docs);
          setUseMock(false);
        } catch {
          setData([]);
          setUseMock(false);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    } else {
      setData(generateMockSubmissions());
      setUseMock(true);
    }
  };

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

  // 1. Apply regional filters to dataset
  const filteredData = useMemo(() => {
    if (regionFilter === 'caribe') {
      return data.filter(item => item.departamento && CARIBE_DEPTS.includes(item.departamento));
    }
    if (regionFilter === 'pacifico') {
      return data.filter(item => item.departamento && PACIFICO_DEPTS.includes(item.departamento));
    }
    return data;
  }, [data, regionFilter]);

  // Helper chart generator
  const getProcessedChartData = (field: string) => {
    const counts: Record<string, number> = {};
    filteredData.forEach(item => {
      const val = item[field];
      if (val) {
        const values = Array.isArray(val) 
          ? val 
          : (typeof val === 'string' && val.includes(',') ? val.split(',').map((s: string) => s.trim()) : [val]);
        
        values.forEach((v: string) => {
          counts[v] = (counts[v] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  };

  // Calculations for charts & stats in individual blocks
  const metrics = useMemo(() => {
    if (!filteredData.length) return null;

    const total = filteredData.length;

    // --- SECCIÓN 1: DATOS DEMOGRÁFICOS ---
    const departamentoRaw = getProcessedChartData('departamento');
    const municipioRaw = getProcessedChartData('municipio').slice(0, 10);
    const zonaRaw = getProcessedChartData('zona');
    const groupsRaw = getProcessedChartData('grupos').filter(v => v.label !== 'Ninguna de las anteriores');
    const generoRaw = getProcessedChartData('genero');
    const discapacidadRaw = getProcessedChartData('tipo_discapacidad');

    // Ordinal sorting for Rango de Edad
    const ageOrdinalOrder = ['12–14 años', '15–17 años', '18–21 años', '22–25 años', '26–28 años', 'Mayor de 28 años'];
    const ageCounts: Record<string, number> = {};
    filteredData.forEach(item => {
      const val = item.rango_edad;
      if (val) ageCounts[val] = (ageCounts[val] || 0) + 1;
    });
    const ageDist = ageOrdinalOrder.map(label => ({
      label,
      value: ageCounts[label] || 0
    }));

    // --- SECCIÓN 2: EDUCACIÓN Y SITUACIÓN ACTUAL ---
    const studiesOrdinalOrder = ['Primaria', 'Secundaria / media sin finalizar', 'Secundaria / media finalizada', 'Técnico / Tecnológico', 'Universitario', 'Posgrado'];
    const studiesCounts: Record<string, number> = {};
    filteredData.forEach(item => {
      const val = item.nivel_estudios;
      if (val) studiesCounts[val] = (studiesCounts[val] || 0) + 1;
    });
    const studiesDist = studiesOrdinalOrder.map(label => ({
      label,
      value: studiesCounts[label] || 0
    }));

    const situacionActual = getProcessedChartData('situacion_actual');
    const interesTrabajo = getProcessedChartData('interes_trabajo_digital');

    // --- SECCIÓN 3: INTERESES ---
    const lineasInteres = getProcessedChartData('lineas_interes');

    // --- SECCIÓN 4: EMPLEABILIDAD DIGITAL ---
    const areasCertificacion = getProcessedChartData('areas_certificacion').filter(v => v.label !== 'No tengo ninguna certificación');

    // --- SECCIÓN 5: EMPRENDIMIENTO DIGITAL ---
    const tieneEmprendimientoSi = filteredData.filter(d => d.tiene_emprendimiento === 'Sí').length;
    const tieneEmprendimientoNo = filteredData.filter(d => d.tiene_emprendimiento === 'No').length;
    const tieneEmprendimientoDist = [
      { label: 'Sí', value: tieneEmprendimientoSi },
      { label: 'No', value: tieneEmprendimientoNo }
    ].filter(v => v.value > 0);

    const temaEmprendimiento = getProcessedChartData('tema_emprendimiento');
    const etapaEmprendimiento = getProcessedChartData('etapa_emprendimiento');
    const alcanceEmprendimiento = getProcessedChartData('alcance_emprendimiento');
    const barrerasEmprendimiento = getProcessedChartData('barreras_emprendimiento');

    // Filtered Entrepreneurship projects list (p18 names, p23 objectives, links)
    const activeProjects = filteredData
      .filter(item => item.tiene_emprendimiento === 'Sí' && item.nombre_emprendimiento)
      .map(item => ({
        name: item.nombre_emprendimiento,
        theme: item.tema_emprendimiento,
        stage: item.etapa_emprendimiento,
        reach: item.alcance_emprendimiento,
        objective: item.objetivo_emprendimiento || '',
        links: item.enlaces_emprendimiento || 'no',
        departamento: item.departamento || 'No especifica'
      }));

    // --- SECCIÓN 6: POLÍTICA PÚBLICA DIGITAL ---
    const participacionPreviaSi = filteredData.filter(d => d.participacion_previa === 'Sí').length;
    const participacionPreviaNo = filteredData.filter(d => d.participacion_previa === 'No').length;
    const participacionPreviaDist = [
      { label: 'Sí', value: participacionPreviaSi },
      { label: 'No', value: participacionPreviaNo }
    ].filter(v => v.value > 0);

    const perteneceRedDist = getProcessedChartData('pertenece_red');
    const temasPolitica = getProcessedChartData('temas_politica');
    const formaParticipar = getProcessedChartData('forma_participar');

    // Redes juveniles/Organizaciones names
    const activeOrgs = filteredData
      .filter(item => item.pertenece_red === 'Sí — ¿cuál?' && item.cual_red)
      .map(item => item.cual_red)
      .filter((v, i, self) => self.indexOf(v) === i); // deduplicated

    // Actividad Diaria
    const dailyCounts: Record<string, number> = {};
    filteredData.forEach(item => {
      if (item.createdAt) {
        const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date((item.createdAt.seconds || item.createdAt._seconds) * 1000);
        const dateStr = date.toISOString().split('T')[0];
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      }
    });
    const dailyActivity = Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // --- ENLACES DINÁMICOS DE REFERENCIA ---
    const referralCounts: Record<string, number> = {
      'goyn': 0,
      'cora': 0,
      'fedesoft': 0,
      'cintel': 0,
      'oit': 0,
      'biznation': 0,
      'directo': 0
    };

    filteredData.forEach(item => {
      let ref = item.referencia;
      if (!ref) {
        referralCounts['directo']++;
      } else {
        const cleanRef = ref.trim().toLowerCase();
        if (cleanRef in referralCounts) {
          referralCounts[cleanRef]++;
        } else if (cleanRef === 'directo' || cleanRef === 'ninguno' || cleanRef === 'sin referente') {
          referralCounts['directo']++;
        } else {
          referralCounts['directo']++;
        }
      }
    });

    const referralData = Object.entries(REFERRAL_LABELS).map(([key, label]) => ({
      label,
      value: referralCounts[key] || 0
    }));

    return {
      total,
      departamentoRaw, municipioRaw, zonaRaw, ageDist, groupsRaw, generoRaw, discapacidadRaw,
      studiesDist, situacionActual, interesTrabajo,
      lineasInteres,
      areasCertificacion,
      tieneEmprendimientoDist, temaEmprendimiento, etapaEmprendimiento, alcanceEmprendimiento, barrerasEmprendimiento, activeProjects,
      participacionPreviaDist, perteneceRedDist, temasPolitica, formaParticipar, activeOrgs,
      dailyActivity,
      referralData
    };
  }, [filteredData]);

  // Export to Excel handler
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const fieldMapping = QUESTIONS.reduce((acc, q) => {
        acc[q.variable] = q.text;
        return acc;
      }, {} as Record<string, string>);

      const excelData = data.map(submission => {
        const row: Record<string, any> = {};
        
        if (submission.createdAt) {
          const date = submission.createdAt.toDate ? submission.createdAt.toDate() : new Date((submission.createdAt.seconds || submission.createdAt._seconds) * 1000);
          row['Fecha de Envío'] = date.toLocaleString();
        }

        Object.keys(submission).forEach(key => {
          if (key === 'createdAt' || key === 'userId') return;
          
          const header = fieldMapping[key] || key;
          let value = submission[key];
          
          if (Array.isArray(value)) {
            value = value.join(', ');
          }
          row[header] = value;
        });

        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Caracterización");
      
      const fileName = `Caracterizacion_Digital_${useMock ? 'SIMULADO_' : ''}${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export error:", error);
      alert("Hubo un error al generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  // Filtering projects list based on search bar
  const searchedProjects = useMemo(() => {
    if (!metrics?.activeProjects) return [];
    if (!searchQuery) return metrics.activeProjects;
    const queryLower = searchQuery.toLowerCase();
    return metrics.activeProjects.filter(p => 
      p.name.toLowerCase().includes(queryLower) ||
      p.objective.toLowerCase().includes(queryLower) ||
      p.departamento.toLowerCase().includes(queryLower)
    );
  }, [metrics?.activeProjects, searchQuery]);

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-[2rem] border border-slate-100 shadow-sm max-w-sm text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                 className="h-9 object-contain"
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

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 text-left space-y-3">
            <span className="text-xs font-black text-amber-800 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              Dominios Autorizados (GitHub & Preview)
            </span>
            <p className="text-[10px] font-semibold text-amber-700 leading-relaxed">
              Recuerda tener autorizados los dominios de <strong>run.app</strong> y <strong>github.io</strong> en la sección Autorizados de tu panel de Firebase Auth para que el pop-up de inicio de sesión con Google responda adecuadamente.
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
              <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 text-left whitespace-pre-wrap break-all">
                {authError}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400">
             <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
               <ArrowLeft className="w-3.5 h-3.5" />
               Volver al chatbot
             </Link>
             <span>Encriptado OIT & UNFPA</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4 relative overflow-hidden">
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
                La cuenta de Google <span className="text-red-650 font-extrabold break-all">{user.email}</span> no se encuentra en la lista de administradores permitidos para este proyecto.
             </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleSignOut}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold p-4 rounded-2xl transition-all shadow-md active:scale-[0.98] cursor-pointer"
            >
              Cerrar Sesión / Usar otro correo
            </button>
            <Link to="/" className="w-full inline-block bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold p-4 rounded-2xl transition-all">
              Ir al Chatbot
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Top Warning banner for Illustrative / Sandbox status */}
      {useMock && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-serif px-4 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 relative z-50">
          <Info className="w-4 h-4 text-white flex-shrink-0" />
          <span>
            Mostrando <strong>Datos Ilustrativos Avanzados (Simulación 60 registros)</strong> ya que la base de datos recién se inicializa.
          </span>
          {realEntriesExist && (
            <button 
              onClick={toggleMockData} 
              className="bg-white/20 hover:bg-white/35 px-4 py-1 text-[10px] font-black uppercase rounded-lg ml-4 transition-all"
            >
              Cargar Reales
            </button>
          )}
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Core Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-150 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-blue-605 bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-200 ring-4 ring-blue-50 text-white">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Panel de Indicadores</h1>
              <p className="text-slate-500 font-medium flex items-center gap-2 mt-1 text-sm">
                <Globe className="w-4 h-4 text-blue-500" />
                Caracterización Territorial de Juventud Caribe y Pacífico Colombiano
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 relative z-10">
            {/* Real vs Mock live toggle */}
            <button 
              onClick={toggleMockData}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2 transition-all"
              title="Permite intercambiar entre los datos simulados cargados y los reales recibidos de internet."
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Ver: {useMock ? 'Simulado' : 'Producción Real'}</span>
            </button>

            {/* Region select filter */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button 
                onClick={() => setRegionFilter('all')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${regionFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Todas
              </button>
              <button 
                onClick={() => setRegionFilter('caribe')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${regionFilter === 'caribe' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Caribe
              </button>
              <button 
                onClick={() => setRegionFilter('pacifico')} 
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${regionFilter === 'pacifico' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pacífico
              </button>
            </div>

            <button 
              onClick={handleExportExcel}
              disabled={isExporting || !metrics?.total}
              className="flex items-center gap-2 px-6 py-3 text-xs font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-50 disabled:opacity-50 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <button 
              onClick={handleSignOut}
              className="px-4 py-3 text-xs font-bold bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-mono"
            >
              Salir
            </button>

            <Link to="/" className="px-5 py-3 text-xs font-bold bg-slate-950 text-white rounded-xl hover:bg-black transition-all">
              Ir al Chat
            </Link>
          </div>
        </header>

        {/* Dynamic overall Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <KPIMiniCard title="Total Filtrado" value={metrics.total} desc="Encuestas registradas" color="border-l-blue-600" />
            <KPIMiniCard title="Región Caribe" value={data.filter(x => CARIBE_DEPTS.includes(x.departamento)).length} desc="Jóvenes en el Caribe" color="border-l-amber-500" />
            <KPIMiniCard title="Región Pacífico" value={data.filter(x => PACIFICO_DEPTS.includes(x.departamento)).length} desc="Jóvenes en el Pacífico" color="border-l-violet-600" />
            <KPIMiniCard title="Porcentaje Mujeres" value={`${Math.round((data.filter(x => x.genero === 'Mujer').length / (data.length || 1)) * 100)}%`} desc="Participación femenina" color="border-l-pink-500" />
            <KPIMiniCard title="Interés en Tech" value={`${Math.round((data.filter(x => x.interes_trabajo_digital && x.interes_trabajo_digital.startsWith('Sí')).length / (data.length || 1)) * 100)}%`} desc="De cara al empleo" color="border-l-emerald-500" />
          </div>
        )}

        {/* Tab segmented selector */}
        <div className="flex overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-200 gap-1.5 shadow-sm scrollbar-hide">
          <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} label="Vista General & Transversal" />
          <TabButton active={activeTab === 'demographics'} onClick={() => setActiveTab('demographics')} label="1. Demografía" />
          <TabButton active={activeTab === 'education'} onClick={() => setActiveTab('education')} label="2 y 3. Educación, Trabajo & Ejes" />
          <TabButton active={activeTab === 'employability'} onClick={() => setActiveTab('employability')} label="4. Empleabilidad" />
          <TabButton active={activeTab === 'entrepreneurship'} onClick={() => setActiveTab('entrepreneurship')} label="5. Emprendimiento" />
          <TabButton active={activeTab === 'policy'} onClick={() => setActiveTab('policy')} label="6. Política Pública" />
        </div>

        {/* Conditional Tab Rendering */}
        {metrics && (
          <div className="space-y-12">
            
            {/* TABS 1: RESUMEN Y VISTAS TRANSVERSALES */}
            {activeTab === 'summary' && (
              <TransversalViews data={filteredData} />
            )}

            {/* TAB 2: DEMOGRAFÍA */}
            {activeTab === 'demographics' && (
              <div className="space-y-8">
                
                {/* DEPARTAMENTOS Y MUNICIPIOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Departamentos */}
                  <ChartCard title="Distribución de Jóvenes por Departamento">
                    <div className="space-y-4">
                      <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">
                        Distribución geográfica absoluta dentro de los departamentos del Caribe y Pacífico.
                      </p>
                      <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-2">
                        {metrics.departamentoRaw.map((item, idx) => {
                          const isCaribe = CARIBE_DEPTS.includes(item.label);
                          const isPac = PACIFICO_DEPTS.includes(item.label);
                          const tagBg = isCaribe ? 'bg-amber-50 text-amber-600 border-amber-200/50' : (isPac ? 'bg-violet-50 text-violet-600 border-violet-200/50' : 'bg-slate-50 text-slate-500');
                          const percent = Math.round((item.value / metrics.total) * 100);

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-lg text-[9px] uppercase font-black border ${tagBg}`}>
                                    {isCaribe ? 'Caribe' : (isPac ? 'Pacífico' : 'Región')}
                                  </span>
                                  {item.label}
                                </span>
                                <span>{item.value} ({percent}%)</span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden block">
                                <div className={`h-full rounded-full ${isCaribe ? 'bg-amber-500' : 'bg-violet-500'}`} style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </ChartCard>

                  {/* Municipios */}
                  <ChartCard title="Top 10 Municipios de Residencia">
                    <HorizontalBarChart data={metrics.municipioRaw} color="#3B82F6" />
                  </ChartCard>
                </div>

                {/* ZONA, RANGO EDAD, GÉNERO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ChartCard title="Ubicación de Zona (Rural/Urbana)">
                    <PieChartUI data={metrics.zonaRaw} colors={['#3B82F6', '#10B981']} hole innerRadius={45} />
                  </ChartCard>

                  <ChartCard title="Distribución por Rango de Edad">
                    <VerticalBarChart data={metrics.ageDist} color="#F59E0B" />
                  </ChartCard>

                  <ChartCard title="Identificación de Género">
                    <PieChartUI data={metrics.generoRaw} colors={['#EC4899', '#3B82F6', '#C084FC', '#94A3B8']} />
                  </ChartCard>
                </div>

                {/* GRUPOS VULNERABLES Y DISCAPACIDAD */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ChartCard title="Participación de Grupos Priorizados (Multiselección)">
                    <HorizontalBarChart data={metrics.groupsRaw} color="#8B5CF6" />
                  </ChartCard>

                  <ChartCard title="Tipo de Discapacidad Reportada (Condicional)">
                    {metrics.discapacidadRaw.length > 0 ? (
                      <HorizontalBarChart data={metrics.discapacidadRaw} color="#EF4444" />
                    ) : (
                      <div className="h-full flex items-center justify-center p-8 border-2 border-dashed rounded-3xl text-slate-400 font-semibold text-xs text-center leading-relaxed">
                        No hay reportes de discapacidad entre los jóvenes filtrados.
                      </div>
                    )}
                  </ChartCard>
                </div>

              </div>
            )}

            {/* TAB 3: EDUCACIÓN, EMPLEO E INTERESES */}
            {activeTab === 'education' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <ChartCard title="Nivel de Estudios Alcanzado">
                    <VerticalBarChart data={metrics.studiesDist} color="#F59E0B" />
                  </ChartCard>

                  <ChartCard title="Situación Ocupacional Actual">
                    <HorizontalBarChart data={metrics.situacionActual} color="#10B981" />
                  </ChartCard>

                  <ChartCard title="Interés Profesional en Tecnología">
                    <VerticalBarChart data={metrics.interesTrabajo} color="#3B82F6" />
                  </ChartCard>
                </div>

                <ChartCard title="Líneas Estratégicas de Participación Seleccionadas (Multiselección)">
                  <HorizontalBarChart data={metrics.lineasInteres} color="#EC4899" />
                </ChartCard>
              </div>
            )}

            {/* TAB 4: EMPLEABILIDAD */}
            {activeTab === 'employability' && (
              <div className="space-y-8">
                <ChartCard title="Áreas de Certificación Técnica o Profesional en Tecnología">
                  <p className="text-xs font-semibold text-slate-500 mb-6 leading-relaxed max-w-xl">
                    Sectores digitales específicos donde los jóvenes cuentan con un título comprobable, listado para priorizar capacitaciones y ofertas de empleo.
                  </p>
                  <HorizontalBarChart data={metrics.areasCertificacion} color="#06B6D4" height={345} />
                </ChartCard>
              </div>
            )}

            {/* TAB 5: EMPRENDIMIENTO */}
            {activeTab === 'entrepreneurship' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ChartCard title="Fórmula de Emprendimiento" className="lg:col-span-1">
                    <PieChartUI data={metrics.tieneEmprendimientoDist} colors={['#10B981', '#EF4444']} hole innerRadius={40} />
                  </ChartCard>

                  <ChartCard title="Temáticas de los Negocios" className="lg:col-span-1">
                    <HorizontalBarChart data={metrics.temaEmprendimiento} color="#8B5CF6" />
                  </ChartCard>

                  <ChartCard title="Etapa de Incubación" className="lg:col-span-1">
                    <VerticalBarChart data={metrics.etapaEmprendimiento} color="#F59E0B" />
                  </ChartCard>

                  <ChartCard title="Alcance Geográfico del Negocio" className="lg:col-span-1">
                    <PieChartUI data={metrics.alcanceEmprendimiento} colors={['#3B82F6', '#06B6D4', '#8B5CF6']} />
                  </ChartCard>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Barreras */}
                  <div className="lg:col-span-7">
                    <ChartCard title="Barreras en el Emprendimiento Digital">
                      <HorizontalBarChart data={metrics.barrerasEmprendimiento} color="#EF4444" />
                    </ChartCard>
                  </div>

                  {/* Directorio de Iniciativas con Enlaces */}
                  <div className="lg:col-span-5 flex flex-col">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex-1 flex flex-col">
                      <div className="border-l-4 border-blue-600 pl-4 mb-6 flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-black text-slate-800">Directorio de Iniciativas</h3>
                          <p className="text-slate-500 text-xs font-semibold mt-0.5">Nombres y objetivos reportados</p>
                        </div>
                      </div>

                      {/* Search project */}
                      <div className="relative mb-4">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input 
                          type="text" 
                          placeholder="Buscar iniciativa..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 block"
                        />
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3.5 pr-1.5 scrollbar-hide">
                        {searchedProjects.map((p, idx) => (
                          <div key={idx} className="p-4 bg-slate-50/60 border border-slate-150 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-xs font-black text-slate-800 leading-snug">{p.name}</h4>
                              <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded-lg uppercase flex-shrink-0">
                                {p.stage}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-extrabold mt-1">
                              Sede: {p.departamento} | Temas: {p.theme ? (Array.isArray(p.theme) ? p.theme.join(', ') : p.theme) : 'N/A'}
                            </p>
                            <p className="text-xs font-medium text-slate-600 leading-relaxed mt-2 italic bg-white p-3 rounded-lg border border-slate-100">
                              "{p.objective}"
                            </p>
                            
                            {p.links && p.links.toLowerCase() !== 'no' && (
                              <div className="mt-3 flex justify-end">
                                <a 
                                  href={p.links.startsWith('http') ? p.links : `https://${p.links}`}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  <Link2 className="w-3.5 h-3.5" />
                                  <span>Visitar Redes / Enlace</span>
                                </a>
                              </div>
                            )}
                          </div>
                        ))}

                        {searchedProjects.length === 0 && (
                          <p className="text-center text-slate-400 text-xs italic py-8">No se encontraron iniciativas.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 6: POLÍTICA PÚBLICA */}
            {activeTab === 'policy' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <ChartCard title="Participación Ciudadana Previa">
                    <PieChartUI data={metrics.participacionPreviaDist} colors={['#10B981', '#EF4444']} hole innerRadius={45} />
                  </ChartCard>

                  <ChartCard title="Pertenencia a Redes Juveniles / Colectivos">
                    <PieChartUI data={metrics.perteneceRedDist} colors={['#3B82F6', '#EF4444']} />
                  </ChartCard>

                  {/* Organizaciones/Colectivos list */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col h-full justify-between">
                    <div className="border-l-4 border-emerald-600 pl-4 mb-4">
                      <h3 className="text-lg font-black text-slate-800">Redes y Organizaciones</h3>
                      <p className="text-slate-500 text-xs font-semibold mt-0.5">Identificadas por jóvenes encuestados</p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[180px] space-y-2 pr-1 scrollbar-hide py-3">
                      {metrics.activeOrgs.map((org, index) => (
                        <div key={index} className="px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-extrabold text-slate-600">
                          {org}
                        </div>
                      ))}
                      {metrics.activeOrgs.length === 0 && (
                        <p className="text-slate-400 italic text-xs py-8 text-center">Sin organizaciones reportadas en estas respuestas.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <ChartCard title="Temáticas de Interés de Política Pública Digital">
                    <HorizontalBarChart data={metrics.temasPolitica} color="#06B6D4" />
                  </ChartCard>

                  <ChartCard title="Formas de Participación Preferidas por la Juventud">
                    <HorizontalBarChart data={metrics.formaParticipar} color="#8B5CF6" />
                  </ChartCard>
                </div>
              </div>
            )}

            {/* ACTIVIDAD DIARIA */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="border-l-4 border-slate-600 pl-4 mb-6">
                <h3 className="text-lg font-black text-slate-800">Historial de Actividad</h3>
                <p className="text-slate-500 text-xs font-semibold mt-0.5">Historial cronológico de registros de encuestas territoriales</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-150">
                      <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400">Fecha de Caracterización</th>
                      <th className="py-4 px-4 text-[10px] font-black uppercase tracking-wider text-slate-400 text-right">Encuestas Completadas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.dailyActivity.map((day: any) => (
                      <tr key={day.date} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 text-xs font-black text-slate-700">{day.date}</td>
                        <td className="py-4 px-4 text-sm font-black text-blue-600 text-right">{day.count}</td>
                      </tr>
                    ))}
                    {metrics.dailyActivity.length === 0 && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-slate-400 italic text-xs">No hay actividad completada todavía.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        <footer className="pt-10 text-center text-slate-400 text-xs border-t border-slate-100 flex flex-col items-center gap-4">
          <img 
            src="https://drive.google.com/uc?export=view&id=174vtmcqrDB0haU8p_G9CVfWZxAn3fOvn" 
            alt="OIT & UNFPA"
            className="h-10 grayscale opacity-50"
            referrerPolicy="no-referrer"
          />
          <p>© 2026 Observatorio de Caracterización Digital - Naciones Unidas OIT & UNFPA Colombia</p>
        </footer>

      </div>
    </div>
  );
}

// UI Mini Components
function KPIMiniCard({ title, value, desc, color }: { title: string; value: any; desc: string; color: string }) {
  return (
    <div className={`bg-white p-5 rounded-2xl border border-slate-200 border-l-4 shadow-sm flex flex-col justify-between ${color}`}>
      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">{title}</span>
      <span className="text-xl md:text-2xl font-black text-slate-800 block mt-2">{value}</span>
      <span className="text-[10px] font-medium text-slate-500 block mt-1 leading-snug">{desc}</span>
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-3 rounded-xl text-xs font-black whitespace-nowrap transition-all focus:outline-none ${
        active 
          ? 'bg-blue-600 text-white shadow-sm' 
          : 'bg-slate-50 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
      }`}
    >
      {label}
    </button>
  );
}

function ChartCard({ title, children, className, height = 250 }: { title: string; children: React.ReactNode; className?: string; height?: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-150 flex flex-col ${className || ''}`}
    >
      <h3 className="text-base font-black text-slate-800 mb-6 border-l-4 border-blue-600 pl-4 leading-none">{title}</h3>
      <div className="flex-1 w-full" style={{ minHeight: `${height}px`, maxHeight: `${height + 100}px` }}>
        {children}
      </div>
    </motion.div>
  );
}

// Recharts wrappers
const CHART_TOOLTIP_STYLE = { 
  borderRadius: '1.25rem', 
  border: 'none', 
  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', 
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: '11px',
  fontWeight: '600'
};

function VerticalBarChart({ data, color }: { data: any[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
        <XAxis 
          dataKey="label" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} 
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CHART_TOOLTIP_STYLE} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} barSize={25} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBarChart({ data, color, height }: { data: any[]; color: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart 
        data={data} 
        layout="vertical" 
        margin={{ top: 10, right: 20, left: 30, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.1} />
        <XAxis type="number" hide />
        <YAxis 
          dataKey="label" 
          type="category" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fontSize: 9, fontWeight: 700, fill: '#475569' }}
          width={110}
        />
        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CHART_TOOLTIP_STYLE} />
        <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} barSize={12} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function PieChartUI({ data, colors, hole = false, innerRadius = 0 }: { data: any[]; colors: string[]; hole?: boolean; innerRadius?: number }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={innerRadius}
          outerRadius={70}
          paddingAngle={hole ? 4 : 0}
          dataKey="value"
          nameKey="label"
        >
          {data.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <Legend 
          verticalAlign="bottom" 
          iconType="circle" 
          formatter={(value) => <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
