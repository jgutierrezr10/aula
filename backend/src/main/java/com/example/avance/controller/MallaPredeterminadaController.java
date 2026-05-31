package com.example.avance.controller;

import com.example.avance.dto.MallaPredeterminadaDTO;
import com.example.avance.service.MallaPredeterminadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/mallas-predeterminadas")
@RequiredArgsConstructor
public class MallaPredeterminadaController {

    private final MallaPredeterminadaService service;

    @GetMapping
    public ResponseEntity<List<MallaPredeterminadaDTO>> obtenerTodas() {
        return ResponseEntity.ok(service.obtenerTodas());
    }

    @PostMapping
    public ResponseEntity<MallaPredeterminadaDTO> publicarMalla(
            @RequestBody MallaPredeterminadaDTO dto,
            Principal principal) {
        return ResponseEntity.ok(service.publicarMalla(dto, principal.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMalla(@PathVariable Long id) {
        service.eliminarMalla(id);
        return ResponseEntity.noContent().build();
    }
}
