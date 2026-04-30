import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { 
  LayoutDashboard, Users, Globe, BookOpen, Brain, Zap, ArrowLeft, 
  ShieldCheck, AlertTriangle, Monitor, Target, Heart, Search, HelpCircle, GraduationCap,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F43F5E'];

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
  }, []);

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
    
    // Bloque 1
    const ageDist = getChartData('rango_edad');
    const zoneDist = getChartData('zona');
    const groupsDist = getChartData('grupos').filter(v => v.label !== 'Ninguna de las anteriores');

    // Bloque 2
    const topUsos = getChartData('uso_internet_principal').slice(0, 5);
    const dejoAlgoCount = data.filter(d => d.dejo_algo === 'si').length;
    const actividadesAfectadas = getChartData('que_dejo');
    const horasPromedio = getChartData('horas_internet');
    const importanciaDist = getChartData('importancia_internet');

    // Bloque 3
    const nivelHabilidades = getChartData('nivel_habilidades');
    const seguridadPercibida = getChartData('seguridad_percibida');
    const solucionProblemas = getChartData('solucion_problemas');
    const dondeAprendio = getChartData('donde_aprendio');
    const usoIaCount = data.filter(d => d.uso_ia === 'si').length;
    const usosIaDist = getChartData('uso_ia_para');

    // Bloque 4
    const tipoConexion = getChartData('forma_conexion');
    const barreras = getChartData('barreras_conexion');
    const riesgosCount = data.filter(d => {
      const g = d.situaciones_riesgo;
      const list = Array.isArray(g) ? g : (typeof g === 'string' ? g.split(', ') : []);
      return list.length > 0 && !list.includes('ninguna');
    }).length;
    const sabeInfoPrivada = data.filter(d => d.conoce_info_privada === 'si').length;
    const sabeDenunciar = data.filter(d => d.sabe_denunciar === 'si').length;

    // Bloque 5
    const lineasInteres = getChartData('lineas_interes');

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
      ageDist, zoneDist, groupsDist,
      topUsos, dejoAlgoCount, actividadesAfectadas, horasPromedio, importanciaDist,
      nivelHabilidades, seguridadPercibida, solucionProblemas, dondeAprendio, usoIaCount, usosIaDist,
      tipoConexion, barreras, riesgosCount, sabeInfoPrivada, sabeDenunciar,
      lineasInteres,
      dailyActivity
    };
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Procesando datos territoriales...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No hay datos aún</h2>
          <p className="text-slate-500 max-w-xs">Comienza la caracterización para ver los indicadores en tiempo real.</p>
          <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold">Ir al Chatbot</Link>
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
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Caracterizados</span>
              <span className="text-2xl font-black text-blue-600">{stats.total}</span>
            </div>
            <Link to="/" className="px-6 py-3 text-sm font-bold bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg">
              Volver
            </Link>
          </div>
        </header>

        {/* 1. PERFIL GENERAL */}
        <SectionHeader title="BLOQUE 1: Perfil General" icon={<Users />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Distribución por Rango de Edad">
            <SimpleBarChart data={stats.ageDist} />
          </ChartCard>
          <ChartCard title="Distribución por Zona">
            <PieChartUI data={stats.zoneDist} colors={['#3B82F6', '#10B981']} />
          </ChartCard>
          <ChartCard title="Grupos Priorizados">
            <HorizontalBarChart data={stats.groupsDist} color="#8B5CF6" />
          </ChartCard>
        </div>

        {/* 2. USO DE INTERNET */}
        <SectionHeader title="BLOQUE 2: Uso de Internet" icon={<Globe />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Principales Usos de Internet">
            <HorizontalBarChart data={stats.topUsos} color="#F59E0B" />
          </ChartCard>
          <div className="flex flex-col gap-6">
            <KPICard 
              label="Brecha de Oportunidad" 
              value={`${((stats.dejoAlgoCount / stats.total) * 100).toFixed(1)}%`}
              sublabel="Dejaron de hacer algo por falta de internet"
              color="bg-red-50 text-red-600"
              icon={<AlertTriangle />}
            />
            <ChartCard title="Horas Promedio de Uso" className="flex-1">
              <PieChartUI data={stats.horasPromedio} hole innerRadius={40} />
            </ChartCard>
          </div>
          <div className="lg:col-span-1 space-y-6">
            <ChartCard title="Actividades Afectadas">
              <HorizontalBarChart data={stats.actividadesAfectadas} color="#EF4444" />
            </ChartCard>
            <ChartCard title="Importancia del Internet">
              <SimpleBarChart data={stats.importanciaDist} color="#06B6D4" />
            </ChartCard>
          </div>
        </div>

        {/* 3. HABILIDADES DIGITALES E IA */}
        <SectionHeader title="BLOQUE 3: Habilidades Digitales e IA" icon={<Brain />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Nivel de Habilidades">
            <PieChartUI data={stats.nivelHabilidades} colors={['#10B981', '#3B82F6', '#F59E0B']} />
          </ChartCard>
          <ChartCard title="Capacidad de Uso Seguro">
            <SimpleBarChart data={stats.seguridadPercibida} color="#8B5CF6" />
          </ChartCard>
          <ChartCard title="Resolución de Problemas">
            <HorizontalBarChart data={stats.solucionProblemas} color="#3B82F6" />
          </ChartCard>
          <ChartCard title="Origen de Formación" className="lg:col-span-1">
             <HorizontalBarChart data={stats.dondeAprendio} color="#EC4899" />
          </ChartCard>
          <div className="flex flex-col gap-6">
            <KPICard 
              label="Adopción de IA" 
              value={`${((stats.usoIaCount / stats.total) * 100).toFixed(1)}%`}
              sublabel="Han usado herramientas de IA"
              color="bg-emerald-50 text-emerald-600"
              icon={<Zap />}
            />
            <ChartCard title="Principales Usos de IA" className="flex-1">
              <HorizontalBarChart data={stats.usosIaDist} color="#10B981" />
            </ChartCard>
          </div>
          <div className="bg-blue-600 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center text-white space-y-4">
             <GraduationCap className="w-12 h-12 opacity-50" />
             <p className="text-sm font-bold uppercase tracking-widest opacity-80">Insights de Habilidades</p>
             <p className="text-xl font-medium leading-relaxed">
               La mayoría de los jóvenes se consideran en un nivel 
               <span className="font-black text-yellow-400 block text-2xl mt-2">{stats.nivelHabilidades[0]?.label || 'Básico'}</span>
             </p>
          </div>
        </div>

        {/* 4. ACCESO, CONECTIVIDAD Y RIESGOS */}
        <SectionHeader title="BLOQUE 4: Acceso, Conectividad y Riesgos" icon={<ShieldCheck />} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChartCard title="Tipo de Conexión Predominante">
            <HorizontalBarChart data={stats.tipoConexion} color="#3B82F6" />
          </ChartCard>
          <ChartCard title="Barreras de Conectividad">
            <HorizontalBarChart data={stats.barreras} color="#EF4444" />
          </ChartCard>
          <div className="space-y-6">
            <KPICard 
              label="Exposición a Riesgos" 
              value={`${((stats.riesgosCount / stats.total) * 100).toFixed(1)}%`}
              sublabel="Han vivido situaciones de riesgo digital"
              color="bg-orange-50 text-orange-600"
              icon={<AlertTriangle />}
            />
            <div className="grid grid-cols-2 gap-4">
              <StatusMiniCard 
                label="Privacidad" 
                percent={Math.round((stats.sabeInfoPrivada / stats.total) * 100)} 
                desc="Saben proteger datos"
              />
              <StatusMiniCard 
                label="Denuncia" 
                percent={Math.round((stats.sabeDenunciar / stats.total) * 100)} 
                desc="Saben dónde acudir"
              />
            </div>
          </div>
        </div>

        {/* 5. PROYECCIÓN E INTERESES */}
        <SectionHeader title="BLOQUE 5: Proyección e Intereses" icon={<Target />} />
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <ChartCard title="Distribución por Líneas de Interés">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.lineasInteres} margin={{ top: 20, right: 30, left: 40, bottom: 60 }}>
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
                    {stats.lineasInteres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
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
