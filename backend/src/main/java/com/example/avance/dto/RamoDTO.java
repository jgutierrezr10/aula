package com.example.avance.dto;

import lombok.Data;

@Data
public class RamoDTO {
    private Long id;
    private String nombre;
    private Integer semestre;
    private Boolean aprobado;
    private Integer nota;
}