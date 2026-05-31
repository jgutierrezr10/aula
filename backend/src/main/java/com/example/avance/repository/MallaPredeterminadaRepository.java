package com.example.avance.repository;

import com.example.avance.model.MallaPredeterminada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MallaPredeterminadaRepository extends JpaRepository<MallaPredeterminada, Long> {
}
