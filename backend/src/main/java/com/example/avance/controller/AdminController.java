package com.example.avance.controller;

import com.example.avance.dto.AdminStatsDTO;
import com.example.avance.dto.CambioRolRequest;
import com.example.avance.dto.UsuarioAdminDTO;
import com.example.avance.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "https://aulaproject.vercel.app", allowedHeaders = "*", allowCredentials = "true")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioAdminDTO>> getUsuarios() {
        return ResponseEntity.ok(adminService.listarUsuarios());
    }

    @PutMapping("/usuarios/{id}/rol")
    public ResponseEntity<UsuarioAdminDTO> actualizarRol(
            @PathVariable Long id,
            @RequestBody CambioRolRequest request,
            Principal principal) {
        return ResponseEntity.ok(adminService.cambiarRol(id, request.getRol(), principal.getName()));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> eliminarUsuario(
            @PathVariable Long id,
            Principal principal) {
        adminService.eliminarUsuario(id, principal.getName());
        return ResponseEntity.noContent().build();
    }
}
