package com.horus.asistencia.integraciones.security;

import com.horus.asistencia.integraciones.model.IntegracionApiKey;
import com.horus.asistencia.integraciones.repository.IntegracionApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-KEY";
    private final IntegracionApiKeyRepository apiKeyRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String path = request.getRequestURI();
        
        // Solo aplica a las rutas de integraciones
        if (!path.startsWith("/api/v1/integraciones/")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String apiKey = request.getHeader(API_KEY_HEADER);
        if (apiKey == null || apiKey.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("API Key no proveida.");
            return;
        }

        // Aquí se usaría un hash en un entorno real. Por simplicidad, comparamos directamente.
        // Lo ideal: String apiKeyHash = DigestUtils.sha256Hex(apiKey);
        Optional<IntegracionApiKey> apiKeyEntityOpt = apiKeyRepository.findByApiKeyHashAndActivaTrue(apiKey);

        if (apiKeyEntityOpt.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("API Key invalida o inactiva.");
            return;
        }

        IntegracionApiKey keyEntity = apiKeyEntityOpt.get();

        // Autenticar la petición en el contexto de Spring Security
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                keyEntity.getEmpresa().getId(), // Principal será el ID de la Empresa
                null,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_INTEGRACION"))
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}
