export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number; // Points needed or specific condition
}

export const BADGES: Badge[] = [
  {
    id: 'iniciado',
    name: 'Joven Iniciado',
    description: 'Comenzaste tu camino en la red de conectividad.',
    icon: '🌱',
    requirement: 10
  },
  {
    id: 'comunicador',
    name: 'Comunicador Digital',
    description: 'Completaste la sección de Información Básica.',
    icon: '📱',
    requirement: 100
  },
  {
    id: 'experto_ciber',
    name: 'Experto en Seguridad',
    description: 'Demostraste conocimientos en riesgos digitales.',
    icon: '🛡️',
    requirement: 300
  },
  {
    id: 'lider_territorial',
    name: 'Líder Territorial',
    description: 'Tu perfil es clave para la transformación de tu región.',
    icon: '🌊',
    requirement: 500
  },
  {
    id: 'visionario',
    name: 'Visionario Digital',
    description: 'Completaste todo el formulario y trazaste tu camino.',
    icon: '🚀',
    requirement: 800
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
  return Math.floor(points / 100) + 1;
};

export const getNextBadge = (points: number, currentBadges: string[]) => {
  return BADGES.find(b => b.requirement > points && !currentBadges.includes(b.id));
};
