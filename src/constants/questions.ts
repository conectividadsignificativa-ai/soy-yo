// questions.ts
// Formulario: Caracterización Digital – Ruta Digital Jóvenes
// Fuente de verdad del flujo, texto, opciones y lógica condicional

export type QuestionType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multi-select';

export interface Question {
  id: string;
  section: string;
  variable: string;
  text: string;
  type: QuestionType;
  options?: string[];
  condition?: (answers: Record<string, any>) => boolean;
}

export const QUESTIONS: Question[] = [

  // ======================================================
  // SECCIÓN I – INFORMACIÓN BÁSICA (P1–P10)
  // ======================================================

  {
    id: 'p1',
    section: 'Información básica',
    variable: 'nombre',
    text: '¿Cuál es tu nombre completo?',
    type: 'text',
  },
  {
    id: 'p2',
    section: 'Información básica',
    variable: 'fecha_nac',
    text: '¿Cuál es tu fecha de nacimiento?',
    type: 'date',
  },
  {
    id: 'p3',
    section: 'Información básica',
    variable: 'email',
    text: '¿Cuál es tu correo electrónico?',
    type: 'text',
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
      'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá',
      'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba',
      'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira',
      'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
      'Quindío', 'Risaralda', 'San Andrés', 'Santander', 'Sucre',
      'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
    ],
  },
  {
    id: 'p6',
    section: 'Información básica',
    variable: 'municipio',
    text: 'Municipio o ciudad de residencia',
    type: 'text',
  },
  {
    id: 'p7',
    section: 'Información básica',
    variable: 'zona',
    text: '¿En qué zona vives actualmente?',
    type: 'select',
    options: ['rural', 'urbana'],
  },
  {
    id: 'p8',
    section: 'Información básica',
    variable: 'genero',
    text: '¿Cómo te identificas?',
    type: 'select',
    options: [
      'Mujer',
      'Hombre',
      'Persona no binaria',
      'Otro',
      'Prefiero no decirlo',
    ],
  },
  {
    id: 'p8a',
    section: 'Información básica',
    variable: 'genero_otro',
    text: '¿Quieres especificar otro género?',
    type: 'text',
    condition: (a) => a.genero === 'Otro',
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
      'Ninguna de las anteriores',
    ],
  },
  {
    id: 'p9a',
    section: 'Información básica',
    variable: 'tipo_discapacidad',
    text:
      'Si marcaste “Persona con discapacidad”, ¿cuál es el tipo de discapacidad?',
    type: 'multi-select',
    options: [
      'Visual',
      'Auditiva',
      'Motora',
      'Cognitiva',
      'Psicosocial',
      'Múltiple',
      'Prefiero no especificar',
    ],
    condition: (a) =>
      Array.isArray(a.grupos) &&
      a.grupos.includes('Persona con discapacidad'),
  },
  {
    id: 'p10',
    section: 'Información básica',
    variable: 'rango_edad',
    text: '¿En qué rango de edad estás?',
    type: 'select',
    options: ['12-14', '15-17', '18-21', '22-25', '26-28', 'Mayor de 28'],
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
      'Estudio',
      'Trabajo',
      'Redes sociales',
      'Entretenimiento',
      'Trámites',
      'Información',
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
      'Estudiar',
      'Trabajar',
      'Acceder a servicios',
      'Comunicarse',
      'Generar ingresos',
    ],
    condition: (a) => a.dejo_algo === 'si',
  },
  {
    id: 'p13',
    section: 'Uso de internet',
    variable: 'horas_internet',
    text: '¿Cuántas horas al día usas internet?',
    type: 'select',
    options: ['1-2', '3-4', '5-6', 'Más de 6'],
  },
  {
    id: 'p14',
    section: 'Uso de internet',
    variable: 'seguridad_percibida',
    text: '¿Te sientes capaz de usar internet de forma segura?',
    type: 'select',
    options: [
      'Nada capaz',
      'Poco capaz',
      'Medianamente capaz',
      'Capaz',
      'Totalmente capaz',
    ],
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
      'Otro',
    ],
  },
  {
    id: 'p16',
    section: 'Uso de internet',
    variable: 'importancia_internet',
    text: '¿Qué tan importante es internet en tu vida diaria?',
    type: 'select',
    options: [
      'Nada importante',
      'Poco importante',
      'Medianamente importante',
      'Importante',
      'Muy importante',
    ],
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
      'Acceder a servicios',
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

  // (↪ el resto de secciones quedaría igual de limpio siguiendo este patrón)
];
