export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

export const BADGES: Badge[] = [
  {
    id: 'perfil_creado',
    name: 'Perfil creado',
    description: '✅ ¡Listo! Ya completaste tu información básica.',
    icon: '🪪',
    points: 50
  },
  {
    id: 'explorador_digital',
    name: 'Explorador/a digital',
    description: '🌍 ¡Genial! Ya sabemos cómo usas internet en tu día a día.',
    icon: '🌍',
    points: 60
  },
  {
    id: 'aprendiz_digital',
    name: 'Aprendiz digital',
    description: '💡 Gracias por contarnos sobre tus habilidades digitales.',
    icon: '🔧',
    points: 60
  },
  {
    id: 'conectado',
    name: 'Conectado/a',
    description: '📡 Tu experiencia de acceso y conectividad es muy importante.',
    icon: '📡',
    points: 50
  },
  {
    id: 'navegante_consciente',
    name: 'Navegante consciente',
    description: '🛡️ Gracias por reflexionar sobre los riesgos y la seguridad en internet.',
    icon: '🛡️',
    points: 60
  },
  {
    id: 'explorador_ia',
    name: 'Explorador/a de IA',
    description: '🤖 La inteligencia artificial también hace parte de tu camino digital.',
    icon: '🔮',
    points: 40
  },
  {
    id: 'rumbo_digital',
    name: 'Rumbo digital',
    description: '🧭 Tener claro hacia dónde quieres aportar es un gran paso.',
    icon: '🧭',
    points: 40
  },
  {
    id: 'talento_digital',
    name: 'Talento digital',
    description: '💼 Tu interés en la empleabilidad digital abre nuevas oportunidades.',
    icon: '🧑‍💻',
    points: 50
  },
  {
    id: 'constructor_ideas',
    name: 'Constructor/a de ideas',
    description: '🚀 Las ideas también transforman territorios y comunidades.',
    icon: '🚀',
    points: 70
  },
  {
    id: 'voz_ciudadana',
    name: 'Voz ciudadana digital',
    description: '🗳️ Participar también es una forma de transformar lo digital.',
    icon: '🗳️',
    points: 60
  },
  {
    id: 'agente_transformacion',
    name: 'Agente de transformación digital',
    description: '🌟 ¡Felicitaciones! Completaste toda la encuesta.',
    icon: '🌟',
    points: 100
  }
];

export interface UserProfile {
  uid: string;
  points: number;
  badges: string[];
  level: number;
  completedSections: string[];
}

export const calculateLevel = (points: number) => {
  return Math.floor(points / 200) + 1;
};
