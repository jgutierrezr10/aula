package com.example.avance.service;

import com.example.avance.dto.RamoDTO;
import com.example.avance.model.Ramo;
import com.example.avance.model.Usuario;
import com.example.avance.repository.RamoRepository;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RamoService {

    private final RamoRepository ramoRepository;
    private final UsuarioRepository usuarioRepository;

    private RamoDTO toDTO(Ramo ramo) {
        RamoDTO dto = new RamoDTO();
        dto.setId(ramo.getId());
        dto.setNombre(ramo.getNombre());
        dto.setSemestre(ramo.getSemestre());
        dto.setAprobado(ramo.getAprobado());
        dto.setNota(ramo.getNota());
        return dto;
    }

    public List<RamoDTO> getRamosByUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ramoRepository.findByUsuarioId(usuario.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public RamoDTO crearRamo(RamoDTO dto, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Ramo ramo = new Ramo();
        ramo.setNombre(dto.getNombre());
        ramo.setSemestre(dto.getSemestre());
        ramo.setAprobado(dto.getAprobado() != null ? dto.getAprobado() : false);
        ramo.setNota(dto.getNota());
        ramo.setUsuario(usuario);
        return toDTO(ramoRepository.save(ramo));
    }

    public RamoDTO actualizarRamo(Long id, RamoDTO dto, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }
        ramo.setNombre(dto.getNombre());
        ramo.setSemestre(dto.getSemestre());
        ramo.setAprobado(dto.getAprobado());
        ramo.setNota(dto.getNota());
        return toDTO(ramoRepository.save(ramo));
    }

    public void eliminarRamo(Long id, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }
        ramoRepository.delete(ramo);
    }

    public int calcularPorcentajeAvance(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        long total = ramoRepository.findByUsuarioId(usuario.getId()).size();
        if (total == 0) return 0;
        long aprobados = ramoRepository.countByUsuarioIdAndAprobadoTrue(usuario.getId());
        return (int) ((aprobados * 100) / total);
    }
}