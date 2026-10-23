package com.example.avance.dto;

import com.example.avance.model.Rol;
import lombok.Data;

@Data
public class RegisterRequest {
    private String nombre;
    private String email;
    private String password;
    private Rol rol;
}