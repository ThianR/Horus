package com.oculus.asistencia.licencia;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/licencia")
@RequiredArgsConstructor
public class LicenciaController {

    private final LicenciaService licenciaService;

    @GetMapping("/estado")
    public ResponseEntity<?> getEstado() {
        return ResponseEntity.ok(Map.of(
                "hardwareId", licenciaService.getHardwareIdActual(),
                "valida", licenciaService.isLicenciaValida(),
                "mensaje", licenciaService.getMensajeError()
        ));
    }

    @PostMapping("/activar")
    public ResponseEntity<?> activarLicencia(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token requerido"));
        }

        boolean exito = licenciaService.guardarNuevaLicencia(token);
        if (exito) {
            return ResponseEntity.ok(Map.of("mensaje", "Software activado correctamente."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", licenciaService.getMensajeError()));
        }
    }
}
