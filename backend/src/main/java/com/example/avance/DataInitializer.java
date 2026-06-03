package com.example.avance;

import com.example.avance.model.MallaPredeterminada;
import com.example.avance.model.RamoPredeterminado;
import com.example.avance.repository.MallaPredeterminadaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final MallaPredeterminadaRepository repository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Forzar la eliminación y recreación para que tome tus nuevos cambios
        repository.findAll().stream()
                .filter(m -> "Ingeniería Civil Informática".equals(m.getNombre()) || "Nutrición y Dietética".equals(m.getNombre()))
                .forEach(repository::delete);

        repository.flush();

            // Malla 1: Ing. Civil Informática (approx 58 ramos)
            MallaPredeterminada ici = new MallaPredeterminada();
            ici.setNombre("Ingeniería Civil Informática");
            ici.setUniversidad("Universidad San Sebastian");
            ici.setDescripcion("Malla completa de Ingeniería Civil Informática (10 semestres)");
            ici.setIcono("bi-cpu");
            ici.setSemestres(10);
            ici.setTotalRamos(58);

            // Semestre 1
            agregarRamo(ici, "Introducción al Cálculo", 1);
            agregarRamo(ici, "Álgebra", 1);
            agregarRamo(ici, "Introducción a la Ingeniería Informática", 1);
            agregarRamo(ici, "Taller de Introducción a la Ingeniería", 1);
            agregarRamo(ici, "Estrategias para el Aprendizaje", 1);

            // Semestre 2
            agregarRamo(ici, "Cálculo Diferencial e Integral", 2);
            agregarRamo(ici, "Álgebra Lineal", 2);
            agregarRamo(ici, "Química General", 2);
            agregarRamo(ici, "Introducción a la Programación", 2);
            agregarRamo(ici, "Taller de Trabajo en Equipo", 2);

            // Semestre 3
            agregarRamo(ici, "Cálculo Multivariable", 3);
            agregarRamo(ici, "Mecánica", 3);
            agregarRamo(ici, "Tecnologías Digitales para la Ingeniería", 3);
            agregarRamo(ici, "Programación Orientada a Objetos", 3);
            agregarRamo(ici, "Taller de Liderazgo y Negociación", 3);
            agregarRamo(ici, "Inglés I", 3);

            // Semestre 4
            agregarRamo(ici, "Ecuaciones Diferenciales", 4);
            agregarRamo(ici, "Electricidad y Magnetismo", 4);
            agregarRamo(ici, "Probabilidades para Ingeniería", 4);
            agregarRamo(ici, "Taller de Programación Aplicada", 4);
            agregarRamo(ici, "Taller de Ingeniería y Sustentabilidad", 4);
            agregarRamo(ici, "Inglés II", 4);

            // Semestre 5
            agregarRamo(ici, "Optimización", 5);
            agregarRamo(ici, "Termofluidos", 5);
            agregarRamo(ici, "Matemáticas Discretas", 5);
            agregarRamo(ici, "Estadística para Ingeniería", 5);
            agregarRamo(ici, "Estructura de Datos y Algoritmos", 5);
            agregarRamo(ici, "Taller de Emprendimiento e Innovación I", 5);
            agregarRamo(ici, "Inglés III", 5);

            // Semestre 6
            agregarRamo(ici, "Economía Financiera", 6);
            agregarRamo(ici, "Arquitectura de Computadores", 6);
            agregarRamo(ici, "Redes de Computadores", 6);
            agregarRamo(ici, "Programación Avanzada", 6);
            agregarRamo(ici, "Base de Datos", 6);
            agregarRamo(ici, "Taller de Emprendimiento e Innovación II", 6);
            agregarRamo(ici, "Inglés Técnico", 6);

            // Semestre 7
            agregarRamo(ici, "Sistemas Operativos", 7);
            agregarRamo(ici, "Aplicaciones y Tecnologías de la Web", 7);
            agregarRamo(ici, "Taller de Interfaces y Diseño de Software", 7);
            agregarRamo(ici, "Electivo de Profundización I", 7);
            agregarRamo(ici, "Antropología", 7);
            agregarRamo(ici, "Inglés de Especialidad", 7);

            // Semestre 8
            agregarRamo(ici, "Formulación y Evaluación de Proyectos", 8);
            agregarRamo(ici, "Inteligencia Artificial", 8);
            agregarRamo(ici, "Ing. Requerimientos y Aseguramiento de Calidad", 8);
            agregarRamo(ici, "Taller de Ingeniería de Software", 8);
            agregarRamo(ici, "Electivo de Profundización II", 8);
            agregarRamo(ici, "Ética", 8);

            // Semestre 9
            agregarRamo(ici, "Gestión de Proyectos", 9);
            agregarRamo(ici, "Gestión de Operaciones TI", 9);
            agregarRamo(ici, "Taller en Empresa I", 9);
            agregarRamo(ici, "Minería de Datos y Big Data", 9);
            agregarRamo(ici, "Electivo de Formación Integral", 9);

            // Semestre 10
            agregarRamo(ici, "Seguridad Informática", 10);
            agregarRamo(ici, "Gestión Estratégica", 10);
            agregarRamo(ici, "Taller en Empresa II", 10);
            agregarRamo(ici, "Electivo de Profundización III", 10);
            agregarRamo(ici, "Electivo de Profundización IV", 10);

            ici.setTotalRamos(ici.getRamos().size());
            repository.save(ici);

            // Malla 2: Nutrición
            MallaPredeterminada nut = new MallaPredeterminada();
            nut.setNombre("Nutrición y Dietética");
            nut.setUniversidad("Universidad San Sebastián");
            nut.setDescripcion("Malla completa de Nutrición y Dietética (10 semestres)");
            nut.setIcono("bi-heart-pulse-fill");
            nut.setSemestres(10);
            nut.setTotalRamos(49);

            // Semestre 1 a 4
            agregarRamo(nut, "Química General y Orgánica", 1);
            agregarRamo(nut, "Biología Celular", 1);
            agregarRamo(nut, "Anatomía Humana", 1);
            agregarRamo(nut, "Introducción a la Nutrición", 1);
            agregarRamo(nut, "Matemáticas Básicas", 1);

            agregarRamo(nut, "Bioquímica", 2);
            agregarRamo(nut, "Fisiología General", 2);
            agregarRamo(nut, "Nutrición Básica", 2);
            agregarRamo(nut, "Psicología General", 2);
            agregarRamo(nut, "Comunicación Efectiva", 2);

            agregarRamo(nut, "Fisiología Humana", 3);
            agregarRamo(nut, "Microbiología General", 3);
            agregarRamo(nut, "Evaluación Nutricional", 3);
            agregarRamo(nut, "Bromatología", 3);
            agregarRamo(nut, "Salud Pública", 3);

            agregarRamo(nut, "Dietética del Ciclo Vital", 4);
            agregarRamo(nut, "Fisiopatología", 4);
            agregarRamo(nut, "Tecnología de los Alimentos", 4);
            agregarRamo(nut, "Epidemiología", 4);
            agregarRamo(nut, "Educación en Salud", 4);

            // Semestres 5 a 10 resumidos
            agregarRamo(nut, "Dietoterapia Adulto I", 5);
            agregarRamo(nut, "Gestión en Servicios de Alimentación I", 5);
            agregarRamo(nut, "Farmacología", 5);
            agregarRamo(nut, "Nutrición Deportiva", 5);
            agregarRamo(nut, "Metodología de la Investigación", 5);

            agregarRamo(nut, "Dietoterapia Adulto II", 6);
            agregarRamo(nut, "Gestión en Servicios de Alimentación II", 6);
            agregarRamo(nut, "Nutrición Pediátrica", 6);
            agregarRamo(nut, "Toxicología Alimentaria", 6);
            agregarRamo(nut, "Electivo I", 6);

            agregarRamo(nut, "Dietoterapia Pediátrica", 7);
            agregarRamo(nut, "Proyectos en Salud", 7);
            agregarRamo(nut, "Soporte Nutricional", 7);
            agregarRamo(nut, "Ética Profesional", 7);
            agregarRamo(nut, "Electivo II", 7);

            agregarRamo(nut, "Práctica Clínica I", 8);
            agregarRamo(nut, "Nutrición Comunitaria", 8);
            agregarRamo(nut, "Legislación Alimentaria", 8);
            agregarRamo(nut, "Electivo III", 8);

            agregarRamo(nut, "Internado Profesional Clínico", 9);
            agregarRamo(nut, "Seminario de Título I", 9);

            agregarRamo(nut, "Internado Profesional en Salud Pública", 10);
            agregarRamo(nut, "Seminario de Título II", 10);

            nut.setTotalRamos(nut.getRamos().size());
            repository.save(nut);
    }

    private void agregarRamo(MallaPredeterminada malla, String nombre, int semestre) {
        RamoPredeterminado r = new RamoPredeterminado();
        r.setNombre(nombre);
        r.setSemestre(semestre);
        r.setMalla(malla);
        malla.getRamos().add(r);
    }
}
