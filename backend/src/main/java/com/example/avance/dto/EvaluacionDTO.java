package com.example.avance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;

@Data
public class EvaluacionDTO {
    private Long id;
    private String nombre;
    private Double nota;
    private Double ponderacion;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;
    private Long ramoId;
    private String ramoNombre;
}
