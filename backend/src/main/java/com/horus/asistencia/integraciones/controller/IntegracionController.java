package com.horus.asistencia.integraciones.controller;

import com.horus.asistencia.integraciones.service.IntegracionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/integraciones")
@RequiredArgsConstructor
@Tag(name = "Integraciones", description = "API para consumo de marcaciones por aplicaciones de terceros")
public class IntegracionController {

    private final IntegracionService integracionService;

    @GetMapping("/marcaciones")
    @Operation(summary = "Obtener marcaciones", description = "Recupera una lista paginada de marcaciones de asistencia (eventos) filtradas por rango de fecha. Requiere autenticación mediante API Key en el header X-API-KEY.", security = @SecurityRequirement(name = "X-API-KEY"))
    public ResponseEntity<Page<IntegracionService.MarcacionDto>> obtenerMarcaciones(
            Authentication authentication,
            @Parameter(description = "Fecha y hora de inicio (Formato ISO, ej: 2026-06-01T00:00:00)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @Parameter(description = "Fecha y hora de fin (Formato ISO, ej: 2026-06-30T23:59:59)") 
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin,
            @Parameter(description = "DNI del empleado (opcional)") 
            @RequestParam(required = false) String dni,
            @Parameter(description = "Número de página (0-indexado)") 
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de la página") 
            @RequestParam(defaultValue = "50") int size
    ) {
        Long empresaId = (Long) authentication.getPrincipal();
        Page<IntegracionService.MarcacionDto> resultado = integracionService.obtenerMarcaciones(empresaId, inicio, fin, dni, PageRequest.of(page, size));
        return ResponseEntity.ok(resultado);
    }
}
