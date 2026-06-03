package com.example.avance.service;

import com.example.avance.dto.RamoDTO;
import com.example.avance.model.Ramo;
import com.example.avance.model.Usuario;
import com.example.avance.repository.BloqueHorarioRepository;
import com.example.avance.repository.EvaluacionRepository;
import com.example.avance.repository.RamoRepository;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RamoService {

    private final RamoRepository ramoRepository;
    private final UsuarioRepository usuarioRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final EvaluacionRepository evaluacionRepository;

    private RamoDTO toDTO(Ramo ramo) {
        RamoDTO dto = new RamoDTO();
        dto.setId(ramo.getId());
        dto.setNombre(ramo.getNombre());
        dto.setSemestre(ramo.getSemestre());
        dto.setAprobado(ramo.getAprobado());
        dto.setCursando(ramo.getCursando());
        dto.setNota(ramo.getNota());
        return dto;
    }

    public List<RamoDTO> getRamosByUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ramoRepository.findByUsuarioId(usuario.getId())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public RamoDTO crearRamo(RamoDTO dto, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Ramo ramo = new Ramo();
        ramo.setNombre(dto.getNombre());
        ramo.setSemestre(dto.getSemestre());
        ramo.setAprobado(dto.getAprobado() != null ? dto.getAprobado() : false);
        ramo.setCursando(dto.getCursando() != null ? dto.getCursando() : false);
        ramo.setNota(dto.getNota());
        ramo.setUsuario(usuario);
        return toDTO(ramoRepository.save(ramo));
    }

    @Transactional
    public RamoDTO actualizarRamo(Long id, RamoDTO dto, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }
        if (dto.getNombre() != null) {
            ramo.setNombre(dto.getNombre());
        }
        if (dto.getSemestre() != null) {
            ramo.setSemestre(dto.getSemestre());
        }
        ramo.setAprobado(dto.getAprobado() != null ? dto.getAprobado() : false);
        ramo.setCursando(dto.getCursando() != null ? dto.getCursando() : false);
        ramo.setNota(dto.getNota());
        return toDTO(ramoRepository.save(ramo));
    }

    @Transactional
    public RamoDTO cambiarEstado(Long id, Boolean aprobado, Boolean cursando, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }
        ramo.setAprobado(aprobado != null ? aprobado : false);
        ramo.setCursando(cursando != null ? cursando : false);
        return toDTO(ramoRepository.save(ramo));
    }

    @Transactional
    public List<RamoDTO> cambiarEstadoBulk(List<Map<String, Object>> estados, String email) {
        List<Ramo> actualizados = new java.util.ArrayList<>();
        for (Map<String, Object> estadoReq : estados) {
            Long id = Long.valueOf(estadoReq.get("id").toString());
            Boolean aprobado = (Boolean) estadoReq.get("aprobado");
            Boolean cursando = (Boolean) estadoReq.get("cursando");
            
            Ramo ramo = ramoRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
            if (!ramo.getUsuario().getEmail().equals(email)) {
                throw new RuntimeException("No autorizado");
            }
            ramo.setAprobado(aprobado != null ? aprobado : false);
            ramo.setCursando(cursando != null ? cursando : false);
            actualizados.add(ramo);
        }
        return ramoRepository.saveAll(actualizados)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public void eliminarRamo(Long id, String email) {
        Ramo ramo = ramoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }
        // Limpiar todas las FK que referencian a este ramo
        limpiarReferenciasRamo(id);
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

    @Transactional
    public List<RamoDTO> crearRamosBulk(List<RamoDTO> dtos, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Limpiar FK references antes de eliminar ramos existentes
        List<Ramo> existentes = ramoRepository.findByUsuarioId(usuario.getId());
        for (Ramo r : existentes) {
            limpiarReferenciasRamo(r.getId());
        }
        ramoRepository.deleteAll(existentes);

        List<Ramo> nuevos = dtos.stream().map(dto -> {
            Ramo ramo = new Ramo();
            ramo.setNombre(dto.getNombre());
            ramo.setSemestre(dto.getSemestre());
            ramo.setAprobado(dto.getAprobado() != null ? dto.getAprobado() : false);
            ramo.setCursando(dto.getCursando() != null ? dto.getCursando() : false);
            ramo.setNota(dto.getNota());
            ramo.setUsuario(usuario);
            return ramo;
        }).collect(Collectors.toList());

        return ramoRepository.saveAll(nuevos)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public void eliminarTodosLosRamos(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Limpiar FK references antes de eliminar
        List<Ramo> existentes = ramoRepository.findByUsuarioId(usuario.getId());
        for (Ramo r : existentes) {
            limpiarReferenciasRamo(r.getId());
        }
        ramoRepository.deleteAll(existentes);
    }

    /**
     * Limpia todas las referencias FK a un ramo antes de eliminarlo.
     * Elimina evaluaciones y bloques_horario que referencian a este ramo.
     */
    private void limpiarReferenciasRamo(Long ramoId) {
        // Eliminar evaluaciones de este ramo
        evaluacionRepository.deleteByRamoId(ramoId);
        // Nullificar referencias como ramo2 en horario
        bloqueHorarioRepository.nullifyRamo2ByRamoId(ramoId);
        // Eliminar bloques donde es ramo principal
        bloqueHorarioRepository.deleteByRamoId(ramoId);
    }
}