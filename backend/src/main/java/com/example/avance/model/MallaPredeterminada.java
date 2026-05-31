package com.example.avance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
@Entity
@Table(name = "mallas_predeterminadas")
public class MallaPredeterminada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String universidad;

    @Column(length = 1000)
    private String descripcion;

    private String icono;

    private Integer totalRamos;

    private Integer semestres;

    // Quien la creó
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creador_id")
    private Usuario creador;

    @OneToMany(mappedBy = "malla", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RamoPredeterminado> ramos = new ArrayList<>();
}
