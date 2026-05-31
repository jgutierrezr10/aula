package com.example.avance.dto;

import lombok.Data;
import java.util.List;

@Data
public class MallaPredeterminadaDTO {
    private Long id;
    private String nombre;
    private String universidad;
    private String descripcion;
    private String icono;
    private Integer totalRamos;
    private Integer semestres;
    private List<RamoPredeterminadoDTO> ramos;
}
