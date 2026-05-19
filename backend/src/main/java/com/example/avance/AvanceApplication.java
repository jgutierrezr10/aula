package com.example.avance;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.example.avance.model.Usuario;
import com.example.avance.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

@SpringBootApplication
public class AvanceApplication {

	public static void main(String[] args) {
		SpringApplication.run(AvanceApplication.class, args);
	}

	@Bean
	CommandLineRunner updatePasswords(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
		return args -> {
			List<Usuario> usuarios = usuarioRepository.findAll();
			boolean updated = false;
			for (Usuario u : usuarios) {
				// Si la contraseña tiene fuerza 10 (sin importar si es $2a$, $2b$, etc), la reseteamos
				if (u.getPassword().contains("$10$")) {
					u.setPassword(passwordEncoder.encode("123456"));
					usuarioRepository.save(u);
					updated = true;
				}
			}
			if (updated) {
				System.out.println("=================================================");
				System.out.println("SE HAN RESETEADO LAS CONTRASEÑAS LENTAS A: 123456");
				System.out.println("=================================================");
			}
		};
	}
}
