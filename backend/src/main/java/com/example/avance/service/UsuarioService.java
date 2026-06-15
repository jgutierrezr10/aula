package com.example.avance.service;

import com.example.avance.dto.*;
import com.example.avance.model.Usuario;
import com.example.avance.repository.UsuarioRepository;
import com.example.avance.model.PasswordResetToken;
import com.example.avance.repository.PasswordResetTokenRepository;
import com.example.avance.model.VerificationToken;
import com.example.avance.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;
import java.util.Random;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${brevo.api.key:}")
    private String brevoApiKey;

    @Value("${brevo.sender.email:tu_correo@gmail.com}")
    private String senderEmail;

    @Value("${google.client.id}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new RuntimeException("El formato del correo electrónico no es válido");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }
        if (usuarioRepository.existsByNombre(request.getNombre())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setVerificado(false); // Manualmente no verificado

        usuarioRepository.save(usuario);

        // Generar código de 6 dígitos
        String code = String.format("%06d", new Random().nextInt(999999));
        
        VerificationToken vToken = new VerificationToken();
        vToken.setToken(code);
        vToken.setUsuario(usuario);
        vToken.setExpiryDate(LocalDateTime.now().plusMinutes(15));
        verificationTokenRepository.save(vToken);

        // Enviar correo (no bloqueante de forma asíncrona mediante HTTP API)
        try {
            String subject = "AULA - Verifica tu correo";
            String textContent = "Hola " + usuario.getNombre() + ",\n\n" +
                    "Gracias por registrarte en AULA.\n" +
                    "Tu código de verificación es: " + code + "\n\n" +
                    "Ingresa este código en la aplicación para activar tu cuenta.\n" +
                    "El código expirará en 15 minutos.\n\n" +
                    "Saludos,\nEl equipo de AULA";
            
            CompletableFuture.runAsync(() -> {
                try {
                    enviarCorreoBrevo(usuario.getEmail(), usuario.getNombre(), subject, textContent);
                    log.info("Correo de verificación enviado a: " + usuario.getEmail());
                } catch (Exception e) {
                    log.error("Error al enviar el correo de verificación a " + usuario.getEmail() + ".", e);
                }
            });
        } catch (Exception e) {
            log.error("Error al preparar el correo de verificación.", e);
        }

        return new AuthResponse(null, usuario.getNombre(), usuario.getEmail());
    }

    @Transactional
    public AuthResponse verifyEmail(String email, String code) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        if (usuario.isVerificado()) {
            throw new RuntimeException("El usuario ya está verificado");
        }

        VerificationToken vToken = verificationTokenRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("No hay código pendiente para este usuario"));

        if (!vToken.getToken().equals(code)) {
            throw new RuntimeException("Código de verificación incorrecto");
        }

        if (vToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            verificationTokenRepository.delete(vToken);
            throw new RuntimeException("El código de verificación ha expirado");
        }

        usuario.setVerificado(true);
        usuarioRepository.save(usuario);
        verificationTokenRepository.delete(vToken);

        String jwtToken = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(jwtToken, usuario.getNombre(), usuario.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        // Buscar por email o por nombre
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .or(() -> usuarioRepository.findByNombre(request.getEmail()))
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        String storedHash = (usuario.getPassword() != null && usuario.getPassword().startsWith("{GOOGLE}")) ? 
                usuario.getPassword().substring(8) : usuario.getPassword();

        if (storedHash == null || !passwordEncoder.matches(request.getPassword(), storedHash)) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        if (!usuario.isVerificado()) {
            throw new RuntimeException("Por favor verifica tu correo electrónico antes de iniciar sesión");
        }

        String token = jwtService.generateToken(usuario.getEmail());
        return new AuthResponse(token, usuario.getNombre(), usuario.getEmail());
    }

    @Transactional
    public AuthResponse googleLogin(String googleToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                // Google puede no devolver el nombre si el perfil no lo tiene configurado
                String name = (String) payload.get("name");
                if (name == null || name.isBlank()) {
                    // Usamos la parte del correo antes del @ como nombre de fallback
                    name = email.split("@")[0];
                }

                String emailNormalizado = email.trim().toLowerCase();
                Usuario usuario = usuarioRepository.findByEmail(emailNormalizado).orElse(null);
                // Fallback: buscar sin normalizar por si el correo fue guardado diferente
                if (usuario == null) {
                    usuario = usuarioRepository.findByEmail(email).orElse(null);
                }
                
                boolean esNuevoUsuario = false;
                if (usuario == null) {
                    // Crear nuevo usuario si no existe
                    esNuevoUsuario = true;
                    usuario = new Usuario();
                    usuario.setEmail(email);
                    
                    // Si el nombre ya existe, le agregamos un sufijo aleatorio corto
                    String baseName = name.replaceAll("\\s+", "");
                    if (baseName.isEmpty()) baseName = "usuario";
                    if (usuarioRepository.existsByNombre(baseName)) {
                        baseName = baseName + UUID.randomUUID().toString().substring(0, 4);
                    }
                    usuario.setNombre(baseName);
                    
                    // Asignamos una contraseña aleatoria muy compleja ya que el usuario usará Google
                    usuario.setPassword("{GOOGLE}" + passwordEncoder.encode(UUID.randomUUID().toString() + UUID.randomUUID().toString()));
                    usuario.setVerificado(true);
                    usuarioRepository.save(usuario);
                } else if (!usuario.isVerificado()) {
                    usuario.setVerificado(true);
                    usuarioRepository.save(usuario);
                }

                String token = jwtService.generateToken(usuario.getEmail());
                return new AuthResponse(token, usuario.getNombre(), usuario.getEmail(), esNuevoUsuario);
            } else {
                throw new RuntimeException("Token de Google inválido o expirado");
            }
        } catch (RuntimeException e) {
            // Re-lanzamos RuntimeExceptions directamente (ya tienen un mensaje claro)
            throw e;
        } catch (Exception e) {
            log.error("Error inesperado al verificar token de Google", e);
            throw new RuntimeException("Error al autenticar con Google: " + e.getMessage());
        }
    }

    public AuthResponse actualizarCuenta(UpdateUserRequest request, String currentEmail) {
        Usuario usuario = usuarioRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Validar contraseña actual si se quiere cambiar la contraseña o el email
        if (request.getCurrentPassword() != null && !request.getCurrentPassword().isEmpty()) {
            String storedHash = (usuario.getPassword() != null && usuario.getPassword().startsWith("{GOOGLE}")) ? 
                    usuario.getPassword().substring(8) : usuario.getPassword();
                    
            if (!passwordEncoder.matches(request.getCurrentPassword(), storedHash)) {
                throw new RuntimeException("Contraseña actual incorrecta");
            }
            if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
                usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }
        } else if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
            if (usuario.getPassword() != null && usuario.getPassword().startsWith("{GOOGLE}")) {
                usuario.setPassword(passwordEncoder.encode(request.getNewPassword()));
            } else {
                throw new RuntimeException("Debe ingresar su contraseña actual para establecer una nueva");
            }
        }

        if (request.getNombre() != null && !request.getNombre().isEmpty() && !request.getNombre().equalsIgnoreCase(usuario.getNombre())) {
            if (usuarioRepository.existsByNombre(request.getNombre())) {
                throw new RuntimeException("El nuevo nombre de usuario ya está en uso");
            }
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

        // Buscar si ya tiene un token y actualizarlo para evitar el error de Constraint Unique
        PasswordResetToken resetToken = tokenRepository.findByUsuario(usuario)
                .orElse(new PasswordResetToken());

        String token = UUID.randomUUID().toString();
        resetToken.setToken(token);
        resetToken.setUsuario(usuario);
        resetToken.setExpiryDate(LocalDateTime.now().plusHours(1)); // 1 hora de validez
        tokenRepository.save(resetToken);

        // Enviando el correo real en segundo plano usando la API
        String subject = "AULA - Recuperación de Contraseña";
        String textContent = "Hola " + usuario.getNombre() + ",\n\n" +
                "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.\n" +
                "Tu código de recuperación es: " + token + "\n\n" +
                "Ingresa este código en la aplicación junto con tu nueva contraseña.\n" +
                "Este código expirará en 1 hora.\n\n" +
                "Si no solicitaste este cambio, ignora este mensaje.\n\n" +
                "Saludos,\nEl equipo de AULA";

        CompletableFuture.runAsync(() -> {
            try {
                enviarCorreoBrevo(email, usuario.getNombre(), subject, textContent);
                log.info("Correo de recuperación enviado exitosamente a: " + email);
            } catch (Exception e) {
                log.error("Error al enviar el correo de recuperación a " + email, e);
            }
        });

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

    private void enviarCorreoBrevo(String toEmail, String toName, String subject, String textContent) {
        if (brevoApiKey == null || brevoApiKey.isEmpty()) {
            log.warn("La API Key de Brevo no está configurada. El correo no se enviará.");
            return;
        }

        RestTemplate restTemplate = new RestTemplate();
        String url = "https://api.brevo.com/v3/smtp/email";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoApiKey);
        headers.set("accept", "application/json");

        String htmlContent = "<html><body style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>" + 
                             textContent.replace("\n", "<br>") + "</body></html>";

        java.util.Map<String, Object> body = new java.util.HashMap<>();
        
        java.util.Map<String, String> sender = new java.util.HashMap<>();
        sender.put("name", "AULA App");
        sender.put("email", senderEmail);
        body.put("sender", sender);
        
        java.util.List<java.util.Map<String, String>> to = new java.util.ArrayList<>();
        java.util.Map<String, String> toUser = new java.util.HashMap<>();
        toUser.put("email", toEmail);
        toUser.put("name", toName != null ? toName : "");
        to.add(toUser);
        body.put("to", to);
        
        body.put("subject", subject);
        body.put("htmlContent", htmlContent);

        HttpEntity<java.util.Map<String, Object>> entity = new HttpEntity<>(body, headers);
        
        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new RuntimeException("Error desde la API de Brevo: " + response.getBody());
        }
    }
}