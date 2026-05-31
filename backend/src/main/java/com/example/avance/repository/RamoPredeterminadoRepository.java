package com.example.avance.repository;

import com.example.avance.model.RamoPredeterminado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RamoPredeterminadoRepository extends JpaRepository<RamoPredeterminado, Long> {
}
