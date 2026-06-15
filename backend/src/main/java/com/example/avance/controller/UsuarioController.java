package com.example.avance.controller;

import com.example.avance.dto.AuthResponse;
import com.example.avance.dto.UpdateUserRequest;
import com.example.avance.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "https://aulaproject.vercel.app", allowedHeaders = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PutMapping("/cuenta")
    public ResponseEntity<AuthResponse> actualizarCuenta(
            @RequestBody UpdateUserRequest request,
            Principal principal) {
        return ResponseEntity.ok(usuarioService.actualizarCuenta(request, principal.getName()));
    }

    // Endpoint temporal para borrar usuarios de prueba
    @GetMapping("/borrar-test/{email}")
    public ResponseEntity<String> borrarUsuarioTest(@PathVariable String email) {
        usuarioService.borrarUsuarioTest(email);
        return ResponseEntity.ok("Usuario " + email + " eliminado. (Nota: Borra este endpoint antes de ir a producción)");
    }
}
