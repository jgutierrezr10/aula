package com.example.avance.service;

import com.example.avance.dto.MallaPredeterminadaDTO;
import com.example.avance.dto.RamoPredeterminadoDTO;
import com.example.avance.model.MallaPredeterminada;
import com.example.avance.model.RamoPredeterminado;
import com.example.avance.model.Usuario;
import com.example.avance.repository.MallaPredeterminadaRepository;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MallaPredeterminadaService {

    private final MallaPredeterminadaRepository mallaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<MallaPredeterminadaDTO> obtenerTodas() {
        return mallaRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public MallaPredeterminadaDTO publicarMalla(MallaPredeterminadaDTO dto, String emailCreador) {
        Usuario creador = usuarioRepository.findByEmail(emailCreador)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        MallaPredeterminada malla = new MallaPredeterminada();
        malla.setNombre(dto.getNombre());
        malla.setUniversidad(dto.getUniversidad());
        malla.setDescripcion(dto.getDescripcion());
        malla.setIcono(dto.getIcono() != null ? dto.getIcono() : "bi-grid-3x3-gap-fill");
        malla.setCreador(creador);

        // Map ramos
        if (dto.getRamos() != null) {
            for (RamoPredeterminadoDTO rDto : dto.getRamos()) {
                RamoPredeterminado r = new RamoPredeterminado();
                r.setNombre(rDto.getNombre());
                r.setSemestre(rDto.getSemestre());
                r.setMalla(malla);
                malla.getRamos().add(r);
            }
        }

        malla.setTotalRamos(malla.getRamos().size());
        int semestres = malla.getRamos().stream()
                .mapToInt(RamoPredeterminado::getSemestre)
                .max().orElse(0);
        malla.setSemestres(semestres);

        malla = mallaRepository.save(malla);
        return mapToDTO(malla);
    }

    @Transactional
    public void eliminarMalla(Long id) {
        mallaRepository.deleteById(id);
    }

    private MallaPredeterminadaDTO mapToDTO(MallaPredeterminada malla) {
        MallaPredeterminadaDTO dto = new MallaPredeterminadaDTO();
        dto.setId(malla.getId());
        dto.setNombre(malla.getNombre());
        dto.setUniversidad(malla.getUniversidad());
        dto.setDescripcion(malla.getDescripcion());
        dto.setIcono(malla.getIcono());
        dto.setTotalRamos(malla.getTotalRamos());
        dto.setSemestres(malla.getSemestres());

        if (malla.getRamos() != null) {
            List<RamoPredeterminadoDTO> ramosDto = malla.getRamos().stream().map(r -> {
                RamoPredeterminadoDTO rDto = new RamoPredeterminadoDTO();
                rDto.setNombre(r.getNombre());
                rDto.setSemestre(r.getSemestre());
                return rDto;
            }).collect(Collectors.toList());
            dto.setRamos(ramosDto);
        }
        return dto;
    }
}
