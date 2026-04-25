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
      'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas',
      'Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca',
      'Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño',
      'Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés',
      'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada',
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
    options: ['mujer', 'hombre', 'otro', 'nopref'],
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
      'persona_con_discapacidad',
      'comunidad_etnica',
      'poblacion_rural',
      'migrante',
      'victima_conflicto',
      'ninguno',
    ],
  },
  {
    id: 'p9a',
    section: 'Información básica',
    variable: 'tipo_discapacidad',
    text:
      'Si marcaste “persona con discapacidad”, ¿cuál es el tipo de discapacidad?',
    type: 'multi-select',
    options: ['visual', 'auditiva', 'motora', 'cognitiva', 'psicosocial'],
    condition: (a) =>
      Array.isArray(a.grupos) &&
      a.grupos.includes('persona_con_discapacidad'),
  },
  {
    id: 'p10',
    section: 'Información básica',
    variable: 'rango_edad',
    text: '¿En qué rango de edad estás?',
    type: 'select',
    options: ['12_14', '15_17', '18_21', '22_25', '26_28'],
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
      'redes_sociales',
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
      'acceder_servicios',
      'comunicarse',
      'generar_ingresos',
    ],
    condition: (a) => a.dejo_algo === 'si',
  },
  {
    id: 'p13',
    section: 'Uso de internet',
    variable: 'horas_internet',
    text: '¿Cuántas horas al día usas internet?',
    type: 'select',
    options: ['1_2', '3_4', '5_6', 'mas6'],
  },
  {
    id: 'p14',
    section: 'Uso de internet',
    variable: 'seguridad_percibida',
    text: '¿Te sientes capaz de usar internet de forma segura?',
    type: 'select',
    options: ['baja', 'media', 'alta'],
  },
  {
    id: 'p15',
    section: 'Uso de internet',
    variable: 'motivacion_internet',
    text: '¿Cuál es tu principal motivación para conectarte a internet?',
    type: 'select',
    options: [
      'educacion',
      'trabajo',
      'ingresos',
      'comunicacion',
      'entretenimiento',
    ],
  },
  {
    id: 'p16',
    section: 'Uso de internet',
    variable: 'importancia_internet',
    text: '¿Qué tan importante es internet en tu vida diaria?',
    type: 'select',
    options: ['baja', 'media', 'alta'],
  },
  {
    id: 'p17',
    section: 'Uso de internet',
    variable: 'quisiera_hacer',
    text: '¿Qué te gustaría hacer en internet que hoy no puedes?',
    type: 'text',
  },
  {
    id: 'p18',
    section: 'Uso de internet',
    variable: 'desmotivacion',
    text: '¿Qué te desmotiva a conectarte a internet?',
    type: 'text',
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
    text:
      '¿Qué tan capaz te sientes de realizar actividades digitales básicas?',
    type: 'select',
    options: ['bajo', 'medio', 'alto'],
  },
  {
    id: 'p21',
    section: 'Habilidades digitales',
    variable: 'nivel_habilidades',
    text: '¿Cómo calificarías tu nivel de habilidades digitales?',
    type: 'select',
    options: ['bajo', 'medio', 'alto'],
  },
  {
    id: 'p22',
    section: 'Habilidades digitales',
    variable: 'solucion_problemas',
    text: 'Cuando tienes un problema digital, ¿qué haces?',
    type: 'select',
    options: [
      'busco_en_internet',
      'pido_ayuda',
      'no_se_que_hacer',
      'curso_o_tutorial',
    ],
  },
  {
    id: 'p23',
    section: 'Habilidades digitales',
    variable: 'donde_aprendio',
    text:
      '¿Dónde has aprendido lo que sabes sobre tecnología e internet?',
    type: 'multi-select',
    options: ['escuela', 'cursos', 'trabajo', 'autodidacta', 'amigos_familia'],
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
    type: 'text',
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
    options: ['datos', 'wifi_casa', 'wifi_publico', 'centro_digital'],
  },
  {
    id: 'p27',
    section: 'Acceso y conectividad',
    variable: 'dispositivo_principal',
    text: '¿Qué dispositivo usas principalmente?',
    type: 'select',
    options: ['celular', 'computador', 'tablet'],
  },
  {
    id: 'p28',
    section: 'Acceso y conectividad',
    variable: 'acceso_diario',
    text: '¿Tienes acceso a internet todos los días?',
    type: 'select',
    options: ['si', 'no', 'a_veces'],
  },
  {
    id: 'p29',
    section: 'Acceso y conectividad',
    variable: 'costo_internet',
    text: '¿Qué tan costoso es para ti tener internet?',
    type: 'select',
    options: ['bajo', 'medio', 'alto'],
  },
  {
    id: 'p30',
    section: 'Acceso y conectividad',
    variable: 'barreras_conexion',
    text: '¿Qué barreras enfrentas para conectarte a internet?',
    type: 'multi-select',
    options: [
      'costo',
      'cobertura',
      'calidad',
      'dispositivos',
      'tiempo',
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
      'fraude',
      'acoso',
      'estafa',
      'robo_informacion',
      'ninguna',
    ],
  },
  {
    id: 'p32',
    section: 'Riesgos digitales',
    variable: 'sensacion_seguridad',
    text: '¿Qué tan segura/o te sientes usando internet?',
    type: 'select',
    options: ['baja', 'media', 'alta'],
  },
  {
    id: 'p33',
    section: 'Riesgos digitales',
    variable: 'busco_ayuda',
    text:
      'Si viviste una situación negativa, ¿buscaste ayuda o denunciaste?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) =>
      Array.isArray(a.situaciones_riesgo) &&
      !a.situaciones_riesgo.includes('ninguna'),
  },
  {
    id: 'p33a',
    section: 'Riesgos digitales',
    variable: 'por_que_no',
    text: 'Si no buscaste ayuda, ¿por qué?',
    type: 'text',
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
    options: ['baja', 'media', 'alta'],
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
      'primaria',
      'secundaria',
      'tecnico',
      'tecnologo',
      'universitario',
      'ninguno',
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
      'estudio',
      'trabajo',
      'busco_trabajo',
      'emprendimiento',
      'otro',
    ],
  },
  {
    id: 'p40',
    section: 'Educación y situación actual',
    variable: 'formacion_digital',
    text:
      '¿Has tomado algún curso o formación en temas digitales?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p41',
    section: 'Educación y situación actual',
    variable: 'interes_trabajo_digital',
    text:
      '¿Te gustaría trabajar en áreas relacionadas con tecnología o entornos digitales?',
    type: 'select',
    options: ['si', 'no'],
  },
  {
    id: 'p42',
    section: 'Intereses',
    variable: 'lineas_interes',
    text:
      '¿En cuál(es) de estas líneas te gustaría participar o aportar?',
    type: 'multi-select',
    options: ['empleabilidad', 'emprendimiento', 'politica_digital'],
  },
  {
    id: 'p43',
    section: 'Empleabilidad digital',
    variable: 'areas_certificacion',
    text:
      '¿En cuál de las siguientes áreas tienes certificación de estudios (tecnológicos, técnicos o superiores)?',
    type: 'multi-select',
    options: [
      'software',
      'datos',
      'marketing_digital',
      'redes',
      'soporte_tecnico',
    ],
    condition: (a) =>
      Array.isArray(a.lineas_interes) &&
      a.lineas_interes.includes('empleabilidad'),
  },
  {
    id: 'p44',
    section: 'Emprendimiento digital',
    variable: 'tiene_emprendimiento',
    text:
      '¿Tienes o estás desarrollando un emprendimiento digital?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) =>
      Array.isArray(a.lineas_interes) &&
      a.lineas_interes.includes('emprendimiento'),
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
    type: 'text',
    condition: (a) => a.tiene_emprendimiento === 'si',
  },
  {
    id: 'p47',
    section: 'Emprendimiento digital',
    variable: 'etapa_emprendimiento',
    text: '¿En qué etapa está tu iniciativa?',
    type: 'select',
    options: ['idea', 'inicio', 'crecimiento'],
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
      'capital',
      'conocimiento',
      'mercado',
      'tecnologia',
      'tiempo',
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
      '¿Tienes enlaces o redes sociales donde podamos conocer más?',
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
    condition: (a) =>
      Array.isArray(a.lineas_interes) &&
      a.lineas_interes.includes('politica_digital'),
  },
  {
    id: 'p52',
    section: 'Política pública digital',
    variable: 'pertenece_red',
    text:
      '¿Perteneces a alguna red, colectivo u organización juvenil?',
    type: 'select',
    options: ['si', 'no'],
    condition: (a) =>
      Array.isArray(a.lineas_interes) &&
      a.lineas_interes.includes('politica_digital'),
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
      'educacion_digital',
      'empleo_digital',
      'datos',
      'conectividad',
      'inclusion',
    ],
    condition: (a) =>
      Array.isArray(a.lineas_interes) &&
      a.lineas_interes.includes('politica_digital'),
  },
  {
    id: 'p55',
    section: 'Política pública digital',
    variable: 'forma_participar',
    text:
      '¿Cómo te gustaría participar o contribuir en temas de política digital?',
    type: 'text',
    condition: (a) =>
      Array.isArray(a.lineas_interes) &&
      a.lineas_interes.includes('politica_digital'),
  },
];
