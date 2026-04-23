export interface Question {
  id: string;
  text: string;
  type: 'text' | 'date' | 'select' | 'multi-select' | 'number' | 'scale';
  options?: string[];
  placeholder?: string;
  section: string;
  required?: boolean;
  condition?: (answers: Record<string, any>) => boolean;
  intro?: string; // Text to say before the question if it's the start of a section
}

export const QUESTIONS: Question[] = [
  // SECCIÓN 1: INFORMACIÓN BÁSICA
  { id: 'p1', text: '¿Cuál es tu nombre completo?', type: 'text', section: 'Información Básica', required: true },
  { id: 'p2', text: '¿Cuál es tu fecha de nacimiento? (día/mes/año)', type: 'date', section: 'Información Básica', required: true },
  { id: 'p3', text: '¿Cuál es tu correo electrónico?', type: 'text', section: 'Información Básica', required: true, placeholder: 'ejemplo@correo.com' },
  { id: 'p4', text: '¿Nos puedes dejar tu número de WhatsApp? Es para hacerte parte de una comunidad que trabaja por la transformación digital en el Caribe y Pacífico colombiano. (Es opcional — si prefieres no darlo, escribe "no".)', type: 'text', section: 'Información Básica' },
  { id: 'p5', text: '¿En qué departamento vives?', type: 'text', section: 'Información Básica', required: true },
  { id: 'p6', text: '¿En qué municipio o ciudad vives?', type: 'text', section: 'Información Básica', required: true },
  { id: 'p7', text: '¿En qué zona vives actualmente?', type: 'select', options: ['Rural', 'Urbana'], section: 'Información Básica', required: true },
  { id: 'p8', text: '¿En qué rango de edad estás?', type: 'select', options: ['12–14 años', '15–17 años', '18–21 años', '22–25 años', '26–28 años'], section: 'Información Básica', required: true },
  { id: 'p9', text: '¿Cómo te identificas?', type: 'select', options: ['Mujer', 'Hombre', 'Persona no binaria', 'Prefiero no decirlo', 'Otro'], section: 'Información Básica', required: true },
  { id: 'p10', text: '¿Perteneces a alguno de estos grupos o comunidades? Puedes elegir varios.', type: 'multi-select', options: ['Comunidad indígena', 'Población afrodescendiente, raizal o palenquera', 'Persona LGBTIQ+', 'Persona con discapacidad', 'Persona migrante o en situación de movilidad', 'Víctima del conflicto armado', 'Joven cuidador/a', 'Ninguna de las anteriores', 'Prefiero no decirlo', 'Otro'], section: 'Información Básica' },
  { 
    id: 'p11', 
    text: '¿Cuál es el tipo de discapacidad? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['Visual', 'Auditiva', 'Física / motriz', 'Intelectual o cognitiva', 'Psicosocial / mental', 'Múltiple', 'Prefiero no especificar'], 
    section: 'Información Básica',
    condition: (ans) => ans.p10?.includes('Persona con discapacidad')
  },
  { id: 'p12', text: '¿Cuál es tu nivel de estudios?', type: 'select', options: ['Secundaria / media sin finalizar', 'Secundaria / media finalizada', 'Técnico', 'Tecnológico', 'Universitario', 'Posgrado'], section: 'Información Básica', required: true },
  { id: 'p13', text: '¿Cuál de estas opciones describe mejor tu situación actual?', type: 'select', options: ['Estoy estudiando', 'Estoy estudiando y trabajando', 'Estoy buscando empleo', 'Estoy trabajando', 'Tengo un emprendimiento propio', 'Otra'], section: 'Información Básica', required: true },

  // SECCIÓN 2: USO DE INTERNET
  { 
    id: 'p14', 
    text: '¿Para qué usas internet la mayor parte del tiempo?', 
    type: 'multi-select', 
    options: ['Redes sociales', 'Hablar con amigos, familia o pareja', 'Estudiar o aprender', 'Entretenimiento (videos, música, juegos)', 'Trabajar o generar ingresos'], 
    section: 'Uso de Internet',
    intro: 'Perfecto, ya tenemos tu información básica. Ahora vienen unas preguntas sobre cómo usas internet.'
  },
  { id: 'p15', text: '¿Alguna vez has dejado de hacer algo importante para ti por no tener internet?', type: 'select', options: ['Sí', 'No'], section: 'Uso de Internet' },
  { 
    id: 'p16', 
    text: '¿Qué dejaste de hacer? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['Estudiar o hacer tareas', 'Trabajar o generar ingresos', 'Comunicarme con alguien importante', 'Acceder a servicios (salud, gobierno, etc.)', 'Participar en una oportunidad (convocatoria, curso, etc.)', 'Dar mi opinión o participar en conversaciones importantes del país', 'Otro'], 
    section: 'Uso de Internet',
    condition: (ans) => ans.p15 === 'Sí'
  },
  { id: 'p17', text: '¿Cuántas horas al día usas internet aproximadamente?', type: 'select', options: ['Menos de 1 hora', 'Entre 1 y 3 horas', 'Entre 3 y 6 horas', 'Más de 6 horas'], section: 'Uso de Internet' },
  { id: 'p18', text: '¿Te sientes capaz de usar internet de forma segura? (1: Nada capaz, 5: Totalmente capaz)', type: 'scale', section: 'Uso de Internet' },
  { id: 'p19', text: '¿Has usado internet para mejorar tus oportunidades — de estudio, trabajo o ingresos?', type: 'select', options: ['Sí', 'No'], section: 'Uso de Internet' },

  // SECCIÓN 3: MOTIVACIONES
  { 
    id: 'p20', 
    text: '¿Cuál es tu principal motivación para conectarte a internet? Elige una sola.', 
    type: 'select', 
    options: ['Mantenerme en contacto con personas', 'Entretenimiento', 'Estudiar o aprender', 'Trabajar o generar ingresos', 'Informarme', 'Expresarme o crear contenido', 'Reducir el estrés o distraerme', 'Conocer nuevas personas', 'Participar en temas sociales o políticos', 'Otro'], 
    section: 'Motivaciones',
    intro: 'Vamos bien. Ahora quiero entender qué te mueve a conectarte.'
  },
  { id: 'p21', text: '¿Qué tan importante es internet en tu vida diaria? (1: Nada importante, 5: Muy importante)', type: 'scale', section: 'Motivaciones' },
  { id: 'p22', text: '¿Qué te gustaría hacer en internet que hoy no puedes o te cuesta? Puedes elegir varios.', type: 'multi-select', options: ['Estudiar o acceder a cursos', 'Conseguir trabajo o generar ingresos', 'Crear contenido o emprender', 'Acceder a servicios (salud, trámites, etc.)', 'Participar en comunidades o proyectos', 'Jugar o consumir contenido sin limitaciones', 'Otro'], section: 'Motivaciones' },
  { id: 'p23', text: '¿Qué te desmotiva a conectarte a internet? Puedes elegir varios.', type: 'multi-select', options: ['Alto costo', 'Mala conexión', 'Falta de tiempo', 'No saber usarlo bien', 'Riesgos o inseguridad', 'Falta de interés', 'No tener dispositivo', 'Otro'], section: 'Motivaciones' },

  // SECCIÓN 4: ACCESO Y CONECTIVIDAD
  { 
    id: 'p24', 
    text: '¿Cómo te conectas principalmente a internet? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['Datos móviles propios', 'Datos móviles prestados', 'WiFi del hogar', 'WiFi público (biblioteca, parque, café)', 'No tengo acceso regular'], 
    section: 'Acceso y Conectividad',
    intro: 'Ahora hablemos de cómo es tu acceso a internet en la práctica.'
  },
  { id: 'p25', text: '¿Cómo describirías la calidad de tu conexión?', type: 'select', options: ['Buena', 'Regular', 'Mala', 'Muy mala / sin conexión estable'], section: 'Acceso y Conectividad' },
  { id: 'p26', text: '¿Con qué dispositivos cuentas para conectarte? Puedes elegir varios.', type: 'multi-select', options: ['Celular inteligente / smartphone', 'Computador portátil', 'Computador de escritorio', 'Tablet', 'Ninguno propio'], section: 'Acceso y Conectividad' },
  { id: 'p27', text: '¿Los dispositivos que usas son...?', type: 'select', options: ['Propios (míos)', 'Compartidos (de un familiar u otra persona)', 'Mixto (algunos propios, algunos compartidos)'], section: 'Acceso y Conectividad' },
  { id: 'p28', text: '¿Tienes acceso a internet todos los días?', type: 'select', options: ['Sí', 'No', 'A veces'], section: 'Acceso y Conectividad' },
  { id: 'p29', text: '¿Qué tan costoso es para ti tener internet?', type: 'select', options: ['Barato', 'Caro', 'Muy caro'], section: 'Acceso y Conectividad' },
  { id: 'p30', text: '¿Qué barreras enfrentas para conectarte? Puedes elegir varios.', type: 'multi-select', options: ['Mala señal o conexión inestable', 'Falta de dinero', 'No tengo dispositivo', 'Debo compartir el dispositivo', 'Falta de energía eléctrica', 'Falta de cobertura en mi zona', 'Otro'], section: 'Acceso y Conectividad' },

  // SECCIÓN 5: HABILIDADES DIGITALES
  { id: 'p31a', text: '¿Qué tan capaz te sientes de: Buscar información y verificar si es confiable? (1-5)', type: 'scale', section: 'Habilidades Digitales', intro: 'Ya vamos por la mitad. Ahora hablemos de tus habilidades digitales.' },
  { id: 'p31b', text: '¿Qué tan capaz te sientes de: Usar herramientas para estudiar o trabajar? (1-5)', type: 'scale', section: 'Habilidades Digitales' },
  { id: 'p31c', text: '¿Qué tan capaz te sientes de: Proteger tu información personal? (1-5)', type: 'scale', section: 'Habilidades Digitales' },
  { id: 'p31d', text: '¿Qué tan capaz te sientes de: Identificar riesgos o fraudes en internet? (1-5)', type: 'scale', section: 'Habilidades Digitales' },
  { id: 'p31e', text: '¿Qué tan capaz te sientes de: Crear contenido digital? (1-5)', type: 'scale', section: 'Habilidades Digitales' },
  { id: 'p31f', text: '¿Qué tan capaz te sientes de: Resolver problemas técnicos básicos? (1-5)', type: 'scale', section: 'Habilidades Digitales' },
  { id: 'p31g', text: '¿Qué tan capaz te sientes de: Comunicarte en entornos digitales profesionales? (1-5)', type: 'scale', section: 'Habilidades Digitales' },
  { id: 'p32', text: '¿Cómo calificarías tu nivel general de habilidades digitales?', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado'], section: 'Habilidades Digitales' },
  { id: 'p33', text: 'Cuando tienes un problema digital, ¿qué haces normalmente?', type: 'select', options: ['Lo soluciono por mi cuenta', 'Busco ayuda en internet', 'Le pregunto a alguien', 'No sé cómo solucionarlo'], section: 'Habilidades Digitales' },
  { id: 'p34', text: '¿Dónde has aprendido lo que sabes sobre tecnología e internet? Puedes elegir varios.', type: 'multi-select', options: ['Colegio o universidad', 'Cursos virtuales', 'Redes sociales o internet', 'Amigos o familiares', 'De forma autodidacta', 'No he tenido formación'], section: 'Habilidades Digitales' },
  { id: 'p35', text: '¿Crees que mejorar tus habilidades digitales aumentaría tus oportunidades?', type: 'select', options: ['Sí', 'No', 'No estoy seguro/a'], section: 'Habilidades Digitales' },
  { id: 'p36', text: '¿Has usado herramientas de inteligencia artificial (IA)?', type: 'select', options: ['Sí', 'No'], section: 'Habilidades Digitales' },
  { 
    id: 'p37', 
    text: '¿Para qué las has usado? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['Estudiar o hacer tareas', 'Crear contenido', 'Resolver dudas', 'Trabajo o emprendimiento', 'Apoyo emocional o bienestar', 'Otro'], 
    section: 'Habilidades Digitales',
    condition: (ans) => ans.p36 === 'Sí'
  },
  { id: 'p38', text: '¿Has tomado algún curso o formación específica en temas digitales?', type: 'select', options: ['Sí', 'No'], section: 'Habilidades Digitales' },
  { id: 'p39', text: '¿Cuál o cuáles?', type: 'text', section: 'Habilidades Digitales', condition: (ans) => ans.p38 === 'Sí' },

  // SECCIÓN 6: RIESGOS DIGITALES
  { 
    id: 'p40', 
    text: '¿Has experimentado alguna de estas situaciones en internet? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['Acoso o insultos', 'Suplantación de identidad', 'Difusión de información personal sin tu permiso', 'Discriminación', 'Ninguna', 'Otra'], 
    section: 'Riesgos Digitales',
    intro: 'Ahora unas preguntas sobre seguridad en internet. Todas tus respuestas son confidenciales.'
  },
  { id: 'p41', text: '¿Qué tan seguro/a te sientes usando internet? (1: Muy inseguro/a, 5: Muy seguro/a)', type: 'scale', section: 'Riesgos Digitales' },
  { 
    id: 'p42', 
    text: 'Si viviste una situación negativa, ¿buscaste ayuda o lo denunciaste?', 
    type: 'select', 
    options: ['Sí', 'No', 'No aplica'], 
    section: 'Riesgos Digitales',
    condition: (ans) => ans.p40 && !ans.p40.includes('Ninguna')
  },
  { 
    id: 'p43', 
    text: '¿Por qué no buscaste ayuda? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['No sé cómo hacerlo', 'No confío en las instituciones', 'No lo consideré grave', 'Miedo a las consecuencias', 'Vergüenza', 'Otro'], 
    section: 'Riesgos Digitales',
    condition: (ans) => ans.p42 === 'No'
  },
  { id: 'p44', text: '¿Sabes qué información personal no deberías compartir en internet?', type: 'select', options: ['Sí', 'No', 'No estoy seguro/a'], section: 'Riesgos Digitales' },
  { id: 'p45', text: '¿Sabes dónde denunciar situaciones de riesgo digital?', type: 'select', options: ['Sí', 'No', 'No estoy seguro/a'], section: 'Riesgos Digitales' },
  { id: 'p46', text: '¿Qué tan probable es que aceptes una solicitud o mensaje de alguien desconocido en internet?', type: 'select', options: ['Muy poco probable', 'Poco probable', 'Neutral', 'Probable', 'Muy probable'], section: 'Riesgos Digitales' },
  { id: 'p47', text: '¿Alguna vez alguien desconocido te ha contactado con ofertas sospechosas?', type: 'select', options: ['Sí', 'No', 'No estoy seguro/a'], section: 'Riesgos Digitales' },

  // SECCIÓN 7: ÁREAS DE INTERÉS Y TRAYECTORIA
  { 
    id: 'p48', 
    text: '¿Te gustaría trabajar o ya trabajas en áreas relacionadas con tecnología o entornos digitales?', 
    type: 'select', 
    options: [
      'Sí, estoy buscando algo en ese sector', 
      'Me interesa, pero no he explorado opciones aún', 
      'Ya tengo experiencia laboral en temas digitales', 
      'No me interesa orientarme laboralmente hacia lo digital'
    ], 
    section: 'Áreas de Interés',
    intro: 'Ya casi terminamos. Esta última parte nos ayuda a conectarte con las oportunidades más relevantes para ti.'
  },
  { 
    id: 'p49', 
    text: '¿En cuál(es) de estas líneas te gustaría participar o aportar? Puedes elegir varios.', 
    type: 'multi-select', 
    options: [
      'Empleabilidad digital', 
      'Emprendimiento digital', 
      'Participación en política pública digital'
    ], 
    section: 'Áreas de Interés' 
  },

  // MÓDULO A: EMPLEABILIDAD DIGITAL
  { 
    id: 'pa1', 
    text: '¿En cuál(es) de las siguientes áreas tienes certificación de estudios técnicos, tecnológicos o superiores? Puedes elegir varios.', 
    type: 'multi-select', 
    options: ['Ciberseguridad', 'Internet de las Cosas (IoT)', 'Desarrollo de apps móviles', 'Desarrollo en la nube (cloud)', 'Desarrollo de software', 'Análisis de datos / Data science', 'Sistemas teleinformáticos', 'Inteligencia Artificial', 'Diseño UX/UI', 'Marketing digital', 'Soporte técnico', 'Otra', 'No tengo certificación aún'], 
    section: 'Empleabilidad Digital',
    intro: 'Cuéntame más sobre tu trayectoria en empleabilidad digital.',
    condition: (ans) => ans.p49?.includes('Empleabilidad digital')
  },

  // MÓDULO B: EMPRENDIMIENTO DIGITAL
  { 
    id: 'pb1', 
    text: '¿Tienes o estás desarrollando un emprendimiento digital?', 
    type: 'select', 
    options: ['Sí, ya está en marcha', 'Está en diseño o prototipo', 'Tengo la idea, aún no he comenzado', 'No, pero me interesa iniciar uno'], 
    section: 'Emprendimiento Digital',
    intro: 'Cuéntame sobre tu emprendimiento o idea digital.',
    condition: (ans) => ans.p49?.includes('Emprendimiento digital')
  },
  { id: 'pb2', text: '¿Cómo se llama tu iniciativa o idea? (Si aún no tiene nombre, escribe "sin nombre".)', type: 'text', section: 'Emprendimiento Digital', condition: (ans) => ans.p49?.includes('Emprendimiento digital') },
  { id: 'pb3', text: '¿Qué tema aborda principalmente? Puedes elegir varios.', type: 'multi-select', options: ['Educación', 'Salud', 'Medio ambiente / sostenibilidad', 'Comercio / economía local', 'Cultura y arte', 'Seguridad y convivencia', 'Género e inclusión', 'Gobierno y trámites ciudadanos', 'Conectividad e infraestructura digital', 'Turismo', 'Otro'], section: 'Emprendimiento Digital', condition: (ans) => ans.p49?.includes('Emprendimiento digital') },
  { id: 'pb4', text: 'Tu iniciativa está enfocada en... Puedes elegir varios.', type: 'multi-select', options: ['Tu comunidad local', 'Tu región', 'Alcance nacional'], section: 'Emprendimiento Digital', condition: (ans) => ans.p49?.includes('Emprendimiento digital') },
  { id: 'pb5', text: '¿Qué barreras has enfrentado para desarrollarla? Puedes elegir varios.', type: 'multi-select', options: ['Falta de conexión a internet', 'Falta de formación', 'Falta de recursos económicos', 'Falta de redes o contactos', 'Poco apoyo institucional', 'Otra'], section: 'Emprendimiento Digital', condition: (ans) => ans.p49?.includes('Emprendimiento digital') },
  { id: 'pb6', text: 'En una frase corta, cuéntanos el objetivo principal de tu iniciativa y cómo lo están cumpliendo. (Opcional — si prefieres no responder, escribe "omitir".)', type: 'text', section: 'Emprendimiento Digital', condition: (ans) => ans.p49?.includes('Emprendimiento digital') },
  { id: 'pb7', text: '¿Tienes un enlace, red social o sitio web donde podamos conocer más? (Opcional. Si no, escribe "no".)', type: 'text', section: 'Emprendimiento Digital', condition: (ans) => ans.p49?.includes('Emprendimiento digital') },

  // MÓDULO C: POLÍTICA PÚBLICA DIGITAL
  { 
    id: 'pc1', 
    text: '¿Has participado antes en espacios de participación ciudadana, juvenil o digital?', 
    type: 'select', 
    options: ['Sí, en procesos juveniles o comunitarios', 'Sí, en temas tecnológicos o digitales', 'No, pero me gustaría'], 
    section: 'Política Pública Digital',
    intro: 'Cuéntame sobre tu interés en política pública digital.',
    condition: (ans) => ans.p49?.includes('Participación en política pública digital')
  },
  { id: 'pc2', text: '¿Perteneces a alguna red, colectivo u organización juvenil?', type: 'select', options: ['Sí', 'No'], section: 'Política Pública Digital', condition: (ans) => ans.p49?.includes('Participación en política pública digital') },
  { id: 'pc3', text: '¿Cuál o cuáles?', type: 'text', section: 'Política Pública Digital', condition: (ans) => ans.p49?.includes('Participación en política pública digital') && ans.pc2 === 'Sí' },
  { id: 'pc4', text: '¿Qué temas te interesan más dentro de la política pública digital? Puedes elegir varios.', type: 'multi-select', options: ['Derechos digitales', 'Protección de datos personales', 'Acceso e inclusión digital', 'Alfabetización y educación digital', 'Participación en decisiones tecnológicas', 'Gobernanza digital local', 'Empleo y trabajo en la economía digital', 'Regulación de plataformas', 'Inteligencia artificial y sus impactos', 'Otro'], section: 'Política Pública Digital', condition: (ans) => ans.p49?.includes('Participación en política pública digital') },
  { id: 'pc5', text: '¿Cómo te gustaría participar o contribuir en política digital? Puedes elegir varios.', type: 'multi-select', options: ['Participando en espacios de consulta o diálogo', 'Haciendo veeduría o seguimiento', 'Creando contenido para informar', 'Representando a jóvenes de mi territorio', 'Formulando propuestas', 'Investigando y documentando problemáticas', 'Conectando a otros jóvenes', 'Aprendiendo más sobre el tema', 'Otro'], section: 'Política Pública Digital', condition: (ans) => ans.p49?.includes('Participación en política pública digital') },
];
