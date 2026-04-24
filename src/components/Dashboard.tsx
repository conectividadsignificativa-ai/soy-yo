import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { LayoutDashboard, Users, Globe, BookOpen, Brain, Zap, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'submissions'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const submissions = querySnapshot.docs.map(doc => doc.data());
        setData(submissions);
      } catch (error) {
        console.error("Error fetching submissions:", error);
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
        const values = typeof val === 'string' && val.includes(',') 
          ? val.split(',').map(s => s.trim()) 
          : [val];
        
        values.forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).map(([label, value]) => ({ label, value }));
  };

  const genderData = getChartData('p9');
  const ageData = getChartData('p8');
  const zoneData = getChartData('p7');
  const skillData = getChartData('p32');
  const interestData = getChartData('p49');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 leading-tight">Estadísticas del Proyecto</h1>
              <p className="text-slate-500 text-sm">Caracterización de Jóvenes TIC - Caribe y Pacífico</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al Chat
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users className="text-blue-600" />} label="Total Inscritos" value={data.length} color="bg-blue-50" />
          <StatCard icon={<Globe className="text-emerald-600" />} label="Zonas Cubiertas" value={new Set(data.map(d => d.p6)).size} color="bg-emerald-50" />
          <StatCard icon={<BookOpen className="text-amber-600" />} label="Niveles de Estudio" value={new Set(data.map(d => d.p12)).size} color="bg-amber-50" />
          <StatCard icon={<Brain className="text-purple-600" />} label="Líneas de Interés" value={interestData.length} color="bg-purple-50" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Edad y Género */}
          <ChartContainer title="Distribución por Género">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="label"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Rangos de Edad">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          {/* Habilidades e Intereses */}
          <ChartContainer title="Nivel de Habilidades Digitales">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" axisLine={false} tickLine={false} />
                  <YAxis dataKey="label" type="category" axisLine={false} tickLine={false} tick={{fontSize: 11}} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

          <ChartContainer title="Líneas de Interés">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={interestData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    nameKey="label"
                    label
                  >
                    {interestData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" layout="horizontal" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>

        </div>

        {/* Zona */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ChartContainer title="Ubicación (Rural vs Urbana)" className="lg:col-span-1">
                <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie
                        data={zoneData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        dataKey="value"
                        nameKey="label"
                    >
                        {zoneData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#10b981'} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </ChartContainer>
            
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-center gap-6">
                <div className="flex items-center gap-3">
                    <Zap className="w-6 h-6 text-yellow-500" />
                    <h3 className="text-lg font-bold text-slate-800">Resumen Ejecutivo</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Municipio con más inscritos</p>
                        <p className="text-xl font-bold text-slate-900">{getTopValue(data, 'p6') || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Nivel educativo predominante</p>
                        <p className="text-xl font-bold text-slate-900">{getTopValue(data, 'p12') || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Uso principal de Internet</p>
                        <p className="text-xl font-bold text-slate-900">{getTopValue(data, 'p14') || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-500">Motivación principal</p>
                        <p className="text-xl font-bold text-slate-900">{getTopValue(data, 'p20') || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4"
    >
      <div className={cn("p-4 rounded-2xl", color)}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </motion.div>
  );
}

function ChartContainer({ title, children, className }: any) {
  return (
    <div className={cn("bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6", className)}>
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

function getTopValue(data: any[], field: string) {
    if (!data.length) return null;
    const counts: Record<string, number> = {};
    data.forEach(item => {
        const val = item[field];
        if (val) counts[val] = (counts[val] || 0) + 1;
    });
    return Object.entries(counts).sort((a,b) => b[1] - a[1])[0]?.[0];
}
