export interface Question {
  id: string;
  text: string;
  type: 'text' | 'date' | 'select' | 'multi-select' | 'number' | 'scale';
  options?: string[];
  placeholder?: string;
  section: string;
  required?: boolean;
}

export const QUESTIONS: Question[] = [
  // Sección I: Información básica
  { id: 'fullName', text: '¡Hola! Para empezar, ¿cuál es tu nombre completo?', type: 'text', section: 'Información básica', required: true },
  { id: 'birthDate', text: '¿Cuándo naciste? (Día/Mes/Año)', type: 'date', section: 'Información básica', required: true },
  { id: 'email', text: 'Regálame tu correo electrónico para estar en contacto.', type: 'text', section: 'Información básica', required: true, placeholder: 'ejemplo@correo.com' },
  { id: 'whatsapp', text: '¿Tienes un número de WhatsApp? Así podemos hacerte parte de nuestra comunidad.', type: 'text', section: 'Información básica' },
  { id: 'department', text: '¿En qué departamento vives?', type: 'text', section: 'Información básica', required: true },
  { id: 'municipality', text: '¿Y en qué municipio o ciudad?', type: 'text', section: 'Información básica', required: true },
  
  // Sección II: Caracterización
  { id: 'zone', text: '¿En qué zona vives actualmente?', type: 'select', options: ['Rural', 'Urbana'], section: 'Caracterización', required: true },
  { id: 'genderIdentity', text: '¿Cómo te identificas?', type: 'select', options: ['Mujer', 'Hombre', 'Persona no binaria', 'Prefiero no decirlo', 'Otro'], section: 'Caracterización', required: true },
  { id: 'communities', text: '¿Perteneces a alguno de estos grupos o comunidades? (Puedes marcar varios)', type: 'multi-select', options: ['Comunidad indígena', 'Población afrodescendiente, raizal o palenquera', 'Persona LGBTIQ+', 'Persona con discapacidad', 'Persona migrante o en situación de movilidad', 'Víctima del conflicto armado', 'Joven cuidador/a', 'Ninguna de las anteriores', 'Prefiero no decirlo'], section: 'Caracterización' },
  { id: 'ageRange', text: '¿En qué rango de edad estás?', type: 'select', options: ['12–14', '15–17', '18–21', '22–25', '26–28'], section: 'Caracterización', required: true },

  // Diagnóstico
  { id: 'internetUsePurpose', text: '¿Para qué usas internet la mayor parte del tiempo?', type: 'select', options: ['Redes sociales', 'Hablar con amigos, familia o pareja', 'Estudiar o aprender', 'Entretenimiento (videos, música, juegos)', 'Trabajar o generar ingresos'], section: 'Uso de Internet' },
  { id: 'internetHours', text: '¿Cuántas horas al día usas internet?', type: 'select', options: ['Menos de 1 hora', 'Entre 1 y 3 horas', 'Entre 3 y 6 horas', 'Más de 6 horas'], section: 'Uso de Internet' },
  { id: 'capabilitiesLevel', text: '¿Cómo calificarías tu nivel de habilidades digitales?', type: 'select', options: ['Básico', 'Intermedio', 'Avanzado'], section: 'Habilidades digitales', required: true },
  { id: 'learningSource', text: '¿Dónde has aprendido lo que sabes sobre tecnología e internet?', type: 'select', options: ['Colegio o universidad', 'Cursos virtuales', 'Redes sociales o internet', 'Amigos o familiares', 'De forma autodidacta', 'No he tenido formación'], section: 'Habilidades digitales' },

  // Áreas de interés
  { id: 'interests', text: '¿En cuáles de estas líneas te gustaría participar o aportar?', type: 'select', options: ['Empleabilidad digital', 'Emprendimiento digital', 'Participación en política pública digital'], section: 'Áreas de interés', required: true },
  
  // Situación Actual
  { id: 'currentSituation', text: '¿Cuál de estas opciones describe mejor tu situación actual?', type: 'select', options: ['Estoy estudiando', 'Estoy estudiando y trabajando', 'Estoy buscando empleo', 'Estoy trabajando', 'Tengo un emprendimiento propio', 'Otra'], section: 'Situación Actual', required: true },
];

