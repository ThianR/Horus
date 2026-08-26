package com.horus.asistencia.integraciones.controller;

import com.horus.asistencia.reportes.dto.NominaEmpleadoDto;
import com.horus.asistencia.reportes.service.NominaService;
import com.horus.asistencia.organizacion.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Endpoint público de integración, protegido por ApiKeyAuthenticationFilter
 */
@RestController
@RequestMapping("/api/v1/integraciones/nomina")
@RequiredArgsConstructor
public class IntegracionApiController {

    private final NominaService nominaService;
    private final EmpresaService empresaService;

    @GetMapping("/resumen")
    public ResponseEntity<List<NominaEmpleadoDto>> obtenerResumenNomina(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        // En un entorno multi-tenant real, el empresaId se extraería del ApiKey del cliente.
        Long empresaId = empresaService.getEmpresaDefault().getId();
        return ResponseEntity.ok(nominaService.calcularNomina(empresaId, inicio, fin));
    }
}
