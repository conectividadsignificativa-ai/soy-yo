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
  { id: 'p11', variable: 'uso_internet_principal', text: '¿Para qué usas internet la mayor parte del tiempo?', type: 'multi-select', options: ['estudio', 'trabajo', 'redes_sociales', 'entretenimiento', 'tramites', 'informacion'], section: 'Uso de Internet' },
  { id: 'p12', variable: 'dejo_algo', text: '¿Alguna vez has dejado de hacer algo importante por no tener internet?', type: 'select', options: ['si', 'no'], section: 'Uso de Internet' },
  { 
    id: 'p12a', 
    variable: 'que_dejo', 
    text: '¿Qué dejaste de hacer?', 
    type: 'multi-select', 
    options: ['estudiar', 'trabajar', 'acceder_servicios', 'comunicarse', 'generar_ingresos'], 
    section: 'Uso de Internet', 
    condition: (ans) => ans.dejo_algo === 'si' 
  },
  { id: 'p13', variable: 'horas_internet', text: '¿Cuántas horas al día usas internet?', type: 'select', options: ['1_2', '3_4', '5_6', 'mas6'], section: 'Uso de Internet' },
  { id: 'p14', variable: 'seguridad_percibida', text: '¿Te sientes capaz de usar internet de forma segura?', type: 'select', options: ['baja', 'media', 'alta'], section: 'Uso de Internet' },
  { id: 'p15', variable: 'motivacion_internet', text: '¿Cuál es tu principal motivación para conectarte a internet?', type: 'select', options: ['educacion', 'trabajo', 'ingresos', 'comunicacion', 'entretenimiento'], section: 'Uso de Internet' },
  { id: 'p16', variable: 'importancia_internet', text: '¿Qué tan importante es internet en tu vida diaria?', type: 'select', options: ['baja', 'media', 'alta'], section: 'Uso de Internet' },
  { id: 'p17', variable: 'quisiera_hacer', text: '¿Qué te gustaría hacer en internet que hoy no puedes?', type: 'text', section: 'Uso de Internet' },
  { id: 'p18', variable: 'desmotivacion', text: '¿Qué te desmotiva a conectarte a internet?', type: 'text', section: 'Uso de Internet' },
  { id: 'p19', variable: 'uso_oportunidades', text: '¿Has usado internet para mejorar tus oportunidades de estudio, trabajo o ingresos?', type: 'select', options: ['si', 'no'], section: 'Uso de Internet' },

  // III. HABILIDADES DIGITALES
  { id: 'p20', variable: 'nivel_actividades', text: '¿Qué tan capaz te sientes de realizar actividades digitales básicas?', type: 'select', options: ['bajo', 'medio', 'alto'], section: 'Habilidades Digitales' },
  { id: 'p21', variable: 'nivel_habilidades', text: '¿Cómo calificarías tu nivel general de habilidades digitales?', type: 'select', options: ['bajo', 'medio', 'alto'], section: 'Habilidades Digitales' },
  { id: 'p22', variable: 'solucion_problemas', text: 'Cuando tienes un problema digital, ¿qué haces normalmente?', type: 'select', options: ['busco_en_internet', 'pido_ayuda', 'no_se_que_hacer', 'curso_o_tutorial'], section: 'Habilidades Digitales' },
  { id: 'p23', variable: 'donde_aprendio', text: '¿Dónde has aprendido lo que sabes sobre tecnología e internet?', type: 'multi-select', options: ['escuela', 'cursos', 'trabajo', 'autodidacta', 'amigos_familia'], section: 'Habilidades Digitales' },
  { id: 'p24', variable: 'cree_mejora', text: '¿Crees que mejorar tus habilidades digitales aumentaría tus oportunidades?', type: 'select', options: ['si', 'no'], section: 'Habilidades Digitales' },
  { id: 'p25', variable: 'uso_ia', text: '¿Has usado herramientas de inteligencia artificial (IA)?', type: 'select', options: ['si', 'no'], section: 'Habilidades Digitales' },
  { 
    id: 'p25a', 
    variable: 'uso_ia_para', 
    text: '¿Para qué las has usado?', 
    type: 'text', 
    section: 'Habilidades Digitales', 
    condition: (ans) => ans.uso_ia === 'si' 
  },

  // IV. ACCESO Y CONECTIVIDAD
  { id: 'p26', variable: 'forma_conexion', text: '¿Cómo te conectas principalmente a internet?', type: 'multi-select', options: ['datos', 'wifi_casa', 'wifi_publico', 'centro_digital'], section: 'Acceso y Conectividad' },
  { id: 'p27', variable: 'dispositivo_principal', text: '¿Qué dispositivo usas principalmente?', type: 'select', options: ['celular', 'computador', 'tablet'], section: 'Acceso y Conectividad' },
  { id: 'p28', variable: 'acceso_diario', text: '¿Tienes acceso a internet todos los días?', type: 'select', options: ['si', 'no'], section: 'Acceso y Conectividad' },
  { id: 'p29', variable: 'costo_internet', text: '¿Qué tan costoso es para ti tener internet?', type: 'select', options: ['bajo', 'medio', 'alto'], section: 'Acceso y Conectividad' },
  { id: 'p30', variable: 'barreras_conexion', text: '¿Qué barreras enfrentas para conectarte a internet?', type: 'multi-select', options: ['costo', 'cobertura', 'calidad', 'dispositivos', 'tiempo'], section: 'Acceso y Conectividad' },

  // V. RIESGOS DIGITALES
  { id: 'p31', variable: 'situaciones_riesgo', text: '¿Has experimentado alguna de estas situaciones en internet?', type: 'multi-select', options: ['fraude', 'acoso', 'estafa', 'robo_informacion', 'ninguna'], section: 'Riesgos Digitales' },
  { id: 'p32', variable: 'sensacion_seguridad', text: '¿Qué tan segura/o te sientes usando internet?', type: 'select', options: ['baja', 'media', 'alta'], section: 'Riesgos Digitales' },
  { 
    id: 'p33', 
    variable: 'busco_ayuda', 
    text: 'Si viviste una situación negativa, ¿buscaste ayuda o denunciaste?', 
    type: 'select', 
    options: ['si', 'no'], 
    section: 'Riesgos Digitales', 
    condition: (ans) => ans.situaciones_riesgo && !ans.situaciones_riesgo.includes('ninguna') 
  },
  { 
    id: 'p33a', 
    variable: 'por_que_no', 
    text: '¿Por qué no buscaste ayuda?', 
    type: 'text', 
    section: 'Riesgos Digitales', 
    condition: (ans) => ans.busco_ayuda === 'no' 
  },
  { id: 'p34', variable: 'conoce_info_privada', text: '¿Sabes qué información personal no deberías compartir en internet?', type: 'select', options: ['si', 'no'], section: 'Riesgos Digitales' },
  { id: 'p35', variable: 'sabe_denunciar', text: '¿Sabes dónde denunciar situaciones de riesgo digital?', type: 'select', options: ['si', 'no'], section: 'Riesgos Digitales' },
  { id: 'p36', variable: 'aceptar_desconocido', text: '¿Qué tan probable es que aceptes mensajes o solicitudes de personas desconocidas?', type: 'select', options: ['baja', 'media', 'alta'], section: 'Riesgos Digitales' },
  { id: 'p37', variable: 'contacto_sospechoso', text: '¿Alguien desconocido te ha contactado con ofertas sospechosas?', type: 'select', options: ['si', 'no'], section: 'Riesgos Digitales' },

  // VI. EDUCACIÓN Y SITUACIÓN ACTUAL
  { id: 'p38', variable: 'nivel_estudios', text: '¿Cuál es tu nivel de estudios?', type: 'select', options: ['primaria', 'secundaria', 'tecnico', 'tecnologo', 'universitario', 'ninguno'], section: 'Educación' },
  { id: 'p39', variable: 'situacion_actual', text: '¿Cuál opción describe mejor tu situación actual?', type: 'select', options: ['estudio', 'trabajo', 'busco_trabajo', 'emprendimiento', 'otro'], section: 'Educación' },
  { id: 'p40', variable: 'formacion_digital', text: '¿Has tomado algún curso o formación en temas digitales?', type: 'select', options: ['si', 'no'], section: 'Educación' },
  { id: 'p41', variable: 'interes_trabajo_digital', text: '¿Te gustaría trabajar en áreas relacionadas con tecnología o entornos digitales?', type: 'select', options: ['si', 'no'], section: 'Educación' },

  // VII. ÁREAS DE INTERÉS
  { id: 'p42', variable: 'lineas_interes', text: '¿En cuál(es) de estas líneas te gustaría participar o aportar?', type: 'multi-select', options: ['empleabilidad', 'emprendimiento', 'politica_digital'], section: 'Áreas de Interés' },

  // VIII. EMPLEABILIDAD DIGITAL
  { 
    id: 'p43', 
    variable: 'areas_certificacion', 
    text: '¿En cuál de las siguientes áreas tienes certificación de estudios?', 
    type: 'multi-select', 
    options: ['software', 'datos', 'marketing', 'redes', 'soporte_tecnico'], 
    section: 'Empleabilidad Digital', 
    condition: (ans) => ans.lineas_interes?.includes('empleabilidad') 
  },

  // IX. EMPRENDIMIENTO DIGITAL
  { 
    id: 'p44', 
    variable: 'tiene_emprendimiento', 
    text: '¿Tienes o estás desarrollando un emprendimiento digital?', 
    type: 'select', 
    options: ['si', 'no'], 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p45', 
    variable: 'nombre_emprendimiento', 
    text: '¿Cómo se llama tu iniciativa o idea de emprendimiento digital?', 
    type: 'text', 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p46', 
    variable: 'tema_emprendimiento', 
    text: '¿Qué tema aborda principalmente tu iniciativa?', 
    type: 'text', 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p47', 
    variable: 'etapa_emprendimiento', 
    text: '¿En qué etapa está tu iniciativa?', 
    type: 'select', 
    options: ['idea', 'inicio', 'crecimiento'], 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p48_e', 
    variable: 'enfoque_emprendimiento', 
    text: 'Tu iniciativa está enfocada en…', 
    type: 'text', 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p49_e', 
    variable: 'barreras_emprendimiento', 
    text: '¿Qué barreras has enfrentado?', 
    type: 'multi-select', 
    options: ['capital', 'conocimiento', 'mercado', 'tecnologia', 'tiempo'], 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p50', 
    variable: 'objetivo_emprendimiento', 
    text: 'En una frase corta, cuéntanos el objetivo principal de tu iniciativa y cómo lo están cumpliendo.', 
    type: 'text', 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },
  { 
    id: 'p51', 
    variable: 'enlaces_emprendimiento', 
    text: '¿Tienes enlaces o redes sociales donde podamos conocer más?', 
    type: 'text', 
    section: 'Emprendimiento Digital', 
    condition: (ans) => ans.tiene_emprendimiento === 'si' && ans.lineas_interes?.includes('emprendimiento') 
  },

  // X. PARTICIPACIÓN EN POLÍTICA PÚBLICA DIGITAL
  { 
    id: 'p52', 
    variable: 'participacion_previa', 
    text: '¿Has participado antes en espacios de participación ciudadana, juvenil o digital?', 
    type: 'select', 
    options: ['si', 'no'], 
    section: 'Política Digital', 
    condition: (ans) => ans.lineas_interes?.includes('politica_digital') 
  },
  { 
    id: 'p53', 
    variable: 'pertenece_red', 
    text: '¿Perteneces a alguna red, colectivo u organización juvenil?', 
    type: 'select', 
    options: ['si', 'no'], 
    section: 'Política Digital', 
    condition: (ans) => ans.lineas_interes?.includes('politica_digital') 
  },
  { 
    id: 'p53a', 
    variable: 'cual_red', 
    text: '¿Cuál?', 
    type: 'text', 
    section: 'Política Digital', 
    condition: (ans) => ans.pertenece_red === 'si' && ans.lineas_interes?.includes('politica_digital') 
  },
  { 
    id: 'p54', 
    variable: 'temas_politica', 
    text: '¿Qué temas te interesan más dentro de la política pública digital?', 
    type: 'multi-select', 
    options: ['educacion_digital', 'empleo_digital', 'datos', 'conectividad', 'inclusion'], 
    section: 'Política Digital', 
    condition: (ans) => ans.lineas_interes?.includes('politica_digital') 
  },
  { 
    id: 'p55', 
    variable: 'forma_participar', 
    text: '¿Cómo te gustaría participar o contribuir en temas de política digital?', 
    type: 'text', 
    section: 'Política Digital', 
    condition: (ans) => ans.lineas_interes?.includes('politica_digital') 
  },
];
