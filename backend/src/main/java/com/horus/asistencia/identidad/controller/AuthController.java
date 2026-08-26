package com.horus.asistencia.identidad.controller;

import com.horus.asistencia.identidad.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    private final com.horus.asistencia.identidad.repository.UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest login) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(login.username(), login.password()));

        final UserDetails userDetails = userDetailsService.loadUserByUsername(login.username());
        final String token = jwtTokenUtil.generateToken(userDetails);

        return ResponseEntity.ok(new AuthResponse(token));
    }

    @org.springframework.web.bind.annotation.GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        return usuarioRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok(new UserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getRol().name(),
                        user.isTourCompletado()
                )))
                .orElse(ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build());
    }

    @PostMapping("/tour-completado")
    public ResponseEntity<?> completarTour(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        return usuarioRepository.findByUsername(username).map(user -> {
            user.setTourCompletado(true);
            usuarioRepository.save(user);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build());
    }

    public record LoginRequest(String username, String password) {
    }

    public record AuthResponse(String token) {
    }

    public record UserResponse(Long id, String username, String rol, boolean tourCompletado) {
    }
}
