export interface Question {
  id: string;
  variable: string;
  text: string;
  type: 'text' | 'date' | 'select' | 'multi-select' | 'number' | 'scale';
  options?: string[];
  section: string;
  required?: boolean;
  condition?: (answers: Record<string, any>) => boolean;
  placeholder?: string;
  labels?: [string, string];
}

export const QUESTIONS: Question[] = [
  // I. INFORMACIÓN BÁSICA
  { id: 'p1', variable: 'nombre', text: '¿Cuál es tu nombre completo?', type: 'text', section: 'Información Básica', required: true },
  { id: 'p2', variable: 'fecha_nac', text: '¿Cuál es tu fecha de nacimiento?', type: 'date', section: 'Información Básica', required: true },
  { id: 'p3', variable: 'email', text: '¿Cuál es tu correo electrónico?', type: 'text', section: 'Información Básica', required: true },
  { id: 'p4', variable: 'whatsapp', text: '¿Cuál es tu número de WhatsApp? (Queremos hacerte parte de una comunidad que trabaja por la transformación digital en el Caribe y Pacífico Colombiano. Déjanos tu número si deseas participar)', type: 'text', section: 'Información Básica' },
  { 
    id: 'p5', 
    variable: 'departamento', 
    text: '¿En qué departamento resides actualmente?', 
    type: 'select', 
    options: ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'], 
    section: 'Información Básica', 
    required: true 
  },
  { id: 'p6', variable: 'municipio', text: '¿Cuál es tu municipio o ciudad de residencia?', type: 'text', section: 'Información Básica', required: true },
  { id: 'p7', variable: 'zona', text: '¿En qué zona vives actualmente?', type: 'select', options: ['rural', 'urbana'], section: 'Información Básica', required: true },
  { id: 'p8', variable: 'genero', text: '¿Cómo te identificas?', type: 'select', options: ['mujer', 'hombre', 'otro', 'nopref'], section: 'Información Básica', required: true },
  { 
    id: 'p8a', 
    variable: 'genero_otro', 
    text: '¿Quieres especificar otro género?', 
    type: 'text', 
    section: 'Información Básica', 
    condition: (ans) => ans.genero === 'otro' 
  },
  { 
    id: 'p9', 
    variable: 'grupos', 
    text: '¿Perteneces a alguno de los siguientes grupos o comunidades? (Puedes marcar varios)', 
    type: 'multi-select', 
    options: ['persona_con_discapacidad', 'comunidad_etnica', 'poblacion_rural', 'migrante', 'victima_conflicto', 'ninguno'], 
    section: 'Información Básica' 
  },
  { 
    id: 'p9a', 
    variable: 'tipo_discapacidad', 
    text: '¿Cuál es el tipo de discapacidad?', 
    type: 'multi-select', 
    options: ['visual', 'auditiva', 'motora', 'cognitiva', 'psicosocial'], 
    section: 'Información Básica', 
    condition: (ans) => ans.grupos?.includes('persona_con_discapacidad') 
  },
  { id: 'p10', variable: 'rango_edad', text: '¿En qué rango de edad estás?', type: 'select', options: ['12_14', '15_17', '18_21', '22_25', '26_28'], section: 'Información Básica', required: true },

  // II. DIAGNÓSTICO – USO DE INTERNET
  { 
    id: 'p11', 
    variable: 'uso_internet_principal', 
    text: '¿Para qué usas internet la mayor parte del tiempo?', 
    type: 'multi-select', 
    options: ['estudio', 'trabajo', 'redes_sociales', 'entretenimiento', 'tramites', 'informacion'], 
    section: 'Uso de Internet' 
  },
  { 
    id: 'p14', 
    variable: 'seguridad_percibida', 
    text: '¿Te sientes capaz de usar internet de forma segura?', 
    type: 'scale', 
    labels: ['Nada capaz', 'Totalmente capaz'],
    section: 'Uso de Internet' 
  },
  { 
    id: 'p16', 
    variable: 'importancia_internet', 
    text: '¿Qué tan importante es internet en tu vida diaria?', 
    type: 'scale', 
    labels: ['Nada importante', 'Muy importante'],
    section: 'Uso de Internet' 
  },
  { 
    id: 'p17', 
    variable: 'quisiera_hacer', 
    text: '¿Qué te gustaría hacer en internet que hoy no puedes?', 
    type: 'multi-select', 
    options: [
      'Estudiar o acceder a cursos',
      'Conseguir trabajo o generar ingresos',
      'Crear contenido o emprender',
      'Acceder a servicios (salud, trámites, etc.)',
      'Participar en comunidades o proyectos',
      'Jugar o consumir contenido sin limitaciones',
      'Otro'
    ],
    section: 'Uso de Internet' 
  },
  { 
    id: 'p18', 
    variable: 'desmotivacion', 
    text: '¿Qué te desmotiva a conectarte a internet?', 
    type: 'multi-select',
    options: [
      'Alto costo',
      'Mala conexión',
      'Falta de tiempo',
      'No saber usarlo bien',
      'Riesgos o inseguridad',
      'Falta de interés',
      'No tener dispositivo',
      'Otro'
    ],
    section: 'Uso de Internet' 
  },
  { 
    id: 'p19', 
    variable: 'uso_oportunidades', 
    text: '¿Has usado internet para mejorar tus oportunidades de estudio, trabajo o ingresos?', 
    type: 'select', 
    options: ['si', 'no'], 
    section: 'Uso de Internet' 
  },

  // III. HABILIDADES DIGITALES
  { 
    id: 'p25', 
    variable: 'uso_ia', 
    text: '¿Has usado herramientas de inteligencia artificial (IA)?', 
    type: 'select', 
    options: ['Sí', 'No'], 
    section: 'Habilidades Digitales' 
  },
  { 
    id: 'p25a', 
    variable: 'uso_ia_para', 
    text: '¿Para qué las has usado?', 
    type: 'multi-select', 
    options: [
      'Estudiar o hacer tareas',
      'Crear contenido',
      'Resolver dudas',
      'Trabajo o emprendimiento',
      'Apoyo emocional o bienestar',
      'Otro'
    ],
    section: 'Habilidades Digitales', 
    condition: (ans) => ans.uso_ia === 'Sí' 
  },

  // IV. ACCESO Y CONECTIVIDAD
  { 
    id: 'p27', 
    variable: 'dispositivo_principal', 
    text: '¿Qué dispositivo usas principalmente?', 
    type: 'select', 
    options: [
      'Celular propio',
      'Celular compartido',
      'Computador propio',
      'Computador compartido',
      'Computador público',
      'Otro'
    ],
    section: 'Acceso y Conectividad' 
  },
  { 
    id: 'p29', 
    variable: 'costo_internet', 
    text: '¿Qué tan costoso es para ti tener internet?', 
    type: 'select', 
    options: ['Barato', 'Caro', 'Muy caro'], 
    section: 'Acceso y Conectividad' 
  },

  // VI. EDUCACIÓN Y SITUACIÓN ACTUAL
  { 
    id: 'p41', 
    variable: 'interes_trabajo_digital', 
    text: '¿Te gustaría trabajar en áreas relacionadas con tecnología o entornos digitales?', 
    type: 'select', 
    options: [
      'Sí, estoy buscando algo en ese sector',
      'Me interesa, pero no he explorado opciones aún',
      'Ya tengo experiencia en temas digitales'
    ],
    section: 'Educación' 
  },

  // VII. ÁREAS DE INTERÉS
  { id: 'p42', variable: 'lineas_interes', text: '¿En cuál(es) de estas líneas te gustaría participar o aportar?', type: 'multi-select', options: ['empleabilidad', 'emprendimiento', 'politica_digital'], section: 'Áreas de Interés' },

  // VIII. EMPLEABILIDAD DIGITAL
  { 
    id: 'p43', 
    variable: 'areas_certificacion', 
    text: '¿En cuál de las siguientes áreas tienes certificación de estudios (tecnológicos, técnicos o superiores)?', 
    type: 'multi-select', 
    options: [
      'Ciberseguridad',
      'Internet de las Cosas (IoT)',
      'Desarrollo de apps móviles',
      'Desarrollo en la nube (cloud)',
      'Desarrollo de software',
      'Análisis de datos / Data science',
      'Sistemas teleinformáticos (redes, telecomunicaciones)',
      'Inteligencia Artificial',
      'Diseño UX/UI',
      'Marketing digital',
      'Soporte técnico',
      'Otra'
    ],
    section: 'Empleabilidad Digital', 
    condition: (ans) => ans.lineas_interes?.includes('empleabilidad') 
  },

  // X. PARTICIPACIÓN EN POLÍTICA PÚBLICA DIGITAL
  { 
    id: 'p54', 
    variable: 'temas_politica', 
    text: '¿Qué temas te interesan más dentro de la política pública digital? (Marca los que apliquen)', 
    type: 'multi-select', 
    options: [
      'Derechos digitales',
      'Protección de datos personales',
      'Acceso e inclusión digital',
      'Alfabetización y educación digital',
      'Participación en decisiones tecnológicas',
      'Gobernanza digital local',
      'Empleo y trabajo en la economía digital / comercio electrónico',
      'Regulación de plataformas',
      'Inteligencia artificial y sus impactos',
      'Otro'
    ],
    section: 'Política Digital', 
    condition: (ans) => ans.lineas_interes?.includes('politica_digital') 
  },
  { 
    id: 'p55', 
    variable: 'forma_participar', 
    text: '¿Cómo te gustaría participar o contribuir en temas de política digital?', 
    type: 'multi-select',
    options: [
      'Participando en espacios de consulta o diálogo con el gobierno',
      'Haciendo veeduría o seguimiento a políticas digitales',
      'Creando contenido para informar a mi comunidad sobre temas digitales',
      'Representando a jóvenes de mi territorio en espacios de toma de decisión',
      'Formulando propuestas o iniciativas de política pública',
      'Investigando y documentando problemáticas digitales de mi región',
      'Conectando a otros jóvenes con oportunidades y espacios digitales',
      'Aprendiendo más sobre el tema antes de participar activamente',
      'Otro'
    ],
    section: 'Política Digital', 
    condition: (ans) => ans.lineas_interes?.includes('politica_digital') 
  },
];
