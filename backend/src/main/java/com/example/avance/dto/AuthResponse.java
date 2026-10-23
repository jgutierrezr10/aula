package com.example.avance.dto;

import com.example.avance.model.Rol;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String nombre;
    private String email;
    private Rol rol;
    private boolean nuevoUsuario;
    private boolean tutorialPendiente;

    public AuthResponse(String token, String nombre, String email, Rol rol) {
        this.token = token;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol != null ? rol : Rol.ESTUDIANTE_PREGRADO;
        this.nuevoUsuario = false;
        this.tutorialPendiente = false;
    }

    // Constructor de compatibilidad para los lugares que no indican nuevoUsuario ni tutorialPendiente
    public AuthResponse(String token, String nombre, String email) {
        this(token, nombre, email, Rol.ESTUDIANTE_PREGRADO);
    }
}