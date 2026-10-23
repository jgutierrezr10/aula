package com.example.avance.service;

import com.example.avance.dto.AdminStatsDTO;
import com.example.avance.dto.UsuarioAdminDTO;
import com.example.avance.model.Rol;
import com.example.avance.model.Usuario;
import com.example.avance.repository.MallaPredeterminadaRepository;
import com.example.avance.repository.RamoRepository;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final RamoRepository ramoRepository;
    private final MallaPredeterminadaRepository mallaPredeterminadaRepository;

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats() {
        List<Usuario> usuarios = usuarioRepository.findAll();
        long totalUsuarios = usuarios.size();
        long totalAdmins = usuarios.stream().filter(u -> u.getRol() == Rol.ADMIN).count();
        long totalBasica = usuarios.stream().filter(u -> u.getRol() == Rol.ESTUDIANTE_BASICA).count();
        long totalPregrado = usuarios.stream().filter(u -> u.getRol() == Rol.ESTUDIANTE_PREGRADO).count();
        long totalPostgrado = usuarios.stream().filter(u -> u.getRol() == Rol.ESTUDIANTE_POSTGRADO).count();
        long totalMallas = mallaPredeterminadaRepository.count();
        long totalRamos = ramoRepository.count();

        return AdminStatsDTO.builder()
                .totalUsuarios(totalUsuarios)
                .totalAdmins(totalAdmins)
                .totalEstudiantesBasica(totalBasica)
                .totalEstudiantesPregrado(totalPregrado)
                .totalEstudiantesPostgrado(totalPostgrado)
                .totalMallasPredeterminadas(totalMallas)
                .totalRamosRegistrados(totalRamos)
                .build();
    }

    @Transactional(readOnly = true)
    public List<UsuarioAdminDTO> listarUsuarios() {
        return usuarioRepository.findAll().stream().map(u -> UsuarioAdminDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .email(u.getEmail())
                .rol(u.getRol())
                .verificado(u.isVerificado())
                .totalRamos(u.getRamos() != null ? u.getRamos().size() : 0)
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public UsuarioAdminDTO cambiarRol(Long usuarioId, Rol nuevoRol, String adminEmail) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        if (nuevoRol == null) {
            throw new RuntimeException("El nuevo rol no puede ser nulo");
        }

        // Si el admin se está cambiando el rol a sí mismo a algo que no sea ADMIN, verificar que no sea el único ADMIN
        if (usuario.getEmail().equalsIgnoreCase(adminEmail) && nuevoRol != Rol.ADMIN) {
            long adminsRestantes = usuarioRepository.findAll().stream()
                    .filter(u -> u.getRol() == Rol.ADMIN && !u.getId().equals(usuarioId))
                    .count();
            if (adminsRestantes == 0) {
                throw new RuntimeException("No puedes quitarte el rol de Administrador porque eres el único administrador en el sistema.");
            }
        }

        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);

        return UsuarioAdminDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .verificado(usuario.isVerificado())
                .totalRamos(usuario.getRamos() != null ? uRamosCount(usuario) : 0)
                .build();
    }

    private int uRamosCount(Usuario usuario) {
        return usuario.getRamos() != null ? usuario.getRamos().size() : 0;
    }

    @Transactional
    public void eliminarUsuario(Long usuarioId, String adminEmail) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        if (usuario.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new RuntimeException("No puedes eliminar tu propia cuenta de Administrador.");
        }

        usuarioRepository.delete(usuario);
    }
}
