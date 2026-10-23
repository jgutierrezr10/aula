package com.example.avance.dto;

import com.example.avance.model.Rol;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private boolean verificado;
    private int totalRamos;
}
