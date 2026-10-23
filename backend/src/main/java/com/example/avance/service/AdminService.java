package com.example.avance.service;

import com.example.avance.dto.AdminStatsDTO;
import com.example.avance.dto.UsuarioAdminDTO;
import com.example.avance.model.Rol;
import com.example.avance.model.Usuario;
import com.example.avance.repository.MallaPredeterminadaRepository;
import com.example.avance.repository.RamoRepository;
import com.example.avance.repository.UsuarioRepository;
import com.example.avance.repository.EvaluacionRepository;
import com.example.avance.repository.BloqueHorarioRepository;
import com.example.avance.repository.VerificationTokenRepository;
import com.example.avance.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final RamoRepository ramoRepository;
    private final MallaPredeterminadaRepository mallaPredeterminadaRepository;
    private final EvaluacionRepository evaluacionRepository;
    private final BloqueHorarioRepository bloqueHorarioRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    @Transactional(readOnly = true)
    public AdminStatsDTO getStats(String actorEmail) {
        exigirCuentaPropietaria(actorEmail);
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
    public List<UsuarioAdminDTO> listarUsuarios(String actorEmail) {
        exigirCuentaPropietaria(actorEmail);
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
        exigirCuentaPropietaria(adminEmail);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        if (nuevoRol == null) {
            throw new RuntimeException("El nuevo rol no puede ser nulo");
        }

        if ("elkiubs".equalsIgnoreCase(usuario.getNombre()) && nuevoRol != Rol.ADMIN) {
            throw new RuntimeException("La cuenta elkiubs conserva permanentemente el rol de Administrador.");
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
        exigirCuentaPropietaria(adminEmail);
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + usuarioId));

        if (usuario.getEmail().equalsIgnoreCase(adminEmail)) {
            throw new RuntimeException("No puedes eliminar tu propia cuenta de Administrador.");
        }

        if ("elkiubs".equalsIgnoreCase(usuario.getNombre())) {
            throw new RuntimeException("La cuenta administradora elkiubs no se puede eliminar.");
        }

        // Limpiar primero los datos que referencian a los ramos del usuario.
        if (usuario.getRamos() != null) usuario.getRamos().forEach(ramo -> {
            evaluacionRepository.deleteByRamoId(ramo.getId());
            bloqueHorarioRepository.nullifyRamo2ByRamoId(ramo.getId());
            bloqueHorarioRepository.deleteByRamoId(ramo.getId());
        });
        bloqueHorarioRepository.deleteByUsuarioId(usuario.getId());
        verificationTokenRepository.deleteByUsuario(usuario);
        passwordResetTokenRepository.deleteByUsuario(usuario);

        usuarioRepository.delete(usuario);
    }

    private void exigirCuentaPropietaria(String email) {
        Usuario actor = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario administrador no encontrado"));
        if (!"elkiubs".equalsIgnoreCase(actor.getNombre())) {
            throw new AccessDeniedException("Solo la cuenta elkiubs puede gestionar usuarios y roles.");
        }
    }
}
