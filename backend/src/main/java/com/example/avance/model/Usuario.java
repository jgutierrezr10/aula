package com.example.avance.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.List;

@Data
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String nombre;

    @Column(columnDefinition = "boolean default true")
    private boolean verificado = true;

    @Enumerated(EnumType.STRING)
    // Must remain nullable during Hibernate's schema update so legacy NULL rows
    // can be migrated by DataInitializer after the EntityManagerFactory starts.
    @Column(length = 30)
    private Rol rol = Rol.ESTUDIANTE_PREGRADO;

    public Rol getRol() {
        return rol != null ? rol : Rol.ESTUDIANTE_PREGRADO;
    }

    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Ramo> ramos;
}
