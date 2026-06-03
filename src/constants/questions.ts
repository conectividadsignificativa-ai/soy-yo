// questions.ts
// Formulario: Caracterización Digital – Ruta Digital Jóvenes (OIT & UNFPA Colombia)
// Fuente de verdad del flujo, de acuerdo con el nuevo formulario simplificado de 28 preguntas.

export type QuestionType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multi-select'
  | 'scale';

export interface Question {
  id: string;
  section: string;
  variable: string;
  text: string;
  type: QuestionType;
  options?: string[];
  condition?: (answers: Record<string, any>) => boolean;
  required?: boolean;
  placeholder?: string;
  labels?: [string, string];
}

export const QUESTIONS: Question[] = [
  // ======================================================
  // SECCIÓN 1 — INFORMACIÓN BÁSICA
  // ======================================================
  {
    id: 'p1',
    section: 'Información básica',
    variable: 'nombre',
    text: '¿Cuál es tu nombre completo?',
    type: 'text',
    required: true,
    placeholder: 'Escribe tu nombre y apellidos...'
  },
  {
    id: 'p2',
    section: 'Información básica',
    variable: 'fecha_nac',
    text: '¿Cuál es tu fecha de nacimiento? (día / mes / año)',
    type: 'date',
    required: true
  },
  {
    id: 'p3',
    section: 'Información básica',
    variable: 'email',
    text: '¿Cuál es tu correo electrónico?',
    type: 'text',
    required: true,
    placeholder: 'ejemplo@correo.com'
  },
  {
    id: 'p4',
    section: 'Información básica',
    variable: 'whatsapp',
    text: '¿Nos puedes dejar tu número de WhatsApp? Queremos hacerte parte de una gran comunidad que trabaja por la transformación digital en el Caribe y Pacífico Colombiano. Es opcional — si prefieres no darlo, escribe "no".',
    type: 'text',
    placeholder: 'Ej: 3001234567 o escribe "no"'
  },
  {
    id: 'p5',
    section: 'Información básica',
    variable: 'departamento',
    text: '¿En qué departamento vives?',
    type: 'select',
    options: [
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas',
      'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca',
      'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño',
      'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés',
      'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'
    ],
    required: true
  },
  {
    id: 'p6',
    section: 'Información básica',
    variable: 'municipio',
    text: '¿En qué municipio o ciudad vives?',
    type: 'text',
    required: true,
    placeholder: 'Escribe el nombre del municipio...'
  },
  {
    id: 'p7',
    section: 'Información básica',
    variable: 'zona',
    text: '¿En qué zona vives actualmente?',
    type: 'select',
    options: ['Rural', 'Urbana'],
    required: true
  },
  {
    id: 'p8',
    section: 'Información básica',
    variable: 'rango_edad',
    text: '¿En qué rango de edad estás?',
    type: 'select',
    options: [
      '12–14 años',
      '15–17 años',
      '18–21 años',
      '22–25 años',
      '26–28 años',
      'Mayor de 28 años'
    ],
    required: true
  },
  {
    id: 'p9',
    section: 'Información básica',
    variable: 'genero',
    text: '¿Cómo te identificas?',
    type: 'select',
    options: [
      'Mujer',
      'Hombre',
      'Persona no binaria',
      'Prefiero no decirlo',
      'Otro — ¿cuál?'
    ],
    required: true
  },
  {
    id: 'p9a',
    section: 'Información básica',
    variable: 'genero_otro',
    text: '¿Quieres especificar tu identidad de género?',
    type: 'text',
    condition: (a) => a.genero === 'Otro — ¿cuál?',
    placeholder: 'Escribe cómo te identificas...'
  },
  {
    id: 'p10',
    section: 'Información básica',
    variable: 'grupos',
    text: '¿Perteneces a alguno de los siguientes grupos o comunidades? Puedes elegir varios.',
    type: 'multi-select',
    options: [
      'Comunidad indígena',
      'Población afrodescendiente, raizal o palenquera',
      'Persona con discapacidad',
      'Persona LGBTIQ+',
      'Persona migrante o en situación de movilidad',
      'Víctima del conflicto armado',
      'Joven cuidador/a',
      'Ninguna de las anteriores'
    ]
  },
  {
    id: 'p11',
    section: 'Información básica',
    variable: 'tipo_discapacidad',
    text: '¿Cuál es el tipo de discapacidad? Puedes marcar las que apliquen.',
    type: 'multi-select',
    options: [
      'Visual',
      'Auditiva',
      'Física / motriz',
      'Intelectual o cognitiva',
      'Psicosocial / mental',
      'Múltiple',
      'Prefiero no especificar'
    ],
    condition: (a) => {
      const g = a.grupos;
      const list = Array.isArray(g) ? g : (typeof g === 'string' ? g.split(', ') : []);
      return list.includes('Persona con discapacidad');
    }
  },

  // ======================================================
  // SECCIÓN 2 — EDUCACIÓN Y SITUACIÓN ACTUAL
  // ======================================================
  {
    id: 'p12',
    section: 'Educación y situación actual',
    variable: 'nivel_estudios',
    text: '¿Cuál es tu nivel de estudios?',
    type: 'select',
    options: [
      'Primaria',
      'Secundaria / media sin finalizar',
      'Secundaria / media finalizada',
      'Técnico / Tecnológico',
      'Universitario',
      'Posgrado'
    ],
    required: true
  },
  {
    id: 'p13',
    section: 'Educación y situación actual',
    variable: 'situacion_actual',
    text: '¿Cuál de estas opciones describe mejor tu situación actual?',
    type: 'select',
    options: [
      'Estoy estudiando',
      'Estoy estudiando y trabajando',
      'Estoy buscando empleo',
      'Estoy trabajando',
      'Tengo un emprendimiento propio',
      'Ni estudio ni trabajo'
    ],
    required: true
  },
  {
    id: 'p14',
    section: 'Educación y situación actual',
    variable: 'interes_trabajo_digital',
    text: '¿Te gustaría trabajar en áreas relacionadas con tecnología o entornos digitales?',
    type: 'select',
    options: [
      'Sí, estoy buscando algo en ese sector',
      'Me interesa, pero no he explorado opciones aún',
      'Ya tengo experiencia en temas digitales',
      'No me interesan los temas digitales o de tecnología'
    ],
    required: true
  },

  // ======================================================
  // SECCIÓN 3 — INTERESES
  // ======================================================
  {
    id: 'p15',
    section: 'Intereses',
    variable: 'lineas_interes',
    text: '¿En cuál(es) de estas líneas te gustaría participar o aportar? Puedes elegir varias.',
    type: 'multi-select',
    options: [
      'Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales',
      'Emprendimiento digital — ideas, soluciones y negocios con tecnología',
      'Participación en política pública digital — derechos digitales, incidencia y gobernanza local'
    ],
    required: true
  },

  // ======================================================
  // SECCIÓN 4 — EMPLEABILIDAD DIGITAL
  // ======================================================
  {
    id: 'p16',
    section: 'Empleabilidad digital',
    variable: 'areas_certificacion',
    text: '¿En cuál de las siguientes áreas tienes certificación de estudios técnicos, tecnológicos o superiores? Puedes elegir varias.',
    type: 'multi-select',
    options: [
      'Ciberseguridad',
      'Internet de las Cosas (IoT)',
      'Desarrollo de apps',
      'Desarrollo en la nube (cloud)',
      'Análisis de datos / Data science',
      'Sistemas teleinformáticos (redes, telecomunicaciones)',
      'Inteligencia Artificial',
      'Diseño UX/UI',
      'Marketing digital',
      'Soporte técnico',
      'Otra — ¿cuál?',
      'No tengo ninguna certificación'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales');
    }
  },
  {
    id: 'p16a',
    section: 'Empleabilidad digital',
    variable: 'otra_certificacion',
    text: '¿Cuál otra certificación tienes?',
    type: 'text',
    condition: (a) => {
      const c = a.areas_certificacion;
      const list = Array.isArray(c) ? c : (typeof c === 'string' ? c.split(', ') : []);
      return list.includes('Otra — ¿cuál?');
    },
    placeholder: 'Escribe tu otra certificación...'
  },

  // ======================================================
  // SECCIÓN 5 — EMPRENDIMIENTO DIGITAL
  // ======================================================
  {
    id: 'p17',
    section: 'Emprendimiento digital',
    variable: 'tiene_emprendimiento',
    text: '¿Tienes o estás desarrollando un emprendimiento digital?',
    type: 'select',
    options: ['Sí', 'No'],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología');
    }
  },
  {
    id: 'p18',
    section: 'Emprendimiento digital',
    variable: 'nombre_emprendimiento',
    text: '¿Cómo se llama tu iniciativa o idea de emprendimiento digital?',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    },
    placeholder: 'Escribe el nombre de tu emprendimiento o idea...'
  },
  {
    id: 'p19',
    section: 'Emprendimiento digital',
    variable: 'tema_emprendimiento',
    text: '¿Qué tema aborda principalmente tu iniciativa?',
    type: 'select',
    options: [
      'Educación',
      'Salud',
      'Medio ambiente / sostenibilidad',
      'Comercio / economía local',
      'Cultura y arte',
      'Seguridad y convivencia',
      'Género e inclusión',
      'Gobierno y trámites ciudadanos',
      'Conectividad e infraestructura digital',
      'Otro — ¿cuál?'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    }
  },
  {
    id: 'p19a',
    section: 'Emprendimiento digital',
    variable: 'tema_emprendimiento_otro',
    text: '¿Cuál otro tema aborda tu iniciativa?',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí' && a.tema_emprendimiento === 'Otro — ¿cuál?';
    },
    placeholder: 'Especifica el tema de tu iniciativa...'
  },
  {
    id: 'p20',
    section: 'Emprendimiento digital',
    variable: 'etapa_emprendimiento',
    text: '¿En qué etapa está tu iniciativa?',
    type: 'select',
    options: [
      'Es solo una idea',
      'Está en diseño o prototipo',
      'Ya tiene usuarios o clientes activos'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    }
  },
  {
    id: 'p21',
    section: 'Emprendimiento digital',
    variable: 'alcance_emprendimiento',
    text: '¿Tu iniciativa está enfocada en…?',
    type: 'select',
    options: [
      'Tu comunidad local',
      'En tu región',
      'Cuenta con alcance nacional'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    }
  },
  {
    id: 'p22',
    section: 'Emprendimiento digital',
    variable: 'barreras_emprendimiento',
    text: '¿Qué barreras has enfrentado para desarrollar tu emprendimiento digital? Puedes elegir varias.',
    type: 'multi-select',
    options: [
      'Falta de conexión a internet',
      'Falta de formación',
      'Falta de recursos económicos',
      'Poco apoyo institucional',
      'Dificultad para entrar al mercado',
      'Otro — ¿cuál?'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    }
  },
  {
    id: 'p22a',
    section: 'Emprendimiento digital',
    variable: 'barreras_emprendimiento_otro',
    text: '¿Cuál otra barrera has enfrentado?',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      const b = a.barreras_emprendimiento;
      const blist = Array.isArray(b) ? b : (typeof b === 'string' ? b.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí' && blist.includes('Otro — ¿cuál?');
    },
    placeholder: 'Especifica la barrera...'
  },
  {
    id: 'p23',
    section: 'Emprendimiento digital',
    variable: 'objetivo_emprendimiento',
    text: 'En una frase corta, cuéntanos el objetivo principal de tu iniciativa y cómo lo están cumpliendo.',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    },
    placeholder: 'El objetivo de mi iniciativa es...'
  },
  {
    id: 'p24',
    section: 'Emprendimiento digital',
    variable: 'enlaces_emprendimiento',
    text: '¿Tienes links, hashtags o redes sociales donde podamos conocer más? (Opcional — si no, escribe "no".)',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología') && a.tiene_emprendimiento === 'Sí';
    },
    placeholder: 'Escribe los links o redes sociales, o escribe "no"'
  },

  // ======================================================
  // SECCIÓN 6 — POLÍTICA PÚBLICA DIGITAL
  // ======================================================
  {
    id: 'p25',
    section: 'Política pública digital',
    variable: 'participacion_previa',
    text: '¿Has participado antes en espacios de participación ciudadana, juvenil o digital?',
    type: 'select',
    options: ['Sí', 'No'],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    }
  },
  {
    id: 'p26',
    section: 'Política pública digital',
    variable: 'pertenece_red',
    text: '¿Perteneces a alguna red, colectivo u organización juvenil?',
    type: 'select',
    options: ['Sí — ¿cuál?', 'No'],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    }
  },
  {
    id: 'p26a',
    section: 'Política pública digital',
    variable: 'cual_red',
    text: '¿Cuál es el nombre de la red, colectivo u organización juvenil a la que perteneces?',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local') && a.pertenece_red === 'Sí — ¿cuál?';
    },
    placeholder: 'Escribe el nombre de la red o colectivo...'
  },
  {
    id: 'p27',
    section: 'Política pública digital',
    variable: 'temas_politica',
    text: '¿Qué temas te interesan más dentro de la política pública digital? Puedes elegir varios.',
    type: 'multi-select',
    options: [
      'Derechos digitales',
      'Protección de datos personales',
      'Alfabetización y educación digital',
      'Participación en decisiones tecnológicas',
      'Empleo y trabajo en la economía digital / comercio electrónico',
      'Regulación de plataformas digitales',
      'Inteligencia artificial y sus impactos',
      'Otro — ¿cuál?'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    }
  },
  {
    id: 'p27a',
    section: 'Política pública digital',
    variable: 'temas_politica_otro',
    text: '¿Cuál otro tema de política digital te interesa?',
    type: 'text',
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      const t = a.temas_politica;
      const tlist = Array.isArray(t) ? t : (typeof t === 'string' ? t.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local') && tlist.includes('Otro — ¿cuál?');
    },
    placeholder: 'Establece el tema de interés...'
  },
  {
    id: 'p28',
    section: 'Política pública digital',
    variable: 'forma_participar',
    text: '¿Cómo te gustaría participar o contribuir en temas de política digital? Puedes elegir varios.',
    type: 'multi-select',
    options: [
      'Participando en espacios de consulta o diálogo con el gobierno',
      'Haciendo veeduría o seguimiento a políticas digitales',
      'Creando contenido para informar a mi comunidad sobre temas digitales',
      'Representando a jóvenes de mi territorio en espacios de toma de decisión',
      'Formulando propuestas o iniciativas de política pública',
      'Investigando y documentando problemáticas digitales de mi región',
      'Conectando a otros jóvenes con oportunidades y espacios digitales',
      'Aprendiendo más sobre el tema antes de participar activamente'
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    }
  }
];
