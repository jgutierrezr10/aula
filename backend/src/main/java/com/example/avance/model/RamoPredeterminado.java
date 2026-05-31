package com.example.avance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "ramos_predeterminados")
public class RamoPredeterminado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private Integer semestre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "malla_id", nullable = false)
    private MallaPredeterminada malla;
}
