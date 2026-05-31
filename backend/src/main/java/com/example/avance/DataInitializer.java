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
        if (repository.count() == 0) {
            // Malla 1: Ing. Civil Informática
            MallaPredeterminada ici = new MallaPredeterminada();
            ici.setNombre("Ingeniería Civil Informática");
            ici.setUniversidad("Universidad San Sebastian");
            ici.setDescripcion("Malla completa de Ingeniería Civil Informática (10 semestres)");
            ici.setIcono("bi-cpu");
            ici.setSemestres(10);
            ici.setTotalRamos(58);

            agregarRamo(ici, "Introducción al Cálculo", 1);
            agregarRamo(ici, "Álgebra", 1);
            agregarRamo(ici, "Introducción a la Programación", 1);
            agregarRamo(ici, "Cálculo Diferencial e Integral", 2);
            agregarRamo(ici, "Programación Orientada a Objetos", 2);
            agregarRamo(ici, "Estructura de Datos y Algoritmos", 5);
            agregarRamo(ici, "Base de Datos", 6);
            agregarRamo(ici, "Sistemas Operativos", 7);

            repository.save(ici);

            // Malla 2: Nutrición
            MallaPredeterminada nut = new MallaPredeterminada();
            nut.setNombre("Nutrición y Dietética");
            nut.setUniversidad("Universidad San Sebastián");
            nut.setDescripcion("Malla completa de Nutrición y Dietética (10 semestres)");
            nut.setIcono("bi-heart-pulse-fill");
            nut.setSemestres(10);
            nut.setTotalRamos(49);

            agregarRamo(nut, "Química General y Orgánica", 1);
            agregarRamo(nut, "Biología Celular", 1);
            agregarRamo(nut, "Fisiología Humana", 3);
            agregarRamo(nut, "Dietética del Ciclo Vital", 4);
            agregarRamo(nut, "Internado Profesional Clínico", 9);

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
