package com.example.avance.service;

import com.example.avance.dto.BloqueHorarioDTO;
import com.example.avance.model.BloqueHorario;
import com.example.avance.model.Ramo;
import com.example.avance.model.Usuario;
import com.example.avance.repository.BloqueHorarioRepository;
import com.example.avance.repository.RamoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BloqueHorarioService {

    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final RamoRepository ramoRepository;
    private final com.example.avance.repository.UsuarioRepository usuarioRepository;

    public List<BloqueHorarioDTO> obtenerHorario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return bloqueHorarioRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<BloqueHorarioDTO> guardarHorarioBulk(List<BloqueHorarioDTO> bloques, String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Forma simple: borramos todo el horario del usuario y lo guardamos de nuevo.
        bloqueHorarioRepository.deleteByUsuarioId(usuario.getId());
        
        List<BloqueHorario> nuevosBloques = bloques.stream()
                .filter(dto -> dto.getRamoId() != null) // Solo guardamos los bloques que tienen un ramo asignado
                .map(dto -> {
                    BloqueHorario bh = new BloqueHorario();
                    bh.setUsuario(usuario);
                    bh.setDia(dto.getDia());
                    bh.setHora(dto.getHora());
                    
                    Ramo ramo = ramoRepository.findById(dto.getRamoId())
                            .orElseThrow(() -> new RuntimeException("Ramo no encontrado"));
                    
                    // Verificar que el ramo pertenezca al usuario
                    if (!ramo.getUsuario().getId().equals(usuario.getId())) {
                        throw new RuntimeException("Acceso denegado al ramo");
                    }
                    
                    bh.setRamo(ramo);
                    return bh;
                })
                .collect(Collectors.toList());
                
        bloqueHorarioRepository.saveAll(nuevosBloques);
        return obtenerHorario(email);
    }

    @Transactional
    public void limpiarHorario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        bloqueHorarioRepository.deleteByUsuarioId(usuario.getId());
    }

    private BloqueHorarioDTO mapToDTO(BloqueHorario bh) {
        BloqueHorarioDTO dto = new BloqueHorarioDTO();
        dto.setId(bh.getDia() + "-" + bh.getHora()); // Para el frontend
        dto.setDia(bh.getDia());
        dto.setHora(bh.getHora());
        dto.setRamoId(bh.getRamo() != null ? bh.getRamo().getId() : null);
        return dto;
    }
}
