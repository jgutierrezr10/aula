package com.example.avance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long totalUsuarios;
    private long totalAdmins;
    private long totalEstudiantesBasica;
    private long totalEstudiantesPregrado;
    private long totalEstudiantesPostgrado;
    private long totalMallasPredeterminadas;
    private long totalRamosRegistrados;
}
