package com.oculus.asistencia.licencia;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE) // Queremos que este filtro corra antes que Spring Security
@RequiredArgsConstructor
public class LicenciaFilter extends OncePerRequestFilter {

    private final LicenciaService licenciaService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // No filtramos endpoints que no sean /api/ ni los de licencia propiamente tal
        if (!path.startsWith("/api/") || path.startsWith("/api/licencia")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!licenciaService.isLicenciaValida()) {
            response.setStatus(402); // 402 Payment Required
            response.setContentType("application/json");
            
            Map<String, String> errorResponse = Map.of(
                    "error", "LICENSE_ERROR",
                    "mensaje", licenciaService.getMensajeError(),
                    "hwid", licenciaService.getHardwareIdActual()
            );
            
            response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            return;
        }

        filterChain.doFilter(request, response);
    }
}
