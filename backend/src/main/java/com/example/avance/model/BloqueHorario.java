package com.example.avance.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "bloques_horario")
public class BloqueHorario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String dia;

    @Column(nullable = false)
    private String hora;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ramo_id")
    private Ramo ramo;
}
