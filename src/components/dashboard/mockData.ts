// mockData.ts
// Generador de datos simulados realistas para el panel de indicadores (OIT & UNFPA)

export const generateMockSubmissions = () => {
  const depts = [
    'Chocó', 'Valle del Cauca', 'Cauca', 'Nariño', // Pacífico
    'Atlántico', 'Bolívar', 'Cesar', 'Córdoba', 'La Guajira', 'Magdalena', 'Sucre' // Caribe
  ];
  
  const munis: Record<string, string[]> = {
    'Chocó': ['Quibdó', 'Istmina', 'Condoto', 'Tadó'],
    'Valle del Cauca': ['Cali', 'Buenaventura', 'Palmira', 'Tuluá'],
    'Cauca': ['Popayán', 'Guapi', 'Timbiquí', 'Santander de Quilichao'],
    'Nariño': ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Puerto Colombia'],
    'Bolívar': ['Cartagena', 'Turbaco', 'Magangué', 'El Carmen de Bolívar'],
    'Cesar': ['Valledupar', 'Aguachica', 'Codazzi'],
    'Córdoba': ['Montería', 'Cereté', 'Lorica', 'Sahagún'],
    'La Guajira': ['Riohacha', 'Maicao', 'Uribia', 'Manaure'],
    'Magdalena': ['Santa Marta', 'Ciénaga', 'Fundación'],
    'Sucre': ['Sincelejo', 'Corozal', 'San Marcos']
  };

  const ages = ['18–21 años', '22–25 años', '26–28 años', '15–17 años'];
  const genders = ['Mujer', 'Hombre', 'Persona no binaria'];
  const groupsList = [
    'Población afrodescendiente, raizal o palenquera',
    'Comunidad indígena',
    'Persona con discapacidad',
    'Persona LGBTIQ+',
    'Víctima del conflicto armado',
    'Joven cuidador/a'
  ];
  const studies = ['Secundaria / media finalizada', 'Técnico / Tecnológico', 'Universitario', 'Posgrado'];
  const situations = [
    'Estoy estudiando',
    'Estoy estudiando y trabajando',
    'Estoy buscando empleo',
    'Estoy trabajando',
    'Tengo un emprendimiento propio',
    'Ni estudio ni trabajo'
  ];
  
  const yesNo = ['Sí', 'No'];
  const techInterests = [
    'Sí, estoy buscando algo en ese sector',
    'Me interesa, pero no he explorado opciones aún',
    'Ya tengo experiencia en temas digitales, o estoy trabajando en estos temas',
    'No me interesan los temas digitales o de tecnología'
  ];

  const lines = [
    ['Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales'],
    ['Emprendimiento digital — ideas, soluciones y negocios con tecnología'],
    ['Participación en política pública digital — derechos digitales, incidencia y gobernanza local'],
    [
      'Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales',
      'Emprendimiento digital — ideas, soluciones y negocios con tecnología'
    ],
    [
      'Emprendimiento digital — ideas, soluciones y negocios con tecnología',
      'Participación en política pública digital — derechos digitales, incidencia y gobernanza local'
    ],
    [
      'Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales',
      'Participación en política pública digital — derechos digitales, incidencia y gobernanza local'
    ],
    [
      'Empleabilidad digital — formación, habilidades y acceso a oportunidades laborales',
      'Emprendimiento digital — ideas, soluciones y negocios con tecnología',
      'Participación en política pública digital — derechos digitales, incidencia y gobernanza local'
    ]
  ];

  const certs = [
    'Marketing digital', 'Desarrollo de apps', 'Ciberseguridad', 'Análisis de datos / Data science', 'Diseño UX/UI'
  ];

  const themes = ['Comercio / economía local', 'Educación', 'Medio ambiente / sostenibilidad', 'Cultura y arte'];
  const stages = ['Es solo una idea', 'Está en diseño o prototipo', 'Ya tiene usuarios o clientes activos'];
  const current_date = new Date();

  return Array.from({ length: 60 }).map((_, i) => {
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const mList = munis[dept] || ['Otro'];
    const muni = mList[Math.floor(Math.random() * mList.length)];
    const age = ages[Math.floor(Math.random() * ages.length)];
    const gender = genders[Math.floor(Math.random() * genders.length)];
    const gr: string[] = [];
    
    if (Math.random() > 0.25) {
      gr.push(groupsList[Math.floor(Math.random() * groupsList.length)]);
    }
    if (gr.includes('Persona con discapacidad')) {
      // Ensure "Persona con discapacidad" is consistent
    }
    const hasDisability = gr.includes('Persona con discapacidad') || Math.random() < 0.1;
    if (hasDisability && !gr.includes('Persona con discapacidad')) {
      gr.push('Persona con discapacidad');
    }
    if (gr.length === 0) {
      gr.push('Ninguna de las anteriores');
    }

    const disability = hasDisability ? ['Física / motriz', 'Visual', 'Auditiva'][Math.floor(Math.random() * 3)] : null;
    const selectedLines = lines[Math.floor(Math.random() * lines.length)];
    const hasEmp = selectedLines.some(x => x.startsWith('Empleabilidad'));
    const hasEmpr = selectedLines.some(x => x.startsWith('Emprendimiento'));
    const hasPol = selectedLines.some(x => x.startsWith('Participación'));

    const activeEmp = hasEmpr ? yesNo[Math.floor(Math.random() * 1.5)] : 'No';

    const referralOptions = ['goyn', 'cora', 'fedesoft', 'cintel', 'oit', 'Directo'];
    const randomReferral = referralOptions[Math.floor(Math.random() * referralOptions.length)];

    return {
      nombre: `Joven ${i + 1}`,
      email: `joven${i + 1}@correo.com`,
      whatsapp: '3001234567',
      departamento: dept,
      municipio: muni,
      zona: Math.random() > 0.4 ? 'Urbana' : 'Rural',
      rango_edad: age,
      genero: gender,
      grupos: gr,
      tipo_discapacidad: disability ? [disability] : [],
      nivel_estudios: studies[Math.floor(Math.random() * studies.length)],
      situacion_actual: situations[Math.floor(Math.random() * situations.length)],
      interes_trabajo_digital: techInterests[Math.floor(Math.random() * techInterests.length)],
      lineas_interes: selectedLines,
      areas_certificacion: hasEmp ? [certs[Math.floor(Math.random() * certs.length)]] : ['No tengo ninguna certificación'],
      tiene_emprendimiento: activeEmp,
      nombre_emprendimiento: activeEmp === 'Sí' ? `Iniciativa Digital ${i + 1}` : '',
      tema_emprendimiento: activeEmp === 'Sí' ? [themes[Math.floor(Math.random() * themes.length)]] : [],
      etapa_emprendimiento: activeEmp === 'Sí' ? stages[Math.floor(Math.random() * stages.length)] : '',
      alcance_emprendimiento: activeEmp === 'Sí' ? ['Tu comunidad local', 'En tu región', 'Cuenta con alcance nacional'][Math.floor(Math.random() * 3)] : '',
      barreras_emprendimiento: activeEmp === 'Sí' ? ['Falta de recursos económicos', 'Falta de conexión a internet', 'Falta de formación'][Math.floor(Math.random() * 3)] : [],
      objetivo_emprendimiento: activeEmp === 'Sí' ? 'Impulsar el desarrollo local mediante la digitalización y el acceso tecnológico.' : '',
      enlaces_emprendimiento: activeEmp === 'Sí' ? 'https://instagram.com/digital_init' : '',
      participacion_previa: hasPol ? yesNo[Math.floor(Math.random() * 2)] : 'No',
      pertenece_red: hasPol ? (Math.random() > 0.5 ? 'Sí — ¿cuál?' : 'No') : 'No',
      cual_red: (hasPol && Math.random() > 0.5) ? 'Red de Jóvenes del Territorio' : '',
      temas_politica: hasPol ? ['Derechos digitales', 'Alfabetización y educación digital'] : [],
      forma_participar: hasPol ? ['Creando contenido para informar a mi comunidad sobre temas digitales', 'Participando en espacios de consulta o diálogo con el gobierno'] : [],
      referencia: randomReferral,
      createdAt: {
        seconds: Math.floor((current_date.getTime() - (Math.random() * 10 * 24 * 60 * 60 * 1000)) / 1000),
        toDate: function() { return new Date(this.seconds * 1000); }
      }
    };
  });
};
