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
        // Buscar si ya están completas
        boolean iciCompleta = repository.findAll().stream()
                .anyMatch(m -> "Ingeniería Civil Informática".equals(m.getNombre()) && m.getRamos().size() > 10);

        if (!iciCompleta) {
            // Eliminar las mallas de prueba antiguas e incompletas
            repository.findAll().stream()
                    .filter(m -> "Ingeniería Civil Informática".equals(m.getNombre()) || "Nutrición y Dietética".equals(m.getNombre()))
                    .forEach(repository::delete);

            repository.flush();

            // Malla 1: Ing. Civil Informática (58 ramos aprox)
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
            agregarRamo(ici, "Introducción a la Programación", 1);
            agregarRamo(ici, "Física General", 1);
            agregarRamo(ici, "Química para Ingeniería", 1);
            agregarRamo(ici, "Desarrollo Personal", 1);

            // Semestre 2
            agregarRamo(ici, "Cálculo Diferencial e Integral", 2);
            agregarRamo(ici, "Álgebra Lineal", 2);
            agregarRamo(ici, "Programación Orientada a Objetos", 2);
            agregarRamo(ici, "Física Mecánica", 2);
            agregarRamo(ici, "Inglés I", 2);
            agregarRamo(ici, "Comunicación Efectiva", 2);

            // Semestre 3
            agregarRamo(ici, "Cálculo en Varias Variables", 3);
            agregarRamo(ici, "Ecuaciones Diferenciales", 3);
            agregarRamo(ici, "Estructura de Datos", 3);
            agregarRamo(ici, "Física Electromagnetismo", 3);
            agregarRamo(ici, "Inglés II", 3);
            agregarRamo(ici, "Emprendimiento", 3);

            // Semestre 4
            agregarRamo(ici, "Probabilidades y Estadística", 4);
            agregarRamo(ici, "Base de Datos", 4);
            agregarRamo(ici, "Arquitectura de Computadores", 4);
            agregarRamo(ici, "Sistemas Operativos", 4);
            agregarRamo(ici, "Inglés III", 4);
            agregarRamo(ici, "Ética Profesional", 4);

            // Semestre 5
            agregarRamo(ici, "Análisis de Algoritmos", 5);
            agregarRamo(ici, "Ingeniería de Software I", 5);
            agregarRamo(ici, "Redes de Computadores", 5);
            agregarRamo(ici, "Investigación de Operaciones", 5);
            agregarRamo(ici, "Economía", 5);
            agregarRamo(ici, "Inglés IV", 5);

            // Semestre 6
            agregarRamo(ici, "Inteligencia Artificial", 6);
            agregarRamo(ici, "Ingeniería de Software II", 6);
            agregarRamo(ici, "Sistemas Distribuidos", 6);
            agregarRamo(ici, "Evaluación de Proyectos", 6);
            agregarRamo(ici, "Gestión de Empresas", 6);
            agregarRamo(ici, "Electivo de Formación Integral I", 6);

            // Semestre 7
            agregarRamo(ici, "Seguridad Informática", 7);
            agregarRamo(ici, "Desarrollo Web y Móvil", 7);
            agregarRamo(ici, "Arquitectura de Software", 7);
            agregarRamo(ici, "Gestión de Proyectos de TI", 7);
            agregarRamo(ici, "Electivo de Especialidad I", 7);
            agregarRamo(ici, "Electivo de Formación Integral II", 7);

            // Semestre 8
            agregarRamo(ici, "Minería de Datos", 8);
            agregarRamo(ici, "Cloud Computing", 8);
            agregarRamo(ici, "Sistemas de Información", 8);
            agregarRamo(ici, "Legislación Laboral y TI", 8);
            agregarRamo(ici, "Electivo de Especialidad II", 8);
            agregarRamo(ici, "Electivo de Formación Integral III", 8);

            // Semestre 9
            agregarRamo(ici, "Práctica Profesional I", 9);
            agregarRamo(ici, "Seminario de Título I", 9);
            agregarRamo(ici, "Tópicos Avanzados en TI", 9);
            agregarRamo(ici, "Electivo de Especialidad III", 9);
            agregarRamo(ici, "Gestión de la Innovación", 9);

            // Semestre 10
            agregarRamo(ici, "Práctica Profesional II", 10);
            agregarRamo(ici, "Proyecto de Título", 10);
            agregarRamo(ici, "Electivo de Especialidad IV", 10);
            agregarRamo(ici, "Auditoría de Sistemas", 10);
            agregarRamo(ici, "Taller de Integración", 10);

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
    }

    private void agregarRamo(MallaPredeterminada malla, String nombre, int semestre) {
        RamoPredeterminado r = new RamoPredeterminado();
        r.setNombre(nombre);
        r.setSemestre(semestre);
        r.setMalla(malla);
        malla.getRamos().add(r);
    }
}
