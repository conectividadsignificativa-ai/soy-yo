// questions.ts
// Formulario: Caracterización Digital – Ruta Digital Jóvenes
// Fuente de verdad del flujo, texto, opciones y lógica condicional

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

// ======================================================
// SECCIÓN I – INFORMACIÓN BÁSICA (P1–P10)
// ======================================================

export const QUESTIONS: Question[] = [
  {
    id: 'p1',
    section: 'Información básica',
    variable: 'nombre',
    text: '¿Cuál es tu nombre completo?',
    type: 'text',
    required: true
  },
  {
    id: 'p2',
    section: 'Información básica',
    variable: 'fecha_nac',
    text: '¿Cuál es tu fecha de nacimiento?',
    type: 'date',
    required: true
  },
  {
    id: 'p3',
    section: 'Información básica',
    variable: 'email',
    text: '¿Cuál es tu correo electrónico?',
    type: 'text',
    required: true
  },
  {
    id: 'p4',
    section: 'Información básica',
    variable: 'whatsapp',
    text:
      'Número de WhatsApp (Queremos hacerte parte de una gran comunidad que trabaja por la transformación digital en el Caribe y Pacífico Colombiano. Déjanos tu número si deseas hacer parte).',
    type: 'text',
  },
  {
    id: 'p5',
    section: 'Información básica',
    variable: 'departamento',
    text: 'Departamento',
    type: 'select',
    options: [
      'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas',
      'Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca',
      'Guainía','Guaviare','Huila',' La Guajira','Magdalena','Meta','Nariño',
      'Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés',
      'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada',
    ],
    required: true
  },
  {
    id: 'p6',
    section: 'Información básica',
    variable: 'municipio',
    text: 'Municipio o ciudad de residencia',
    type: 'text',
    required: true
  },
  {
    id: 'p7',
    section: 'Información básica',
    variable: 'zona',
    text: '¿En qué zona vives actualmente?',
    type: 'select',
    options: ['rural', 'urbana'],
    required: true
  },
  {
    id: 'p8',
    section: 'Información básica',
    variable: 'genero',
    text: '¿Cómo te identificas?',
    type: 'select',
    options: ['mujer', 'hombre', 'otro', 'Prefiero no decirlo','Persona no binaria' ],
    required: true
  },
  {
    id: 'p8a',
    section: 'Información básica',
    variable: 'genero_otro',
    text: '¿Quieres especificar otro género?',
    type: 'text',
    condition: (a) => a.genero === 'otro',
  },
  {
    id: 'p9',
    section: 'Información básica',
    variable: 'grupos',
    text:
      '¿Perteneces a alguno de los siguientes grupos o comunidades? (Marca los que apliquen)',
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
    ],
  },
  {
    id: 'p9a',
    section: 'Información básica',
    variable: 'tipo_discapacidad',
    text:
      'Si marcaste “Persona con discapacidad”, ¿cuál es el tipo de discapacidad?',
    type: 'multi-select',
    options: ['visual', 'auditiva', 'motora', 'cognitiva', 'psicosocial','Múltiple', 'Prefiero no especificar'],
    condition: (a) => {
      const g = a.grupos;
      const list = Array.isArray(g) ? g : (typeof g === 'string' ? g.split(', ') : []);
      return list.includes('Persona con discapacidad');
    }
  },
  {
    id: 'p10',
    section: 'Información básica',
    variable: 'rango_edad',
    text: '¿En qué rango de edad estás?',
    type: 'select',
    options: ['12-14', '15-17', '18-21', '22-25', '26-28','mayor de 28'],
    required: true
  },

// ======================================================
// SECCIÓN II – USO DE INTERNET (P11–P19)
// ======================================================

  {
    id: 'p11',
    section: 'Uso de internet',
    variable: 'uso_internet_principal',
    text: '¿Para qué usas internet la mayor parte del tiempo?',
    type: 'multi-select',
    options: [
      'estudio',
      'trabajo',
      'redes sociales',
      'entretenimiento',
      'tramites',
      'informacion',
    ],
  },
  {
    id: 'p12',
    section: 'Uso de internet',
    variable: 'dejo_algo',
    text:
      '¿Alguna vez has dejado de hacer algo que consideras importante por no tener internet?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p12a',
    section: 'Uso de internet',
    variable: 'que_dejo',
    text: 'Si respondiste sí, ¿qué dejaste de hacer?',
    type: 'multi-select',
    options: [
      'estudiar',
      'trabajar',
      'acceder a servicios',
      'comunicarse',
      'generar ingresos',
    ],
    condition: (a) => a.dejo_algo === 'si',
  },
  {
    id: 'p13',
    section: 'Uso de internet',
    variable: 'horas_internet',
    text: '¿Cuántas horas al día usas internet?',
    type: 'select',
    options: ['1 - 2', '3 - 4', '5 - 6', 'mas de 6'],
  },
  {
    id: 'p14',
    section: 'Uso de internet',
    variable: 'seguridad_percibida',
    text: '¿Te sientes capaz de usar internet de forma segura?',
    type: 'scale',
    labels: ['Nada capaz', 'Totalmente capaz'],
  },
  {
    id: 'p15',
    section: 'Uso de internet',
    variable: 'motivacion_internet',
    text: '¿Cuál es tu principal motivación para conectarte a internet?',
    type: 'multi-select',
    options: [
      'Mantenerme en contacto con personas',
      'Entretenimiento',
      'Estudiar o aprender',
      'Trabajar o generar ingresos',
      'Informarme',
      'Expresarme o crear contenido',
      'Reducir el estrés o distraerme',
      'Conocer nuevas personas',
      'Participar en temas sociales o políticos',
    ],
  },
  {
    id: 'p16',
    section: 'Uso de internet',
    variable: 'importancia_internet',
    text: '¿Qué tan importante es internet en tu vida diaria?',
    type: 'scale',
    labels: ['Nada importante', 'Muy importante'],
  },
   {
    id: 'p17',
    section: 'Uso de internet',
    variable: 'quisiera_hacer',
    text: '¿Qué te gustaría hacer en internet que hoy no puedes?',
    type: 'multi-select',
    options: [
      'Estudiar o acceder a cursos',
      'Conseguir trabajo o generar ingresos',
      'Crear contenido o emprender',
      'Acceder a servicios (salud, gobierno, etc.)',
      'Participar en comunidades o proyectos',
      'Jugar o consumir contenido sin limitaciones',
      'Otro',
    ],
  },
  {
    id: 'p18',
    section: 'Uso de internet',
    variable: 'desmotivacion',
    text: '¿Qué te desmotiva a conectarte a internet?',
    type: 'multi-select',
    options: [
      'Alto costo',
      'Mala conexión',
      'Falta de tiempo',
      'No saber usarlo bien',
      'Falta de interés',
      'No tener dispositivo',
      'Otro',
    ],
  },
  {
    id: 'p19',
    section: 'Uso de internet',
    variable: 'uso_oportunidades',
    text:
      '¿Has usado internet para mejorar tus oportunidades (estudio, trabajo o ingresos)?',
    type: 'select',
    options: ['si', 'no'],
  },

// ======================================================
// SECCIÓN III – HABILIDADES DIGITALES Y IA (P20–P25a)
// ======================================================

 {
    id: 'p20',
    section: 'Habilidades digitales',
    variable: 'nivel_actividades',
    text: '¿Cuáles de las siguientes habilidades te consideras en capacidad de hacer? (Selecciona solo las que cuentes con capacidad)',
    type: 'multi-select',
    options: [
      'Buscar información y verificar si es confiable',
      'Usar herramientas para estudiar o trabajar',
      'Proteger tu información personal',
      'Identificar riesgos o fraudes',
      'Resolver problemas técnicos básicos',
      'Comunicarte en entornos digitales',
    ],
  },
  {
    id: 'p21',
    section: 'Habilidades digitales',
    variable: 'nivel_habilidades',
    text: '¿Cómo calificarías tu nivel de habilidades digitales?',
    type: 'select',
    options: ['Básico', 'Intermedio', 'Avanzado'],
  },
  {
    id: 'p22',
    section: 'Habilidades digitales',
    variable: 'solucion_problemas',
    text: 'Cuando tienes un problema digital, ¿qué haces?',
    type: 'select',
    options: [
      'Lo soluciono por mi cuenta',
      'Busco ayuda en internet',
      'Le pregunto a alguien',
      'No sé cómo solucionarlo',
    ],
  },
  {
    id: 'p23',
    section: 'Habilidades digitales',
    variable: 'donde_aprendio',
    text:
      '¿Dónde has aprendido lo que sabes sobre tecnología e internet?',
    type: 'multi-select',
    options: ['Colegio o universidad', 'Cursos virtuales', 'Redes sociales o internet', 'Amigos o familiares', 'De forma autodidacta', 'No he tenido formación'],
  },
  {
    id: 'p24',
    section: 'Habilidades digitales',
    variable: 'cree_mejora',
    text:
      '¿Crees que mejorar tus habilidades digitales aumentaría tus oportunidades?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p25',
    section: 'Habilidades digitales',
    variable: 'uso_ia',
    text:
      '¿Has usado herramientas de inteligencia artificial (IA)?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p25a',
    section: 'Habilidades digitales',
    variable: 'uso_ia_para',
    text: 'Si respondiste sí, ¿para qué las has usado?',
    type: 'multi-select',
    options: [
      'Estudiar o hacer tareas',
      'Crear contenidos',
      'Resolver dudas',
      'Trabajo o emprendimiento',
      'Apoyo emocional o bienestar',
      'Otro',
    ],
    condition: (a) => a.uso_ia === 'si',
  },

// ======================================================
// SECCIÓN IV – ACCESO, CONECTIVIDAD Y RIESGOS (P26–P37)
// ======================================================

  {
    id: 'p26',
    section: 'Acceso y conectividad',
    variable: 'forma_conexion',
    text: '¿Cómo te conectas principalmente a internet?',
    type: 'multi-select',
    options: ['datos', 'wifi casa', 'wifi publico', 'centro digital comunitario', 'No tengo acceso'],
  },
  {
    id: 'p27',
    section: 'Acceso y conectividad',
    variable: 'dispositivo_principal',
    text: '¿Qué dispositivo usas principalmente?',
    type: 'select',
    options: ['Celular propio', 'Celular compartido', 'Computador propio', 'Computador compartido', 'Computador público', 'Otro'],
  },
  {
    id: 'p28',
    section: 'Acceso y conectividad',
    variable: 'acceso_diario',
    text: '¿Tienes acceso a internet todos los días?',
    type: 'select',
    options: ['si', 'no', 'a veces'],
  },
  {
    id: 'p29',
    section: 'Acceso y conectividad',
    variable: 'costo_internet',
    text: '¿Qué tan costoso es para ti tener internet?',
    type: 'select',
    options: ['barato', 'mas o menos costoso', 'Muy costoso'],
  },
  {
    id: 'p30',
    section: 'Acceso y conectividad',
    variable: 'barreras_conexion',
    text: '¿Qué barreras enfrentas para conectarte a internet?',
    type: 'multi-select',
    options: [
      'Mala señal o conexión inestable',
      'Falta de dinero',
      'No tengo dispositivo o Debo compartir el dispositivo',
      'Falta de energía eléctrica',
      'otro',
    ],
  },
  {
    id: 'p31',
    section: 'Riesgos digitales',
    variable: 'situaciones_riesgo',
    text:
      '¿Has experimentado alguna de estas situaciones en internet?',
    type: 'multi-select',
    options: [
      'Acoso o insultos',
      'Suplantación de identidad',
      'Difusión de información personal',
      'Discriminación',
      'ninguna',
    ],
  },
  {
    id: 'p32',
    section: 'Riesgos digitales',
    variable: 'sensacion_seguridad',
    text: '¿Qué tan segura/o te sientes usando internet?',
    type: 'scale',
    labels: ['Muy inseguro/a', 'Muy seguro/a'],
  },
  {
    id: 'p33',
    section: 'Riesgos digitales',
    variable: 'busco_ayuda',
    text:
      'Si viviste una situación negativa, ¿buscaste ayuda o denunciaste?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) => {
      const s = a.situaciones_riesgo;
      const list = Array.isArray(s) ? s : (typeof s === 'string' ? s.split(', ') : []);
      return list.length > 0 && !list.includes('ninguna');
    },
  },
   {
    id: 'p33a',
    section: 'Riesgos digitales',
    variable: 'por_que_no',
    text: 'Si no buscaste ayuda, ¿por qué?',
    type: 'multi-select',
    options: [
      'No sé cómo hacerlo',
      'No confío en las instituciones',
      'No lo consideré grave',
      'Miedo a las consecuencias',
      'Vergüenza',
      'Otro',
    ],
    condition: (a) => a.busco_ayuda === 'no',
  },
  {
    id: 'p34',
    section: 'Riesgos digitales',
    variable: 'conoce_info_privada',
    text:
      '¿Sabes qué información personal no deberías compartir en internet?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p35',
    section: 'Riesgos digitales',
    variable: 'sabe_denunciar',
    text:
      '¿Sabes dónde denunciar situaciones de riesgo digital?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p36',
    section: 'Riesgos digitales',
    variable: 'aceptar_desconocido',
    text:
      '¿Qué tan probable es que aceptes solicitudes o mensajes de personas desconocidas?',
    type: 'select',
    options: ['Nunca lo aceptaría', 'Casi nunca lo acepto', 'Depende de la situación', 'Es probable que lo acepte', 'Lo acepto sin problema'],
  },
  {
    id: 'p37',
    section: 'Riesgos digitales',
    variable: 'contacto_sospechoso',
    text:
      '¿Alguna vez alguien desconocido te ha contactado con ofertas sospechosas?',
    type: 'select',
    options: ['si', 'no'],
  },

// ======================================================
// SECCIÓN V – EDUCACIÓN, EMPLEABILIDAD, EMPRENDIMIENTO, POLÍTICA (P38–P55)
// ======================================================

  {
    id: 'p38',
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
      'Postgrado',
    ],
  },
  {
    id: 'p39',
    section: 'Educación y situación actual',
    variable: 'situacion_actual',
    text:
      '¿Cuál de estas opciones describe mejor tu situación actual?',
    type: 'select',
    options: [
      'Estoy estudiando',
      'Estoy estudiando y trabajando',
      'Estoy buscando empleo',
      'Estoy trabajando',
      'Tengo un emprendimiento propio',
      'Ni estudio ni trabajo',
    ],
  },

  {
    id: 'p41',
    section: 'Educación y situación actual',
    variable: 'interes_trabajo_digital',
    text:
      '¿Te gustaría trabajar en áreas relacionadas con tecnología o entornos digitales?',
    type: 'select',
    options: ['Sí, estoy buscando algo en ese sector', 'Me interesa, pero no he explorado opciones aún', 'Ya tengo experiencia en temas digitales', 'No me interesa los temas digitales o de tecnología'],
  },
  {
    id: 'p42',
    section: 'Intereses',
    variable: 'lineas_interes',
    text:
      '¿En cuál(es) de estas líneas te gustaría participar o aportar? (Puedes marcar más de una)*',
    type: 'multi-select',
    options: [
      'Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales', 
      'Emprendimiento digital — ideas, soluciones y negocios con tecnología', 
      'Participación en política pública digital — derechos digitales, incidencia y gobernanza local'
    ],
  },
  {
    id: 'p43',
    section: 'Empleabilidad digital',
    variable: 'areas_certificacion',
    text:
      '¿En cuál de las siguientes áreas tienes certificación de estudios (tecnológicos, técnicos o superiores)?',
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
      'Otra',
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales');
    },
  },
  {
    id: 'p44',
    section: 'Emprendimiento digital',
    variable: 'tiene_emprendimiento',
    text:
      '¿Tienes o estás desarrollando un emprendimiento digital?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Emprendimiento digital — ideas, soluciones y negocios con tecnología');
    },
  },
  {
    id: 'p45',
    section: 'Emprendimiento digital',
    variable: 'nombre_emprendimiento',
    text: '¿Cómo se llama tu iniciativa o idea de emprendimiento digital?',
    type: 'text',
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
   {
    id: 'p46',
    section: 'Emprendimiento digital',
    variable: 'tema_emprendimiento',
    text: '¿Qué tema aborda principalmente tu iniciativa?',
    type: 'multi-select',
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
      'Otro',
    ],
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
  {
    id: 'p47',
    section: 'Emprendimiento digital',
    variable: 'etapa_emprendimiento',
    text: '¿En qué etapa está tu iniciativa?',
    type: 'select',
    options: ['Es solo una idea', 'Está en diseño o prototipo', 'Ya tiene usuarios o clientes activos'],
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
   {
    id: 'p47a',
    section: 'Emprendimiento digital',
    variable: 'alcance_emprendimiento',
    text: '¿Tu iniciativa está enfocada en…?',
    type: 'select',
    options: ['Tu comunidad local', 'En tu región', 'Cuenta con alcance nacional'],
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
  {
    id: 'p48',
    section: 'Emprendimiento digital',
    variable: 'barreras_emprendimiento',
    text:
      '¿Qué barreras has enfrentado para desarrollar tu emprendimiento digital?',
    type: 'multi-select',
    options: [
      'Falta de conexión ',
      'Falta de formación',
      'Falta de recursos económicos ',
      'Poco apoyo institucional',
      'Otro',
    ],
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
  {
    id: 'p49',
    section: 'Emprendimiento digital',
    variable: 'objetivo_emprendimiento',
    text:
      'En una frase corta, cuéntanos el objetivo principal de tu iniciativa y cómo lo están cumpliendo.',
    type: 'text',
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
  {
    id: 'p50',
    section: 'Emprendimiento digital',
    variable: 'enlaces_emprendimiento',
    text:
      '¿Tienes links, hashtags o redes sociales donde podamos conocer más?',
    type: 'text',
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
  {
    id: 'p51',
    section: 'Política pública digital',
    variable: 'participacion_previa',
    text:
      '¿Has participado antes en espacios de participación ciudadana, juvenil o digital?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    },
  },
  {
    id: 'p52',
    section: 'Política pública digital',
    variable: 'pertenece_red',
    text:
      '¿Perteneces a alguna red, colectivo u organización juvenil?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    },
  },
  {
    id: 'p53',
    section: 'Política pública digital',
    variable: 'cual_red',
    text: '¿Cuál?',
    type: 'text',
    condition: (a) => a.pertenece_red === 'si',
  },
  {
    id: 'p54',
    section: 'Política pública digital',
    variable: 'temas_politica',
    text:
      '¿Qué temas te interesan más dentro de la política pública digital?',
    type: 'multi-select',
    options: [
      'Derechos digitales',
      'Protección de datos personales',
      'Alfabetización y educación digital',
      'Participación en decisiones tecnológicas',
      'Empleo y trabajo en la economía digital / comercio electrónico',
      'Regulación de plataformas digitales',
      'Inteligencia artificial y sus impactos',
      'Otro',
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    },
  },
  {
    id: 'p55',
    section: 'Política pública digital',
    variable: 'forma_participar',
    text:
      '¿Cómo te gustaría participar o contribuir en temas de política digital?',
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
      'Otro',
    ],
    condition: (a) => {
      const li = a.lineas_interes;
      const list = Array.isArray(li) ? li : (typeof li === 'string' ? li.split(', ') : []);
      return list.includes('Participación en política pública digital — derechos digitales, incidencia y gobernanza local');
    },
  }
];
