package com.example.avance.dto;

import com.example.avance.model.Rol;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String nombre;
    private String email;
    private String currentPassword;
    private String newPassword;
    private Rol rol;
}
