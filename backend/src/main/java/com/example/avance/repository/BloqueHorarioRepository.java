package com.example.avance.repository;

import com.example.avance.model.BloqueHorario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BloqueHorarioRepository extends JpaRepository<BloqueHorario, Long> {
    List<BloqueHorario> findByUsuarioId(Long usuarioId);
    Optional<BloqueHorario> findByUsuarioIdAndDiaAndHora(Long usuarioId, String dia, String hora);
    void deleteByUsuarioId(Long usuarioId);
}
