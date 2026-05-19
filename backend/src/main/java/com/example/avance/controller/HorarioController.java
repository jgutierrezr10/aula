package com.example.avance.controller;

import com.example.avance.dto.BloqueHorarioDTO;
import com.example.avance.service.BloqueHorarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/horario")
@RequiredArgsConstructor
public class HorarioController {

    private final BloqueHorarioService bloqueHorarioService;

    @GetMapping
    public ResponseEntity<List<BloqueHorarioDTO>> obtenerHorario(Principal principal) {
        return ResponseEntity.ok(bloqueHorarioService.obtenerHorario(principal.getName()));
    }

    @PostMapping
    public ResponseEntity<List<BloqueHorarioDTO>> guardarHorario(@RequestBody List<BloqueHorarioDTO> bloques, Principal principal) {
        return ResponseEntity.ok(bloqueHorarioService.guardarHorarioBulk(bloques, principal.getName()));
    }

    @DeleteMapping("/limpiar")
    public ResponseEntity<Void> limpiarHorario(Principal principal) {
        bloqueHorarioService.limpiarHorario(principal.getName());
        return ResponseEntity.ok().build();
    }
}
