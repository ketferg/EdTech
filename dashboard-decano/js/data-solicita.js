// Base de datos de prueba con mallas reales de Ingeniería UPDS
const UPDS_DATA = {
  facultad: {
    nombre: "Facultad de Ingeniería",
    sede: "Sede Santa Cruz",
    decano: "Ing. Roberto Mendoza",
    carreras: [
      { id: "ING-RED", nombre: "Ing. en Redes y Telecomunicaciones", plan: "350-02" },
      { id: "ING-SIS", nombre: "Ingeniería de Sistemas", plan: "340-02" },
      { id: "ING-IND", nombre: "Ingeniería Industrial", plan: "330-02" }
    ]
  },

  // Espacios físicos disponibles en el campus
  espacios: [
    { id: "LAB-RED-1", nombre: "Laboratorio de Redes y Cisco 1", tipo: "Laboratorio", capacidad: 30, ubicacion: "Bloque B - Piso 2" },
    { id: "LAB-RED-2", nombre: "Laboratorio de Telecomunicaciones 2", tipo: "Laboratorio", capacidad: 30, ubicacion: "Bloque B - Piso 2" },
    { id: "LAB-SIS-1", nombre: "Laboratorio de Software y Cloud 1", tipo: "Laboratorio", capacidad: 30, ubicacion: "Bloque C - Piso 1" },
    { id: "LAB-SIS-2", nombre: "Laboratorio de Inteligencia Artificial", tipo: "Laboratorio", capacidad: 30, ubicacion: "Bloque C - Piso 2" },
    { id: "AULA-301", nombre: "Aula Teórica 301 (Multimedia)", tipo: "Aula", capacidad: 50, ubicacion: "Bloque A - Piso 3" },
    { id: "AULA-302", nombre: "Aula Teórica 302", tipo: "Aula", capacidad: 50, ubicacion: "Bloque A - Piso 3" },
    { id: "AULA-304", nombre: "Aula Teórica 304 (Magna)", tipo: "Aula", capacidad: 50, ubicacion: "Bloque A - Piso 3" }
  ],

  // Plantel docente de la Facultad de Ingeniería
  docentes: [
    { id: "DOC-01", nombre: "Ing. Carlos Mendoza", especialidad: "Redes y Telecomunicaciones", asignaciones: ["Noche"] },
    { id: "DOC-02", nombre: "Ing. Marcela Durán", especialidad: "Sistemas Distribuidos y Cloud", asignaciones: ["Mañana"] },
    { id: "DOC-03", nombre: "Ing. Fernando Justiniano", especialidad: "Bases de Datos y Big Data", asignaciones: ["Tarde"] },
    { id: "DOC-04", nombre: "Ing. Alejandro Torrico", especialidad: "Seguridad Informática y Criptografía", asignaciones: [] },
    { id: "DOC-05", nombre: "Ing. Patricia Vaca", especialidad: "Inteligencia Artificial y Machine Learning", asignaciones: ["Mediodía"] },
    { id: "DOC-06", nombre: "Ing. Víctor Hugo Soliz", especialidad: "Antenas, Microondas y Fibra Óptica", asignaciones: [] },
    { id: "DOC-07", nombre: "Ing. Gabriel Montaño", especialidad: "Investigación Operativa y Simulación", asignaciones: ["Noche"] }
  ],

  // Los 4 turnos oficiales de UPDS
  turnos: [
    { id: "Mañana", horario: "07:00 a 11:30" },
    { id: "Mediodía", horario: "11:30 a 15:30" },
    { id: "Tarde", horario: "15:30 a 19:00" },
    { id: "Noche", horario: "19:00 a 22:30" }
  ],

  // PESTAÑA 1: Materias que están activas en el foro de SOLICITA acumulando alumnos
  materiasForo: [
    {
      id: "FORO-01",
      codigo: "RED-0210",
      nombre: "Tecnologías Inalámbricas",
      carreraId: "ING-RED",
      carreraNombre: "Ing. en Redes y Telecomunicaciones",
      semestre: 7,
      turno: "Noche",
      tipoRequerido: "Laboratorio",
      interesados: 18,
      metaMinima: 10,
      limite: 30,
      fechaCreacion: "2026-10-18",
      alumnos: [
        { reg: "20210458", nombre: "Ketfer Gianella Salazar", requisitosOk: true, telefono: "62143492" },
        { reg: "20210892", nombre: "José Andrés Salame", requisitosOk: true, telefono: "71310958" },
        { reg: "20210741", nombre: "José Rene Huebe", requisitosOk: true, telefono: "63555649" },
        { reg: "20210115", nombre: "Joel Richard Quispe", requisitosOk: true, telefono: "75098231" },
        { reg: "20220332", nombre: "Mateo Fernández Ramos", requisitosOk: true, telefono: "78451230" },
        { reg: "20220419", nombre: "Camila Andrea Vaca", requisitosOk: true, telefono: "76321489" },
        { reg: "20210984", nombre: "Rodrigo Paz Flores", requisitosOk: true, telefono: "77014589" },
        { reg: "20220677", nombre: "Luciana Morales Roca", requisitosOk: true, telefono: "70894512" },
        { reg: "20210344", nombre: "Sebastián Peña Cruz", requisitosOk: true, telefono: "75632140" },
        { reg: "20220199", nombre: "Valeria Guzmán Ortiz", requisitosOk: true, telefono: "79854120" },
        { reg: "20210871", nombre: "Diego Hurtado Salvatierra", requisitosOk: true, telefono: "73124560" },
        { reg: "20220556", nombre: "Sofía Arteaga Justiniano", requisitosOk: true, telefono: "72145896" },
        { reg: "20210723", nombre: "Mauricio Banegas Paz", requisitosOk: true, telefono: "74125896" },
        { reg: "20220812", nombre: "Gabriela Suárez Pinto", requisitosOk: true, telefono: "70124589" },
        { reg: "20210290", nombre: "Lucas Mercado Rojas", requisitosOk: true, telefono: "79145236" },
        { reg: "20220945", nombre: "Mariana Cuéllar Chávez", requisitosOk: true, telefono: "78541236" },
        { reg: "20210634", nombre: "Esteban Melgar Ribera", requisitosOk: true, telefono: "71258963" },
        { reg: "20220388", nombre: "Natalia Aguilera Bravo", requisitosOk: true, telefono: "76985412" }
      ],
      comentarios: [
        { autor: "Ketfer G.", texto: "Compañeros, ya somos 18 confirmados. Cumplimos el prerrequisito de Redes II." },
        { autor: "Camila V.", texto: "¿Saben si el Ing. Mendoza podría darla en la noche? Todos trabajamos de día." }
      ]
    },
    {
      id: "FORO-02",
      codigo: "SIS-0360",
      nombre: "Seguridad Informática I",
      carreraId: "ING-SIS",
      carreraNombre: "Ingeniería de Sistemas",
      semestre: 8,
      turno: "Noche",
      tipoRequerido: "Laboratorio",
      interesados: 12,
      metaMinima: 10,
      limite: 30,
      fechaCreacion: "2026-10-20",
      alumnos: [
        { reg: "20210984", nombre: "Rodrigo Paz Flores", requisitosOk: true, telefono: "77014589" },
        { reg: "20220677", nombre: "Luciana Morales Roca", requisitosOk: true, telefono: "70894512" },
        { reg: "20210458", nombre: "Ketfer Gianella Salazar", requisitosOk: true, telefono: "62143492" },
        { reg: "20210892", nombre: "José Andrés Salame", requisitosOk: true, telefono: "71310958" },
        { reg: "20220332", nombre: "Mateo Fernández Ramos", requisitosOk: true, telefono: "78451230" },
        { reg: "20220419", nombre: "Camila Andrea Vaca", requisitosOk: true, telefono: "76321489" },
        { reg: "20210344", nombre: "Sebastián Peña Cruz", requisitosOk: true, telefono: "75632140" },
        { reg: "20220199", nombre: "Valeria Guzmán Ortiz", requisitosOk: true, telefono: "79854120" },
        { reg: "20210871", nombre: "Diego Hurtado Salvatierra", requisitosOk: true, telefono: "73124560" },
        { reg: "20220556", nombre: "Sofía Arteaga Justiniano", requisitosOk: true, telefono: "72145896" },
        { reg: "20210723", nombre: "Mauricio Banegas Paz", requisitosOk: true, telefono: "74125896" },
        { reg: "20220812", nombre: "Gabriela Suárez Pinto", requisitosOk: true, telefono: "70124589" }
      ],
      comentarios: [
        { autor: "Rodrigo P.", texto: "Ya llegamos a 12. Avisamos a secretaría para que pase a revisión." }
      ]
    },
    {
      id: "FORO-03",
      codigo: "RED-0140",
      nombre: "Redes III",
      carreraId: "ING-RED",
      carreraNombre: "Ing. en Redes y Telecomunicaciones",
      semestre: 7,
      turno: "Mañana",
      tipoRequerido: "Laboratorio",
      interesados: 8,
      metaMinima: 10,
      limite: 30,
      fechaCreacion: "2026-10-22",
      alumnos: [
        { reg: "20220112", nombre: "Bruno Céspedes Parada", requisitosOk: true, telefono: "76012458" },
        { reg: "20220445", nombre: "Andrea Terrazas Gil", requisitosOk: true, telefono: "78124596" },
        { reg: "20220389", nombre: "Carlos Eduardo Saucedo", requisitosOk: true, telefono: "77458962" },
        { reg: "20210992", nombre: "Valeria Soliz Mercado", requisitosOk: true, telefono: "71458963" },
        { reg: "20220811", nombre: "Javier Antelo Moreno", requisitosOk: true, telefono: "75412369" },
        { reg: "20210776", nombre: "Fabiana Justiniano Roca", requisitosOk: true, telefono: "72589631" },
        { reg: "20220234", nombre: "Pablo Andrés Barba", requisitosOk: true, telefono: "70145896" },
        { reg: "20210665", nombre: "Denisse Vaca Díez", requisitosOk: true, telefono: "78965412" }
      ],
      comentarios: [
        { autor: "Bruno C.", texto: "Faltan solo 2 personas para el mínimo de 10 en la mañana." }
      ]
    },
    {
      id: "FORO-04",
      codigo: "SIS-0410",
      nombre: "Inteligencia Artificial",
      carreraId: "ING-SIS",
      carreraNombre: "Ingeniería de Sistemas",
      semestre: 9,
      turno: "Mediodía",
      tipoRequerido: "Laboratorio",
      interesados: 6,
      metaMinima: 10,
      limite: 30,
      fechaCreacion: "2026-10-24",
      alumnos: [
        { reg: "20210115", nombre: "Joel Richard Quispe", requisitosOk: true, telefono: "75098231" },
        { reg: "20210892", nombre: "José Andrés Salame", requisitosOk: true, telefono: "71310958" },
        { reg: "20210741", nombre: "José Rene Huebe", requisitosOk: true, telefono: "63555649" },
        { reg: "20220332", nombre: "Mateo Fernández Ramos", requisitosOk: true, telefono: "78451230" },
        { reg: "20220419", nombre: "Camila Andrea Vaca", requisitosOk: true, telefono: "76321489" },
        { reg: "20210984", nombre: "Rodrigo Paz Flores", requisitosOk: true, telefono: "77014589" }
      ],
      comentarios: []
    }
  ],

  // PESTAÑA 2: Materias que pasaron a Evaluación (Mesa de Decisión Auxiliar/Decano)
  materiasEvaluacion: [
    {
      id: "EVAL-01",
      codigo: "TEL-0320",
      nombre: "Antenas y Propagación",
      carreraId: "ING-RED",
      carreraNombre: "Ing. en Redes y Telecomunicaciones",
      semestre: 7,
      turno: "Noche",
      horario: "19:00 a 22:30",
      tipo: "Laboratorio",
      espacioAsignado: "LAB-RED-2",
      docenteAsignadoId: null, // Pendiente de asignación por Decano
      docenteAsignadoNombre: null,
      interesados: 16,
      metaMinima: 10,
      limite: 30,
      recaudacionEstimada: 10240, // 16 * 640
      honorarioDocente: 2500,
      utilidadInstitucional: 7740,
      auxiliarValidador: "Lic. Andrea Suárez (Auxiliar)",
      alumnos: [
        { reg: "20210458", nombre: "Ketfer Gianella Salazar", requisitosOk: true, notaPrevia: "84/100" },
        { reg: "20210892", nombre: "José Andrés Salame", requisitosOk: true, notaPrevia: "78/100" },
        { reg: "20210741", nombre: "José Rene Huebe", requisitosOk: true, notaPrevia: "80/100" },
        { reg: "20210115", nombre: "Joel Richard Quispe", requisitosOk: true, notaPrevia: "82/100" },
        { reg: "20220332", nombre: "Mateo Fernández Ramos", requisitosOk: true, notaPrevia: "90/100" },
        { reg: "20220419", nombre: "Camila Andrea Vaca", requisitosOk: true, notaPrevia: "75/100" },
        { reg: "20210984", nombre: "Rodrigo Paz Flores", requisitosOk: true, notaPrevia: "88/100" },
        { reg: "20220677", nombre: "Luciana Morales Roca", requisitosOk: true, notaPrevia: "92/100" },
        { reg: "20210344", nombre: "Sebastián Peña Cruz", requisitosOk: true, notaPrevia: "70/100" },
        { reg: "20220199", nombre: "Valeria Guzmán Ortiz", requisitosOk: true, notaPrevia: "85/100" },
        { reg: "20210871", nombre: "Diego Hurtado Salvatierra", requisitosOk: true, notaPrevia: "79/100" },
        { reg: "20220556", nombre: "Sofía Arteaga Justiniano", requisitosOk: true, notaPrevia: "83/100" },
        { reg: "20210723", nombre: "Mauricio Banegas Paz", requisitosOk: true, notaPrevia: "74/100" },
        { reg: "20220812", nombre: "Gabriela Suárez Pinto", requisitosOk: true, notaPrevia: "86/100" },
        { reg: "20210290", nombre: "Lucas Mercado Rojas", requisitosOk: true, notaPrevia: "81/100" },
        { reg: "20220945", nombre: "Mariana Cuéllar Chávez", requisitosOk: true, notaPrevia: "89/100" }
      ]
    },
    {
      id: "EVAL-02",
      codigo: "IND-0310",
      nombre: "Investigación Operativa II",
      carreraId: "ING-IND",
      carreraNombre: "Ingeniería Industrial",
      semestre: 6,
      turno: "Tarde",
      horario: "15:30 a 19:00",
      tipo: "Aula",
      espacioAsignado: "AULA-301",
      docenteAsignadoId: null,
      docenteAsignadoNombre: null,
      interesados: 14,
      metaMinima: 10,
      limite: 50,
      recaudacionEstimada: 8960, // 14 * 640
      honorarioDocente: 2500,
      utilidadInstitucional: 6460,
      auxiliarValidador: "Lic. Andrea Suárez (Auxiliar)",
      alumnos: [
        { reg: "20220112", nombre: "Bruno Céspedes Parada", requisitosOk: true, notaPrevia: "80/100" },
        { reg: "20220445", nombre: "Andrea Terrazas Gil", requisitosOk: true, notaPrevia: "85/100" },
        { reg: "20220389", nombre: "Carlos Eduardo Saucedo", requisitosOk: true, notaPrevia: "76/100" },
        { reg: "20210992", nombre: "Valeria Soliz Mercado", requisitosOk: true, notaPrevia: "82/100" },
        { reg: "20220811", nombre: "Javier Antelo Moreno", requisitosOk: true, notaPrevia: "79/100" },
        { reg: "20210776", nombre: "Fabiana Justiniano Roca", requisitosOk: true, notaPrevia: "88/100" },
        { reg: "20220234", nombre: "Pablo Andrés Barba", requisitosOk: true, notaPrevia: "91/100" },
        { reg: "20210665", nombre: "Denisse Vaca Díez", requisitosOk: true, notaPrevia: "74/100" },
        { reg: "20220778", nombre: "Gonzalo Moreno Ruiz", requisitosOk: true, notaPrevia: "83/100" },
        { reg: "20210543", nombre: "Paola Castedo Suárez", requisitosOk: true, notaPrevia: "87/100" },
        { reg: "20220912", nombre: "Hugo Landívar Añez", requisitosOk: true, notaPrevia: "78/100" },
        { reg: "20210321", nombre: "Adriana Dorado Paz", requisitosOk: true, notaPrevia: "85/100" },
        { reg: "20220654", nombre: "Martín Ortiz Melgar", requisitosOk: true, notaPrevia: "80/100" },
        { reg: "20210887", nombre: "Carolina Rivero Bravo", requisitosOk: true, notaPrevia: "89/100" }
      ]
    }
  ],

  // PESTAÑA 3: Materias ya Habilitadas (Aprobadas por Decano con Acta Oficial para Registro)
  materiasHabilitadas: [
    {
      id: "HAB-01",
      numActa: "ACTA-DEC-2026-088",
      codigo: "TEL-0330",
      nombre: "Sistemas de Comunicaciones Ópticas",
      carreraId: "ING-RED",
      carreraNombre: "Ing. en Redes y Telecomunicaciones",
      semestre: 8,
      turno: "Noche",
      horario: "19:00 a 22:30",
      tipo: "Laboratorio",
      aulaAsignada: "Laboratorio de Telecomunicaciones 2 (Bloque B - Piso 2)",
      docenteId: "DOC-06",
      docenteNombre: "Ing. Víctor Hugo Soliz",
      docenteEspecialidad: "Antenas, Microondas y Fibra Óptica",
      alumnosInscritos: 15,
      fechaAprobacion: "2026-10-26",
      aprobadoPor: "Ing. Roberto Mendoza (Decano de Facultad)",
      recaudacionTotal: 9600,
      honorarioDocente: 2500,
      utilidadUPDS: 7100,
      estadoRegistro: "Enviado a Registro / En proceso de Matriculación",
      alumnos: [
        { reg: "20210458", nombre: "Ketfer Gianella Salazar" },
        { reg: "20210892", nombre: "José Andrés Salame" },
        { reg: "20210741", nombre: "José Rene Huebe" },
        { reg: "20210115", nombre: "Joel Richard Quispe" },
        { reg: "20220332", nombre: "Mateo Fernández Ramos" },
        { reg: "20220419", nombre: "Camila Andrea Vaca" },
        { reg: "20210984", nombre: "Rodrigo Paz Flores" },
        { reg: "20220677", nombre: "Luciana Morales Roca" },
        { reg: "20210344", nombre: "Sebastián Peña Cruz" },
        { reg: "20220199", nombre: "Valeria Guzmán Ortiz" },
        { reg: "20210871", nombre: "Diego Hurtado Salvatierra" },
        { reg: "20220556", nombre: "Sofía Arteaga Justiniano" },
        { reg: "20210723", nombre: "Mauricio Banegas Paz" },
        { reg: "20220812", nombre: "Gabriela Suárez Pinto" },
        { reg: "20210290", nombre: "Lucas Mercado Rojas" }
      ]
    }
  ],

  // Directorio de Usuarios (Inspirado en AdminLTE 4)
  usuarios: [
    {
      id: "USR-01",
      nombre: "Ketfer Gianella Salazar",
      correo: "ketfer.gianella@edtech.bo",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
      rol: "TI / SuperAdmin",
      rolBadge: "ti",
      estado: "Activo",
      estadoBadge: "active",
      fechaCreacion: "2026-03-01",
      expiracion: "Permanente",
      cargo: "Director de Tecnología (CTO EdTech)"
    },
    {
      id: "USR-02",
      nombre: "Ing. Roberto Mendoza",
      correo: "roberto.mendoza@upds.net.bo",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
      rol: "Decano",
      rolBadge: "decano",
      estado: "Activo",
      estadoBadge: "active",
      fechaCreacion: "2026-03-05",
      expiracion: "Permanente",
      cargo: "Decano de la Facultad de Ingeniería"
    },
    {
      id: "USR-03",
      nombre: "Lic. Andrea Suárez",
      correo: "andrea.suarez@upds.net.bo",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
      rol: "Auxiliar",
      rolBadge: "auxiliar",
      estado: "Activo",
      estadoBadge: "active",
      fechaCreacion: "2026-04-12",
      expiracion: "Permanente",
      cargo: "Auxiliar de Secretaría Académica"
    },
    {
      id: "USR-04",
      nombre: "Sebastián Peña Cruz",
      correo: "sebastian.pena.pasante@upds.net.bo",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
      rol: "Temporal",
      rolBadge: "temporal",
      estado: "Activo",
      estadoBadge: "active",
      fechaCreacion: "2026-10-15",
      expiracion: "Vence: 15 de Noviembre (Fin de Módulo 8)",
      cargo: "Pasante de Apoyo a Inscripciones"
    }
  ]
};
