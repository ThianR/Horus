package com.horus.asistencia.motor.controller;

import com.horus.asistencia.motor.service.CierreDiaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/motor/cierre")
@RequiredArgsConstructor
public class CierreDiaController {

    private final CierreDiaService cierreDiaService;

    @PostMapping("/{empresaId}")
    public ResponseEntity<?> ejecutarCierreManual(
            @PathVariable Long empresaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        
        LocalDate fechaCierre = (fecha != null) ? fecha : LocalDate.now().minusDays(1);
        
        try {
            int procesados = cierreDiaService.procesarCierreEmpresa(empresaId, fechaCierre);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "mensaje", "Cierre completado correctamente",
                "registrosCreados", procesados,
                "fecha", fechaCierre
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }
}
