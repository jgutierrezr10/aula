package com.example.avance.repository;

import com.example.avance.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByNombre(String nombre);
    Optional<Usuario> findByNombreIgnoreCase(String nombre);
    boolean existsByEmail(String email);
    boolean existsByNombre(String nombre);
}
