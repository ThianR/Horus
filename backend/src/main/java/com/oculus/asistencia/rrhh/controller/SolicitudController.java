package com.oculus.asistencia.rrhh.controller;

import com.oculus.asistencia.rrhh.model.SolicitudAusencia;
import com.oculus.asistencia.rrhh.service.SolicitudService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasRole('EMPLEADO') or hasRole('ADMIN') or hasRole('RRHH')")
    public ResponseEntity<List<SolicitudAusencia>> obtenerMisSolicitudes(Authentication authentication) {
        return ResponseEntity.ok(solicitudService.obtenerMisSolicitudes(authentication.getName()));
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLEADO')")
    public ResponseEntity<SolicitudAusencia> crearSolicitud(
            @RequestBody SolicitudRequest request,
            Authentication authentication) {
        
        SolicitudAusencia nueva = solicitudService.crearSolicitud(
                authentication.getName(),
                request.fechaInicio(),
                request.fechaFin(),
                request.tipo(),
                request.motivo()
        );
        return ResponseEntity.ok(nueva);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RRHH')")
    public ResponseEntity<List<SolicitudAusencia>> obtenerTodasLasSolicitudes() {
        return ResponseEntity.ok(solicitudService.obtenerTodasLasSolicitudes());
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RRHH')")
    public ResponseEntity<SolicitudAusencia> actualizarEstado(
            @PathVariable Long id,
            @RequestBody ActualizarEstadoRequest request) {
        
        return ResponseEntity.ok(solicitudService.actualizarEstado(id, request.estado(), request.comentarioRevisor()));
    }

    public record SolicitudRequest(LocalDate fechaInicio, LocalDate fechaFin, SolicitudAusencia.TipoSolicitud tipo, String motivo) {}
    public record ActualizarEstadoRequest(SolicitudAusencia.EstadoSolicitud estado, String comentarioRevisor) {}
}
