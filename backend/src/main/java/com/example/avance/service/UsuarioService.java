package com.example.avance.service;

import com.example.avance.dto.*;
import com.example.avance.model.Usuario;
import com.example.avance.repository.UsuarioRepository;
import com.example.avance.model.PasswordResetToken;
import com.example.avance.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));

        usuarioRepository.save(usuario);

        String token = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(token, usuario.getNombre(), usuario.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        // Buscar por email o por nombre
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .or(() -> usuarioRepository.findByNombre(request.getEmail()))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(token, usuario.getNombre(), usuario.getEmail());
    }

    public AuthResponse actualizarCuenta(UpdateUserRequest request, String currentEmail) {
        Usuario usuario = usuarioRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar contraseña actual si se quiere cambiar la contraseña o el email
        if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
            if (!passwordEncoder.matches(request.getCurrentPassword(), usuario.getPassword())) {
                throw new RuntimeException("Contraseña actual incorrecta");
            }
            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }
        } else if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            throw new RuntimeException("Debe ingresar su contraseña actual para establecer una nueva");
        }

        if (request.getNombre() != null && !request.getNombre().isEmpty()) {
            usuario.setNombre(request.getNombre());
        }

        if (request.getEmail() != null && !request.getEmail().isEmpty() && !request.getEmail().equalsIgnoreCase(currentEmail)) {
            if (usuarioRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("El nuevo email ya está registrado");
            }
            usuario.setEmail(request.getEmail());
        }

        usuarioRepository.save(usuario);

        String nuevoToken = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(nuevoToken, usuario.getNombre(), usuario.getEmail());
    }

    @Transactional
    public String forgotPassword(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No se encontró una cuenta con ese correo electrónico"));

        // Eliminar tokens anteriores de este usuario si existen
        tokenRepository.deleteByUsuario(usuario);

        // Crear nuevo token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1)); // 1 hora de validez
        tokenRepository.save(resetToken);

        // Simulando el envío de correo por consola
        log.info("=========================================================");
        log.info("SIMULACIÓN DE CORREO ENVIADO A: " + email);
        log.info("Su código de recuperación de contraseña es: " + token);
        log.info("=========================================================");

        return "Si el correo existe, se ha enviado un código de recuperación.";
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("El código de recuperación es inválido o ha expirado."));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            throw new RuntimeException("El código de recuperación ha expirado.");
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        // Eliminar el token ya usado
        tokenRepository.delete(resetToken);
    }
}