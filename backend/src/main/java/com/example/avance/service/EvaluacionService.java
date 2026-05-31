package com.example.avance.service;

import com.example.avance.dto.EvaluacionDTO;
import com.example.avance.model.Evaluacion;
import com.example.avance.model.Ramo;
import com.example.avance.repository.EvaluacionRepository;
import com.example.avance.repository.RamoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final RamoRepository ramoRepository;

    private EvaluacionDTO toDTO(Evaluacion ev) {
        EvaluacionDTO dto = new EvaluacionDTO();
        dto.setId(ev.getId());
        dto.setNombre(ev.getNombre());
        dto.setNota(ev.getNota());
        dto.setPonderacion(ev.getPonderacion());
        dto.setFecha(ev.getFecha());
        dto.setRamoId(ev.getRamo().getId());
        dto.setRamoNombre(ev.getRamo().getNombre());
        return dto;
    }

    @Transactional(readOnly = true)
    public List<EvaluacionDTO> getEvaluacionesByUsuario(String email) {
        return evaluacionRepository.findByRamoUsuarioEmailOrderByFechaAsc(email)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EvaluacionDTO> getEvaluacionesByRamo(Long ramoId, String email) {
        Ramo ramo = ramoRepository.findById(ramoId)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }
        return evaluacionRepository.findByRamoId(ramoId)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public EvaluacionDTO crearEvaluacion(EvaluacionDTO dto, String email) {
        Ramo ramo = ramoRepository.findById(dto.getRamoId())
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
        if (!ramo.getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }

        Evaluacion ev = new Evaluacion();
        ev.setNombre(dto.getNombre());
        ev.setNota(dto.getNota());
        ev.setPonderacion(dto.getPonderacion());
        ev.setFecha(dto.getFecha());
        ev.setRamo(ramo);

        Evaluacion guardada = evaluacionRepository.save(ev);
        recalcularPromedioRamo(ramo.getId());

        return toDTO(guardada);
    }

    @Transactional
    public EvaluacionDTO actualizarEvaluacion(Long id, EvaluacionDTO dto, String email) {
        Evaluacion ev = evaluacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
        if (!ev.getRamo().getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }

        ev.setNombre(dto.getNombre());
        ev.setNota(dto.getNota());
        ev.setPonderacion(dto.getPonderacion());
        ev.setFecha(dto.getFecha());

        Evaluacion guardada = evaluacionRepository.save(ev);
        recalcularPromedioRamo(ev.getRamo().getId());

        return toDTO(guardada);
    }

    @Transactional
    public void eliminarEvaluacion(Long id, String email) {
        Evaluacion ev = evaluacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));
        if (!ev.getRamo().getUsuario().getEmail().equals(email)) {
            throw new RuntimeException("No autorizado");
        }

        Long ramoId = ev.getRamo().getId();
        evaluacionRepository.delete(ev);
        recalcularPromedioRamo(ramoId);
    }

    private void recalcularPromedioRamo(Long ramoId) {
        Ramo ramo = ramoRepository.findById(ramoId)
                .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));

        List<Evaluacion> evs = evaluacionRepository.findByRamoId(ramoId);
        double sumNotasPonderadas = 0;
        double sumPonderacionesConNota = 0;

        for (Evaluacion ev : evs) {
            if (ev.getNota() != null) {
                sumNotasPonderadas += ev.getNota() * ev.getPonderacion();
                sumPonderacionesConNota += ev.getPonderacion();
            }
        }

        if (sumPonderacionesConNota > 0) {
            double finalNota = sumNotasPonderadas / sumPonderacionesConNota;
            // Redondear a 1 decimal
            finalNota = Math.round(finalNota * 10.0) / 10.0;
            ramo.setNota(finalNota);
        } else {
            ramo.setNota(null);
        }

        ramoRepository.save(ramo);
    }
}
