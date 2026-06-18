import { Ramo } from '../models/ramo.model';

export interface MallaPredeterminada {
  id: string;
  nombre: string;
  universidad: string;
  descripcion: string;
  icono: string;
  totalRamos: number;
  semestres: number;
  ramos: Ramo[];
}

export const MALLAS_PREDETERMINADAS: MallaPredeterminada[] = [
  {
    id: 'ici-ucn',
    nombre: 'Ingeniería Civil Informática',
    universidad: 'Universidad San Sebastian',
    descripcion: 'Malla completa de Ingeniería Civil Informática (10 semestres)',
    icono: 'bi-cpu',
    totalRamos: 58,
    semestres: 10,
    ramos: [
      // ══════════════════════════════════════
      // SEMESTRE 1
      // ══════════════════════════════════════
      { nombre: 'Introducción al Cálculo', semestre: 1, aprobado: false },
      { nombre: 'Álgebra', semestre: 1, aprobado: false },
      { nombre: 'Introducción a la Programación', semestre: 1, aprobado: false },
      { nombre: 'Introducción a la Ingeniería Informática', semestre: 1, aprobado: false },
      { nombre: 'Taller de Introducción a la Ingeniería', semestre: 1, aprobado: false },
      { nombre: 'Estrategias para el Aprendizaje', semestre: 1, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 2
      // ══════════════════════════════════════
      { nombre: 'Cálculo Diferencial e Integral', semestre: 2, aprobado: false },
      { nombre: 'Álgebra Lineal', semestre: 2, aprobado: false },
      { nombre: 'Química General (y Laboratorio)', semestre: 2, aprobado: false },
      { nombre: 'Programación Orientada a Objetos', semestre: 2, aprobado: false },
      { nombre: 'Taller de Trabajo en Equipo', semestre: 2, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 3
      // ══════════════════════════════════════
      { nombre: 'Cálculo Multivariable', semestre: 3, aprobado: false },
      { nombre: 'Mecánica (y Laboratorio)', semestre: 3, aprobado: false },
      { nombre: 'Tecnologías Digitales para la Ingeniería', semestre: 3, aprobado: false },
      { nombre: 'Programacion Orientada a Objetos', semestre: 3, aprobado: false },
      { nombre: 'Taller de Liderazgo y Negociación', semestre: 3, aprobado: false },
      { nombre: 'Inglés I', semestre: 3, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 4
      // ══════════════════════════════════════
      { nombre: 'Ecuaciones Diferenciales', semestre: 4, aprobado: false },
      { nombre: 'Electricidad y Magnetismo (y Lab)', semestre: 4, aprobado: false },
      { nombre: 'Probabilidades para Ingeniería', semestre: 4, aprobado: false },
      { nombre: 'Taller de Programación Aplicada', semestre: 4, aprobado: false },
      { nombre: 'Taller de Ingeniería y Sustentabilidad', semestre: 4, aprobado: false },
      { nombre: 'Inglés II', semestre: 4, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 5
      // ══════════════════════════════════════
      { nombre: 'Optimización', semestre: 5, aprobado: false },
      { nombre: 'Termofluidos', semestre: 5, aprobado: false },
      { nombre: 'Matemáticas Discretas', semestre: 5, aprobado: false },
      { nombre: 'Estadística para Ingeniería', semestre: 5, aprobado: false },
      { nombre: 'Estructura de Datos y Algoritmos', semestre: 5, aprobado: false },
      { nombre: 'Taller de Emprendimiento e Innovación I', semestre: 5, aprobado: false },
      { nombre: 'Inglés III', semestre: 5, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 6
      // ══════════════════════════════════════
      { nombre: 'Economía Financiera', semestre: 6, aprobado: false },
      { nombre: 'Arquitectura de Computadores', semestre: 6, aprobado: false },
      { nombre: 'Redes de Computadores', semestre: 6, aprobado: false },
      { nombre: 'Programación Avanzada', semestre: 6, aprobado: false },
      { nombre: 'Base de Datos', semestre: 6, aprobado: false },
      { nombre: 'Taller de Emprendimiento e Innovación II', semestre: 6, aprobado: false },
      { nombre: 'Inglés Técnico', semestre: 6, aprobado: false },


      // ══════════════════════════════════════
      // SEMESTRE 7 (Post Práctica Industrial)
      // ══════════════════════════════════════
      { nombre: 'Sistemas Operativos', semestre: 7, aprobado: false },
      { nombre: 'Aplicaciones y Tecnologías de la Web', semestre: 7, aprobado: false },
      { nombre: 'Taller de Interfaces y Diseño de Software', semestre: 7, aprobado: false },
      { nombre: 'Electivo de Profundización I', semestre: 7, aprobado: false },
      { nombre: 'Antropología', semestre: 7, aprobado: false },
      { nombre: 'Inglés de Especialidad', semestre: 7, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 8
      // ══════════════════════════════════════
      { nombre: 'Formulación y Evaluación de Proyectos', semestre: 8, aprobado: false },
      { nombre: 'Inteligencia Artificial', semestre: 8, aprobado: false },
      { nombre: 'Ing. Requerimientos y Aseguramiento de Calidad', semestre: 8, aprobado: false },
      { nombre: 'Taller de Ingeniería de Software', semestre: 8, aprobado: false },
      { nombre: 'Electivo de Profundización II', semestre: 8, aprobado: false },
      { nombre: 'Ética', semestre: 8, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 9 (Post Práctica Profesional)
      // ══════════════════════════════════════
      { nombre: 'Gestión de Proyectos', semestre: 9, aprobado: false },
      { nombre: 'Gestión de Operaciones TI', semestre: 9, aprobado: false },
      { nombre: 'Taller en Empresa I', semestre: 9, aprobado: false },
      { nombre: 'Minería de Datos y Big Data', semestre: 9, aprobado: false },
      { nombre: 'Electivo de Formación Integral', semestre: 9, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 10
      // ══════════════════════════════════════
      { nombre: 'Seguridad Informática', semestre: 10, aprobado: false },
      { nombre: 'Gestión Estratégica', semestre: 10, aprobado: false },
      { nombre: 'Taller en Empresa II', semestre: 10, aprobado: false },
      { nombre: 'Electivo de Profundización III', semestre: 10, aprobado: false },
      { nombre: 'Electivo de Profundización IV', semestre: 10, aprobado: false }
    ]
  },
  {
    id: 'nutricion',
    nombre: 'Nutrición y Dietética',
    universidad: 'Universidad San Sebastián',
    descripcion: 'Malla completa de Nutrición y Dietética (10 semestres)',
    icono: 'bi-heart-pulse-fill',
    totalRamos: 49,
    semestres: 10,
    ramos: [
      // ══════════════════════════════════════
      // SEMESTRE 1 
      // ══════════════════════════════════════
      { nombre: 'Química General y Orgánica', semestre: 1, aprobado: false },
      { nombre: 'Biología Celular', semestre: 1, aprobado: false },
      { nombre: 'Ciencias de los Alimentos I', semestre: 1, aprobado: false },
      { nombre: 'Introducción a la Nutrición y Dietética', semestre: 1, aprobado: false },
      { nombre: 'Estrategias para el aprendizaje', semestre: 1, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 2
      // ══════════════════════════════════════
      { nombre: 'Anatomía Humana', semestre: 2, aprobado: false },
      { nombre: 'Bioquímica General', semestre: 2, aprobado: false },
      { nombre: 'Ciencias de los alimentos II', semestre: 2, aprobado: false },
      { nombre: 'Expresion Oral y Escrita', semestre: 2, aprobado: false },
      { nombre: 'Matematica', semestre: 2, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 3
      // ══════════════════════════════════════
      { nombre: 'Fisiología Humana', semestre: 3, aprobado: false },
      { nombre: 'Evaluacion del Estado Nutricional', semestre: 3, aprobado: false },
      { nombre: 'Microbiología y Parasitología de Alimentos', semestre: 3, aprobado: false },
      { nombre: 'Estadística', semestre: 3, aprobado: false },
      { nombre: 'Nutrición Basica', semestre: 3, aprobado: false },
      { nombre: 'Antropologia', semestre: 3, aprobado: false },
      { nombre: 'Integracion I (Planificación de Minutas)', semestre: 3, aprobado: false },


      // ══════════════════════════════════════
      // SEMESTRE 4
      // ══════════════════════════════════════
      { nombre: 'Bases Fisiopatologícas de la Nutricion', semestre: 4, aprobado: false },
      { nombre: 'Dietética del Ciclo Vital', semestre: 4, aprobado: false },
      { nombre: 'Evaluación del Estado Nutricional II', semestre: 4, aprobado: false },
      { nombre: 'Nutrición Basica II', semestre: 4, aprobado: false },
      { nombre: 'Ética', semestre: 4, aprobado: false },
      { nombre: 'Integracion II (Taller de Casos de Individuos Sanos en Ciclo Vital)', semestre: 4, aprobado: false },
      { nombre: 'Epidemiologia', semestre: 4, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 5
      // ══════════════════════════════════════
      { nombre: 'Analisis y Tecnologia de los Alimentos', semestre: 5, aprobado: false },
      { nombre: 'Dietoterapia del Adulto y Adulto Mayor I', semestre: 5, aprobado: false },
      { nombre: 'Farmacologia en Nutricion', semestre: 5, aprobado: false },
      { nombre: 'Salud Publica', semestre: 5, aprobado: false },
      { nombre: 'Psicologia de la Conducta Alimentaria', semestre: 5, aprobado: false },
      { nombre: 'Integracion III (Taller de Casos Clínicos)', semestre: 5, aprobado: false },
      { nombre: 'Nutrition Research Articles Analysis I', semestre: 5, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 6
      // ══════════════════════════════════════
      { nombre: 'Dietoterapia del Adulto y Adulto Mayor II', semestre: 6, aprobado: false },
      { nombre: 'Nutrición y Ejercicio', semestre: 6, aprobado: false },
      { nombre: 'Inocuidad Alimentaria', semestre: 6, aprobado: false },
      { nombre: 'Intervension Educativa en Alimentación y Nutrición', semestre: 6, aprobado: false },
      { nombre: 'Electivo de Formacion Integral', semestre: 6, aprobado: false },
      { nombre: 'Nutricion Research Articles Analysis II', semestre: 6, aprobado: false },
      { nombre: 'Integracion IV (Taller de Intervension Educativa en Alimentación y Nutrición)', semestre: 6, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 7
      // ══════════════════════════════════════
      { nombre: 'Dietoterapia Materno Infantil y Adolescente I', semestre: 7, aprobado: false },
      { nombre: 'Planificacion de Politicas Publicas en Alimentacion y Nutricion', semestre: 7, aprobado: false },
      { nombre: 'Gestión Alimentaria I', semestre: 7, aprobado: false },
      { nombre: 'Bioética y Legislación Alimentaria', semestre: 7, aprobado: false },
      { nombre: 'Emprendimiento y Desarrollo de Proyectos', semestre: 7, aprobado: false },
      { nombre: 'Integracion V (Taller de Casos Clínico Materno Infantil)', semestre: 7, aprobado: false },
      { nombre: 'Metodologia de la Investigación', semestre: 7, aprobado: false },



      // ══════════════════════════════════════
      // SEMESTRE 8
      // ══════════════════════════════════════
      { nombre: 'Gestión Alimentaria II', semestre: 8, aprobado: false },
      { nombre: 'Dietoterapia Materno Infantil y Adolescente II', semestre: 8, aprobado: false },
      { nombre: 'Intervencion Nutricional en Salud Comunitaria', semestre: 8, aprobado: false },
      { nombre: 'Seminario de Investigacion', semestre: 8, aprobado: false },
      { nombre: 'Liderazgo y Responsabilidad Social', semestre: 8, aprobado: false },
      { nombre: 'Integracion VI (Taller de Gestion Alimentaria)', semestre: 8, aprobado: false },


      // ══════════════════════════════════════
      // SEMESTRE 9 (Internado Profesional I)
      // ══════════════════════════════════════
      { nombre: 'Internado Profesional Gestion Alimentaria', semestre: 9, aprobado: false },
      { nombre: 'Internado Profesional Salud Comunitaria', semestre: 9, aprobado: false },
      { nombre: 'Internado Profesional Clínico', semestre: 9, aprobado: false },

      // ══════════════════════════════════════
      // SEMESTRE 10 (Internado Profesional II)
      // ══════════════════════════════════════
      { nombre: 'Internado Profesional Gestion Alimentaria', semestre: 10, aprobado: false },
      { nombre: 'Internado Profesional Salud Comunitaria', semestre: 10, aprobado: false },
      { nombre: 'Internado Profesional Clínico', semestre: 10, aprobado: false },
    ]
  }
];
