// TransversalViews.tsx
import { useMemo } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { Users, HelpCircle, ShieldCheck, Award, Link2 } from 'lucide-react';
import { motion } from 'motion/react';

interface TransversalViewsProps {
  data: any[];
}

export default function TransversalViews({ data }: TransversalViewsProps) {
  // Region lists
  const CARIBE_DEPTS = ['Atlántico', 'Bolívar', 'Cesar', 'Córdoba', 'La Guajira', 'Magdalena', 'Sucre', 'San Andrés'];
  const PACIFICO_DEPTS = ['Chocó', 'Valle del Cauca', 'Cauca', 'Nariño'];

  const CHART_TOOLTIP_STYLE = { 
    borderRadius: '1.25rem', 
    border: 'none', 
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)', 
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '11px',
    fontWeight: '600'
  };

  const referralData = useMemo(() => {
    const REFERRAL_LABELS: Record<string, string> = {
      'goyn': 'GOYN',
      'cora': 'CORA',
      'fedesoft': 'Fedesoft',
      'cintel': 'Cintel',
      'oit': 'OIT',
      'biznation': 'BizNation',
      'directo': 'Directo (Estándar)'
    };

    const referralCounts: Record<string, number> = {
      'goyn': 0,
      'cora': 0,
      'fedesoft': 0,
      'cintel': 0,
      'oit': 0,
      'biznation': 0,
      'directo': 0
    };

    data.forEach(item => {
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

    return Object.entries(REFERRAL_LABELS).map(([key, label]) => ({
      label,
      value: referralCounts[key] || 0
    }));
  }, [data]);

  // 1. Scorecard de participación por eje
  const scorecardStats = useMemo(() => {
    const total = data.length || 1;
    let empCount = 0;
    let emprCount = 0;
    let polCount = 0;

    data.forEach(item => {
      const li = item.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      if (list.some((x: string) => x.startsWith('Empleabilidad'))) empCount++;
      if (list.some((x: string) => x.startsWith('Emprendimiento'))) emprCount++;
      if (list.some((x: string) => x.startsWith('Participación'))) polCount++;
    });

    return [
      { name: 'Empleabilidad Digital', count: empCount, pct: Math.round((empCount / total) * 100), color: 'bg-blue-50 text-blue-600 border-blue-100 ring-blue-500/20' },
      { name: 'Emprendimiento Digital', count: emprCount, pct: Math.round((emprCount / total) * 100), color: 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-emerald-500/20' },
      { name: 'Política Pública Digital', count: polCount, pct: Math.round((polCount / total) * 100), color: 'bg-violet-50 text-violet-600 border-violet-100 ring-violet-500/20' },
    ];
  }, [data]);

  // 2. Overlap calculations for Venn-list representation
  const overlapsStats = useMemo(() => {
    let onlyEmp = 0, onlyEmpr = 0, onlyPol = 0;
    let empAndEmpr = 0, empAndPol = 0, emprAndPol = 0;
    let allThree = 0;

    data.forEach(item => {
      const li = item.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      
      const hasEmp = list.some((x: string) => x.startsWith('Empleabilidad'));
      const hasEmpr = list.some((x: string) => x.startsWith('Emprendimiento'));
      const hasPol = list.some((x: string) => x.startsWith('Participación'));

      if (hasEmp && hasEmpr && hasPol) allThree++;
      else if (hasEmp && hasEmpr) empAndEmpr++;
      else if (hasEmp && hasPol) empAndPol++;
      else if (hasEmpr && hasPol) emprAndPol++;
      else if (hasEmp) onlyEmp++;
      else if (hasEmpr) onlyEmpr++;
      else if (hasPol) onlyPol++;
    });

    return [
      { name: 'Solo un eje de interés', value: onlyEmp + onlyEmpr + onlyPol, sub: `Empleabilidad: ${onlyEmp} | Emprendimiento: ${onlyEmpr} | Política: ${onlyPol}` },
      { name: 'Cruce Empleabilidad × Emprendimiento', value: empAndEmpr, sub: 'Jóvenes interesados en ambas líneas de impulso privado/profesional' },
      { name: 'Cruce Empleabilidad × Política Pública', value: empAndPol, sub: 'Jóvenes interesados en defender derechos laborales e institucionales' },
      { name: 'Cruce Emprendimiento × Política Pública', value: emprAndPol, sub: 'Jóvenes con iniciativas tecnológicas que inciden en desarrollo local' },
      { name: 'Intersección Completa (Todos los 3 Ejes)', value: allThree, sub: 'Líderes integrales motivados por las 3 dimensiones digitales', highlight: true }
    ];
  }, [data]);

  // 3. Mapa de interseccionalidad (Heatmap: Género × Grupos Vulnerables)
  const heatmapStats = useMemo(() => {
    const genders = ['Mujer', 'Hombre', 'Persona no binaria'];
    const groups = [
      'Población afrodescendiente, raizal o palenquera',
      'Comunidad indígena',
      'Persona con discapacidad',
      'Persona LGBTIQ+',
      'Persona migrante o en situación de movilidad',
      'Víctima del conflicto armado',
      'Joven cuidador/a'
    ];

    const grid: Record<string, Record<string, number>> = {};
    genders.forEach(g => {
      grid[g] = {};
      groups.forEach(gr => {
        grid[g][gr] = 0;
      });
    });

    let maxCount = 0;

    data.forEach(item => {
      const itemGender = item.genero;
      if (itemGender && genders.includes(itemGender)) {
        const itemGroups = item.grupos;
        const list = Array.isArray(itemGroups) ? itemGroups : (typeof itemGroups === 'string' ? itemGroups.split(', ') : []);
        list.forEach((gr: string) => {
          if (groups.includes(gr)) {
            grid[itemGender][gr] = (grid[itemGender][gr] || 0) + 1;
            if (grid[itemGender][gr] > maxCount) {
              maxCount = grid[itemGender][gr];
            }
          }
        });
      }
    });

    return { genders, groups, grid, maxCount: maxCount || 1 };
  }, [data]);

  // 4. Flujo de caracterización: Cohorte / Rango Edad -> Ejes elegidos
  const flowStats = useMemo(() => {
    const cohorts = ['15–17 años', '18–21 años', '22–25 años', '26–28 años', 'Mayor de 28 años'];
    const flowData = cohorts.map(c => {
      let empl = 0;
      let empr = 0;
      let pol = 0;

      data.forEach(item => {
        if (item.rango_edad === c) {
          const li = item.lineas_interes;
          const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
          if (list.some((x: string) => x.startsWith('Empleabilidad'))) empl++;
          if (list.some((x: string) => x.startsWith('Emprendimiento'))) empr++;
          if (list.some((x: string) => x.startsWith('Participación'))) pol++;
        }
      });

      return {
        rango: c,
        'Empleabilidad': empl,
        'Emprendimiento': empr,
        'Política Pública': pol
      };
    });

    return flowData;
  }, [data]);

  // 5. Perfil típico por región: Caribe vs Pacífico
  const regionComparison = useMemo(() => {
    const caribeList = data.filter(item => item.departamento && CARIBE_DEPTS.includes(item.departamento));
    const pacificoList = data.filter(item => item.departamento && PACIFICO_DEPTS.includes(item.departamento));

    const getStatsForList = (list: any[]) => {
      const total = list.length || 1;
      
      // % Interés en Tech
      const techInterestCount = list.filter(item => 
        item.interes_trabajo_digital === 'Sí, estoy buscando algo en ese sector' ||
        item.interes_trabajo_digital === 'Ya tengo experiencia en temas digitales, o estoy trabajando en estos temas'
      ).length;

      // % Tiene emprendimiento
      const entrepreneurCount = list.filter(item => item.tiene_emprendimiento === 'Sí').length;

      // % Participación ciudadana previa
      const prevParticipationCount = list.filter(item => item.participacion_previa === 'Sí').length;

      // % Mujer
      const womanCount = list.filter(item => item.genero === 'Mujer').length;

      // % Zona Rural
      const ruralCount = list.filter(item => item.zona === 'Rural').length;

      return {
        total,
        techInterestPct: Math.round((techInterestCount / total) * 100),
        entrepreneurPct: Math.round((entrepreneurCount / total) * 100),
        prevParticipationPct: Math.round((prevParticipationCount / total) * 100),
        womanPct: Math.round((womanCount / total) * 100),
        ruralPct: Math.round((ruralCount / total) * 100)
      };
    };

    const caribeStats = getStatsForList(caribeList);
    const pacificoStats = getStatsForList(pacificoList);

    // Radar chart compatible structure
    const radarData = [
      { subject: 'Interés Tecnología', Caribe: caribeStats.techInterestPct, Pacifico: pacificoStats.techInterestPct, fullMark: 100 },
      { subject: 'Emprendedores', Caribe: caribeStats.entrepreneurPct, Pacifico: pacificoStats.entrepreneurPct, fullMark: 100 },
      { subject: 'Participación Ciu.', Caribe: caribeStats.prevParticipationPct, Pacifico: pacificoStats.prevParticipationPct, fullMark: 100 },
      { subject: 'Mujeres Líderes', Caribe: caribeStats.womanPct, Pacifico: pacificoStats.womanPct, fullMark: 100 },
      { subject: 'Zona Rural', Caribe: caribeStats.ruralPct, Pacifico: pacificoStats.ruralPct, fullMark: 100 },
    ];

    return { caribeStats, pacificoStats, radarData };
  }, [data]);

  return (
    <div className="space-y-12">
      
      {/* SCORECARD DE PARTICIPACIÓN POR EJE */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="border-l-4 border-blue-600 pl-4 mb-6">
          <h3 className="text-xl font-black text-slate-800">Scorecard de Participación por Eje</h3>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Distribución general de intereses tecnológicos priorizados</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scorecardStats.map((item, index) => (
            <div 
              key={index} 
              className={`p-6 rounded-3xl border flex flex-col justify-between relative overflow-hidden group shadow-sm transition-all hover:shadow-md ${item.color}`}
            >
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-85 block">Línea Estratégica</span>
                <span className="text-lg font-black tracking-tight mt-1 leading-tight block">{item.name}</span>
              </div>
              <div className="flex items-baseline gap-2 mt-8">
                <span className="text-4xl font-black">{item.pct}%</span>
                <span className="text-xs font-bold opacity-75">({item.count} jóvenes)</span>
              </div>
              <div className="mt-4 h-2 w-full bg-black/5 rounded-full overflow-hidden block">
                <div className="h-full bg-current rounded-full" style={{ width: `${item.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MONITOREO DE ENLACES DINÁMICOS (REFERIDOS POR SOCIOS) */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="border-l-4 border-teal-600 pl-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-800">Monitoreo de Enlaces Dinámicos (Socio-Referentes)</h3>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">Control en tiempo real de encuestas recibidas por cada canal de difusión</p>
          </div>
          <span className="text-xs font-black bg-teal-50 text-teal-700 px-3 py-1.5 rounded-xl border border-teal-200 uppercase tracking-wider self-start md:self-auto">
            Canales de Difusión
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Gráfico de Barras */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Envíos por Enlace de Referente</h4>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={referralData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="label" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="value" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Listado de Enlaces Dinámicos para Copiar */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Enlaces Dinámicos Oficiales:</h4>
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Usa y comparte estos enlaces específicos con cada socio para medir su impacto de captación:
              </p>
              
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {(() => {
                  const currentBase = window.location.origin + window.location.pathname;
                  const cleanBase = currentBase.endsWith('/') ? currentBase : currentBase + '/';
                  
                  const links = [
                    { id: 'goyn', name: 'GOYN', url: `${cleanBase}#/?ref=goyn` },
                    { id: 'cora', name: 'CORA', url: `${cleanBase}#/?ref=cora` },
                    { id: 'fedesoft', name: 'Fedesoft', url: `${cleanBase}#/?ref=fedesoft` },
                    { id: 'cintel', name: 'Cintel', url: `${cleanBase}#/?ref=cintel` },
                    { id: 'oit', name: 'OIT', url: `${cleanBase}#/?ref=oit` },
                    { id: 'biznation', name: 'BizNation', url: `${cleanBase}#/?ref=biznation` },
                    { id: 'estandar', name: 'Enlace Estándar', url: `${cleanBase}#/?ref=` }
                  ];

                  return links.map((linkObj) => (
                    <div key={linkObj.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="text-[10px] font-black uppercase text-teal-600 block">{linkObj.name}</span>
                        <p className="text-xs font-mono text-slate-500 truncate mt-0.5">{linkObj.url}</p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(linkObj.url);
                          alert(`¡Enlace de ${linkObj.name} copiado al portapapeles!`);
                        }}
                        className="p-2 bg-white hover:bg-slate-150 border border-slate-200 rounded-lg text-slate-500 hover:text-teal-600 transition-colors shadow-sm cursor-pointer flex-shrink-0"
                        title="Copiar enlace"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN TRANSVERSAL RECOMENDADA (Venn / Superposiciones & Heatmap) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CRUCES Y SUPERPOSICIÓN DE INTERESES (VENN LIST) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 lg:col-span-6 flex flex-col">
          <div className="border-l-4 border-violet-600 pl-4 mb-6">
            <h3 className="text-lg font-black text-slate-800">Intersecciones de Intereses</h3>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">Cruces múltiples detallando la superposición de vocación</p>
          </div>

          <div className="flex-1 space-y-4">
            {overlapsStats.map((overlap, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-2xl border transition-all ${
                  overlap.highlight 
                    ? 'bg-violet-50/50 border-violet-250 ring-2 ring-violet-500/20' 
                    : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black tracking-tight ${overlap.highlight ? 'text-violet-700' : 'text-slate-700'}`}>
                    {overlap.name}
                  </span>
                  <span className={`text-base font-black px-3 py-1 rounded-xl ${overlap.highlight ? 'bg-violet-600 text-white' : 'bg-slate-200/80 text-slate-800'}`}>
                    {overlap.value}
                  </span>
                </div>
                <p className="text-[10px] font-medium text-slate-500 mt-1 leading-relaxed">
                  {overlap.sub}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* MAPA DE INTERSECCIONALIDAD (GÉNERO × GRUPOS PRIORIZADOS) */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 lg:col-span-6 flex flex-col">
          <div className="border-l-4 border-pink-600 pl-4 mb-6">
            <h3 className="text-lg font-black text-slate-800">Mapa de Interseccionalidad (Heatmap)</h3>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">Matriz de densidad cruzando Identidad de Género con Grupos Priorizados</p>
          </div>

          <div className="flex-1 overflow-x-auto">
            <div className="min-w-[480px] space-y-3">
              {/* Header */}
              <div className="grid grid-cols-4 gap-2 text-center border-b border-slate-150 pb-2">
                <div className="text-[10px] font-black uppercase text-slate-400 text-left">Grupo Vulnerable</div>
                {heatmapStats.genders.map(g => (
                  <div key={g} className="text-[10px] font-black uppercase text-slate-500 truncate">{g}</div>
                ))}
              </div>

              {/* Rows */}
              {heatmapStats.groups.map(group => (
                <div key={group} className="grid grid-cols-4 gap-2 items-center hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
                  <div className="text-[10px] font-bold text-slate-600 truncate leading-tight pr-1" title={group}>
                    {group}
                  </div>
                  {heatmapStats.genders.map(gender => {
                    const count = heatmapStats.grid[gender][group] || 0;
                    const pct = count / heatmapStats.maxCount;
                    
                    // Colors based on density
                    let cellBg = 'bg-slate-100/40 text-slate-400';
                    if (count > 0) {
                      if (pct <= 0.3) cellBg = 'bg-indigo-50 text-indigo-700 border border-indigo-100/50';
                      else if (pct <= 0.6) cellBg = 'bg-indigo-100/80 text-indigo-800 font-extrabold border border-indigo-200/50';
                      else cellBg = 'bg-indigo-600 text-white font-black shadow-sm ring-2 ring-indigo-500/20';
                    }

                    return (
                      <div 
                        key={gender} 
                        className={`py-3 rounded-xl text-center text-xs transition-transform hover:scale-[1.02] flex items-center justify-center font-mono ${cellBg}`}
                        title={`${count} respuestas en ${gender} - ${group}`}
                      >
                        {count}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Legend guide */}
            <div className="flex items-center gap-4 mt-6 justify-end text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Leyenda de Densidad:</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 border inline-block" /> 0</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-50 border inline-block" /> Baja</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-100 border inline-block" /> Media</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" /> Máxima</span>
            </div>
          </div>
        </div>

      </div>

      {/* FLUJO DE CARACTERIZACIÓN (Sankey-style Flow o Cohortes y Concentración) */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="border-l-4 border-emerald-600 pl-4 mb-8">
          <h3 className="text-lg font-black text-slate-800">Flujo de Caracterización por Cohorte Etaria</h3>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Qué ejes eligen los jóvenes según su rango de edad y dónde se concentran</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flowStats} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="rango" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '1.25rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} formatter={(val) => <span className="text-xs font-bold text-slate-500">{val}</span>} />
                <Bar dataKey="Empleabilidad" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Emprendimiento" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Política Pública" fill="#C084FC" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Análisis de la Cohorte</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Observación Territorial:</span>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                Históricamente, los jóvenes de <strong className="text-slate-800">18–25 años</strong> concentran la mayor tasa de participación, mostrando un equilibrio fluido entre buscar empleo tecnológico calificado y la incubación de ideas rurales con redes sociales en su localidad.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <span className="text-[11px] font-black text-indigo-600 uppercase tracking-wider block flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> Eje Cohesivo
              </span>
              <p className="text-xs font-semibold text-indigo-700 leading-relaxed">
                La cohorte de <strong className="text-indigo-900">15–17 años</strong> demuestra un interés destacado en <strong className="text-indigo-900">Política Pública</strong>, impulsados por la demanda de derechos de alfabetización y acceso digital en veredas aisladas del Pacífico.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* PERFIL TÍPICO POR REGIÓN (Radar y side-by-side comparador Caribe vs Pacífico) */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="border-l-4 border-amber-600 pl-4 mb-8">
          <h3 className="text-lg font-black text-slate-800">Perfil Típico Comparativo: Caribe vs Pacífico</h3>
          <p className="text-slate-500 text-xs font-semibold mt-0.5">Contraste de indicadores clave entre las dos regiones geográficas de interés prioritario</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* RADAR CHART */}
          <div className="lg:col-span-6 h-[340px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" data={regionComparison.radarData}>
                <PolarGrid strokeOpacity={0.15} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                <Radar name="Pacífico Colombiano" dataKey="Pacifico" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
                <Radar name="Caribe Colombiano" dataKey="Caribe" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} formatter={(val) => <span className="text-xs font-bold text-slate-600">{val}</span>} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* SIDE-BY-SIDE PROGRESS BAR COMPARISON */}
          <div className="lg:col-span-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Caribe Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Región Caribe</span>
                <span className="text-2xl font-black text-amber-600 block mt-1">{regionComparison.caribeStats.total}</span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Encuestas diligenciadas</span>
              </div>
              
              {/* Pacífico Banner */}
              <div className="p-4 rounded-2xl bg-violet-50 border border-violet-100">
                <span className="text-[10px] font-black uppercase text-violet-500 tracking-wider">Región Pacífico</span>
                <span className="text-2xl font-black text-violet-600 block mt-1">{regionComparison.pacificoStats.total}</span>
                <span className="text-[10px] font-bold text-slate-400 block mt-0.5">Encuestas diligenciadas</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Detalle de Comparación (%):</h4>
              
              {/* Variable 1 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Interés Laboral Digital</span>
                  <div>
                    <span className="text-amber-500 font-extrabold mr-2">Caribe: {regionComparison.caribeStats.techInterestPct}%</span>
                    <span className="text-violet-500 font-extrabold">Pacífico: {regionComparison.pacificoStats.techInterestPct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${regionComparison.caribeStats.techInterestPct / 2}%` }} />
                  <div className="bg-violet-500 h-full transition-all" style={{ width: `${regionComparison.pacificoStats.techInterestPct / 2}%` }} />
                </div>
              </div>

              {/* Variable 2 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Proporción de Emprendimientos activos</span>
                  <div>
                    <span className="text-amber-500 font-extrabold mr-2">Caribe: {regionComparison.caribeStats.entrepreneurPct}%</span>
                    <span className="text-violet-500 font-extrabold">Pacífico: {regionComparison.pacificoStats.entrepreneurPct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${regionComparison.caribeStats.entrepreneurPct / 2}%` }} />
                  <div className="bg-violet-500 h-full transition-all" style={{ width: `${regionComparison.pacificoStats.entrepreneurPct / 2}%` }} />
                </div>
              </div>

              {/* Variable 3 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Participación Ciudadana previa</span>
                  <div>
                    <span className="text-amber-500 font-extrabold mr-2">Caribe: {regionComparison.caribeStats.prevParticipationPct}%</span>
                    <span className="text-violet-500 font-extrabold">Pacífico: {regionComparison.pacificoStats.prevParticipationPct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${regionComparison.caribeStats.prevParticipationPct / 2}%` }} />
                  <div className="bg-violet-500 h-full transition-all" style={{ width: `${regionComparison.pacificoStats.prevParticipationPct / 2}%` }} />
                </div>
              </div>

              {/* Variable 4 */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Liderazgo Autónomo Femenino</span>
                  <div>
                    <span className="text-amber-500 font-extrabold mr-2">Caribe: {regionComparison.caribeStats.womanPct}%</span>
                    <span className="text-violet-500 font-extrabold">Pacífico: {regionComparison.pacificoStats.womanPct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="bg-amber-500 h-full transition-all" style={{ width: `${regionComparison.caribeStats.womanPct / 2}%` }} />
                  <div className="bg-violet-500 h-full transition-all" style={{ width: `${regionComparison.pacificoStats.womanPct / 2}%` }} />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
