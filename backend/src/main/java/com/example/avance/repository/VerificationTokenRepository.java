package com.example.avance.repository;

import com.example.avance.model.Usuario;
import com.example.avance.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUsuario(Usuario usuario);
    void deleteByUsuario(Usuario usuario);
}
